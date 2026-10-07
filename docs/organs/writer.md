# The Writer — the cold path

> **Path:** cold · **Status:** live recorder on; most sub-organs built and switched off; consolidator unbuilt · **Code:** [`writer.py`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/alto/write/writer.py), `writer_*.py`, [`mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/alto/read/mem_bridge.py), [`src/mem/`](https://github.com/sawyerstrong/alto/tree/63fd2b6678134ad05c772894c84445cf951950f0/src/mem)

The Writer turns the *now* into the past. It takes what was just said and persists it —
episodes, the entities mentioned in them, the relations and events those mentions imply — so a
later moment can be shaped by an earlier one. Everything Alto can ever remember arrives through
here. If the Writer records nothing, the read side has nothing to read, and several organs that
look independently broken are in fact starved by this one.

## Where it sits

It consumes a completed turn: today the PTT-completed utterance as perception heard it (the
raw text and its features) and the reply; in the target shape, a grounded percept from Intake,
an organ deleted in code on 2026-10-04 ([intake.md](intake.md)). It emits episode Nodes and typed edges into the AGE
graph behind [`src/alto/brain/store.py`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/alto/brain/store.py), plus segments
and derived lines into `mem`, its own separate store.

It is a **cold-path sibling of the Subconscious** — not nested under it, not attached to
the designed Intake ([architecture revisions §2](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/alto-architecture-revisions-june2026.md);
[`writer.py:1-2`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/alto/write/writer.py#L1-L2) says so too). Three tenses in the design:
intake extracts the incoming, the subconscious feels the now, the Writer turns the now into the
past. (In code there is no intake, and the Writer reads what perception heard.)

The firewall is **current-mood-blindness, not affect-neutrality** (revisions §3). The Writer
*must* read graph-affect — prior valences, standing affect — because computing an episode's
valence is its job. What it must never do is subscribe to the live subconscious mood as an
input to what it records: Alto irritated *now* does not get to bend the facts. The
subconscious legitimately gates *whether and how much* is worth writing; the Writer alone
controls *what*. [`writer.py:13`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/alto/write/writer.py#L13) marks the module "cold-path, mood-blind". Downstream,
everything it writes is read by the shared graph-read layer, the reader and the surfacer —
see [retrieval.md](retrieval.md).

## The intended design

**Two timescales** ([revisions §4](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/alto-architecture-revisions-june2026.md)), because
memory has two:

- **Live recorder** — concurrent with experience but off the hot path. Records that an
  episode is happening, stamps its date, captures what was perceived, computes that episode's
  *immediate* valence. Live so recent memory does not lag experience.
- **Consolidator** — batched, sleep-time. Aggregates standing affect across many episodes,
  promotes and demotes beliefs, detects patterns, prunes, restructures. Deliberately not live:
  expensive, and it needs an accumulated backlog — sleep pressure is roughly that backlog's
  size. Draft contract:
  [SPEC-consolidation-loop.md](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/specs/v3/SPEC-consolidation-loop.md).

This split is the Writer-side expression of the standing rule that **the hot loop never writes
durable structure** — only the cold consolidator changes who Alto is becoming.

**The write organ itself is mid-replacement, and that is the most important thing to know
before reading the module list.**
[PLAN-writer-v2.md](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/specs/v3/PLAN-writer-v2.md) decides the target: v2 **replaces the
resolver's identity adjudication** with a deterministic canonical → alias → create-new
cascade (the LLM stops adjudicating sameness), makes merges *soft* so every later mistake is
recoverable, and **collapses the three extractors into one organ**. Separately, the config
records a 2026-08-15 decision to retire the per-turn LLM cold path altogether in favour of an
**episode-close picture pass** ([`config.yaml`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/config.yaml), `writer:` block), shaped by
[SPEC-episode-account.md](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/specs/v3/SPEC-episode-account.md) after
[DECISION-picture-shape-and-felt-state.md](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/specs/v3/DECISION-picture-shape-and-felt-state.md)
found the claim/triple form wrong — an exclusion became an entity, a claim got built on the
wrong nucleus, a comparative stance had no slot at all.

So: **today's five-module decomposition is scaffolding with a decided expiry date.** Do not
read it as the architecture.

## What exists today

**The live recorder is on and real.** [`writer.py`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/alto/write/writer.py)
observes each completed utterance, decides by idle gap whether to extend the current
episode or open a new one, writes it as a `kind:'episode'` Node with its turns inline, and
chains episodes with `before {label:'episode_succession'}` edges ([`writer.py:26-27`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/alto/write/writer.py#L26-L27)). If a
store call raises, the event spools to JSONL and the turn still succeeds — the pipeline never
fails because the brain DB is down ([`writer.py:19`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/alto/write/writer.py#L19)).

**`mem` is the writer's own store: written on every turn, and read by the Surfacer since
2026-09-22.** [`src/mem/__init__.py`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/mem/__init__.py) maps its modules against
[SPEC-writer-build_14](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/specs/v3/SPEC-writer-build_14.html); the seam is
[`mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/alto/read/mem_bridge.py), the only module that imports `mem`.
`mem.enabled: true` ([`config.yaml:315`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/config.yaml#L315)) — one INSERT per utterance and per reply, no model, no
GPU. But `enrich: false` ([`config.yaml:330`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/config.yaml#L330)) for a measured reason: step ⑤'s 14B needs 9.57 GiB beside a
9.69 GiB conversational model on a card with ~14.5 GiB free, so loading it evicts all three
production models and costs 8.8s on the next turn against ~1s of work. `close_episodes: true`
([`config.yaml:358`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/config.yaml#L358)), `corefer_model: false` ([`config.yaml:368`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/config.yaml#L368)). What a turn pays is unchanged, but the write side no longer
ends at the database: `mem.read.enabled: true` ([`config.yaml:389`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/config.yaml#L389)) puts a read path on top of
it, and what `mem` holds can reach a reply through the Surfacer — see
[retrieval.md](retrieval.md). Because `enrich` is off, the lines that path reads are derived only
when someone runs the enrichment batch. And when a rebuild replaces a derived row, the old one is
archived to `<table>_history` in the same transaction (since 2026-09-14) rather than lost.

**Most of the rest of the write side is built and switched OFF.**

| Sub-organ | Module | Shipped flag |
|---|---|---|
| Episode read / account | [`writer_episode_read.py`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/alto/write/writer_episode_read.py), [`writer_episode_account.py`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/alto/write/writer_episode_account.py) | both keys commented out ⇒ false ([`config.yaml:528`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/config.yaml#L528), `:573`) |

The resolver's LLM half (entity create/link and mention edges), the relation extractor, the
event extractor and the typer were switched off on 2026-08-15 and deleted on 2026-10-04: the
resolver's half had lost its only input when intake was deleted, and the other three needed the
entity nodes only it minted. **What remained — the resolver's eager self-schema learners (self
name, speaker name, self-type, creation event, the `addressed` edge) and the relator's
deterministic detectors (preferences, birthdays, serves) — was deleted on 2026-10-05**
(OpenSpec change `remove-grammar-rules`): English phrase rules writing AGE facts that nothing on
the normal path read. Alto's name now comes from `mem`'s testimony
([`selfname.py`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/mem/selfname.py)) and stated facts reach memory as `mem` lines,
written by step 5 only when an enrichment batch runs (`mem.enrich` is off; until then a stated fact
is raw testimony only). So
**the write side writes no entity, relation, attribute or self-schema facts to the graph at
all**; it writes episodes. One reader of the frozen rows remains: when `mem` is unreachable at
boot the Surfacer falls back to the graph and reads the self-schema and speaker rows already
there (registry SF-15).

**The consolidator has no code.** The one consolidation-shaped thing that existed,
`ProjectStore.consolidate_concepts` (an offline, dry-run-by-default merge of duplicate concept
nodes), had no caller and was deleted 2026-10-05. Aggregate standing affect, belief
promotion, pattern detection and pruning are designed and unbuilt. Throughout,
[`gate.py`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/alto/write/gate.py) is the turn-activity gate between-turn work waits on;
its live caller is the idle tick (the resolver's LLM call it was built for was deleted
2026-10-04).

## The gap

The gap is not "the organs do not work." It is that **the organs were switched off, then deleted
(2026-10-04), and the thing that replaces them is designed but not built.** The current implementation is slated
for replacement; the plan doc is [PLAN-writer-v2.md](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/specs/v3/PLAN-writer-v2.md).

Closing it is gated on that build order: phase 0 extracts the guard chain the three extractors
each copy, phase 1 lands the deterministic identity cascade, phase 2 builds a merge whose loser is
soft-deactivated rather than `DETACH DELETE`d (the old `merge_entities` did the latter; it had no
caller and was deleted 2026-10-05) — which is what makes every later mistake recoverable
and is therefore pillar 9's real unblock — and phase 3 collapses the extractors. The 15 named
type gates (moved to `name_gates`, `phrase_gates` and `value_gates`) and their tests are v2's
acceptance suite, turning "rebuild" into "port" (§2), and the five identity mechanisms — PRs [#197](https://github.com/sawyerstrong/alto/pull/197)–[#201](https://github.com/sawyerstrong/alto/pull/201), closed 2026-09-29 with their tips
tagged `archive/resolver-identity-stack/*` — are the only rollback. §6b records why they were
closed before v2 beat v1's edge precision on an unseen slice, which was the original condition.
One metric is
already retired: pair-closure scored 10 and 13 on the *same commit, same config, same slice*
(§5). Do not reach for it.

## Pillars this serves

- **Pillar 9 (repairability over precision)** — the governing principle here. Bias toward
  capture; a precision gate that DROPS rather than records is the anti-pattern (the deleted
  resolver and relator were exactly that gate). Measured trigger: 730 simulated episodes → 953
  mentions, 0 relations; a blind gold standard → 0 of ~30 durable facts.
- **Pillar 3 (honesty by construction)** — the line pillar 9 does not cross, worked out at
  `_assertion_polarity` (now [`mem/polarity.py`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/mem/polarity.py), written for the
  deleted relator): a span with both a clause boundary and a negator has a sign no regex can
  decide, so the relator **dropped** the proposal rather than guessing it. An inverted sign "says the opposite of the utterance, so there is nothing to
  revise later" — a confident falsehood that looks exactly like a fact.
- **Pillar 2 (affect as lived state)** — the Writer computes an episode's evidential affect
  from the graph and the evidence, never from the present mood.
- **Pillar 1 (continuous being)** — episode succession is the record of continuity;
  [`writer_episode_read.py:32`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/alto/write/writer_episode_read.py#L32) marks the turn-shaped compromise rather than hiding it.
- **Pillar 7 (composed proof)** — every flag above was flipped, or held, on a measured gate.

## Sources

- [CLAUDE.md](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/CLAUDE.md) · [docs/README.md](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/README.md) ·
  [PILLARS.md](../PILLARS.md) · [THE-ORGANS.md](../THE-ORGANS.md) ·
  [CHECKS-measurement.md](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/CHECKS-measurement.md).
- [alto-architecture-revisions-june2026.md](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/alto-architecture-revisions-june2026.md) —
  §2 placement, §3 the mood firewall, §4 the two timescales, §6 concurrency.
- [PLAN-writer-v2.md](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/specs/v3/PLAN-writer-v2.md) — the target and the build order.
- Specs (all drafts, not interview-gated — see [specs/README.md](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/specs/README.md)):
  [SPEC-writer-recorder.md](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/specs/v1/SPEC-writer-recorder.md) ·
  [SPEC-relation-organ.md](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/specs/v1/SPEC-relation-organ.md) ·
  [SPEC-autobiographical-events.md](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/specs/v1/SPEC-autobiographical-events.md) ·
  [SPEC-episode-account.md](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/specs/v3/SPEC-episode-account.md) (supersedes
  [SPEC-episode-residue.md](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/specs/v3/SPEC-episode-residue.md)) ·
  [DECISION-picture-shape-and-felt-state.md](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/specs/v3/DECISION-picture-shape-and-felt-state.md) ·
  [SPEC-consolidation-loop.md](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/docs/specs/v3/SPEC-consolidation-loop.md).
- Code: [`writer.py`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/alto/write/writer.py) ·
  [`gate.py`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/alto/write/gate.py) ·
  [`mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/alto/read/mem_bridge.py) ·
  [`src/mem/__init__.py`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/mem/__init__.py) ·
  [`config.yaml`](https://github.com/sawyerstrong/alto/blob/63fd2b6678134ad05c772894c84445cf951950f0/src/config.yaml).
