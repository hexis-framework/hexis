# Skill Design Guide

How to design effective skills for the Hexis framework. Skills are markdown instruction files that Claude Code loads and follows -- they're the primary way to encode repeatable workflows.

## Two Types of Skills

### Invocable Skills

Triggered by the user with `/skill-name`. These are workflows with specific steps.

```yaml
---
name: wrap
description: End-of-session review. Captures learnings, updates violation log.
user_invocable: true
---
```

**Examples:** `/wrap`, `/todo`, `/decide`, `/morning`

The user says the command, Claude loads the skill file, and follows its instructions. The skill defines the full workflow -- Claude doesn't need to improvise.

### Reference Skills

Not triggered directly. Claude consults them automatically when relevant context appears.

```yaml
---
name: web-search
description: Reference for choosing the right web search tool. Consulted when Claude needs to search the web.
user_invocable: false
---
```

**Examples:** `web-search` (tool routing), `browser-automation` (troubleshooting), `deployment` (checklist)

Reference skills act as decision aids. When Claude encounters a situation the skill covers, it reads the skill for guidance rather than improvising. This is how you encode domain knowledge that applies across many different tasks.

## The Seven Design Principles

### 1. Descriptions = When to Use

The `description` field in the frontmatter is a routing signal, not marketing copy. Write it as a trigger condition -- it tells Claude when to load this skill.

**Good:**
```yaml
description: End-of-session review. Run when user says /wrap or session is ending.
```

**Bad:**
```yaml
description: A comprehensive session management tool for optimal workflow closure.
```

The description answers one question: "Under what conditions should Claude load this file?" If the description doesn't answer that clearly, Claude will either load the skill when it shouldn't, or miss it when it should.

### 2. Self-Contained

A skill must work without external context. Include everything needed in the skill file itself. Don't assume Claude has read another file, remembers a previous session, or has implicit knowledge about your setup.

This means:
- Include exact file paths, not relative references
- Spell out commands in full, don't reference "the usual approach"
- If the skill depends on a tool being installed, say so explicitly
- If the skill references a config format, include an example

The test: could someone with zero context about your project follow this skill file and get the right result? If not, add what's missing.

### 3. Chain, Don't Duplicate

Skills should compose. If skill A needs skill B's output, have A invoke B -- don't copy B's logic into A.

**Good:**
```markdown
### Step 2: Run analysis
Invoke `/analyze` on the output from Step 1.
```

**Bad:**
```markdown
### Step 2: Run analysis
[200 lines copied from the analyze skill]
```

Duplication means two places to update when the logic changes. One of them will get stale. Chain instead: reference the other skill by name and let Claude load it.

### 4. Rationalizations to Reject

List common excuses for NOT following the skill's workflow, and pre-emptively reject them. This is the most underused principle -- and the most powerful.

Claude (and users) will find reasons to skip steps. Anticipate those reasons and address them in the skill itself.

**Example:**
```markdown
## Rationalizations to Reject

- "This change is too small to need tests" -- If it touches shared code, it needs tests. Size is not the criterion; blast radius is.
- "I'll add the log entry later" -- You won't. The session will end and the violation will be forgotten. Log it now.
- "The existing pattern is close enough" -- Close enough means subtly wrong. Follow the skill exactly or propose an amendment.
```

This works because it catches the skip-reasoning at the moment it occurs, not after the damage is done.

### 5. Active Questions > Passive Tables

Instead of reference tables that Claude has to interpret, use decision questions that guide to the right answer.

**Before (passive table):**
```markdown
| Tool | Speed | Cost | Quality |
|------|-------|------|---------|
| Tool A | Fast | Free | Low |
| Tool B | Slow | Paid | High |
| Tool C | Medium | Free | Medium |
```

**After (active questions):**
```markdown
### Which tool to use?

1. Is cost a constraint? If yes, eliminate Tool B.
2. Is quality critical (user-facing output)? If yes, use Tool B.
3. Otherwise, use Tool C (best balance of speed and quality).
```

Tables require Claude to weigh multiple factors simultaneously and make a judgment call. Decision trees encode your judgment directly, leaving less room for error.

### 6. Seed Skills Early

Create a stub skill the first time you do something novel. Don't wait for the pattern to repeat three times -- by then you've already made the mistake twice.

A stub skill can be minimal:

```markdown
---
name: deploy-staging
description: Deploy to staging environment. Run when user says /deploy-staging.
user_invocable: true
---

# Deploy to Staging

## Workflow

1. Run tests
2. Build the project
3. Deploy to staging URL

## Gotchas

- [Add as discovered]
```

The skill acts as a collector. Each time you do the task, you add what you learned. After three iterations, you have a complete skill without ever having to reconstruct it from memory.

### 7. Naming

Skill names should be verbs or verb phrases. The name is a command -- it tells Claude what action to take.

**Good:** `/wrap`, `/decide`, `/deploy`, `/review-pr`, `/morning`

**Bad:** `/session-end`, `/decision-framework`, `/deployment-system`, `/pr-review-tool`, `/morning-routine`

Keep names short (one or two words). If you need a longer name, use hyphens. Avoid nouns -- a skill is something you do, not something you have.

## When to Create a Skill

Not everything belongs in a skill. Use this decision table:

| Signal | Create a skill | Put in CLAUDE.md | Put in docs/solutions/ |
|--------|---------------|-----------------|----------------------|
| Multi-step workflow that repeats | Yes | No | No |
| Simple rule (one sentence) | No | Yes | No |
| Reusable how-to or reference | No | No | Yes |
| Needs specific ordered steps | Yes | No | No |
| One-line behavioral instruction | No | Yes | No |
| Troubleshooting reference | Reference skill | No | Also fine |
| Domain knowledge for decisions | Reference skill | No | No |

**Rules of thumb:**
- If it has steps, it's a skill
- If it's one sentence, it's a CLAUDE.md rule
- If it explains how something works, it's a docs/solutions/ file
- If Claude needs to consult it mid-task without being asked, it's a reference skill

## Skill Template

See [templates/SKILL.md](../templates/SKILL.md) for the standard template. Every skill should include at minimum:

- Frontmatter with `name`, `description`, and `user_invocable`
- A trigger section (when to use)
- A workflow section (what to do)
- Error handling (what to do when things go wrong)

## Progressive Disclosure

Keep the default path simple. Put advanced options behind clearly marked sections so they don't overwhelm the common case.

**Good:**
```markdown
## Workflow

### Step 1: Check inputs
Verify the file exists and is valid JSON.

### Step 2: Execute
Run the transformation and save the output.

### Step 3: Verify
Confirm the output matches expected format.

## Advanced: Custom Configuration

For non-standard setups, you can override the defaults:
- **Custom output path:** Set `OUTPUT_DIR` before running
- **Dry run mode:** Add `--dry-run` to skip the save step
- **Verbose logging:** Add `--verbose` for debugging
```

**Bad:**
```markdown
## Workflow

### Step 1: Configure all options
Before doing anything, decide on:
- Output path (default: ./out, override with OUTPUT_DIR)
- Dry run mode (default: false, set with --dry-run)
- Verbose logging (default: false, set with --verbose)
- Input format (default: JSON, also supports YAML and TOML)
- Validation level (default: strict, also supports lenient)
[User hasn't done anything yet and is already overwhelmed]
```

The principle: make the simple thing simple, and the complex thing possible. Most skill invocations follow the happy path. Don't front-load every edge case.
