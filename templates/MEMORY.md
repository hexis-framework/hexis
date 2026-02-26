# Auto-Memory

> Complements CLAUDE.md (rules). This file captures operational gotchas —
> things that break routine operations. Kept concise (<150 lines).
>
> **Routing guide:**
> - Rule ("always do X") → CLAUDE.md
> - Gotcha ("X breaks when Y") → here
> - How-to ("steps to do X") → docs/solutions/
> - Reference ("X is documented at Y") → your notes/vault
>
> **Maturity:** Entries here are living observations. When a gotcha generalizes
> into a reusable pattern, promote it to docs/solutions/. When it stops being
> relevant, delete it. This file should never grow stale.

## Tool Gotchas

<!-- High-frequency issues with tools you use daily.
     Format: **tool/command** — what breaks and the workaround.
     Only include things that have bitten you at least once. -->

- [Example: **grep on large directories** — times out without scope limits. Use path filters.]
- [Example: **package-manager** — global installs not in PATH for non-interactive shells.]

## Search & File Patterns

<!-- What works, what breaks, and workarounds for finding things.
     File system quirks, search tool limitations, encoding issues. -->

- [Example: Case-sensitive file system — use case-insensitive flags when unsure of casing]
- [Example: Recursive glob in home directory times out — always scope to a subdirectory]

## Shell Environment

<!-- Package managers, PATH issues, aliases, env var quirks.
     Things that affect how commands behave in your setup. -->

- [Example: **find** is aliased to fd — use /usr/bin/find for POSIX syntax]
- [Example: **env vars** in .zshenv not .zshrc — non-interactive shells skip .zshrc]

## Date/Time

<!-- If you work across timezones or need accurate time references,
     capture the gotchas here. -->

- [Example: Always run date before stating current time — do not guess from context]

## Project-Specific

<!-- Gotchas tied to active projects. When a project ends,
     archive or delete its entries. -->

### [Project Name]

- [Example: Uses port 3001, not default 3000]
- [Example: Test suite requires Docker running]

## Session Patterns

<!-- Workflow discoveries that affect how you operate.
     Things you have learned about effective AI collaboration. -->

- [Example: Clear context between unrelated tasks to avoid cross-contamination]
- [Example: Background tasks can silently fail — check output early]

## Housekeeping

<!-- Cleanup commands, maintenance notes, periodic tasks. -->

- [Example: Orphaned temp files accumulate in .cache/ — purge monthly]
- [Example: Log rotation: delete files older than 7 days in logs/]

---

> **Maintenance:**
> - Review monthly. Target: under 150 lines.
> - Promote patterns that generalize → docs/solutions/
> - Demote items no longer relevant → delete
> - If this file exceeds 150 lines, it is trying to do too much.
>   Split by moving how-tos to docs/solutions/ and rules to CLAUDE.md.
