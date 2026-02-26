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

## Before / After

Most Claude Code setups look like this:

```markdown
# CLAUDE.md
Use TypeScript. Run tests before committing. Prefer pnpm.
```

A Hexis-powered setup looks like this:

```
project/
├── CLAUDE.md                    # Rules with maturity annotations (🌱→📋→🔒)
├── MEMORY.md                    # Gotchas that affect daily work
├── rule-violation-log.md        # 2 strikes → becomes a hook
├── .claude/
│   ├── hooks/
│   │   ├── bash-guard.js        # Hard gate: blocks rm -rf, unscoped grep
│   │   └── stuck-detector.js    # Detects 3x repeated failures
│   └── skills/
│       ├── wrap/SKILL.md        # End-of-session review + learning capture
│       └── decide/SKILL.md      # Structured decision-making
└── docs/
    └── solutions/               # Reusable how-tos (every hard fix → a doc)
```

The flat file says *what to do*. The system learns *what went wrong* and makes it impossible to repeat.

## Quick Start

```bash
# Clone and run the scaffolder
git clone https://github.com/hexis-framework/hexis.git ~/.hexis/repo
cd your-project

# Scaffold the directory structure + core templates
~/.hexis/repo/hexis init

# Add modules
~/.hexis/repo/hexis add wrap              # Session wrap-up skill
~/.hexis/repo/hexis add stuck-detector    # Repeated-failure detector

# See everything available
~/.hexis/repo/hexis list
```

Or set up manually — see [docs/getting-started.md](docs/getting-started.md) for the full walkthrough.

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

## Ecosystem

| Tool | Description |
|------|-------------|
| [consilium](https://github.com/hexis-framework/consilium) | Multi-model deliberation CLI — 5 frontier models debate, then a judge synthesises |
| [oghma](https://github.com/hexis-framework/oghma) | Conversation memory daemon with semantic search |
| [compound-engineering](https://github.com/hexis-framework/compound-engineering-plugin) | Claude Code plugin: plan → work → review → compound workflows |

## Status

Hexis is in early release. The architecture and patterns are battle-tested (running 56 skills, 12 hooks, 110+ solutions KB files in daily production use), but the open-source packaging is new.

Currently supports **Claude Code** only. Cross-agent support (Cursor, Copilot, Windsurf) is future work.

## Contributing

Issues and PRs welcome. See the [skill design guide](docs/skill-design-guide.md) and [hook patterns](docs/hook-patterns.md) if you'd like to contribute modules.

## License

MIT
