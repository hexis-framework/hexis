# CLAUDE.md

> This CLAUDE.md follows the [Hexis](https://github.com/hexis-framework/hexis) meta-cognitive framework.
> Rules are annotated with maturity levels: 🌱 New → 📋 Established → 🔒 Hook-enforced → ❌ Deprecated

## Operating Philosophy

<!-- 📋 Established: This section rarely changes once set. Define how your AI assistant
     should behave — autonomy level, communication style, decision-making boundaries.
     Start with 2-3 principles and refine over time. -->

- [Your core principles — e.g., "Be direct, push back when a simpler approach exists"]
- [Autonomy boundary — e.g., "Draft autonomously, pause before external actions"]
- [Quality bar — e.g., "Before marking work complete, ask: would a senior engineer approve this?"]

## Working Environment

- **Timezone:** [Your timezone, e.g., UTC-5 / EST]
- **Shell:** [Your shell, e.g., zsh, bash, fish]
- **Platform:** [Your platform, e.g., macOS, Linux]
- **Package managers:** [Your preferred package managers, e.g., pnpm, uv]
- **Terminal:** [Your terminal emulator, if relevant]

## Context Hierarchy

<!-- Hexis loads context in this order. Customize paths to match your setup.
     The hierarchy determines precedence: lower entries override higher ones
     for project-specific concerns. -->

1. **This file (CLAUDE.md)** — global rules and conventions
2. **MEMORY.md** — operational gotchas (high-frequency corrections)
3. **Project-specific CLAUDE.md** — per-repo overrides that take precedence
4. **[Your knowledge base]** — reference material, notes, documentation

## Enforcement Rules

<!-- Hexis uses Rule Maturity to track how rules are enforced.
     New rules start as soft guidance. After repeated violations,
     they graduate to hard enforcement via hooks.

     The lifecycle:
     1. You notice a recurring mistake
     2. Add it as a 🌱 Soft Rule below
     3. If violated again, promote to 📋 Established
     4. If violated a third time, create a hook and mark 🔒 Hook-enforced
     5. Rules that no longer apply get marked ❌ Deprecated and pruned

     Track violations in a simple log (see Rule Violation Log section). -->

### Hard Rules (Hook-Enforced)

<!-- 🔒 These rules have corresponding hooks in .claude/hooks/ that block
     the action before it happens. They exist because soft rules failed. -->

- [Example: NEVER run destructive commands without validation — hook: safe-delete.js]
- [Example: NEVER commit secrets or credentials — hook: secret-scan.js]

### Established Rules

<!-- 📋 These rules are proven useful across multiple sessions.
     They are enforced by this file + MEMORY.md reminders.
     If violated twice more, promote to Hard Rule and create a hook. -->

- [Example: Prefer scoped searches over broad recursive patterns]
- [Example: Check existing solutions before writing new ones]
- [Example: Run date before stating the current day/time]

### New Rules

<!-- 🌱 Recently added, not yet validated. Review after 2-3 sessions.
     If they prove useful, promote to Established. If not, remove. -->

- [Rules you are currently testing go here]

### Deprecated

<!-- ❌ Rules that are no longer relevant. Keep briefly for audit trail,
     then remove on next periodic review. -->

## Rule Violation Log

<!-- Track violations here to know when to promote rules.
     Format: date | rule | what happened | action taken
     Review weekly. Two violations of the same rule = promotion trigger.

| Date | Rule | Violation | Promoted? |
|------|------|-----------|-----------|
| [date] | [which rule] | [what went wrong] | [yes/no] |
-->

## Knowledge Routing

<!-- Where should the AI store new information it discovers?
     This table prevents knowledge from landing in the wrong place. -->

| What | Where | Example |
|------|-------|---------|
| Operational gotcha | MEMORY.md | "Glob times out on home directory" |
| Reusable how-to | docs/solutions/ | "How to set up pre-commit hooks" |
| Project context | Project CLAUDE.md | "This repo uses Vitest, not Jest" |
| Reference material | [Your notes/vault] | "API documentation summary" |
| Correction to a rule | This file | "Update the search scope rule" |

## Session Lifecycle

<!-- Hexis uses temporal orchestration to drive compound learning.
     Each session is an opportunity to refine your rules. -->

### Session Start
- Review MEMORY.md for active gotchas
- Check recent context (last session notes, TODO files)
- If resuming work, check for stale state (>24h old context)

### During Work
- **Capture corrections immediately** — if the AI makes a mistake and you correct it,
  that correction should become a rule (🌱 New) or a MEMORY.md entry right away
- Route new knowledge using the table above
- One correction = one rule. Do not wait for recurrence to capture

### Session End
- Review for new rules worth capturing
- Update violation log if any rules were broken
- Flush any status changes to persistent files (context does not survive between sessions)

### Periodic Review (Weekly/Monthly)
- **Tightening pass:** Prune dead rules, promote violations to hooks
- Review 🌱 New rules — promote to 📋 or remove
- Review ❌ Deprecated rules — delete after one cycle
- Check MEMORY.md line count (target: under 150 lines)
- Ask: "Are there soft rules I keep violating? Time for a hook."

## Skills

<!-- Skills are reusable instruction sets for recurring tasks.
     List your installed skills here. Create a skill when:
     - You do something non-trivial more than twice
     - A workflow has specific gotchas worth capturing
     - You want consistent behavior across sessions

     Format: skill-name — what it does -->

- [Example: commit — atomic commits with conventional messages]
- [Example: review-pr — structured PR review checklist]

## Quick Reference

<!-- Frequently-used commands, paths, and shortcuts.
     Keep this section short — it should fit on one screen. -->

- **[Tool 1]:** [common command]
- **[Tool 2]:** [common command]
- **[Key path]:** [what lives there]

## Current Projects

<!-- Optional: list active projects so the AI checks for
     project-specific CLAUDE.md files when starting work. -->

- [Project name] — [path] — [one-line description]
