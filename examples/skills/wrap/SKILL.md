---
name: wrap
description: End-of-session wrap-up. TODO sweep, session log, NOW.md, learnings safety net.
user_invocable: true
---

# Wrap

End-of-session wrap-up. Three mechanical steps + a conditional meta-sweep.

## Triggers

- "wrap", "wrap up", "let's wrap"
- "what did we learn"
- End of long/meaty session

## Workflow

Execute in order. Each step is independent -- don't skip earlier steps if a later one seems more interesting.

### Step 1: TODO Sweep

Read `TODO.md`. Two scans:

**Match:** Completed actions -> mark `[x]` with brief note and `done:YYYY-MM-DD`. Skim for: sent, done, submitted, ordered, confirmed, booked, cancelled. Hard test: is it truly done, or just "dev done"? If it still needs testing, pushing, or confirmation, it stays open with an updated status.

**Create:** New commitments, deadlines, or interrupted WIP -> add as new items. Hard test: did anything start but not finish? If there's a concrete next action, it's a TODO.

Skip silently if nothing matches.

### Step 2: Session Log

Append to today's daily note (`daily/YYYY-MM-DD.md`, create if needed):

```markdown
### HH:MM-HH:MM -- [Brief title]
- Key outcome or decision (1-3 bullets max)
- Link to relevant note if detail exists
```

2-3 bullets. No implementation details -- those belong in project notes or `$HEXIS_SOLUTIONS/`. This feeds your daily review.

### Step 3: NOW.md + Project Trackers

**NOW.md** -- full overwrite, max 15 lines:

```markdown
# NOW
<!-- Max 15 lines. Full overwrite at each /wrap. Stale after 24h. -->

## Resume point
- [What you were doing + exact next step -- with links to canonical notes]

## Running (if any)
- [PIDs, log paths, resume commands]
```

**Vault flush:** If the session advanced a project with a canonical tracker note, update that note now. Conversation context doesn't survive -- if it's not in a file, it's lost.

### Step 4: Meta-Sweep (conditional)

**Skip entirely if:** the session was routine -- simple Q&A, no friction, no corrections, no novelty. Do NOT invent learnings to satisfy this step. A routine session producing nothing here is the correct outcome, not a failure.

**If the session had substance,** one pass through three lenses:

1. **Safety net:** Uncaptured friction, corrections, or gotchas? (If you have a real-time capture hook like UserPromptSubmit, wrap catches what slipped through.) Route to the most specific relevant file: tool gotcha -> `$HEXIS_SOLUTIONS/`, cross-session context -> MEMORY.md, skill workflow -> the skill's SKILL.md.
2. **System evolution:** Should a skill be created or tightened? Should a hook be added? (Same mistake twice despite a written rule -> escalate to hook.) Propose, don't auto-implement.
3. **Generalization:** Does any learning apply beyond where it was routed? Instance -> pattern -> principle. Most don't -- if nothing generalizes, move on.

One pass, all three lenses. If nothing surfaces, skip silently.

## Output

**Write first, then summarise.** A short prose paragraph under `**Wrap**`:

1. What the session accomplished (the arc)
2. What changed in notes/files (weave in naturally)
3. What's unfinished or staged for next time
4. Learnings captured and where (only if something was captured)

3-5 sentences. Handoff note to tomorrow-you, not a build log.

**Example:**

> **Wrap**
> Spent the session building the data pipeline from prototype to production-ready. Wrote integration tests for all three ingestion paths, fixed the race condition in the queue consumer, and documented the retry logic in the project README. TODO updated. Staging deploy queued for tomorrow morning.

## Notes

- This is a sweep, not a ritual -- 30 seconds, not 3 minutes
- One insight well-routed beats five dumped in the same file
