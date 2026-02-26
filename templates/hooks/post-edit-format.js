#!/usr/bin/env node

/**
 * Hexis Auto-Formatter — PostToolUse hook
 *
 * Automatically formats files after edits using the appropriate formatter
 * for the file type. Formatters are configured in the FORMATTERS map below.
 *
 * Graceful degradation: if a formatter is not installed, the hook silently
 * skips it. Files under skip directories (node_modules, vendor, etc.) are
 * never formatted.
 *
 * Hook type: PostToolUse (Edit and Write tools)
 * Action: Runs the matching formatter silently; warns on failure via stderr
 *
 * Setup — add to .claude/settings.json:
 * {
 *   "hooks": {
 *     "PostToolUse": [{
 *       "matcher": "Edit|Write",
 *       "hooks": [{
 *         "type": "command",
 *         "command": "node .claude/hooks/post-edit-format.js"
 *       }]
 *     }]
 *   }
 * }
 */

const { execFileSync, execSync } = require("child_process");
const path = require("path");

// ---------------------------------------------------------------------------
// Formatter configuration
//
// Map file extensions to their formatter. Each entry:
//   command — the executable name (must be on PATH)
//   args    — arguments to pass BEFORE the file path
//
// The file path is always appended as the last argument.
// Only runs if the command exists on the system.
// ---------------------------------------------------------------------------

const FORMATTERS = {
  // JavaScript / TypeScript — Prettier
  ".js":   { command: "prettier", args: ["--write"] },
  ".jsx":  { command: "prettier", args: ["--write"] },
  ".ts":   { command: "prettier", args: ["--write"] },
  ".tsx":  { command: "prettier", args: ["--write"] },
  ".mjs":  { command: "prettier", args: ["--write"] },
  ".mts":  { command: "prettier", args: ["--write"] },

  // CSS / HTML / JSON / YAML — Prettier
  ".css":  { command: "prettier", args: ["--write"] },
  ".scss": { command: "prettier", args: ["--write"] },
  ".html": { command: "prettier", args: ["--write"] },
  ".json": { command: "prettier", args: ["--write"] },
  ".yaml": { command: "prettier", args: ["--write"] },
  ".yml":  { command: "prettier", args: ["--write"] },

  // Python — Ruff (fast, opinionated)
  ".py":   { command: "ruff", args: ["format"] },
  ".pyi":  { command: "ruff", args: ["format"] },

  // Rust — rustfmt
  ".rs":   { command: "rustfmt", args: [] },

  // Go — gofmt
  ".go":   { command: "gofmt", args: ["-w"] },

  // Add your own:
  // ".rb":  { command: "rubocop", args: ["-a"] },
  // ".ex":  { command: "mix", args: ["format"] },
};

// ---------------------------------------------------------------------------
// Skip directories — never format files under these paths
// ---------------------------------------------------------------------------

const SKIP_DIRS = [
  "node_modules",
  "vendor",
  ".git",
  "dist",
  "build",
  ".next",
  "__pycache__",
  ".venv",
  "venv",
  "target",        // Rust
  "coverage",
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const input = JSON.parse(await readStdin());

  // Extract the file path from the tool input
  const filePath = extractFilePath(input);
  if (!filePath) return;

  // Check skip directories
  if (isInSkipDir(filePath)) return;

  // Find the formatter for this extension
  const ext = path.extname(filePath).toLowerCase();
  const formatter = FORMATTERS[ext];
  if (!formatter) return;

  // Check if the formatter is installed
  if (!isCommandAvailable(formatter.command)) return;

  // Run the formatter
  try {
    execFileSync(formatter.command, [...formatter.args, filePath], {
      stdio: ["ignore", "ignore", "pipe"],
      timeout: 10_000, // 10s timeout — formatters should be fast
    });
  } catch (err) {
    // Warn but don't fail — formatting is best-effort
    const stderr = err.stderr ? err.stderr.toString().trim() : err.message;
    process.stderr.write(
      `[auto-format] ${formatter.command} failed on ${path.basename(filePath)}: ${stderr}\n`
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract the file path from the hook payload.
 * Handles both Edit (file_path) and Write (file_path) tool inputs.
 */
function extractFilePath(input) {
  const toolInput = input.tool_input || {};
  return toolInput.file_path || toolInput.path || null;
}

/**
 * Check whether the file is under any of the skip directories.
 */
function isInSkipDir(filePath) {
  const normalized = filePath.split(path.sep);
  return SKIP_DIRS.some((dir) => normalized.includes(dir));
}

/**
 * Check if a command is available on the system PATH.
 * Uses `which` (Unix) — returns false if the command is not found.
 */
function isCommandAvailable(command) {
  try {
    execSync(`which ${command}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Read all of stdin as a string.
 */
function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });
}

main().catch((err) => {
  // Hook errors should not block the agent — log and exit cleanly
  process.stderr.write(`post-edit-format error: ${err.message}\n`);
  process.exit(1);
});
