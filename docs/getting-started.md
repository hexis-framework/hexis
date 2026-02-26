# Getting Started with Hexis

This guide walks you through setting up the Hexis meta-cognitive framework for Claude Code. By the end, you'll have:

- A structured CLAUDE.md with rule maturity annotations
- A MEMORY.md for operational gotchas
- Your first enforcement hook
- A rule violation log for the escalation pattern

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed and working
- Basic familiarity with Claude Code's CLAUDE.md and hooks

## Quick Setup (Recommended)

```bash
# Clone the Hexis repo
git clone https://github.com/hexis-framework/hexis.git ~/.hexis/repo

# Run the scaffolder in your project directory
cd your-project
~/.hexis/repo/hexis init
```

This creates the full directory structure, copies the core templates, and installs the bash-guard hook. Skip to [Step 4](#step-4-install-your-first-hook) to register the hook.

## Manual Setup

If you prefer to set things up by hand:

### Step 1: Create the Directory Structure

```bash
# Create Hexis directories alongside your Claude Code config
mkdir -p .claude/hooks
mkdir -p .claude/skills
mkdir -p docs/solutions
```

Your project should look like:

```
your-project/
├── .claude/
│   ├── hooks/           # Enforcement hooks
│   ├── skills/          # Modular skill files
│   └── settings.json    # Claude Code config
├── docs/
│   └── solutions/       # Reusable patterns and how-tos
├── CLAUDE.md            # Rules and conventions
├── MEMORY.md            # Operational gotchas (auto-loaded by Claude Code)
└── rule-violation-log.md # Enforcement escalation tracker
```

### Step 2: Set Up CLAUDE.md

Copy the template:

```bash
cp ~/.hexis/repo/templates/CLAUDE.md ./CLAUDE.md
```

Edit it to add your own rules. Start with just 3-5 rules -- you'll add more as you discover what matters.

**Key concept: Rule Maturity.** Every rule starts as soft guidance in CLAUDE.md. If it proves useful across multiple sessions, it becomes established convention. If it's violated twice despite being documented, it graduates to hook-enforced -- you build a hook that blocks the violation programmatically.

The maturity progression:

1. **New** -- Just added. May need rewording. Hasn't been tested in practice.
2. **Established** -- Proven useful across sessions. Wording is stable.
3. **Hook-enforced** -- Violated twice, now enforced by a PreToolUse or PostToolUse hook.

### Step 3: Set Up MEMORY.md

Copy the template:

```bash
cp ~/.hexis/repo/templates/MEMORY.md ./MEMORY.md
```

MEMORY.md captures gotchas -- things that break routine operations. The key distinction:

- **CLAUDE.md** = rules ("do this")
- **MEMORY.md** = gotchas ("watch out for this")
- **docs/solutions/** = how-tos ("here's how to do this")

MEMORY.md is auto-loaded by Claude Code at session start, making it ideal for high-frequency warnings that affect everyday work. Don't put long-form guides here -- just the facts that prevent repeated mistakes.

### Step 4: Install Your First Hook

The bash-guard hook prevents dangerous commands. If you used `hexis init`, it's already copied. Otherwise:

```bash
cp ~/.hexis/repo/templates/hooks/bash-guard.js .claude/hooks/
```

Register it in `.claude/settings.json`:

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
    ]
  }
}
```

Test it by asking Claude to run a command the hook should block. If the hook is working, the command will be rejected with an explanation.

**How hooks work in Hexis:** Hooks are JavaScript files that run before or after Claude uses a tool. A PreToolUse hook can inspect the command and return `{"decision": "block", "reason": "..."}` to prevent it. This is the enforcement mechanism that makes rules non-optional.

### Step 5: Set Up the Rule Violation Log

If you used `hexis init`, this is already in place. Otherwise:

```bash
cp ~/.hexis/repo/templates/rule-violation-log.md ./rule-violation-log.md
```

This is the heart of Hexis's self-correction mechanism. When a rule exists but Claude still violates it:

1. Log it in the violation log
2. Identify the root cause (was the rule unclear? too broad? competing with another rule?)
3. Fix the rule
4. If the same rule is violated twice, build a hook

The log creates accountability. Without it, violated rules stay as soft guidance indefinitely, and the same mistakes repeat. With it, you have a clear signal for when to invest in automation.

### Step 6: Start Working

That's it for the basic setup. As you use Claude Code:

- **When something breaks:** Add a gotcha to MEMORY.md
- **When you discover a pattern:** Add a how-to to docs/solutions/
- **When a rule is violated:** Log it in the violation log
- **When a rule is violated twice:** Build a hook

Over time, your system becomes self-correcting: corrections flow up (violation to rule to hook), knowledge flows down (rule to skill to solution).

## The Feedback Loop

```
  User correction
        |
        v
  Add to MEMORY.md or CLAUDE.md
        |
        v
  Rule violated? --> Log in rule-violation-log.md
        |
        v
  Violated twice? --> Build a hook
        |
        v
  Hook enforced -- mistake is now impossible
```

Each session should leave the system slightly better than it found it. Not through bulk reorganization, but through targeted responses to actual friction.

## What's Next

- **[Architecture Overview](architecture.md)** -- Understand the full Hexis layer model
- **[Enforcement Escalation](enforcement-escalation.md)** -- Deep dive on the self-correction pattern
- **[Skill Design Guide](skill-design-guide.md)** -- Create your first skill
- **[Hook Patterns](hook-patterns.md)** -- Taxonomy of useful hooks
