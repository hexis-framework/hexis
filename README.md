# Hexis

**The disposition layer between raw AI intelligence and effective action.**

Hexis (ἕξις — "stable disposition built through repetition") is a meta-cognitive framework for [Claude Code](https://claude.com/claude-code). It turns flat configuration files into a self-correcting system where every correction becomes a rule, and rules that fail become hooks.

## The Problem

Most Claude Code setups are static: a CLAUDE.md file, maybe some skills, a few hooks. When something goes wrong, you fix it in the moment and hope you remember next time.

Hexis makes the system learn from its own failures. Corrections flow *up* (violation → rule → hook). Knowledge flows *down* (rule → skill → solution). A session lifecycle drives the loop.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  LIFECYCLE (temporal orchestration)              │
│  session start → work → wrap → review            │
│  Drives the compound learning loop               │
├─────────────────────────────────────────────────┤
│  Layer 1: CONTEXT (always loaded)                │
│  CLAUDE.md (rules) + MEMORY.md (gotchas)         │
├─────────────────────────────────────────────────┤
│  Layer 2: ENFORCEMENT (hard gates)               │
│  Hooks: bash-guard, stuck-detector, formatters   │
│  Rule violation log → 2 strikes → new hook       │
├─────────────────────────────────────────────────┤
│  Layer 3: CAPABILITY (on-demand)                 │
│  Skills (modular workflows)                      │
│  Agents (specialized subprocesses)               │
│  Tools (CLI utilities)                           │
├─────────────────────────────────────────────────┤
│  Layer 4: KNOWLEDGE (reference)                  │
│  Solutions KB (how-tos and patterns)             │
│  Vault (structured notes)                        │
│  Conversation memory                             │
└─────────────────────────────────────────────────┘
```

## The Core Innovation: Enforcement Escalation

Every rule starts soft and hardens through failure:

```
observation → CLAUDE.md rule → MEMORY.md reminder
  → violation log → 2nd violation → hook (hard gate)
```

This means you don't need to anticipate every failure mode upfront. Start with a rule in CLAUDE.md. If it gets violated, log it. If it gets violated *again*, build a hook that makes it impossible to violate. The system tightens itself.

See [docs/enforcement-escalation.md](docs/enforcement-escalation.md) for the full pattern.

## Quick Start

```bash
# 1. Create the directory structure
mkdir -p .claude/hooks .claude/skills docs/solutions

# 2. Copy the templates
cp templates/CLAUDE.md ./CLAUDE.md
cp templates/MEMORY.md ./MEMORY.md
cp templates/rule-violation-log.md ./rule-violation-log.md

# 3. Install your first safety hook
cp templates/hooks/bash-guard.js .claude/hooks/
# Then register it in .claude/settings.json (see getting-started guide)

# 4. Start working — the system learns as you go
```

See [docs/getting-started.md](docs/getting-started.md) for the full walkthrough.

## Philosophy

- **Curated, not auto-generated.** Every rule is written by a human. [Research shows](docs/philosophy.md) auto-generated context files decrease task success rates.
- **Hooks over rules.** If it must happen, don't ask — enforce. Three tiers: nice-to-have (CLAUDE.md) → should happen (+ MEMORY.md) → must happen (hook).
- **Every correction is a rule.** One fix shouldn't happen twice. Capture it immediately.
- **Skills over MCP.** MCP schemas cost 350-500 tokens/turn idle. Skills load on demand at zero overhead.
- **Seed early, prune later.** Create a skill the first time you do something novel. Demote it if it doesn't recur.

Read [docs/philosophy.md](docs/philosophy.md) for the full design principles.

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | Layer model, data flow, extension points |
| [Philosophy](docs/philosophy.md) | Design principles and rationale |
| [Enforcement Escalation](docs/enforcement-escalation.md) | The self-correction pattern |
| [Getting Started](docs/getting-started.md) | Manual setup guide |
| [Skill Design Guide](docs/skill-design-guide.md) | How to create effective skills |
| [Hook Patterns](docs/hook-patterns.md) | Taxonomy of useful hooks |

## Status

Hexis is in early release. The architecture and patterns are battle-tested (running 56 skills, 12 hooks, 110+ solutions KB files in daily production use), but the open-source packaging is new.

Currently supports **Claude Code** only. Cross-agent support (Cursor, Copilot, Windsurf) is future work.

## License

MIT
