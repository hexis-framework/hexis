# Rule Violation Log

Tracks when a system rule (MEMORY.md, CLAUDE.md, hook) existed but was still violated.
Purpose: surface rules that need upgrading from soft guidance to hard gate (hook).

**Escalation trigger:** 2 entries for the same rule = build a hook. Don't wait for subjective pain.

## How to Use

1. When a rule is violated during a session, add an entry below
2. During session wrap-up, review recent work for uncaught violations
3. When a rule appears twice, create a hook that enforces it programmatically
4. After creating the hook, move the rule from "Soft Rules" to "Hard Rules" in CLAUDE.md

## Log

| Date | Rule | What happened | Root cause | Fix applied |
|------|------|---------------|------------|-------------|
| <!-- Add entries here --> | | | | |

## Escalated to Hooks

<!-- Track rules that graduated to hooks -->

| Rule | Date escalated | Hook file | Violations before escalation |
|------|---------------|-----------|------------------------------|
| <!-- Add entries here --> | | | |

## Archive

<!-- Rules that were logged but turned out to be false positives or one-offs -->
<!-- Move here instead of deleting, to avoid re-investigating -->
