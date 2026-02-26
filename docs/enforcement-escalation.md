# Enforcement Escalation

This is the core innovation of Hexis: a systematic process for turning soft rules into hard gates, driven by observed violations rather than upfront anticipation.

## The Pattern

```
observation → CLAUDE.md rule → MEMORY.md reminder
  → violation log → 2nd violation → hook (hard gate)
```

Every rule starts soft and hardens through failure. You don't need to predict which rules will be violated — the system discovers them.

## How It Works

### Stage 1: Observation

Something goes wrong during a session. Maybe the LLM ran an unscoped search that timed out, or deleted a file it shouldn't have, or skipped a step you'd explicitly documented.

**Action:** Fix the immediate problem. Then write a rule.

### Stage 2: Soft Rule (CLAUDE.md)

Add the rule to CLAUDE.md:

```markdown
## Soft Rules

- 🌱 Prefer scoped searches — never glob with ** on the home directory
```

The 🌱 annotation marks this as a new rule, unvalidated. Most rules start here.

### Stage 3: Reinforcement (MEMORY.md)

If the rule matters for routine operations — if it's the kind of thing that breaks work when forgotten — add a gotcha to MEMORY.md:

```markdown
## Search & File Patterns

- Glob ** on home directory times out. Always scope to a subdirectory.
```

MEMORY.md is always loaded, so this provides a second reinforcement. The rule now appears in two places: CLAUDE.md (imperative) and MEMORY.md (warning).

### Stage 4: Violation Logging

Despite the rule existing in both CLAUDE.md and MEMORY.md, the LLM violates it. This is expected — soft rules have ~85% compliance, not 100%.

**Action:** Log the violation in `rule-violation-log.md`:

| Date | Rule | What happened | Root cause | Fix applied |
|------|------|---------------|------------|-------------|
| 2026-03-01 | "Never glob ** on ~" | Ran `Glob **/*.md` on home dir, 90s timeout | Context was long, rule got deprioritized | Restarted with scoped search |

The root cause column is critical. It tells you *why* the rule was violated:
- **Rule was unclear** → rewrite the rule
- **Rule conflicted with another instruction** → resolve the conflict
- **Context pressure** → the rule is a candidate for hook enforcement
- **Edge case not covered** → broaden the rule

### Stage 5: Escalation (Hook)

The same rule is violated a second time. Two strikes = build a hook.

```javascript
// .claude/hooks/bash-guard.js (PreToolUse)
// Guard: block unscoped glob on home directory
{
  pattern: /glob\s+\*\*.*[~\/home]/i,
  message: "Blocked: unscoped glob on home directory. Scope to a subdirectory."
}
```

Register the hook in `.claude/settings.json`. Update CLAUDE.md to mark the rule as hook-enforced:

```markdown
## Hard Rules (Hook-Enforced)

- 🔒 NEVER glob with ** on home directory — enforced by bash-guard hook
```

The rule is now a hard gate. It can't be violated regardless of context pressure, conversation length, or competing instructions.

### Stage 6: Maintenance

Periodically (weekly or monthly), review the system:
- **Prune dead rules:** Remove 🌱 rules that haven't been relevant in a month
- **Promote established rules:** Change 🌱 to 📋 for rules that have survived 2+ sessions
- **Check hook health:** Verify hooks still work against the current Claude Code version
- **Archive false positives:** Move one-off violations to the archive section of the violation log

## A Complete Example

**Day 1:** You notice Claude used `npm install` in a project that uses pnpm. You add to CLAUDE.md:

```markdown
- 🌱 Use pnpm, not npm, for package management in this project
```

**Day 3:** Claude uses `npm install` again. The rule was in CLAUDE.md but got lost in a long context. You log the violation:

| Date | Rule | What happened | Root cause | Fix applied |
|------|------|---------------|------------|-------------|
| Day 3 | "Use pnpm not npm" | Ran `npm install express` | Long conversation, rule deprioritized | Removed node_modules, ran pnpm install |

You also add to MEMORY.md:
```markdown
- This project uses pnpm. npm will create conflicting lockfiles.
```

**Day 5:** Claude uses `npm` again. Second violation. You build the hook:

```javascript
// bash-guard.js addition
{
  pattern: /\bnpm\s+(install|add|remove|update|ci)\b/,
  message: "Blocked: This project uses pnpm. Use pnpm instead of npm."
}
```

**Result:** The rule is now enforced at the tool level. It doesn't matter how long the conversation is or how many competing instructions exist — `npm install` is blocked.

## The Violation Log Format

```markdown
| Date | Rule | What happened | Root cause | Fix applied |
|------|------|---------------|------------|-------------|
```

Each column serves a purpose:
- **Date** — When it happened (for tracking frequency)
- **Rule** — Which rule was violated (for identifying repeat offenders)
- **What happened** — The concrete failure (not an abstraction)
- **Root cause** — Why the rule failed to prevent it (this drives the fix)
- **Fix applied** — What you did immediately (may differ from the systemic fix)

## When NOT to Escalate

Not every violation warrants a hook. Escalate only when:

- **The violation causes real damage** (data loss, wasted time, security risk)
- **The root cause is context pressure** (the LLM "forgot" the rule), not a one-off edge case
- **The rule is binary** (either it applies or it doesn't — no nuanced exceptions)

Keep as soft rules when:
- **The rule has frequent legitimate exceptions** — hooks are binary, they can't reason about context
- **The violation is low-impact** — a minor style preference doesn't need a hard gate
- **The root cause was a bad rule** — fix the rule, don't automate a bad rule

## Known Failure Mode: Automated Correction Detection

We tried automating the detection of violations — logging every time a file was re-edited or a command was retried, assuming these were corrections.

**It failed.** 154 entries, zero actionable signal. Re-editing a file after a gap is normal iterative work, not a correction. Retrying a command with different arguments is exploration, not failure.

The enforcement escalation pattern works because **violation logging is curated by human judgment** (during session wrap-up), not by automated heuristics. The intelligence is in the classification — recognizing that *this* re-edit was a genuine violation while *that* re-edit was intentional iteration — not in the counting.

**Do not try to automate the violation detection step.** The LLM can help identify violations during session review (it has the context to understand intent), but the decision to log a violation should be deliberate.

## The Math

Why "2 strikes" and not 3 or 5?

- **1 strike is too aggressive.** First violations are often edge cases, unclear rules, or one-offs. Building a hook after one violation creates a rigid system that can't accommodate legitimate exceptions.
- **2 strikes is the sweet spot.** A rule violated twice despite being documented is a rule that soft guidance can't enforce. The marginal cost of a hook (10 minutes to write) is much less than the marginal cost of a third violation (plus all future violations).
- **3+ strikes is too lenient.** Each additional violation costs real time and attention. Waiting for 3 violations means you've already paid the cost 3 times before acting.

The 2-strike threshold is a heuristic, not a law. For high-severity violations (data loss, security leaks), escalate after 1. For low-impact style preferences, you might tolerate 3.

## Further Reading

- [Architecture](architecture.md) — Where enforcement fits in the layer model
- [Philosophy](philosophy.md) — Why hard gates beat soft guidance
- [Hook Patterns](hook-patterns.md) — Taxonomy of hooks you can build
