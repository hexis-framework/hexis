#!/usr/bin/env node

/**
 * Hexis Stuck Detector — PostToolUse quality hook
 *
 * Detects when the AI agent is stuck in a repetitive loop and injects a
 * warning into the conversation via stderr. Claude Code surfaces stderr
 * from PostToolUse hooks as system notes visible to the model.
 *
 * Detection patterns (thresholds informed by OpenHands research):
 *   1. Same exact tool call repeated 3+ times
 *   2. Same error message repeated 2+ times
 *   3. Oscillating A-B-A-B pattern over 6+ steps
 *
 * The hook maintains a rolling JSONL log of recent tool calls. The log is
 * append-only and capped at MAX_LOG_ENTRIES to bound disk usage.
 *
 * Hook type: PostToolUse (all tools)
 * Action: Warns via stderr when repetition patterns are detected
 *
 * Setup — add to .claude/settings.json:
 * {
 *   "hooks": {
 *     "PostToolUse": [{
 *       "hooks": [{
 *         "type": "command",
 *         "command": "node .claude/hooks/stuck-detector.js"
 *       }]
 *     }]
 *   }
 * }
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");

// ---------------------------------------------------------------------------
// Configuration — adjust thresholds to taste
// ---------------------------------------------------------------------------

/** Directory for Hexis runtime data */
const HEXIS_DIR = path.join(os.homedir(), ".hexis");

/** Rolling log of recent tool calls */
const LOG_FILE = path.join(HEXIS_DIR, "tool-call-log.jsonl");

/** Maximum entries kept in the log (older entries are trimmed) */
const MAX_LOG_ENTRIES = 50;

/** Detection thresholds */
const THRESHOLDS = {
  /** Same exact call (tool + input hash) repeated this many times */
  sameCall: 3,
  /** Same error output repeated this many times */
  sameError: 2,
  /** A-B-A-B oscillation detected over this many steps */
  oscillation: 6,
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const input = JSON.parse(await readStdin());

  // Build a log entry from the hook payload
  const entry = {
    ts: Date.now(),
    tool: input.tool_name || "unknown",
    inputHash: hashObject(input.tool_input || {}),
    // Capture first 200 chars of output for error matching
    outputSnippet: truncate(input.tool_output || "", 200),
    isError: Boolean(input.tool_error),
    errorSnippet: truncate(input.tool_error || "", 200),
  };

  // Ensure data directory exists
  ensureDir(HEXIS_DIR);

  // Append entry and read back the rolling window
  appendEntry(entry);
  const entries = readRecentEntries();

  // Run detectors
  const warnings = [];

  const repeatWarning = detectSameCallRepeat(entries);
  if (repeatWarning) warnings.push(repeatWarning);

  const errorWarning = detectSameErrorRepeat(entries);
  if (errorWarning) warnings.push(errorWarning);

  const oscillationWarning = detectOscillation(entries);
  if (oscillationWarning) warnings.push(oscillationWarning);

  // Emit warnings via stderr (Claude Code injects these as system notes)
  if (warnings.length > 0) {
    const banner = [
      "",
      "=== STUCK DETECTOR WARNING ===",
      ...warnings,
      "Consider: changing approach, asking the user for guidance, or running /clear.",
      "==============================",
      "",
    ].join("\n");
    process.stderr.write(banner);
  }
}

// ---------------------------------------------------------------------------
// Detection: Same call repeated N times
// ---------------------------------------------------------------------------

/**
 * Checks whether the most recent N calls are identical (same tool + same
 * input hash). This catches the classic "retry the same failing command"
 * loop.
 */
function detectSameCallRepeat(entries) {
  if (entries.length < THRESHOLDS.sameCall) return null;

  const recent = entries.slice(-THRESHOLDS.sameCall);
  const signature = `${recent[0].tool}:${recent[0].inputHash}`;

  const allSame = recent.every(
    (e) => `${e.tool}:${e.inputHash}` === signature
  );

  if (allSame) {
    return (
      `[Repeat x${THRESHOLDS.sameCall}] The same ${recent[0].tool} call ` +
      `has been made ${THRESHOLDS.sameCall} times in a row with identical input.`
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Detection: Same error repeated N times
// ---------------------------------------------------------------------------

/**
 * Checks whether the last N tool calls all produced the same error output.
 * This catches cases where the agent retries different commands but hits
 * the same underlying failure.
 */
function detectSameErrorRepeat(entries) {
  if (entries.length < THRESHOLDS.sameError) return null;

  // Only look at entries that actually errored
  const recentErrors = entries
    .filter((e) => e.isError && e.errorSnippet)
    .slice(-THRESHOLDS.sameError);

  if (recentErrors.length < THRESHOLDS.sameError) return null;

  const firstError = recentErrors[0].errorSnippet;
  const allSame = recentErrors.every((e) => e.errorSnippet === firstError);

  if (allSame) {
    return (
      `[Error x${THRESHOLDS.sameError}] The same error has appeared ` +
      `${THRESHOLDS.sameError} times: "${firstError.slice(0, 100)}..."`
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Detection: A-B oscillation
// ---------------------------------------------------------------------------

/**
 * Checks for an alternating A-B-A-B pattern in the most recent N calls.
 * This catches cases where the agent flips between two approaches without
 * making progress (e.g., add a line / remove the line / add it back).
 */
function detectOscillation(entries) {
  if (entries.length < THRESHOLDS.oscillation) return null;

  const recent = entries.slice(-THRESHOLDS.oscillation);
  const signatures = recent.map((e) => `${e.tool}:${e.inputHash}`);

  // Check for strict A-B-A-B alternation
  if (signatures.length < 4) return null;

  const a = signatures[0];
  const b = signatures[1];

  // Must be two distinct calls
  if (a === b) return null;

  let isOscillating = true;
  for (let i = 0; i < signatures.length; i++) {
    const expected = i % 2 === 0 ? a : b;
    if (signatures[i] !== expected) {
      isOscillating = false;
      break;
    }
  }

  if (isOscillating) {
    const toolA = recent[0].tool;
    const toolB = recent[1].tool;
    return (
      `[Oscillation x${THRESHOLDS.oscillation}] Detected alternating ` +
      `pattern between ${toolA} and ${toolB} calls over the last ` +
      `${THRESHOLDS.oscillation} steps. This usually means two approaches ` +
      `are conflicting.`
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Log file management
// ---------------------------------------------------------------------------

/**
 * Append a single entry to the JSONL log file.
 */
function appendEntry(entry) {
  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");
}

/**
 * Read the log file and return the most recent MAX_LOG_ENTRIES entries.
 * If the file has grown beyond the cap, truncate it in place.
 */
function readRecentEntries() {
  if (!fs.existsSync(LOG_FILE)) return [];

  const lines = fs
    .readFileSync(LOG_FILE, "utf-8")
    .split("\n")
    .filter((line) => line.trim());

  let entries;
  try {
    entries = lines.map((line) => JSON.parse(line));
  } catch {
    // Corrupted log — reset it
    fs.writeFileSync(LOG_FILE, "");
    return [];
  }

  // Trim if over cap
  if (entries.length > MAX_LOG_ENTRIES) {
    entries = entries.slice(-MAX_LOG_ENTRIES);
    fs.writeFileSync(
      LOG_FILE,
      entries.map((e) => JSON.stringify(e)).join("\n") + "\n"
    );
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });
}

function hashObject(obj) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(obj))
    .digest("hex")
    .slice(0, 12);
}

function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

main().catch((err) => {
  // Hook errors should not block the agent — log and exit cleanly
  console.error(`stuck-detector error: ${err.message}`);
  process.exit(1);
});
