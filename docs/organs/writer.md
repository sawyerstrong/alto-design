# The Writer — the cold path

> **Path:** cold · **Status:** `mem` recorder on; enrichment off (batch only); consolidator unbuilt · **Code:** [`src/alto/read/mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/mem_bridge.py), [`src/mem/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem)

The Writer turns the *now* into the past. It takes what was just said and persists it —
episodes, the entities mentioned in them, the relations and events those mentions imply — so a
later moment can be shaped by an earlier one. Everything Alto can ever remember arrives through
here. If the Writer records nothing, the read side has nothing to read, and several organs that
look independently broken are in fact starved by this one.

## Where it sits

It consumes a heard utterance and the finished reply: perception hands the writer the raw text
and its speaker, and the turn hands it Alto's reply. The target shape starts from a grounded
percept from Intake, an organ deleted in code on 2026-10-04 ([intake.md](intake.md)). Today it
emits segments and derived lines into `mem`, the only store.

It is a **cold-path sibling of the Subconscious** — not nested under it, not attached to
the designed Intake ([architecture revisions §2](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/alto-architecture-revisions-june2026.md)).
Three tenses in the design:
intake extracts the incoming, the subconscious feels the now, the Writer turns the now into the
past. (In code there is no intake, and the Writer records what perception heard.)

The firewall is **current-mood-blindness, not affect-neutrality** (revisions §3). The Writer
*must* read graph-affect — prior valences, standing affect — because computing an episode's
valence is its job. What it must never do is subscribe to the live subconscious mood as an
input to what it records: Alto irritated *now* does not get to bend the facts. The
subconscious legitimately gates *whether and how much* is worth writing; the Writer alone
controls *what*. Downstream, what it writes is read by the Surfacer — see [retrieval.md](retrieval.md).

## The intended design

**Two timescales** ([revisions §4](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/alto-architecture-revisions-june2026.md)), because
memory has two:

- **Live recorder** — concurrent with experience but off the hot path. Records that an
  episode is happening, stamps its date, captures what was perceived, computes that episode's
  *immediate* valence. Live so recent memory does not lag experience.
- **Consolidator** — batched, sleep-time. Aggregates standing affect across many episodes,
  promotes and demotes beliefs, detects patterns, prunes, restructures. Deliberately not live:
  expensive, and it needs an accumulated backlog — sleep pressure is roughly that backlog's
  size. Draft contract:
  [SPEC-consolidation-loop.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-consolidation-loop.md).

This split is the Writer-side expression of the standing rule that **the hot loop never writes
durable structure** — only the cold consolidator changes who Alto is becoming.

**The graph writer is gone and its replacement is designed, not built. That is the most
important thing to know before reading the rest.**
[PLAN-writer-v2.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/PLAN-writer-v2.md) decides the target: v2 **replaces the
resolver's identity adjudication** with a deterministic canonical → alias → create-new
cascade (the LLM stops adjudicating sameness), makes merges *soft* so every later mistake is
recoverable, and **collapses the three extractors into one organ**. Separately, the config
records a 2026-08-15 decision to retire the per-turn LLM cold path altogether in favour of an
**episode-close picture pass** ([`config.yaml`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml), `writer:` block), shaped by
[SPEC-episode-account.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-episode-account.md) after
[DECISION-picture-shape-and-felt-state.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/DECISION-picture-shape-and-felt-state.md)
found the claim/triple form wrong — an exclusion became an entity, a claim got built on the
wrong nucleus, a comparative stance had no slot at all.

The AGE-graph writer (episode Nodes, succession edges, the affect assessor, the episode reader)
is archived at tag `archive/age-brain-2026-10-11`. The design above is what remains authoritative.

## What exists today

**The recorder is `mem`, and it is on.** [`src/mem/__init__.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/__init__.py)
maps its modules against [SPEC-writer-build_14](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-writer-build_14.html); the
seam is [`mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/mem_bridge.py), the only [`alto/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto) module that
imports `mem`. On every turn it appends a segment before the reply
(`observe_user_utterance`, [`src/alto/read/mem_bridge.py:219`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/mem_bridge.py#L219), axis `speaker`) and one after it
(`observe_turn_complete`, [`src/alto/read/mem_bridge.py:236`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/mem_bridge.py#L236), axis `alto_reply`). It takes no
actions: the `action` axis has no producer. `mem.enabled: true` ([`src/config.yaml:257`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml#L257)) — one INSERT per segment, no model, no GPU.

- **Failure.** `mem.append` spools to a JSONL file when the store call raises and returns
  success, so the turn never fails because the database is down ([`src/mem/api.py:212`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/api.py#L212)); `drain`
  replays the spool later.
- **Episodes.** A segment that arrives more than `idle_gap_seconds` (600,
  [`src/config.yaml:385`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml#L385)) after the last one, on any axis, closes the open episode and opens the
  next ([`src/mem/api.py:268`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/api.py#L268)). The write side has no turn-shaped episode of its own.
- **Closing.** `close_episodes: true` ([`src/config.yaml:300`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml#L300)) runs the `EpisodeCloser`
  ([`src/mem/worker.py:807`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/worker.py#L807)), which certifies a closed episode. It refuses any episode whose
  segments the enricher has not reached, so with enrichment off it finds nothing until a batch
  run advances the segment mark.
- **Enrichment is off.** `enrich: false` ([`src/config.yaml:272`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml#L272)) for a measured reason: step ⑤'s
  14B needs 9.57 GiB beside a 9.69 GiB conversational model on a card with ~14.5 GiB free, so
  loading it evicts all three production models and costs 8.8s on the next turn against ~1s of
  work. The `Enricher` ([`src/mem/worker.py:389`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/worker.py#L389)) therefore does not run in the process. Derived
  lines are written only when someone runs the batch
  ([`src/scripts/mem/enrich_batch.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/scripts/mem/enrich_batch.py)); until then a stated fact is raw testimony only. When a
  rebuild replaces a derived row, the old one is archived to `<table>_history` in the same
  transaction.

`corefer_model` is false ([`src/config.yaml:310`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml#L310)). The Surfacer reads what `mem` holds — see
[retrieval.md](retrieval.md).

The four name gates (`entity_shape`, `name_gates`, `phrase_gates`, `value_gates`) and canon live
in [`src/mem/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem). The write side records no entity, relation or self-schema facts anywhere but as
`mem` lines; Alto's name comes from `mem`'s testimony
([`selfname.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/selfname.py)).

**The consolidator has no code.** Aggregate standing affect, belief promotion, pattern detection
and pruning are designed and unbuilt.

## The gap

The gap is not "the organs do not work." The per-turn LLM write organs were switched off, then
deleted, and the graph writer went with the AGE graph; the thing that replaces them is designed
but not built. The plan doc is [PLAN-writer-v2.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/PLAN-writer-v2.md).

Closing it is gated on that build order: phase 0 extracts the guard chain the three extractors
each copy, phase 1 lands the deterministic identity cascade, phase 2 builds a merge whose loser is
soft-deactivated rather than `DETACH DELETE`d — which is what makes every later mistake recoverable
and is therefore pillar 9's real unblock — and phase 3 collapses the extractors. The 15 named
type gates (now in [`src/mem/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem) as `name_gates`, `phrase_gates` and `value_gates`) and their tests are v2's
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
  `_assertion_polarity` (now [`mem/polarity.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/polarity.py), written for the
  deleted relator): a span with both a clause boundary and a negator has a sign no regex can
  decide, so the relator **dropped** the proposal rather than guessing it. An inverted sign "says the opposite of the utterance, so there is nothing to
  revise later" — a confident falsehood that looks exactly like a fact.
- **Pillar 2 (affect as lived state)** — the Writer is designed to compute an episode's
  evidential affect from stored evidence, never from the present mood. Nothing computes it today.
- **Pillar 1 (continuous being)** — episode succession is the record of continuity;
  `mem` rotates episodes on an idle gap, which is the nearest thing to a continuity record built so far.
- **Pillar 7 (composed proof)** — every flag above was flipped, or held, on a measured gate.

## Sources

- [CLAUDE.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/CLAUDE.md) · [docs/README.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/README.md) ·
  [PILLARS.md](../PILLARS.md) · [THE-ORGANS.md](../THE-ORGANS.md) ·
  [CHECKS-measurement.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/CHECKS-measurement.md).
- [alto-architecture-revisions-june2026.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/alto-architecture-revisions-june2026.md) —
  §2 placement, §3 the mood firewall, §4 the two timescales, §6 concurrency.
- [PLAN-writer-v2.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/PLAN-writer-v2.md) — the target and the build order.
- Specs (all drafts, not interview-gated — see [specs/README.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/README.md)):
  [SPEC-writer-recorder.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v1/SPEC-writer-recorder.md) ·
  [SPEC-relation-organ.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v1/SPEC-relation-organ.md) ·
  [SPEC-autobiographical-events.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v1/SPEC-autobiographical-events.md) ·
  [SPEC-episode-account.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-episode-account.md) (supersedes
  [SPEC-episode-residue.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-episode-residue.md)) ·
  [DECISION-picture-shape-and-felt-state.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/DECISION-picture-shape-and-felt-state.md) ·
  [SPEC-consolidation-loop.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-consolidation-loop.md).
- Code: [`mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/mem_bridge.py) ·
  [`src/mem/__init__.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/__init__.py) ·
  [`config.yaml`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml).
