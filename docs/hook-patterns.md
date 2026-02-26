# Hook Patterns

Hooks are shell scripts that execute on Claude Code lifecycle events. They run outside the LLM — zero token cost, guaranteed execution. This document covers the taxonomy of useful hooks and patterns for writing your own.

## Hook Types

Claude Code supports several lifecycle events. Each maps to a different enforcement pattern:

| Event | When it fires | Common use |
|-------|--------------|-----------|
| `PreToolUse` | Before a tool executes | **Deny hooks** — block dangerous commands |
| `PostToolUse` | After a tool completes | **Quality hooks** — format, validate, detect patterns |
| `UserPromptSubmit` | When the user sends a message | **Context injection** — add reminders, check state |
| `Stop` | When Claude finishes responding | **Session management** — cleanup, logging |

## Pattern 1: Deny Hook (PreToolUse)

Blocks a tool call before it executes. The most important hook type — this is where hard enforcement lives.

**Structure:**

```javascript
// Read tool input from stdin
const input = JSON.parse(await readStdin());

// Check against rules
if (shouldBlock(input)) {
  // Deny with a message that explains why
  console.log(JSON.stringify({
    hookSpecificOutput: {
      permissionDecision: "deny",
      reason: "Blocked: [explanation of what was blocked and why]"
    }
  }));
}
// Approve by outputting nothing and exiting 0
process.exit(0);
```

**Key behaviors:**
- Output a JSON object with `permissionDecision: "deny"` to block
- Output nothing (or empty) to approve
- The `reason` field is shown to the LLM, which can then adjust its approach
- Always exit 0 — a non-zero exit is treated as a hook failure, not a deny

**Examples:**
- Block `rm -rf` without a safety wrapper
- Block unscoped searches on the home directory
- Block credential file reads (`.env`, `.secrets`)
- Block force-push to main/master
- Block wrong package manager (`npm` when `pnpm-lock.yaml` exists)

**See:** `templates/hooks/bash-guard.js` for a complete deny hook.

## Pattern 2: Quality Hook (PostToolUse)

Runs after a tool completes. Used for automatic formatting, validation, and pattern detection.

**Two sub-patterns:**

### Auto-Formatter

Runs a formatter on files after edits. Silent on success, warns on failure.

```javascript
const input = JSON.parse(await readStdin());
const filePath = input.tool_input?.file_path;

// Determine formatter based on file extension
const formatter = getFormatter(filePath);
if (!formatter) process.exit(0); // No formatter for this type

// Run formatter (graceful degradation if not installed)
try {
  execSync(`${formatter.command} ${formatter.args.join(' ')} "${filePath}"`, {
    timeout: 10000,
    stdio: 'pipe'
  });
} catch (err) {
  // Warn but don't block — formatting failure is not critical
  console.error(`Auto-format warning: ${err.message}`);
}
```

**See:** `templates/hooks/post-edit-format.js` for a complete auto-formatter.

### Stuck Detector

Detects when the LLM is stuck in a repetitive loop and injects a warning.

```javascript
// After each tool call, log it and check for patterns
const patterns = [
  checkSameCallRepeated(log, 3),     // Same exact call 3+ times
  checkSameErrorRepeated(log, 2),    // Same error 2+ times
  checkOscillation(log, 6),          // A-B-A-B pattern over 6+ steps
];

if (patterns.some(p => p.detected)) {
  // Warn via stderr (injected into conversation as system note)
  console.error(`⚠️ Possible stuck loop detected: ${pattern.description}`);
}
```

**See:** `templates/hooks/stuck-detector.js` for a complete stuck detector.

## Pattern 3: Context Injection (UserPromptSubmit)

Runs when the user sends a message. Can inject context (via stdout) into the conversation.

```javascript
// Inject a reminder before every prompt
const reminders = [];

// Check for stale context files
if (isStale('MEMORY.md', 48 * 60 * 60)) {
  reminders.push('⚠️ MEMORY.md is >48h old — may be stale');
}

// Check for pending violations
const violationCount = countPendingViolations();
if (violationCount > 0) {
  reminders.push(`📋 ${violationCount} unreviewed violation(s) in rule-violation-log.md`);
}

if (reminders.length > 0) {
  // stdout is injected as a system note in the conversation
  console.log(reminders.join('\n'));
}
```

**Use cases:**
- Remind about pending violations during session wrap
- Inject auto-learning prompts ("After this correction, capture the rule")
- Surface stale context files
- Check for missed reviews

## Pattern 4: Session Management (Stop)

Runs when Claude finishes a response. Used for logging, cleanup, and session state management.

```javascript
// Log session activity
const sessionLog = {
  timestamp: new Date().toISOString(),
  toolCallCount: getToolCallCount(),
  duration: getSessionDuration(),
};

appendToLog('~/.hexis/session-log.jsonl', sessionLog);

// Suggest wrap-up if it's late
const hour = new Date().getHours();
if (hour >= 21) {
  console.error('💡 It\'s past 9pm — consider running /wrap before ending.');
}
```

## Writing Your Own Hooks

### Input Format

Hooks receive a JSON object on stdin:

```json
{
  "hook_type": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf /tmp/test"
  },
  "session_id": "abc123"
}
```

The exact fields depend on the hook type and tool. Always check for field existence before accessing.

### Registration

Hooks are registered in `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/bash-guard.js"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/stuck-detector.js"
          }
        ]
      }
    ]
  }
}
```

- `matcher` scopes the hook to a specific tool (omit to match all tools)
- Multiple hooks can register for the same event
- Hooks run in order — if a PreToolUse hook denies, later hooks don't execute

### Best Practices

**Do:**
- Parse stdin as JSON (structured input)
- Handle missing fields gracefully (the schema may evolve)
- Exit 0 on success (non-zero = hook failure, not deny)
- Use stderr for warnings injected into conversation
- Use stdout only for structured deny responses (PreToolUse) or context injection (UserPromptSubmit)
- Keep hooks fast — they run on every matching event
- Log to JSONL files (append-only, safe for concurrent access)

**Don't:**
- Use string interpolation to build shell commands from tool input (injection risk)
- Depend on specific `settings.json` schema details (unstable)
- Make network calls in hooks (latency affects every tool call)
- Write hooks that require LLM reasoning (hooks are dumb scripts — that's their strength)
- Use `npx` in hooks (latency fires on every event)

### Testing

Test hooks by simulating stdin:

```bash
echo '{"hook_type":"PreToolUse","tool_name":"Bash","tool_input":{"command":"rm -rf /"}}' | node .claude/hooks/bash-guard.js
# Should output deny JSON

echo '{"hook_type":"PreToolUse","tool_name":"Bash","tool_input":{"command":"ls -la"}}' | node .claude/hooks/bash-guard.js
# Should output nothing (approve)
```

## Stability Note

Hook lifecycle events (PreToolUse, PostToolUse) are semi-stable — they're documented but the set may evolve. The hook input/output JSON schema (especially `hookSpecificOutput` with `permissionDecision`) is convention, not a versioned API. Test hooks after Claude Code updates.

See [Architecture: Extension Mechanism Stability](architecture.md#extension-mechanism-stability) for the full stability classification.

## Further Reading

- [Architecture](architecture.md) — Where hooks fit in the layer model
- [Enforcement Escalation](enforcement-escalation.md) — How rules graduate to hooks
- [Getting Started](getting-started.md) — Installing your first hook
