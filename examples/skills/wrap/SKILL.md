---
name: wrap
description: End-of-session wrap-up. TODO sweep, session log, then capture non-obvious learnings.
user_invocable: true
---

# Wrap

End-of-session wrap-up -- TODO sweep, session log, then catch what inline learning missed.

## Triggers

- "wrap", "wrap up", "let's wrap"
- "what did we learn"
- End of long/meaty session

## What to Look For

Answer these questions honestly during the scan. If any answer is yes, there's a learning to capture:

1. **Did I retry anything?** Multiple attempts at the same thing = friction worth documenting
2. **Did the user correct me?** Correction = wrong assumption or missing context
3. **Did a tool behave unexpectedly?** API quirk, config trap, undocumented behaviour
4. **Did something work surprisingly well?** Worth noting what made it work
5. **Did the same issue come up more than once?** Repetition = pattern
6. **Did the user choose X over Y without explaining?** Implicit preference worth capturing
7. **Did we use a skill and learn something about the workflow?** Skill-specific learnings should go back into the skill, not MEMORY.md
8. **Did a rule exist but get bypassed?** A MEMORY.md or CLAUDE.md rule that wasn't followed -> log to `rule-violation-log.md`. 2 entries for the same rule = escalate to hook.

## Workflow

1. **TODO sweep** -- FIRST, before anything else. Check if anything done this session should be marked in `TODO.md`. This is mechanical and must not be skipped.
2. **Session log** -- ALWAYS append a summary block to today's daily note (`daily/YYYY-MM-DD.md`). Never skip this step, even for short sessions -- a 1-line entry is fine.
3. **NOW.md overwrite** -- Write `NOW.md` from scratch (full overwrite, never append). Max 15 lines. See Step 3 for format.
4. **Learnings scan** -- Run through the questions in "What to Look For" **internally** (do not print them). If the session was <=3 turns of simple Q&A with no corrections or retries, skip to done. Otherwise, you must answer the questions before concluding there's nothing to capture.
5. If something surfaces -> **dedup**, **route**, and optionally **promote**
6. Done. No ceremony.

### Step 1: TODO Sweep

Two scans -- **match** then **create**:

**Match:** Scan conversation for completed actions that match open items in `TODO.md`:
- Messages sent, forms submitted, tasks finished -> mark `[x]` with brief note
- Keep it fast -- skim for verbs like "sent", "done", "submitted", "ordered", "confirmed"

**Create:** Scan for anything that should become a NEW TODO:
- New commitments or deadlines mentioned -> add as new TODO items
- **WIP that got interrupted** -> add TODO for the remaining work. If state is complex, add enough context to resume in the TODO item or the project's canonical tracker note.
- **Hard test:** Did anything start but not finish this session? If yes, it needs a TODO -- even if it feels like "just exploration." If there's a concrete next action, it's a TODO.

If nothing from either scan, skip silently.

### Step 2: Session Log

Append a session summary to today's daily note (`daily/YYYY-MM-DD.md`). Create the file if it doesn't exist. Each entry is a **concise** block -- key points only, with links to notes where detail lives.

```markdown
### HH:MM-HH:MM -- [Brief title]
- Key outcome or decision (1-3 bullets max)
- Link to relevant note if detail exists
- What's left unfinished (if anything)
```

**Keep it tight.** 2-3 bullets per block. Implementation details (CLI flags, iteration counts, error specifics) belong in project notes or `$HEXIS_SOLUTIONS/`, not the daily log. The daily note answers "what did I do and what matters" at a glance -- not a session replay.

This feeds your daily review -- by EOD the note is already populated. Don't editorialize ("productive session!") -- just log what happened.

### Step 3: NOW.md Overwrite + Project Tracker Update

**NOW.md** -- overwrite entirely from scratch. Never append. This is a "what's hot right now" pointer for cold-start sessions, not a project tracker. Max 15 lines.

```markdown
# NOW
<!-- Max 15 lines. Full overwrite at each /wrap. Stale after 24h. -->
<!-- Blockers live in TODO.md -- don't duplicate here. -->

## Resume point
- [What you were doing + exact next step to pick up -- with links to canonical notes]

## Running (if any)
- [PIDs, log paths, resume commands for active background processes]
```

**Project tracker update:** If the session advanced a project that has a canonical tracker note, update that note with current status. Tracker notes are what fresh sessions reference for real context -- NOW.md just points to them.

### Step 4a: Dedup

Before writing anything, search your knowledge base for duplicates. Check MEMORY.md and `$HEXIS_SOLUTIONS/` for existing entries on the same topic. If already captured with same substance, skip it -- just mention "already captured" in output.

### Step 4b: Route by Type

Don't dump everything into MEMORY.md. Route to the store that fits:

| Type | Destination |
|------|-------------|
| Tool gotcha / how-to | `$HEXIS_SOLUTIONS/` |
| Workflow preference | Relevant project note, or today's daily note if no note exists |
| Cross-session agent context | MEMORY.md |
| General insight | Relevant project note, or `$HEXIS_SOLUTIONS/` |
| Skill workflow improvement | The skill's `SKILL.md` directly |
| Activity-specific | Today's daily note |

For `$HEXIS_SOLUTIONS/`, create a simple markdown file in the appropriate category subdirectory. No YAML schema required -- keep it lightweight. Just the gotcha, why it happens, and the fix.

**No staging area.** Route directly to the final destination. If you genuinely don't know where something belongs, put it in today's daily note -- your daily review will catch it.

### Step 4c: Pattern Promotion

If an insight matches something already captured (dedup search returned a hit with similar theme), flag it:

> "This keeps coming up -- worth promoting to MEMORY.md?"

Only suggest, never auto-promote. The user decides.

## Output

**Write first, then summarise.** Route each finding to its destination, then print a brief narrative wrap. The questions are internal reasoning -- never print them.

**Format:** A short prose paragraph under `**Wrap**` that covers:

1. What the session accomplished (the arc, not a task list)
2. What changed in the vault (TODO, daily, NOW, project trackers -- weave in naturally, don't itemise)
3. What's left unfinished or staged for next time
4. Any learnings captured and where they went (only if something was captured)

Keep it to 3-5 sentences. Write like a handoff note to tomorrow-you, not a build log. No bullet points, no status codes, no arrows.

**Example (meaty session):**

> **Wrap**
> Spent the session building the data pipeline from prototype to production-ready. Wrote integration tests for all three ingestion paths, fixed the race condition in the queue consumer, and documented the retry logic in the project README. TODO updated to reflect the shift from "build it" to "deploy it." Staging deploy is queued for tomorrow morning.

**Example (light session):**

> **Wrap**
> Quick session -- replied to two emails and reorganized the project backlog. Daily note updated, nothing else changed.

**Example (learnings captured):**

> **Wrap**
> Built the CSV import processor and validated against both test datasets. Captured the datetime timezone parsing fix in the project's solutions doc -- naive datetime coercion was the gotcha. Both datasets fully imported, pipeline green. Blocked on API credentials for the production endpoint.

## Notes

- This is a sweep, not a ritual -- 30 seconds, not 3 minutes
- Obvious corrections should've been captured on-the-fly
- Focus on patterns and implicit signals
- One insight well-routed beats five dumped in the same file
