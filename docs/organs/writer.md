# The Writer — the cold path

> **Path:** cold · **Status:** live recorder on; most sub-organs built and switched off; consolidator unbuilt · **Code:** [`writer.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer.py), `writer_*.py`, [`mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/read/mem_bridge.py), [`src/mem/`](https://github.com/sawyerstrong/alto/tree/8b244d54d07d5ee2836312f976a81f17ed40804a/src/mem)

The Writer turns the *now* into the past. It takes what was just said and persists it —
episodes, the entities mentioned in them, the relations and events those mentions imply — so a
later moment can be shaped by an earlier one. Everything Alto can ever remember arrives through
here. If the Writer records nothing, the read side has nothing to read, and several organs that
look independently broken are in fact starved by this one.

## Where it sits

It consumes a completed turn: today the PTT-completed utterance (and the reply), and in the
target shape intake's GroundedPercept. It emits episode Nodes and typed edges into the AGE
graph behind [`src/alto/brain/store.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/brain/store.py), plus segments
and derived lines into `mem`, its own separate store.

It is a **cold-path sibling of the Subconscious** — not nested under it, not attached to
intake ([architecture revisions §2](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/alto-architecture-revisions-june2026.md);
[`writer.py:1-2`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer.py#L1-L2) says so too). Three tenses: intake extracts
the incoming, the subconscious feels the now, the Writer turns the now into the past.

The firewall is **current-mood-blindness, not affect-neutrality** (revisions §3). The Writer
*must* read graph-affect — prior valences, standing affect — because computing an episode's
valence is its job. What it must never do is subscribe to the live subconscious mood as an
input to what it records: Alto irritated *now* does not get to bend the facts. The
subconscious legitimately gates *whether and how much* is worth writing; the Writer alone
controls *what*. [`writer.py:13`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer.py#L13) marks the module "cold-path, mood-blind". Downstream,
everything it writes is read by the shared graph-read layer, the reader and the surfacer —
see [retrieval.md](retrieval.md).

## The intended design

**Two timescales** ([revisions §4](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/alto-architecture-revisions-june2026.md)), because
memory has two:

- **Live recorder** — concurrent with experience but off the hot path. Records that an
  episode is happening, stamps its date, captures what was perceived, computes that episode's
  *immediate* valence. Live so recent memory does not lag experience.
- **Consolidator** — batched, sleep-time. Aggregates standing affect across many episodes,
  promotes and demotes beliefs, detects patterns, prunes, restructures. Deliberately not live:
  expensive, and it needs an accumulated backlog — sleep pressure is roughly that backlog's
  size. Draft contract:
  [SPEC-consolidation-loop.md](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/specs/v3/SPEC-consolidation-loop.md).

This split is the Writer-side expression of the standing rule that **the hot loop never writes
durable structure** — only the cold consolidator changes who Alto is becoming.

**The write organ itself is mid-replacement, and that is the most important thing to know
before reading the module list.**
[PLAN-writer-v2.md](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/specs/v3/PLAN-writer-v2.md) decides the target: v2 **replaces the
resolver's identity adjudication** with a deterministic canonical → alias → create-new
cascade (the LLM stops adjudicating sameness), makes merges *soft* so every later mistake is
recoverable, and **collapses the three extractors into one organ**. Separately, the config
records a 2026-08-15 decision to retire the per-turn LLM cold path altogether in favour of an
**episode-close picture pass** ([`config.yaml:584-585`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/config.yaml#L584-L585)), shaped by
[SPEC-episode-account.md](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/specs/v3/SPEC-episode-account.md) after
[DECISION-picture-shape-and-felt-state.md](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/specs/v3/DECISION-picture-shape-and-felt-state.md)
found the claim/triple form wrong — an exclusion became an entity, a claim got built on the
wrong nucleus, a comparative stance had no slot at all.

So: **today's five-module decomposition is scaffolding with a decided expiry date.** Do not
read it as the architecture.

## What exists today

**The live recorder is on and real.** [`writer.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer.py) (1,207
lines) observes each completed utterance, decides by idle gap whether to extend the current
episode or open a new one, writes it as a `kind:'episode'` Node with its turns inline, and
chains episodes with `before {label:'episode_succession'}` edges ([`writer.py:27-28`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer.py#L27-L28)). If a
store call raises, the event spools to JSONL and the turn still succeeds — the pipeline never
fails because the brain DB is down ([`writer.py:20`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer.py#L20)).

**`mem` is the writer's own store: written on every turn, and read by the Surfacer since
2026-09-22.** [`src/mem/__init__.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/mem/__init__.py) maps its modules against
[SPEC-writer-build_14](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/specs/v3/SPEC-writer-build_14.html); the seam is
[`mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/read/mem_bridge.py), the only module that imports `mem`.
`mem.enabled: true` ([`config.yaml:418`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/config.yaml#L418)) — one INSERT per utterance and per reply, no model, no
GPU. But `enrich: false` (433) for a measured reason: step ⑤'s 14B needs 9.57 GiB beside a
9.69 GiB conversational model on a card with ~14.5 GiB free, so loading it evicts all three
production models and costs 8.8s on the next turn against ~1s of work. `close_episodes: true`
(460), `corefer_model: false` (470). What a turn pays is unchanged, but the write side no longer
ends at the database: `mem.read.enabled: true` ([`config.yaml:491`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/config.yaml#L491)) puts a read path on top of
it, and what `mem` holds can reach a reply through the Surfacer — see
[retrieval.md](retrieval.md). Because `enrich` is off, the lines that path reads are derived only
when someone runs the enrichment batch. And when a rebuild replaces a derived row, the old one is
archived to `<table>_history` in the same transaction (since 2026-09-14) rather than lost.

**Most of the rest of the write side is built and switched OFF.**

| Sub-organ | Module | Shipped flag |
|---|---|---|
| Resolver (binds mentions to entities) | [`writer_resolver.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer_resolver.py) (2,377) | `resolver_enabled: false` ([`config.yaml:591`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/config.yaml#L591)) |
| Relator (the entity-relation / taxonomy layer) | [`writer_relator.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer_relator.py) (2,111) | `relator_enabled: true` (630), `relator_llm_enabled: false` (636) |
| Relation extractor | [`writer_relation_extractor.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer_relation_extractor.py) (615) | `relation_extractor_enabled: false` (755) |
| Event extractor (life events) | [`writer_event_extractor.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer_event_extractor.py) (1,083) | `event_extractor_enabled: false` (800) |
| Typer (entity types, co-occurrence) | [`writer_typer.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer_typer.py) (719) | `typer_enabled: false` (846) |
| Episode read / account | [`writer_episode_read.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer_episode_read.py) (882), [`writer_episode_account.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer_episode_account.py) (869) | both keys commented out ⇒ false ([`config.yaml:868`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/config.yaml#L868), `914`) |

The resolver flag is the load-bearing one, and it is narrower than its name.
`resolver_enabled: false` disables **only** the LLM resolution path: the eager, deterministic
self-schema and `addressed` writes still run — they are the cold-start identity accretion
pillar 4 rests on — and then `resolve()` returns before the entity mention-edge path
([`writer_resolver.py:1109`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer_resolver.py#L1109), reasoning at `:967-973`).
Since `add_mention_edge` has exactly one caller in the package and it sits on the suppressed
side of that branch, **no new mention edges are written on the live path at all.** And
`relator_enabled: true` is on but detector-only by design: the producer stamp measured five
relation edges across 150 episodes, all five from the LLM arm that is off, so the production
path "may be writing almost no relations at all" (PLAN-writer-v2 §3).

**The consolidator has no code.** The one consolidation-shaped thing that exists is
`ProjectStore.consolidate_concepts` ([`store.py:1467`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/brain/store.py#L1467)), an
offline, dry-run-by-default pass that merges duplicate concept nodes — and [`writer.py:693`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer.py#L693)
deliberately refuses to run it on the live cold path. Aggregate standing affect, belief
promotion, pattern detection and pruning are designed and unbuilt. Throughout,
[`gate.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/gate.py) is what keeps the cold path off the hot GPU: the
resolver's LLM call blocks until the user has been idle for a configured window.

## The gap

The gap is not "the organs do not work." It is that **the organs work, are switched off, and
the thing that replaces them is designed but not built.** The current implementation is slated
for replacement; the plan doc is [PLAN-writer-v2.md](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/specs/v3/PLAN-writer-v2.md).

Closing it is gated on that build order: phase 0 extracts the guard chain the three extractors
each copy, phase 1 lands the deterministic identity cascade, phase 2 turns `merge_entities`'
`DETACH DELETE` into a soft deactivation — which is what makes every later mistake recoverable
and is therefore pillar 9's real unblock — and phase 3 collapses the extractors. The
resolver's 15 named type gates and 203 tests are v2's acceptance suite, turning "rebuild" into
"port" (§2), and the five identity mechanisms — PRs [#197](https://github.com/sawyerstrong/alto/pull/197)–[#201](https://github.com/sawyerstrong/alto/pull/201), closed 2026-09-29 with their tips
tagged `archive/resolver-identity-stack/*` — are the only rollback. §6b records why they were
closed before v2 beat v1's edge precision on an unseen slice, which was the original condition.
One metric is
already retired: pair-closure scored 10 and 13 on the *same commit, same config, same slice*
(§5). Do not reach for it.

## Pillars this serves

- **Pillar 9 (repairability over precision)** — the governing principle here. Bias toward
  capture; a precision gate that DROPS rather than records is the anti-pattern, and the
  resolver is currently exactly that gate. Measured trigger: 730 simulated episodes → 953
  mentions, 0 relations; a blind gold standard → 0 of ~30 durable facts.
- **Pillar 3 (honesty by construction)** — the line pillar 9 does not cross, worked out at
  [`writer_relator.py:172`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer_relator.py#L172): a span with both a clause
  boundary and a negator has a sign no regex can decide, so the proposal is **dropped** rather
  than guessed. An inverted sign "says the opposite of the utterance, so there is nothing to
  revise later" — a confident falsehood that looks exactly like a fact.
- **Pillar 2 (affect as lived state)** — the Writer computes an episode's evidential affect
  from the graph and the evidence, never from the present mood.
- **Pillar 1 (continuous being)** — episode succession is the record of continuity;
  [`writer_episode_read.py:32`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer_episode_read.py#L32) marks the turn-shaped compromise rather than hiding it.
- **Pillar 7 (composed proof)** — every flag above was flipped, or held, on a measured gate;
  [`writer_relator.py:419`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer_relator.py#L419) refuses to fit a schema to its own test set.

## Sources

- [CLAUDE.md](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/CLAUDE.md) · [docs/README.md](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/README.md) ·
  [PILLARS.md](../PILLARS.md) · [THE-ORGANS.md](../THE-ORGANS.md) ·
  [CHECKS-measurement.md](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/CHECKS-measurement.md).
- [alto-architecture-revisions-june2026.md](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/alto-architecture-revisions-june2026.md) —
  §2 placement, §3 the mood firewall, §4 the two timescales, §6 concurrency.
- [PLAN-writer-v2.md](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/specs/v3/PLAN-writer-v2.md) — the target and the build order.
- Specs (all drafts, not interview-gated — see [specs/README.md](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/specs/README.md)):
  [SPEC-writer-recorder.md](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/specs/v1/SPEC-writer-recorder.md) ·
  [SPEC-relation-organ.md](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/specs/v1/SPEC-relation-organ.md) ·
  [SPEC-autobiographical-events.md](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/specs/v1/SPEC-autobiographical-events.md) ·
  [SPEC-episode-account.md](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/specs/v3/SPEC-episode-account.md) (supersedes
  [SPEC-episode-residue.md](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/specs/v3/SPEC-episode-residue.md)) ·
  [DECISION-picture-shape-and-felt-state.md](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/specs/v3/DECISION-picture-shape-and-felt-state.md) ·
  [SPEC-consolidation-loop.md](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/docs/specs/v3/SPEC-consolidation-loop.md).
- Code: [`writer.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer.py) ·
  [`writer_resolver.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer_resolver.py) ·
  [`writer_relator.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/writer_relator.py) ·
  [`gate.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/write/gate.py) ·
  [`mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/alto/read/mem_bridge.py) ·
  [`src/mem/__init__.py`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/mem/__init__.py) ·
  [`config.yaml`](https://github.com/sawyerstrong/alto/blob/8b244d54d07d5ee2836312f976a81f17ed40804a/src/config.yaml).
