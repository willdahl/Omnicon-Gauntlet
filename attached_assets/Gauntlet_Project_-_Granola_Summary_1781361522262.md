# Gauntlet Project

Fri, 12 Jun 26

### The Gauntlet Concept

- App to ingest meeting transcripts/summaries from any source (Granola, Teams, etc.) via MCP
- Core problem: existing tools (e.g. Granola) lack ability to modify summaries, apply custom templates, or tag/profile conversations
- End goal: route raw meeting data into a personal or company knowledge base with high-fidelity, enriched output

### Versioned Roadmap

- V1 — human-in-the-loop summary review
  - Ingest transcript + summary
  - User reviews: what matched, what didn’t
  - Document gaps → produce V2 summary and V2 transcript
  - GUI for model selection + observability pane (thought process, cost, latency)
- V2 — enrichment via tags and profiles
  - Profiles: work vs. personal context
  - Tags: meeting type (standup, discovery call, etc.) and key topics
- V3 — templates and cross-conversation intelligence
  - Apply guardrails/templates to specific conversation types
  - Query across meetings by tag (e.g. “all discovery calls”)
  - Analogy: Obsidian-style graph — click a tag, see all linked nodes

### Technical Framing (from collaborator)

- ETL is the right mental model — now agentic rather than rule-based
  - Old ETL: deterministic, required explicit rules
  - Agentic ETL: input → output → agent figures it out
- Data tiers: raw → silver (augmented) → golden (desired output)
  - Gap between raw and golden = what the harness closes
- Keeping transcript and summary separate enables cross-tool comparison (benchmark different summarization models)
- Tracking how much each summary needed to change over time = built-in eval/benchmarking signal

### Open Questions

- Does a tool already exist that ingests conversations from multiple sources and routes them into a knowledge base?
- Is there an open-source marketplace for summary templates/harness configurations?

### Next Steps

- William
  - Research existing tools that do multi-source transcript ingestion + knowledge base routing (build vs. buy)
  - Research open-source marketplaces for summarization templates
  - Start V1 build in Replit: transcript/summary ingestion → human review loop → model selector + observability pane