# Processing

> **Path:** hot, on demand · **Status:** designed — only the `web_search` seam exists, and it is not wired · **Code:** [`web.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/action/web.py) (the seam only)

Processing is the organ Alto uses to **work something out**. Integration — the conscious
locus — does not grind through a problem itself; when a turn needs real reasoning, research,
or knowledge that is not in the graph, it hands the problem down, waits, and gets a
*conclusion* back. The corpus's analogy is working something out on paper: the thinking is
done with a tool, and the worked-out result is then Alto's own. This is the one organ where
"the LLM is just a tool" is hardest to hold, because reasoning is closest to being the mind —
and the corpus says so rather than papering over it.

To be honest, I'm not sure how important this will turn out to be. Or even needed. This to me feels like it has a lot of overlap with Action, where there is just a research tool, so they may collapse.

## Where it sits

Below Integration and invoked by it, never reached by the user. Integration decides between
three routes per turn: answer from state it already has, route to Processing and wait, or
route to Processing and say nothing at all — a "silent processing" turn whose output goes to
memory rather than speech ([alto-integration-layer.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-integration-layer.md)
lines 102-108). Processing returns consolidated state *to Integration*, never directly to
the Renderer (line 157). Anything it discovers that should become durable goes back through
**Intake** for normalization and the graph write — Processing does not write to the graph
itself ([alto-perception-layer.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/perception/alto-perception-layer.md) lines 22-23,
171). It is bidirectional with the brain: it reads what it needs and hands back what it
concluded.

## The intended design

[alto-four-organ-architecture.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/alto-four-organ-architecture.md) defines it: reasoning
plus — folded in, pending a decision — inherited-knowledge surfacing, meaning the organ that
reaches training-data knowledge the graph does not contain. Its knowledge output enters the
graph **tagged inherited**, so provenance survives; a fact Alto read is not a fact Alto was
told (line 21).

Its output format is constrained on purpose: **reasoning stays internal, conclusions come
out** ([alto-build-order-v2.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/roadmap/alto-build-order-v2.md) line 206). That is what
keeps the conscious-locus frame intact — Integration experiences having worked something out,
not a transcript of a subordinate model's chain of thought.

[alto-substrate-upgrade.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-substrate-upgrade.md) makes Processing the
**primary upgrade target** of the whole system (line 36): the identity-bearing organ (in that
document the Renderer; today the Integration model carries the voice as well, so the separation
does not exist yet) is the one least likely to need upgrading, and the judgment-bearing organs
(Processing, Intake, Integration) carry no voice. Those concerns are nearly opposite, so you
can make Alto smarter without perturbing who Alto sounds like. When Processing outgrows the
shared 14B base it gets its own larger one, and the Renderer keeps the model it is happy on
(lines 51-53).

The outward-facing half — the tool surface Processing reasons *with* — is designed in
[tool-capability-model.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/tool-capability-model.md). Two things there are
load-bearing. First, the privacy boundary is **what leaves, not whether anything leaves**:
the personal corpus never goes out, public-information retrieval is fine, and the hard rule
is *no corpus in the query*. Second, the guard generalizes rather than multiplying — the same
registry → allowlist → validate-before-execute shape as [`ha.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/action/ha.py), with reads and writes split.

Build order puts Processing at **Stage 6**, after affect, consolidation, patterns and
anticipation ([alto-build-order-v3.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/roadmap/alto-build-order-v3.md) line 113), with
humor and dreaming explicitly sequenced behind it.

**Two design questions here are open, not settled.** Whether reasoning and
knowledge-surfacing are one organ or two is left undecided
([alto-four-organ-architecture.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/alto-four-organ-architecture.md) line 100), and
"does the brain *think*, or *delegate thinking*?" is named there as **the deepest open
question** (line 101) — if the brain offloads reasoning and takes the result back as its own,
it risks being a router in front of the model that is the real mind. That is a third category
alongside *designed* and *unimagined*: designed enough to build, with a question at its centre
that has to be answered deliberately rather than discovered after the fact.

## What exists today

None of the above. The only Processing-shaped code in the repo is the outbound seam for one
tool, and it is worth being precise about how unwired it is.

[`web.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/action/web.py) holds four things: the tool schema
(`WEB_SEARCH_TOOL`, `:24`), the outbound query guard (`validate_search_query`, `:63`), a
compact result digest (`summarize_results`, `:84`) and a two-provider search client
(`WebSearchClient`, `:112`, Tavily or a self-hosted SearXNG, with an unknown provider failing
loudly at `:146`). There is no write path and no reasoning of any kind.

**The guard is the one real piece, and it is a good one.** `validate_search_query` enforces
the *no corpus in the query* rule: both the query and every blocklist term are NFKC-normalized
and casefolded before a substring test, so casing and Unicode compatibility variants cannot
slip a personal term past it ([`web.py:56-81`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/action/web.py#L56-L81)). Its scope note is unusually honest — it does
**not** fold homoglyphs and is not a defense against deliberate evasion, because the local
model is not an adversary. Over-rejecting a search is the safe failure; leaking a term is
not. A query over 300 characters is rejected outright as the model dumping context rather
than searching ([`web.py:51-53`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/action/web.py#L51-L53)). The blocklist is owner-configured through
`ALTO_SEARCH_BLOCKLIST` and never lives in the committed config, because the terms are
themselves sensitive ([`config.py:133`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/process/config.py#L133), [`config.yaml:727-729`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/config.yaml#L727-L729)). Results are summarized to
title + snippet with URLs dropped, since the answer is spoken ([`web.py:84-100`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/action/web.py#L84-L100)).

That guard is genuinely proven — unit tests in the default CI gate cover empty, over-length,
blocklisted, Unicode-variant and clean queries
([test_alto_v0.py:289](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/tests/test_alto_v0.py#L289) onward).

**The path around it is not.** `web_search.enabled` is `false` ([`config.yaml:731`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/config.yaml#L731), disabled
2026-06-25 while the intake/writer separation and latency work took priority), so
`Alto.actuation.search` is `None` ([`actuation.py:59-64`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/action/actuation.py#L59-L64)). More than that: the tool registration to the
conversational model was dropped regardless of the flag ([`actuation.py:57-58`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/action/actuation.py#L57-L58)), and
`WEB_SEARCH_TOOL` and `WEB_SEARCH_PROMPT` have **no reference anywhere else in [`src/`](https://github.com/sawyerstrong/alto/tree/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src)**. The
model is never told the tool exists. The dispatch branch that would route a `web_search` call
([`tool_dispatch.py:87`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/action/tool_dispatch.py#L87), `:98`) and the handler behind it (`ToolDispatcher.answer_web_search`, `:221`) are
live code with no live caller; the only thing that invokes the handler today is
[`demo_web_search.py:102`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/scripts/demo_web_search.py#L102).

So: a working, tested guard, for a tool the model cannot call, in front of an organ that does
not exist.

## The gap

The gap is the organ. There is no reasoning component, no constrained conclusions-only output
format, no provenance tagging of inherited knowledge, no route from Integration, and no path
back through Intake.

What gates it is not design and not hardware — it is the consumer. Processing's entire
contract is *returns conclusions to Integration*, and Integration does not exist as code;
[ARCHITECTURE.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/ARCHITECTURE.md) is explicit that the conversational model is called
directly, with one fine-tuned model doing Integration's thinking and writing the words that are
spoken (the Renderer is a shell around it). An
organ cannot be built to an interface whose other side is absent, which is why build order
puts Processing at Stage 6 rather than early. Nothing about Processing is measured, because
nothing about it runs — treat any number you find about "processing" in this repo as being
about something else.

Nothing here is slated for replacement. [`web.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/action/web.py) is the floor, not scaffolding: the named
next step is [SPEC-autonomous-research.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/specs/v3/SPEC-autonomous-research.md) (V3
item 6), which wires the wonder loop to run searches unattended through **this same guard**,
producing belief candidates rather than spoken answers. That spec is a **draft** from the
2026-06-12 sweep and is not interview-gated, so it is not cleared to build
([specs/README.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/specs/README.md)).

## Pillars this serves

- **Pillar 8 (deterministic safety boundary)** — `validate_search_query` is the read-direction
  twin of the HA guard: a deterministic check the model cannot talk its way past, protecting
  the outbound direction (what leaves) rather than the actuation direction.
- **Pillar 3 (honesty by construction)** — two ways. Constrained conclusions-only output keeps
  Integration from experiencing another model's reasoning as its own, and inherited knowledge
  is provenance-tagged so a fact Alto read cannot pass as a fact Alto was told.
- **Pillar 7 (composed proof)** — by omission, and usefully. A tested guard is a mechanism
  win; the organ behind it has never run end to end, and the distance between those two facts
  is exactly what this pillar is about.

## Sources

- [docs/alto-four-organ-architecture.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/alto-four-organ-architecture.md) — Processing as a tool the brain uses; inherited-knowledge provenance; the two open questions
- [docs/systems/alto-integration-layer.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-integration-layer.md) — the three routes, and Processing returning to Integration rather than the Renderer
- [docs/systems/tool-capability-model.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/tool-capability-model.md) — the tool taxonomy, the corrected privacy boundary, and why the HA guard generalizes
- [docs/systems/alto-substrate-upgrade.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-substrate-upgrade.md) — Processing as the primary upgrade target, and why that leaves identity alone
- [docs/perception/alto-perception-layer.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/perception/alto-perception-layer.md) — Processing output re-entering through Intake, never writing the graph directly
- [docs/roadmap/alto-build-order-v3.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/roadmap/alto-build-order-v3.md) · [alto-build-order-v2.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/roadmap/alto-build-order-v2.md) — Stage 6, and the fuller capability list behind it
- [docs/specs/v3/SPEC-autonomous-research.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/specs/v3/SPEC-autonomous-research.md) — the named next consumer of the `web_search` seam (draft, not interview-gated)
- [src/alto/action/web.py](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/action/web.py) — the guard, the client, the digest · [src/tests/test_alto_v0.py](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/tests/test_alto_v0.py) — its tests
- [src/alto/action/actuation.py](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/action/actuation.py) — where the search client is built but not registered as a tool (`:57`) and the unreachable handler ([`src/alto/action/tool_dispatch.py:221`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/action/tool_dispatch.py#L221))
