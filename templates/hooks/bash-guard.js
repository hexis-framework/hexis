#!/usr/bin/env node

/**
 * Hexis Bash Guard — PreToolUse deny hook
 *
 * Blocks dangerous or unscoped bash commands before execution.
 * Configure guards by editing the GUARDS array below. Each guard is a
 * { pattern, message } pair — if the command matches the regex, the tool
 * call is denied with the message injected into conversation context.
 *
 * Hook type: PreToolUse (Bash tool only)
 * Action: Blocks matching commands with a deny message
 *
 * Setup — add to .claude/settings.json:
 * {
 *   "hooks": {
 *     "PreToolUse": [{
 *       "matcher": "Bash",
 *       "hooks": [{
 *         "type": "command",
 *         "command": "node .claude/hooks/bash-guard.js"
 *       }]
 *     }]
 *   }
 * }
 */

// ---------------------------------------------------------------------------
// GUARDS — each entry: { pattern: RegExp, message: string }
//
// Add your own guards at the end. The first matching guard wins.
// Patterns are tested against the full command string.
// ---------------------------------------------------------------------------

const GUARDS = [

  // === 1. Destructive deletion ===
  // Blocks rm with force flags (-f, -rf, -fr, etc.) to prevent accidental
  // recursive deletions. Require explicit confirmation or a safe wrapper.
  {
    pattern: /\brm\s+(-[a-zA-Z]*f[a-zA-Z]*\s+|--force\s+)/,
    message:
      "Blocked: rm with force flag detected. Remove the -f flag, or use a " +
      "safe deletion wrapper that validates the target path first.",
  },

  // === 2. Unscoped grep on home directory ===
  // Running grep/rg on ~ without constraints can take minutes and burn
  // context window on huge output. Require a subdirectory or --include.
  {
    pattern: /\b(grep|rg|ack)\b.*\s+~\/?(\s|$)/,
    message:
      "Blocked: unscoped grep on home directory. Scope to a subdirectory " +
      "(e.g., ~/src/) or add file filters (--include, --type) to avoid " +
      "timeouts on large trees.",
  },

  // === 3. Unscoped find on home directory ===
  // Same rationale as grep — find on ~ walks everything including
  // node_modules, .git, caches, etc.
  {
    pattern: /\b(find|fd)\s+~\/?(\s|$)/,
    message:
      "Blocked: unscoped find on home directory. Scope to a subdirectory " +
      "or add -maxdepth / --max-depth to limit traversal.",
  },

  // === 4. Credential file reads ===
  // Prevent accidentally dumping secrets into the conversation context.
  // Catches cat/less/more/head/tail on common credential filenames.
  {
    pattern: /\b(cat|less|more|head|tail|bat)\s+.*\.(env|secrets|credentials|pem|key)\b/,
    message:
      "Blocked: reading a credential or secrets file. These should not be " +
      "dumped into conversation context. Access secrets through your " +
      "application's config loader or a secrets manager.",
  },

  // === 5. Force push to main/master ===
  // Protects the primary branch from history rewrites. Force-push to
  // feature branches is fine; main/master should go through PR merge.
  {
    pattern: /\bgit\s+push\s+.*--force(?!-).*\b(main|master)\b|\bgit\s+push\s+.*\b(main|master)\b.*--force(?!-)/,
    message:
      "Blocked: force push to main/master. This rewrites shared history. " +
      "Use a feature branch and merge through a pull request instead.",
  },

  // === 6. Package manager mismatch ===
  // If a pnpm-lock.yaml or yarn.lock exists in the working directory,
  // block bare `npm install` to prevent creating a conflicting lockfile.
  // This is a heuristic — checks the command for `npm install` or `npm i`
  // and relies on the project having the correct lockfile present.
  {
    pattern: /\bnpm\s+(install|i|ci|add|remove|uninstall)\b/,
    message:
      "Blocked: npm command detected. Check for pnpm-lock.yaml or " +
      "yarn.lock in the project root — using the wrong package manager " +
      "creates conflicting lockfiles. Use the project's declared package " +
      "manager instead.",
  },

  // === Add your custom guards below ===
  // {
  //   pattern: /your-regex-here/,
  //   message: "Your deny message here.",
  // },
];

// ---------------------------------------------------------------------------
// Hook plumbing — you shouldn't need to edit below this line
// ---------------------------------------------------------------------------

async function main() {
  const input = JSON.parse(await readStdin());

  // Only inspect Bash tool calls
  if (input.tool_name !== "Bash") return approve();

  const command = input.tool_input?.command || "";

  for (const guard of GUARDS) {
    if (guard.pattern.test(command)) {
      return deny(guard.message);
    }
  }

  return approve();
}

/**
 * Read all of stdin as a string (Claude Code pipes the hook payload here).
 */
function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });
}

/**
 * Approve the tool call — empty output signals approval.
 */
function approve() {
  process.exit(0);
}

/**
 * Deny the tool call — the reason is shown to the agent in conversation.
 */
function deny(message) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        permissionDecision: "deny",
        reason: message,
      },
    })
  );
  process.exit(0);
}

main().catch((err) => {
  // Hook errors should not block the agent — log and exit cleanly
  console.error(`bash-guard error: ${err.message}`);
  process.exit(1);
});
