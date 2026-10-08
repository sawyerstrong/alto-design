# Intake

> **Path:** hot · **Status:** removed — the LLM organ was deleted on 2026-10-04; perception's `hear` stands in, with no model · **Code:** none; the stand-in is [`heard.py`](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/src/alto/perception/heard.py)

In the design, Intake is **the single point of faithful interpretation**. It takes the raw
symbols Perception produced and turns them into a *grounded percept*: who spoke, what was said,
whether it was stated or asked or commanded, which things it referred to, and how clean the
transcription was — **without inferring past the evidence**. Everything downstream consumes
that percept rather than the raw text, which is why the discipline matters: if Intake decides
the speaker is angry and it was wrong, every organ after it honestly processes a corrupted
perception.

Candidly, this system may not be needed at all. Or maybe it's just not needed **yet**. Raw input has proven more useful in basically all cases thus far, but intake might earn its keep when more perception modules are introduced. We will need something to help organize the percepts for other systems. Not sure if this is the right form.

That reading was tested and acted on: the intake-to-raw-utterance arc
([plan](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/docs/handoff/_PLAN-2026-10-04-intake-to-raw-utterance.md)) moved every consumer to the
raw utterance, measured each move against a baseline taken first, and then deleted the organ.
This page keeps the design, because the design has not changed, and says plainly that nothing
implements it today.

## Where it sits

In the design ([docs/README.md](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/docs/README.md),
[alto-perception-layer.md](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/docs/perception/alto-perception-layer.md) lines 157-171) Intake
consumes the transcript from Perception and has three sibling consumers, **none of which gates
the others**: the Subconscious (to feel and react), Integration (to attend), and the live
recorder half of the Writer (to persist). Perception is also not its only upstream — when
Processing finishes a piece of research, its output comes back through Intake for normalization
before anything reaches the graph (same doc, lines 22-23 and 171).

In the code today there is no Intake between Perception and those consumers. `Alto._perceive`
([`alto.py:248`](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/src/alto/runtime/alto.py#L248)) wraps the transcript in a `Heard` ([`heard.py:34`](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/src/alto/perception/heard.py#L34)) — the raw text, the speaker
and when it was heard, nothing interpreted — and hands that one record to the cued Surfacer
([`alto.py:257`](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/src/alto/runtime/alto.py#L257)) and to both recorders, `writer` and `mem`
([`alto.py:188`](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/src/alto/runtime/alto.py#L188)).

## The intended design

Read [alto-architecture-revisions-june2026.md](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/docs/alto-architecture-revisions-june2026.md)
§1 before building anything here. It settles two things that are easy to get backwards.

**Intake fans out in parallel; it is not a serial batch stage.** Percepts flow continuously
and individually — not buffered into a complete utterance, processed, then released. Each one
reaches the Subconscious immediately (for affective shift and the twitch path) *and* the
conscious path, at the same time. This is not an optimization: a reflex has to be able to fire
before deliberation finishes, so a hard batch boundary at Intake contradicts the twitch path.

**Timing merges; function does not.** Two things happen to each percept at once — it *moves*
the Subconscious, and it is *faithfully extracted*. Two functions, one timing, never one
merged operation. The failure mode if they merge is named and barred: mood-congruent intake,
where "Sawyer said X" becomes "Sawyer said the irritating X" because Alto was irritated.

The percept's shape is the contract: references resolved, structure extracted, modality
marked, confidence attached ([docs/README.md](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/docs/README.md), and the
[ingestion-path diagram](../assets/alto-ingestion-path.png), which also shows a cheap
alias/recency resolution path with the model reserved for hard cases).

**Modality is a closed set of five** — `stated`, `asked`, `command`, `observed`, `expressed`
(the deleted `percept.py`). Note that [`docs/README.md`](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/docs/README.md)
describes this as *"stated vs fact"*; **`fact` is not one of the five**, so take the enum as
canonical. Promoting or demoting between them is *grammatical classification of the
utterance*, not inference about the world — which is what keeps modality marking on the right
side of pillar 3. [alto-four-organ-architecture.md](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/docs/alto-four-organ-architecture.md)
explains why this organ carries the project's sharpest honesty risk: it sits before everything.
[alto-intake-lora-training.md](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/docs/training/alto-intake-lora-training.md) states the target
as a trained disposition rather than a prompt: a pure extraction system, not a reasoning system
with extraction as a side effect.

## What exists today

No interpretation at all, which is its own kind of honesty guard: nothing can be read into an
utterance that no organ reads. What runs instead, in [`src/alto/perception/`](https://github.com/sawyerstrong/alto/tree/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/src/alto/perception):

- **`hear`** ([`heard.py:34`](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/src/alto/perception/heard.py#L34)) builds the `Utterance` (speaker, raw text, when it was heard)
  once per turn, so every consumer reads the same record of the same utterance. The speaker is
  the one known speaker, carried in its own field and never parsed out of the text
  ([`heard.py:26`](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/src/alto/perception/heard.py#L26); voice ID does not exist).
- **No grammar rules.** Perception briefly computed `is_question` / `is_asking` /
  `is_pure_question` with English rules over each sentence, and the memory guard armed on
  `is_asking`. Removed in October 2026 (OpenSpec change `remove-grammar-rules`): the guard
  now arms whenever no grounded thought surfaced, and its conditional directive lets the reply
  model decide whether the speaker asked for a remembered fact (held-out comparison:
  [RESULTS.md](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/artifacts/memory-guard-ab/heldout/RESULTS.md)). `addressed_self`, the
  intake-era "you/your or Alto's name" rule for whether Alto was addressed, went the same way
  on 2026-10-06: the Surfacer's self render now asks a model (the 14B) instead, from Alto's
  identity line and the conversation. It catches about half of such turns on 24 blind items with
  no false positive, and its thought cannot yet reach the reply ([surfacer.md](surfacer.md)).

What intake's percept used to feed, and where each consumer went:

| Consumer | Then | Now |
|---|---|---|
| Surfacer | refs from the percept | D2: entities the raw text names in the store, at most three ([`cues.py`](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/src/alto/read/surfacing/cues.py)) |
| Memory guard | modality `asked`/`command` | armed when nothing grounded surfaced; the directive's wording is conditional (no utterance rule) |
| Relator | modality gate, raw text | deleted 2026-10-05 |
| Resolver, eager self-schema writes | intake's content, then raw | deleted 2026-10-05 |
| Resolver, LLM half | intake's refs | deleted 2026-10-04 |
| Relation and event extractors (off) | modality `stated` | deleted 2026-10-04 |
| `mem` segment | text + intake's percept as `structured` | text only, no `structured` ([`mem_bridge.py:240`](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/src/alto/read/mem_bridge.py#L240)) |
| Salience seeds (off) | the refs' `resolved_id`s | deleted: the turn-path salience surfacer had no seed once `addressed_self` went (registry SF-19) |

The percept types (`GroundedPercept`, `Extraction`, `EntityRef`) were deleted with the
surfacer's percept entry point, their last consumer; nothing live had built one since intake
went.

**Naming trap.** Before 2026-06-24, `alto/write/intake.py` was what is now
[`alto/write/writer.py`](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/src/alto/write/writer.py) ([`writer.py:10-13`](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/src/alto/write/writer.py#L10-L13)). Old docs and commit messages saying "intake" often
mean the writer, the spool file is still called `intake_spool.jsonl` for back-compat, and `mem`
still records the conversational producer as `"intake"` ([`mem_bridge.py:305-308`](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/src/alto/read/mem_bridge.py#L305-L308)).

## The gap

**Every part of the designed contract is absent.** Nothing resolves a reference, marks a
modality or attaches a confidence. Pronoun resolution was inert before the deletion (intake
resolved one pronoun across 2,542 utterances containing one, on the 2026-10-04 corpus), so that loss is small; the
cost shows elsewhere. Since phase 4b a neighborhood shows only lines that name its entity, so a
pronoun-led line about the right person is withheld (two utterances went from grounded 5 of 5
to 0 of 5). That is pronoun binding, still unbuilt.

**The resolver's LLM half lost its input, and was then deleted.** It turned named refs into graph
entities and mention edges, and intake was the only producer of refs. It shipped off, so nothing
live changed; it was deleted on 2026-10-04 with its harnesses. The resolver's remaining eager
learners were deleted on 2026-10-05.

**The parallel fan-out and the cheap path were never built and are not now.** `hear` is serial
too, but it costs microseconds rather than the ~3 s the LLM call took warm, so the latency
argument against a serial step is gone; the twitch-path argument stands until the Subconscious
loop exists ([subconscious.md](subconscious.md)).

## Pillars this serves

- **Pillar 3 (honesty by construction)** — the design's reason to exist; today honoured by
  having no interpretation step at all.
- **Pillar 9 (repairability over precision)** — no interpretation step means nothing drops an
  utterance for being the wrong kind; intake's whole-utterance labels did.
- **Pillar 1 (continuous being)** — one completed utterance in, one record out, is still the
  turn-shaped frame.
- **Pillar 4 (cold-start self)** — the Surfacer's identity line carries the *earned* name
  only, or says Alto has none.

## Sources

- [docs/alto-architecture-revisions-june2026.md](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/docs/alto-architecture-revisions-june2026.md) §1 — parallel fan-out, continuous ingestion, timing-merges-function-doesn't
- [docs/README.md](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/docs/README.md) — the canonical ingestion path and the grounded-percept contract
- [docs/assets/alto-ingestion-path.png](../assets/alto-ingestion-path.png) — the fan-out diagram
- [docs/alto-four-organ-architecture.md](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/docs/alto-four-organ-architecture.md) — why the honesty risk sits at Intake
- [docs/training/alto-intake-lora-training.md](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/docs/training/alto-intake-lora-training.md) — extraction as a trained disposition (the `alto-intake-v1` LoRA it produced is no longer served)
- [docs/handoff/_PLAN-2026-10-04-intake-to-raw-utterance.md](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/docs/handoff/_PLAN-2026-10-04-intake-to-raw-utterance.md) — the arc that removed the organ, its decisions and measurements
- [src/alto/perception/](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/src/alto/perception/__init__.py) · [src/alto/runtime/alto.py](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/src/alto/runtime/alto.py) · [src/tests/test_alto_perception_features.py](https://github.com/sawyerstrong/alto/blob/6f4a244b6d5c6941570d52232b7018b7e4a6c9ad/src/tests/test_alto_perception_features.py)
