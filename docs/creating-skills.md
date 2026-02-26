# Create Your First Skill

Skills are markdown instruction files that Claude Code loads and follows — they encode repeatable workflows so Claude doesn't improvise. This tutorial builds one from scratch. For design principles, see [Skill Design Guide](skill-design-guide.md).

## Skill File Anatomy

A skill is a markdown file with YAML frontmatter:

```markdown
---
name: skill-name
description: When to load this skill (trigger condition, not marketing copy)
user_invocable: true
---
# Skill Name
## Trigger       — when to use this skill
## Workflow      — step-by-step instructions
## Error Handling — what to do when things go wrong
## Rationalizations to Reject — excuses for skipping steps, pre-emptively addressed
```

- **`name`** — the `/command` users type to invoke it
- **`description`** — tells Claude *when* to load the file (be specific)
- **`user_invocable`** — `true` for commands, `false` for reference skills Claude consults automatically

## Step-by-Step: Build a `/commit` Skill

### 1. Create the file

```bash
mkdir -p .claude/skills/commit
```

Create `.claude/skills/commit/SKILL.md`:

```markdown
---
name: commit
description: Create an atomic git commit with a conventional message. Run when user says /commit.
user_invocable: true
---
# Commit

## Trigger
User says `/commit` or asks to commit current changes.

## Inputs
- **Required:** None — inspects git state directly
- **Optional:** Commit message hint from the user

## Workflow

### Step 1: Check git status
Run `git status` and `git diff --staged`. If nothing is staged, show unstaged changes and ask what to stage.

### Step 2: Review the changes
Analyze the staged diff: what changed, why (bug fix, feature, refactor), and the blast radius.

### Step 3: Generate the commit message
Format: `<type>(<scope>): <summary>` + body explaining the "why."
Types: feat, fix, refactor, docs, test, chore, style, perf. Summary under 72 chars.

### Step 4: Commit
Run `git commit` with the message. Do NOT push unless explicitly asked.

## Error Handling
- **Nothing staged:** Tell the user. Don't create an empty commit.
- **Pre-commit hooks fail:** Fix the issue, re-stage, create a NEW commit (never amend).
- **Diff too large:** Suggest splitting into multiple atomic commits.

## Rationalizations to Reject
- "Too small for a proper message" — Small changes get the same format. Consistency over effort.
- "I'll just use 'fix stuff'" — Vague messages help no one reading the log later.
- "I should amend the last commit" — Only if the user explicitly asks.
```

### 2. Test it

Restart Claude Code (skills load at session startup), then type `/commit`. Claude will load the skill, check git status, and follow the workflow.

### 3. Iterate

Use it a few times. You'll find gaps — edge cases, missing error handling, steps in the wrong order. Edit the SKILL.md and restart to pick up changes.

## Adding Rationalizations

The "Rationalizations to Reject" section is the most powerful part. It catches the moment Claude decides to skip a step. Each rationalization should name the excuse and explain why it's wrong:

```markdown
- "The tests pass so it must be fine" — Passing tests don't validate commit message quality.
- "I'll split into smaller commits later" — You won't. Split now.
```

Be specific. Vague rationalizations don't trigger recognition.

## Invocable vs. Reference Skills

| Pattern | `user_invocable` | When to use |
|---------|-------------------|-------------|
| Invocable | `true` | Multi-step workflows with triggers (`/commit`, `/deploy`) |
| Reference | `false` | Domain knowledge Claude consults automatically (tool routing, style guides) |

Reference skills have decision guidance instead of workflows. Claude loads them when the `description` matches the current context. See [web-search-reference](../examples/skills/web-search-reference/SKILL.md) for an example.

## Naming and Tips

- **Verbs, not nouns:** `/commit` not `/commit-tool`, `/deploy` not `/deployment-system`
- **One or two words:** Use hyphens for multi-word names (`/review-pr`)
- **One skill per directory:** `.claude/skills/<name>/SKILL.md`
- **Start with a stub.** A 10-line skill is better than no skill. Add detail as you use it.
- **Skills compose.** Need a lint step? Invoke `/lint` instead of duplicating logic.
- **Skills load at startup only.** A mid-session skill won't respond until you restart Claude Code.

## Further Reading

- [Skill Design Guide](skill-design-guide.md) — The seven design principles
- [Getting Started](getting-started.md) — Full Hexis setup
- [Hook Patterns](hook-patterns.md) — Enforcement that complements skills
