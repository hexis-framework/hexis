---
name: web-search
description: Reference for choosing the right web search tool. Not user-invocable — consulted automatically when performing searches.
user_invocable: false
---

# Web Search Reference

When performing web searches, choose the right tool for the task.

## Tool Selection

### Is this a quick fact check or current event?

Use **WebSearch** (built-in). It's free, fast, and good enough for straightforward lookups — recent news, release dates, "what version is X."

### Do you need cited sources?

Use **Perplexity** or equivalent cited-search tool. When the user needs to verify claims or share sources, a search tool that returns URLs with its answers saves a follow-up step.

### Is this deep research requiring multiple angles?

Combine **multiple searches + WebFetch**. Run several searches with different queries, then fetch and read the most promising pages. Single-query research produces shallow answers — important questions deserve 3-5 queries from different angles.

### Is the content platform-internal?

WebSearch cannot find platform-internal URLs: YouTube videos, podcast episodes, app store listings, social media posts. Use **platform-specific tools** (APIs, CLIs, dedicated search commands) instead. Don't retry WebSearch — it will keep failing. Escalate to a different tool immediately.

## Search Quality Tips

**Search in the community's language first.** English-language results are often thin for products, services, or communities rooted in another language. Search in Chinese for Chinese products, Japanese for Japanese electronics, Korean for Korean cosmetics, etc. English results can supplement, but the primary-language results are usually deeper and more current.

**Verify AI-generated specs against manufacturer pages.** AI search tools — including Perplexity, Grok, and WebSearch-powered summaries — can hallucinate product details (weight, dimensions, price, model numbers). Always cross-check specific numbers against the manufacturer's official product page before stating them as fact.

**Don't trust a single source.** Even authoritative-looking sources can be outdated or wrong. For anything consequential (purchase decisions, technical architecture, health claims), confirm with at least two independent sources.

**Press coverage pricing can be stale.** Articles comparing product or service pricing often quote numbers from launch day. Check the vendor's current pricing page — prices change, tiers get restructured, and old comparisons mislead.

## When This Skill Applies

Claude should consult this skill when:
- About to perform a web search and multiple tools are available
- The user asks to "research," "look up," or "find out about" something
- A previous WebSearch returned no results or low-quality results
- The search target is likely platform-internal content
- The user needs cited or verifiable sources
