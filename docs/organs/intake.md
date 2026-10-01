# Intake

> **Path:** hot · **Status:** on — but serial, where the design says parallel · **Code:** [`intake.py`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/write/intake.py)

Intake is **the single point of faithful interpretation**. It takes the raw symbols
Perception produced and turns them into a *grounded percept*: who spoke, what was said,
whether it was stated or asked or commanded, which things it referred to, and how clean the
transcription was — **without inferring past the evidence**. Everything downstream consumes
that percept rather than the raw text, which is why the discipline matters: if Intake decides
the speaker is angry and it was wrong, every organ after it honestly processes a corrupted
perception.

Candidly, this system may not be needed at all. Or maybe it's just not needed **yet**. Raw input has proven more useful in basically all cases thus far, but intake might earn its keep when more perception modules are introduced. We will need something to help organize the percepts for other systems. Not sure if this is the right form.

## Where it sits

Intake consumes one thing — the transcript from Perception — and emits a `GroundedPercept`.
In the design ([docs/README.md](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/docs/README.md),
[alto-perception-layer.md](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/docs/perception/alto-perception-layer.md) lines 157-171) it has
three sibling consumers and **none of them gates the others**: the Subconscious (to feel and
react), Integration (to attend), and the live recorder half of the Writer (to persist).
Perception is also not its only upstream — when Processing finishes a piece of research, its
output comes back through Intake for normalization before anything reaches the graph (same
doc, lines 22-23 and 171).

In the code today, one of those three exists: the recorders ([`pipeline.py:1158`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/turn/pipeline.py#L1158), via
`_observe_utterance`, feeding both `writer` and `mem`). The percept also goes to the Surfacer
(`:1283`) and the default-off salience surfacer (`:1287`) — not designed consumers, but the
transducer standing in for the Integration path. The Subconscious loop has nothing to fan
out to at all.

## The intended design

Read [alto-architecture-revisions-june2026.md](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/docs/alto-architecture-revisions-june2026.md)
§1 before touching this organ. It settles two things that are easy to get backwards.

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
marked, confidence attached ([docs/README.md](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/docs/README.md), and the
[ingestion-path diagram](../assets/alto-ingestion-path.png), which also shows a cheap
alias/recency resolution path with the model reserved for hard cases).

**Modality is a closed set of five** — `stated`, `asked`, `command`, `observed`, `expressed`
([`intake.py:54`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/write/intake.py#L54)) — and an out-of-enum value from the model
triggers degraded-percept synthesis rather than being accepted. Note that [`docs/README.md`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/docs/README.md)
describes this as *"stated vs fact"*; **`fact` is not one of the five**, so take the enum as
canonical. The code is careful about why these are safe to assign: promoting or demoting
between them is *grammatical classification of the utterance*, not inference about the world —
which is what keeps modality marking on the right side of pillar 3.
[alto-four-organ-architecture.md](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/docs/alto-four-organ-architecture.md) explains why this
organ carries the project's sharpest honesty risk: with the renderer, as designed, structurally unable to
fake interior, **the risk moved upstream to Intake**, where it is more dangerous because it
is before everything. (The Renderer is a shell today, so that premise is open; Intake's risk
stands either way.) [alto-intake-lora-training.md](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/docs/training/alto-intake-lora-training.md)
states the target as a trained disposition rather than a prompt: a pure extraction system,
not a reasoning system with extraction as a side effect.

## What exists today

`IntakeOrgan.perceive` ([`intake.py:341`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/write/intake.py#L341)) takes one STT-completed utterance, calls the intake
model with a JSON schema and a rolling context block, validates the response, and returns a
`GroundedPercept` ([`intake.py:114`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/write/intake.py#L114)). It never raises: any LLM failure or whole-object schema
violation yields a degraded percept (`extraction=None`, `intake_failed=True`) so the turn
survives. Four of pillar 3's structural guards live here, and they are worth reading as a set:

- **There is no `inference` field.** The schema ([`intake.py:149`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/write/intake.py#L149)) has five keys and none can
  hold an affect-read or an intent-guess. The prompt says so too (`:182`), but the schema is
  the guard — fenced by construction, not by instruction.
- **`resolved_id` must be a surface form the model actually saw.** `_coerce_ref`
  ([`intake.py:526`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/write/intake.py#L526)) keeps a resolution only when the antecedent is genuinely in the recent
  buffer (`:547-549`); a fabricated antecedent is stripped, never admitted.
- **Failures demote, they do not delete.** A bad ref becomes a clean `kind="unknown"` ref
  instead of nulling the whole turn's perception ([`intake.py:497-515`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/write/intake.py#L497-L515)) — the entity *was*
  mentioned, only its resolution was wrong.
- **Self-reference is injected deterministically from the raw text** ([`intake.py:432`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/write/intake.py#L432)),
  because the model's paraphrase drops second-person address ("are you doing alright?" →
  `content="doing alright"`). It matches the *learned* name only ([`intake.py:328`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/write/intake.py#L328)).

Intake runs on its **own dedicated model handle**: `intake_model: alto-intake-v1`
([`config.yaml:114`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/config.yaml#L114)), built by `_build_intake_client` ([`llm.py:313-340`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/turn/llm.py#L313-L340)). The reason is
blast radius, documented at both ends — `aux_model` is *shared* by intake, the surfacer, the
writer-resolver, the writer-relator and the affect assessor, so pointing that shared slot at
an intake-specialized model would corrupt every sibling's `format=`-constrained JSON call
([`config.yaml:118-123`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/config.yaml#L118-L123), [`llm.py:314-320`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/turn/llm.py#L314-L320)).

The handle is not free, and the cost is measured: a third resident model does not fit this
16GB card, so Ollama evicts and reloads it every turn and intake goes from ~820ms to ~2.7s
warm ([`config.yaml:95-102`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/config.yaml#L95-L102)). It is on deliberately, to feel the cost. The context window is
sized off measurement too — real prompts run 996-1070 tokens, so `intake_num_ctx` is 2048
([`config.yaml:131-143`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/config.yaml#L131-L143)), with a hazard: set it too low and Ollama truncates from the *front*,
silently dropping the system prompt.

Evidence, by strength. The pure-function layer is well covered — 50 tests in
[test_alto_intake.py](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/tests/test_alto_intake.py), all in the default gate. The E6
audit measured unflagged inference at 3/54 and a one-line prompt rule took it to 0/54
([alto-experiment-intake-audit.md](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/docs/experiments/alto-experiment-intake-audit.md)); the
same work drove schema compliance from 37% to 100% by adding `format=` ([`intake.py:145-148`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/write/intake.py#L145-L148)).
The shipped LoRA was chosen on a live A/B where it won on refs at every slice and broke the
prompt-resistant `observed → stated` modality wall, with one regression class — it
over-predicts `command` on duty declaratives ([`config.yaml:103-113`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/config.yaml#L103-L113);
[the A/B](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/spikes/writer_mvp/resolver_loop/intake-clause-axis-ab-2026-07-29.md)).

**Naming trap.** Before 2026-06-24, [`alto/write/intake.py`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/write/intake.py) was what is now [`alto/write/writer.py`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/write/writer.py)
([`intake.py:12-16`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/write/intake.py#L12-L16)). Old docs and commit messages saying "intake" often mean the writer, and
the spool file is still called `intake_spool.jsonl` for back-compat.

## The gap

**Serial, not parallel.** `perceive` is called inline between STT and the conversational LLM
([`pipeline.py:1263`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/turn/pipeline.py#L1263)), and the comment above it explains why: parallel was tested on
2026-06-25 and ran ~3x slower, because intake and the conversational model then shared one
14B on one GPU. That comment also names the fix — "a small-model intake on a separate Ollama
slot" — and **that slot now exists** (`intake_model`, shipped). The call site was never
revisited. `perceive` also takes one *completed* utterance, which is exactly the hard batch
boundary §1 rules out. But parallelising it today would buy latency, not the twitch path: two
of the three designed consumers are unbuilt, so the fan-out has nowhere to fan
([subconscious.md](subconscious.md)).

**Refs do not reach the graph here.** `resolved_id` holds a surface form from the recent
buffer, explicitly *not* an entity id or a node UUID ([`intake.py:66-69`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/write/intake.py#L66-L69)); deep resolution
belongs to the writer-resolver, whose LLM half is dark (`resolver_enabled: false`,
[`config.yaml:591`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/config.yaml#L591)). "References resolved" is half-true today: anaphora resolve against three
recent utterances, and nothing resolves against what Alto knows.

**The cheap path does not exist.** The ingestion diagram specifies alias/recency resolution
first with the model reserved for hard cases; `perceive` calls the model on every utterance
([`intake.py:356`](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/write/intake.py#L356)). **The corpus is silent on what that cheap path's dispatch rule would be** —
the diagram names it and no doc specifies it. Do not read that silence as a decision.

One piece of status history, because it reads as a contradiction: E6's 2026-06 verdict was
**DEFER — the intake LoRA is not needed**, and an intake LoRA is what ships today. E6 audited
a prompt-only, no-registry configuration and carried an explicit re-audit caveat; the July
campaign then found a modality wall that was prompt-resistant on both 3B and 7B, and that is
the wall the LoRA was trained to break
([the pilot scope](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/docs/runbooks/intake-3b-lora-pilot-scope.md)).

## Pillars this serves

- **Pillar 3 (honesty by construction)** — the whole organ. No `inference` field exists,
  resolution is an index into a list Intake built, a fabricated antecedent is stripped. The
  pillar's own worked example of *fenced, not instructed*.
- **Pillar 9 (repairability over precision)** — demote-don't-drop. A wrong ref that is still
  captured can be corrected later; a percept nulled by one stray antecedent cannot.
- **Pillar 1 (continuous being)** — currently broken here. One completed utterance in, one
  percept out, serially, is the turn-shaped frame hardening into architecture.
- **Pillar 4 (cold-start self)** — self-reference fires on the *earned* name only.

## Sources

- [docs/alto-architecture-revisions-june2026.md](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/docs/alto-architecture-revisions-june2026.md) §1 — parallel fan-out, continuous ingestion, timing-merges-function-doesn't
- [docs/README.md](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/docs/README.md) — the canonical ingestion path and the grounded-percept contract
- [docs/assets/alto-ingestion-path.png](../assets/alto-ingestion-path.png) — the fan-out diagram
- [docs/alto-four-organ-architecture.md](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/docs/alto-four-organ-architecture.md) — why the honesty risk moved upstream to Intake
- [docs/training/alto-intake-lora-training.md](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/docs/training/alto-intake-lora-training.md) — extraction as a trained disposition, not a prompt
- [docs/experiments/alto-experiment-intake-audit.md](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/docs/experiments/alto-experiment-intake-audit.md) — the E6 audit and its DEFER verdict, and [the pilot scope](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/docs/runbooks/intake-3b-lora-pilot-scope.md) for the LoRA that superseded it
- [docs/CHECKS-measurement.md](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/docs/CHECKS-measurement.md) — including the intake instance: a probe that built the model outside `_build_intake_client` measured the stock 3B while production served the LoRA
- [src/alto/write/intake.py](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/write/intake.py) · [src/alto/turn/pipeline.py](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/alto/turn/pipeline.py) · [src/config.yaml](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/config.yaml) · [src/tests/test_alto_intake.py](https://github.com/sawyerstrong/alto/blob/b93b8a9a2bd80fc259d5628c0a8c5db162a20e76/src/tests/test_alto_intake.py)
