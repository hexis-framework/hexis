# Create Your First Hook

Hooks are scripts that run on Claude Code lifecycle events — outside the LLM, zero token cost, guaranteed execution. If a rule matters enough that violating it causes real damage, make it a hook. For the full taxonomy, see [Hook Patterns](hook-patterns.md).

## Hook File Anatomy

A hook script does three things:

1. **Reads** a JSON object from stdin (tool name, input, session context)
2. **Decides** whether to allow, deny, or annotate
3. **Responds** via stdout (deny JSON) or exits silently (approve)

Critical rule: **exit 0 means success.** A non-zero exit is a hook *failure* (error), not a deny.

## Step-by-Step: Build a "No Secrets" Hook

A PreToolUse hook that blocks `git add` when `.env` files are in the command.

### 1. Create the hook file

```bash
mkdir -p .claude/hooks
```

Create `.claude/hooks/no-secrets.js`:

```javascript
function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('data', (chunk) => data += chunk);
    process.stdin.on('end', () => resolve(data));
  });
}

async function main() {
  const input = JSON.parse(await readStdin());
  if (input.tool_name !== 'Bash') process.exit(0);

  const command = input.tool_input?.command || '';

  if (/git\s+add/.test(command) && /\.env\b/.test(command)) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        permissionDecision: "deny",
        reason: "Blocked: git add includes a .env file. Add .env to .gitignore instead."
      }
    }));
  }
  process.exit(0); // No output = approve
}

main();
```

### 2. Register it in settings.json

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "node .claude/hooks/no-secrets.js" }]
      }
    ]
  }
}
```

The `matcher` scopes this hook to Bash tool calls only. Without it, the hook fires on every tool — wasteful and potentially buggy.

### 3. Test it

Pipe simulated input directly — faster than restarting Claude Code:

```bash
# Should output deny JSON
echo '{"tool_name":"Bash","tool_input":{"command":"git add .env"}}' \
  | node .claude/hooks/no-secrets.js

# Should output nothing (approve)
echo '{"tool_name":"Bash","tool_input":{"command":"git add src/main.js"}}' \
  | node .claude/hooks/no-secrets.js
```

Then test live: ask Claude to `git add .env`. The hook should block it with the reason message.

### 4. Handle edge cases

The basic regex misses `git add -A` or `git add .` (which stage everything). Extend by also checking for broad-stage patterns and whether `.env` exists in the working directory via `fs.existsSync('.env')`.

## Upgrading: PreToolUse to PostToolUse

PreToolUse hooks **block** actions. PostToolUse hooks **react** to completed actions (auto-formatting, validation, pattern detection). PostToolUse hooks don't use `permissionDecision` — use stderr to inject warnings into the conversation instead. Register the same way, changing the event key to `PostToolUse` and the `matcher` to the relevant tool (e.g., `Edit`).

## Common Pitfalls

**Non-zero exit = hook failure, not deny.** If your hook throws and exits with code 1, Claude Code treats it as "hook broke" — not "command blocked." Catch errors and exit 0.

**Slow hooks degrade every interaction.** A 500ms hook adds 500ms to every matching tool call. No network calls, no heavy I/O.

**Never use `npx` in hooks.** It resolves (and potentially downloads) packages on every invocation — seconds of latency per tool call.

**Stdin must be fully consumed.** Not reading all stdin causes broken pipe errors. Always read the full input.

**Don't over-scope.** A hook without a `matcher` fires on *every* tool call (Bash, Read, Write, Edit, Grep). Scope to the tool(s) you care about.

**Test with piped input first.** Live testing requires restarting Claude Code. Pipe test JSON for fast iteration, then verify live.

## Further Reading

- [Hook Patterns](hook-patterns.md) — Full taxonomy: deny hooks, quality hooks, context injection
- [Enforcement Escalation](enforcement-escalation.md) — When rules should graduate to hooks
- [Architecture](architecture.md) — Where hooks fit in the layer model
