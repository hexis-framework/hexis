---
name: design-skill
description: Guide for designing skills. Use when creating new skills, refactoring existing ones, or reviewing skill architecture.
---

# Skills Design Guide

Skills are directories with a `SKILL.md` file. Two types:

| Type | `user_invocable` | Trigger | Example |
|------|---|---|---|
| **Invocable** | `true` | User types `/skillname` | `todo`, `morning`, `wrap` |
| **Reference** | `false` | Claude consults internally | `web-search`, `browser-automation` |

**Reference skill caveat:** Only useful if Claude actively decides to check it. High-signal patterns should graduate to MEMORY.md or CLAUDE.md where they're always in context. Keep reference skills as detailed appendices, not primary behavior drivers.

## Skill vs Other Storage

| Signal | Where | Example |
|--------|-------|---------|
| "Always/never do X" (rule) | `CLAUDE.md` | "Never force-push to main" |
| "X breaks when Y" (one-line fact) | `MEMORY.md` | "sqlite-vec needs enable_load_extension before load" |
| "When X happens, do steps Y->Z" (procedure with trigger + variants) | **Skill** | Multi-step workflow with decision branches |
| "Here's how X works in detail" (deep reference) | `$HEXIS_SOLUTIONS/` | Tool-specific patterns |

**The test:** If the knowledge fits in one sentence, it's a MEMORY.md bullet. If it has a trigger condition, multiple steps, or variants -- it's a skill.

## Design Principles

### 1. Descriptions = When to Use, NOT What It Does

Descriptions that summarize the skill's workflow cause Claude to follow the description as a shortcut instead of reading the full SKILL.md.

```yaml
# BAD: Summarizes workflow -- Claude shortcuts
description: Use when executing plans - dispatches subagent per task with code review between tasks

# GOOD: Just triggering conditions
description: Use when executing implementation plans with independent tasks
```

### 2. Self-Contained

Keep scripts/code inside the skill directory, not scattered elsewhere.

```
skills/mcp-sync/
  +-- SKILL.md
  +-- mcp-sync.py
```

### 3. Chain, Don't Duplicate

Skills should call other skills, not copy their logic.

### 4. Rationalizations to Reject

For steps Claude is tempted to skip, pre-list the common excuses. Use sparingly -- only on steps where you've observed Claude actually skipping.

```markdown
| Excuse | Why It's Wrong |
|--------|----------------|
| "The code is simple enough it doesn't need tests" | Simple code has simple tests |
```

### 5. Active Questions > Passive Tables

When a skill needs the model to scan or evaluate something, use direct yes/no questions -- not reference tables. Tables present correct information but the model skips over them (wrap skill: 54% boilerplate rate with a passive "What to Look For" table). Rephrasing as questions forces the model to engage with each item before concluding "nothing here."

```markdown
# BAD: Passive -- model scans the table and rubber-stamps "nothing"
| Type | Signal |
|------|--------|
| Patterns | Same issue came up 3 times |
| Friction | Something took 4 attempts |

# GOOD: Active -- model must answer each before exiting
1. **Did I retry anything?** Multiple attempts = friction worth documenting
2. **Did the same issue come up more than once?** Repetition = pattern
```

Add a **fast path** for genuinely trivial cases (e.g., <=3 turns) so the questions don't add overhead where there's clearly nothing to find.

### 6. Seed Skills Early

When a novel pattern emerges (a useful visualization technique, a new workflow, a research method), **propose creating a stub skill immediately** -- don't wait for three occurrences. The skill acts as a collector: one pattern today, more added organically as they come up. A stub that grows is better than reconstructing three patterns from memory after the fact. If it's still a single pattern after a month, demote to `$HEXIS_SOLUTIONS/`.

**Actively propose:** When you spot the user doing something for the first time that looks like it'll recur (a type of analysis, a content format, a deployment pattern), suggest seeding a skill for it.

### 7. Naming

- **Action skills** -> verb-first: `evaluate-job`, `design-skill`
- **Trigger/lookup skills** -> short nouns: `todo`, `weather`, `morning`
