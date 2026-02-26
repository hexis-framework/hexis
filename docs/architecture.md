# Hexis Architecture

Hexis organizes Claude Code's extension points into four content layers plus a lifecycle orchestration concern. This document explains each layer, how data flows between them, and how to decide which mechanism to use for any given need.

## The Layer Model

```
┌─────────────────────────────────────────────────┐
│  LIFECYCLE (temporal orchestration)              │
│  session start → work → wrap → review            │
├─────────────────────────────────────────────────┤
│  Layer 1: CONTEXT (always loaded)                │
│  CLAUDE.md (rules) + MEMORY.md (gotchas)         │
├─────────────────────────────────────────────────┤
│  Layer 2: ENFORCEMENT (hard gates)               │
│  Hooks, violation log, escalation triggers       │
├─────────────────────────────────────────────────┤
│  Layer 3: CAPABILITY (on-demand)                 │
│  Skills, agents, tools                           │
├─────────────────────────────────────────────────┤
│  Layer 4: KNOWLEDGE (reference)                  │
│  Solutions KB, vault, conversation memory         │
└─────────────────────────────────────────────────┘
```

The layers are ordered by proximity to the LLM's attention. Context is always present. Enforcement runs automatically on lifecycle events. Capability loads on demand. Knowledge is consulted when needed.

### Lifecycle: The Clock Signal

The lifecycle layer is not a content layer — it's the temporal orchestration that makes the four content layers compound rather than static.

| Phase | What happens | What it drives |
|-------|-------------|----------------|
| **Session start** | Load CLAUDE.md + MEMORY.md, check recent context | Context layer refreshes |
| **Work** | Execute tasks, capture corrections immediately | Capability + Knowledge layers active |
| **Wrap** | Review session for new rules, update violation log | Enforcement escalation |
| **Periodic review** | Tightening pass — prune dead rules, promote violations | System-wide maintenance |

Without the lifecycle, you have four static layers. With it, you have a compound learning loop: each session's corrections feed into the next session's rules.

### Layer 1: Context

**Always loaded.** These files are in Claude Code's context window for every message.

| File | Purpose | Content type |
|------|---------|-------------|
| `CLAUDE.md` | Rules and conventions | Imperatives: "do this", "never do that" |
| `MEMORY.md` | Operational gotchas | Warnings: "watch out for this", "this breaks" |

**CLAUDE.md** is the primary instruction set. Rules are annotated with maturity levels (🌱 New → 📋 Established → 🔒 Hook-enforced) that track their lifecycle.

**MEMORY.md** complements CLAUDE.md with high-frequency gotchas — things that break routine operations. It's the "I keep forgetting this" file. Target: under 150 lines. If it grows beyond that, promote generalizable patterns to `docs/solutions/`.

**The distinction matters:** CLAUDE.md = what to do. MEMORY.md = what goes wrong. Mixing them dilutes both.

### Layer 2: Enforcement

**Runs automatically.** Hooks execute on Claude Code lifecycle events (PreToolUse, PostToolUse, UserPromptSubmit, etc.) without consuming LLM tokens.

Enforcement is the layer that makes rules stick. CLAUDE.md rules are soft guidance — the LLM can and will skip them under context pressure or distraction. Hooks are hard gates.

The three-tier enforcement hierarchy:

| Tier | Mechanism | Reliability | Example |
|------|-----------|-------------|---------|
| Nice to have | CLAUDE.md instruction | ~70% compliance | "Prefer scoped searches" |
| Should happen | CLAUDE.md + MEMORY.md reminder | ~85% compliance | "Check solutions KB before writing new ones" |
| Must happen | Hook (hard gate) | ~100% enforcement | bash-guard blocks `rm -rf` without safety check |

**The decision rule:** If the enforcement mechanism is "instructions tell the LLM to do it," stress-test it first. If it collapses under context pressure, it belongs in a hook, not in CLAUDE.md.

**Enforcement escalation** is the process by which rules move up the hierarchy. See [enforcement-escalation.md](enforcement-escalation.md) for the full pattern.

### Layer 3: Capability

**Loaded on demand.** Skills, agents, and tools extend what Claude Code can do.

| Mechanism | Loads when | Context | Token cost |
|-----------|-----------|---------|-----------|
| **Skills** | User invokes `/command` or Claude matches trigger | Main conversation (inherits CLAUDE.md) | Prompt injection only |
| **Agents** | Delegated by Claude or explicit Task call | Isolated (no CLAUDE.md, no conversation history) | Per-invocation |
| **Tools** | Tool call (MCP or CLI) | Protocol-level | Per-call |

**Skills are the default extension mechanism.** MCP server schemas cost 350-500 tokens per turn in the system prompt regardless of use. Skills are markdown files that load on demand at zero idle overhead. Reserve MCP for stateful connections (databases, browser sessions, external APIs).

Two types of skills:
- **Invocable** (`user_invocable: true`) — triggered by `/command`. Workflows with steps.
- **Reference** (`user_invocable: false`) — consulted automatically by Claude when relevant. Troubleshooting guides, tool routing tables.

### Layer 4: Knowledge

**Consulted when needed.** The long-term memory of the system.

| Store | What goes here | Access pattern |
|-------|---------------|----------------|
| **Solutions KB** (`docs/solutions/`) | Reusable how-tos, patterns, gotchas | Direct search (grep/ls) |
| **Vault / notes** | Structured reference material | Semantic search or direct read |
| **Conversation memory** | What was discussed in past sessions | Search by query |

The knowledge layer is where Hexis is deliberately *un*opinionated. You can use Obsidian, plain markdown, a wiki, or nothing at all. Hexis cares about the meta-cognitive layer (memory, skills, hooks, enforcement) but not the knowledge store's format.

## Data Flow

Two flows define how the system evolves:

### Corrections Flow Up

```
Something goes wrong during work
  → Add gotcha to MEMORY.md
  → If it becomes a pattern, add rule to CLAUDE.md
  → If the rule is violated, log it in rule-violation-log.md
  → If violated twice, build a hook (hard gate)
```

Each correction makes the system stricter. Rules harden through failure, not through anticipation.

### Knowledge Flows Down

```
CLAUDE.md rule
  → Skill encodes the workflow steps
  → docs/solutions/ captures the reusable pattern
  → Conversation memory records the context
```

Each level provides more detail. CLAUDE.md says "do X." The skill says "here's how to do X, step by step." The solution says "here's why X works and when it doesn't."

### The Compound Effect

The lifecycle layer connects these two flows. During session wrap:
1. Review work for uncaught violations → corrections flow up
2. Capture new patterns in solutions KB → knowledge flows down
3. Update violation log → enforcement escalation triggers

Over time, the system tightens: more rules graduate to hooks, more patterns are captured in skills, and the LLM makes fewer mistakes because its instructions are more precise.

## Knowledge Routing

When new information needs to be captured, this decision tree determines where it goes:

```
Is it a gotcha that affects routine operations?
  YES → MEMORY.md (high-frequency, always loaded)
  NO ↓

Is it a reusable how-to or pattern?
  YES → docs/solutions/ (searchable, not always loaded)
  NO ↓

Is it a rule about what Claude should or shouldn't do?
  YES → CLAUDE.md (authoritative, always loaded)
  NO ↓

Is it structured reference material?
  YES → Vault / notes (organized by topic)
  NO ↓

Is it something we discussed that might be useful later?
  YES → Conversation memory (searchable by query)
  NO → Probably doesn't need to be captured
```

## Extension Mechanism Stability

Not all Claude Code extension points are equally stable. This classification helps you decide how much to invest in each:

| Extension Point | Stability | Investment guidance |
|----------------|-----------|-------------------|
| CLAUDE.md, MEMORY.md | **Stable** | File-based, unlikely to change. Build freely. |
| Skills directory (`~/.claude/skills/`) | **Stable** | File-based discovery. Build freely. |
| Hook lifecycle events (PreToolUse, PostToolUse) | **Semi-stable** | Events are documented but the set may evolve. Build with awareness. |
| Hook input/output JSON schema | **Unstable** | `hookSpecificOutput` with `permissionDecision: "deny"` is convention, not API. May break between versions. |
| `settings.json` format | **Unstable** | Has changed and will change. Avoid programmatic modification. |
| Agents directory (`~/.claude/agents/`) | **Semi-stable** | File-based but agent features are actively evolving. |

**Practical implication:** Hexis v0.1 only creates files in stable locations (CLAUDE.md, skills, solutions). It does not programmatically modify `settings.json`. Hook registration is documented as a manual step.

## Anti-Patterns

### Skill for something that should be a hook

If it must happen every time (formatting, validation, safety checks), don't rely on Claude remembering to invoke a skill. Hooks run automatically on lifecycle events.

### Hook for something that needs LLM reasoning

Hooks are shell scripts — they can pattern-match, not think. If the rule has nuanced exceptions ("block this *unless* the user explicitly asked for it"), keep it in CLAUDE.md.

### Auto-generated context files

Research (Latent Space, Feb 2026) found that LLM-generated context files *decrease* task success rates while increasing token costs. Every rule in Hexis is curated by a human. The intelligence is in the curation, not in the volume.

### Elaborate enforcement that collapses to a prompt line

If you're building a "memory system" where the only enforcement mechanism is "the skill tells Claude to do it," you don't have enforcement — you have a prompt. Stress-test the mechanism: if removing the skill and adding one line to CLAUDE.md produces the same behavior, skip the infrastructure.

## Further Reading

- [Philosophy](philosophy.md) — Design principles and rationale
- [Enforcement Escalation](enforcement-escalation.md) — The self-correction pattern in detail
- [Skill Design Guide](skill-design-guide.md) — How to create effective skills
- [Hook Patterns](hook-patterns.md) — Taxonomy of useful hooks
