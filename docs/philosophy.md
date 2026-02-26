# Hexis Design Philosophy

These principles shaped Hexis and should guide how you extend it. They're opinionated — that's the point. A framework without opinions is a file format.

## 1. Curated, Not Auto-Generated

Every rule in a Hexis system is written by a human. This is a deliberate choice, not a limitation.

Research (Latent Space, Feb 2026) found that LLM-generated context files *decrease* task success rates while increasing token costs. The failure mode is predictable: auto-generated summaries are comprehensive but undifferentiated. They tell the LLM everything and emphasize nothing. A hand-written rule like "NEVER run rm -rf without a safety check" carries more weight than a paragraph of auto-summarized cautions.

**The intelligence is in the curation.** Deciding what matters enough to be a rule — and what doesn't — is the human judgment that makes the system work. Auto-generation produces volume. Curation produces signal.

This applies to every Hexis artifact:
- CLAUDE.md rules are written from experience, not generated from code analysis
- MEMORY.md gotchas are captured from real failures, not predicted
- Solutions KB entries document actual problems you solved, not theoretical patterns
- Skills encode workflows you've actually used, not generated boilerplate

## 2. Hooks Over Rules

If something must happen, don't ask — enforce.

CLAUDE.md instructions are soft guidance. The LLM follows them most of the time, but under context pressure (long conversations, many competing instructions, compaction), nuanced rules get dropped. The model has no mechanism to verify it followed a rule — it just proceeds.

Hooks are hard gates. A PreToolUse hook that blocks `rm -rf` runs before the command executes, outside the LLM entirely. It can't be forgotten, deprioritized, or rationalized away.

The three-tier enforcement hierarchy:

| If it... | Use... | Because... |
|----------|--------|-----------|
| Would be nice | CLAUDE.md instruction | Soft guidance is proportionate |
| Should happen | CLAUDE.md + MEMORY.md reminder | Double reinforcement catches most cases |
| Must happen | Hook (hard gate) | Can't be bypassed under any context pressure |

**The decision test:** If removing the rule and relying on the LLM's general knowledge would produce the same behavior 90% of the time, it's a nice-to-have. If violating the rule causes real damage (data loss, security leak, wasted hours), it needs a hook.

## 3. Every Correction Is a Rule

When something goes wrong and you fix it, that fix should become permanent. Not "I'll remember next time" — a written rule, right now.

The workflow:
1. Something goes wrong during a session
2. Fix the immediate problem
3. Write the rule *immediately* — in CLAUDE.md, MEMORY.md, or docs/solutions/
4. If the same rule is violated later, log it in the violation log
5. If it's violated twice, build a hook

**One correction = one rule.** This is the mechanism that makes the system compound. Without it, you're fixing the same problems in different sessions, unable to remember what you already learned.

The hardest part is step 3: writing the rule *immediately* rather than promising yourself you'll do it later. Later never comes. The correction is freshest — and the context is richest — right after the failure.

## 4. Skills Over MCP

MCP (Model Context Protocol) servers are powerful but expensive in attention. Every MCP tool schema is included in the system prompt on every turn, costing 350-500 tokens per tool regardless of whether it's used.

Skills are markdown files. They load on demand when triggered, at zero idle overhead. The full skill content is injected into the conversation only when needed, then it's done.

**The default extension mechanism should be a skill.** Reserve MCP for:
- Stateful connections (databases, browser sessions)
- External API integrations that benefit from structured protocol
- Tools that need to be shared across multiple AI coding environments

Everything else — workflows, procedures, decision frameworks, reference guides — should be a skill.

## 5. Seed Early, Prune Later

Create a skill the first time you do something novel. Don't wait for the pattern to repeat three times.

The cost of creating a stub skill is ~5 minutes. The cost of reconstructing a workflow from scattered notes and memory is much higher. A stub skill acts as a collector: future corrections and refinements accumulate in one place instead of scattering across MEMORY.md entries and conversation history.

**The lifecycle:**
1. First occurrence → create a stub skill with basic steps
2. Second occurrence → refine based on what you learned
3. Third occurrence → the skill is probably close to final form
4. After a month with no use → demote to `docs/solutions/` or delete

The risk of seeding too early (an unused skill that gets deleted) is far smaller than the risk of seeding too late (a workflow that's been done 5 times with 5 different approaches because nobody captured the pattern).

## 6. Hard Gates Over Soft Guidance

This is a generalization of "Hooks Over Rules" that applies beyond just hooks.

Anywhere you have a choice between:
- **Asking** the LLM to do something (soft) vs. **making** it do something (hard)
- **Documenting** a constraint vs. **enforcing** it in tooling
- **Reminding** about a step vs. **automating** it

Choose the hard option. Soft guidance degrades under pressure. Hard gates don't.

Examples beyond hooks:
- A CLI wrapper that enforces search order (hard) vs. a CLAUDE.md rule about search order (soft)
- A template with required sections (hard) vs. a guideline about what to include (soft)
- A pre-commit hook that runs linting (hard) vs. a rule to "always lint before committing" (soft)

## 7. The Program Is the Prompt

In AI agent systems, the configuration *is* the program. CLAUDE.md is not documentation — it's the instruction set that determines behavior. Skills are not reference material — they're executable workflows.

This means:
- **Treat CLAUDE.md like code.** Version control it. Review changes. Test that rules produce the intended behavior.
- **Treat skills like functions.** They should be self-contained, composable, and have clear inputs/outputs.
- **Treat hooks like assertions.** They should fail fast and loudly when constraints are violated.

The corollary: a poorly written CLAUDE.md produces poorly behaving agents, just as poorly written code produces bugs. Invest in the quality of your instructions the way you'd invest in code quality.

## What Hexis Is Not

**Not a replacement for good prompting.** Hexis organizes and enforces the meta-cognitive layer. The quality of individual prompts and interactions is still up to you.

**Not cross-platform.** Hexis targets Claude Code specifically. The extension points (hooks, skills, agents) are Claude Code concepts. Adapting to other AI coding tools would require mapping these concepts to different mechanisms.

**Not auto-pilot.** The compound learning loop requires human judgment at every step: deciding what's a rule, what's a gotcha, when to promote a violation to a hook. The system amplifies human judgment — it doesn't replace it.

## Further Reading

- [Architecture](architecture.md) — How the layers fit together
- [Enforcement Escalation](enforcement-escalation.md) — The self-correction pattern
- [Skill Design Guide](skill-design-guide.md) — Principles for effective skills
