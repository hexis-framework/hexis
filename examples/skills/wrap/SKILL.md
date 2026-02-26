---
name: wrap
description: End-of-session wrap-up. TODO sweep, session log, NOW.md, learnings safety net.
user_invocable: true
---

# Wrap

End-of-session wrap-up. Three mechanical steps + a conditional safety net + system evolution check.

## Triggers

- "wrap", "wrap up", "let's wrap"
- "what did we learn"
- End of long/meaty session

## Workflow

Execute in order. Each step is independent -- don't skip earlier steps if a later one seems more interesting.

### Step 1: TODO Sweep

Read `TODO.md`. Two scans:

**Match:** Completed actions -> mark `[x]` with brief note and `done:YYYY-MM-DD`. Skim for: sent, done, submitted, ordered, confirmed, booked, cancelled.

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

### Step 4: Learnings Safety Net (conditional)

**Skip this step if:** learnings were already captured during the session (check: any writes to `$HEXIS_SOLUTIONS/`, MEMORY.md, or skill files this session?). If you have a real-time capture hook (e.g. UserPromptSubmit), wrap is the safety net, not the primary mechanism.

**If nothing was captured,** run this checklist internally (don't print):

- [ ] Retried anything? (friction)
- [ ] User corrected me? (wrong assumption)
- [ ] Tool behaved unexpectedly? (gotcha)
- [ ] Rule existed but got bypassed? (-> rule violation log)
- [ ] User chose X over Y without explaining? (implicit preference)

If something surfaces, route directly:

| Type | Destination |
|------|-------------|
| Tool gotcha | `$HEXIS_SOLUTIONS/` |
| Workflow preference | Relevant project note |
| Cross-session agent context | MEMORY.md |
| Skill improvement | The skill's SKILL.md |

No dedup search, no staging area. If you missed it all session, just write it now.

### Step 5: System Evolution (quick scan)

Separate from learnings -- this asks "should the machine improve?" not "what did we learn?"

- [ ] **Should a skill be created or tightened?** Repeated multi-step workflow -> new skill. Skill felt bloated or partially redundant -> tighten. Context shifted since skill was written -> update.
- [ ] **Should a hook be added or modified?** Same mistake twice despite a written rule -> escalate to hook.

If nothing, skip silently. If something, propose it -- don't auto-implement.

### Step 6: Generalization Cascade

For each learning captured this session (during the session or in Steps 4-5), ask: **"Does this apply more broadly than where it was routed?"**

- A tool gotcha in one skill -> does it affect other skills?
- A MEMORY.md rule -> is it a generic pattern worth adding to a design guide?
- A skill tightening -> does the *reason* it was tightened reveal a broader maintenance principle?

This is the compounding mechanism. Most learnings stay where they're routed. But ~1 in 5 generalizes upward -- from instance to pattern, from pattern to principle. One pass only. If nothing generalizes, move on.

## Output

**Write first, then summarise.** A short prose paragraph under `**Wrap**`:

1. What the session accomplished (the arc)
2. What changed in notes/files (weave in naturally)
3. What's unfinished or staged for next time
4. Learnings captured and where (only if something was captured)

3-5 sentences. Handoff note to tomorrow-you, not a build log.

**Example (meaty):**

> **Wrap**
> Spent the session building the data pipeline from prototype to production-ready. Wrote integration tests for all three ingestion paths, fixed the race condition in the queue consumer, and documented the retry logic in the project README. TODO updated. Staging deploy queued for tomorrow morning.

**Example (light):**

> **Wrap**
> Quick session -- replied to two emails and reorganized the project backlog. Daily note updated, nothing else changed.

## Notes

- This is a sweep, not a ritual -- 30 seconds, not 3 minutes
- One insight well-routed beats five dumped in the same file
