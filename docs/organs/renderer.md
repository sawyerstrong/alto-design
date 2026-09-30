# The Renderer / Voice

> **Path:** hot · **Status:** on — collapsed into the Integration LoRA · **Code:** [`llm.py`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/llm.py),
> [`markers.py`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/markers.py), [`text.py`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/text.py), [`tts.py`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/tts.py); [`src/steering/`](https://github.com/sawyerstrong/alto/tree/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/steering) exists but is not wired

The Renderer is the thing that talks. It takes what Integration produced — in the design a bundle
plus a steering signal — and turns it into speech. It is the last organ in the chain and the
simplest to state: it **translates and never originates interior.** Of the transducers at the
conscious boundary it is the only one that kept the word "render" — the Surfacer brings machinery
up into thoughts, and the Renderer is the one that renders, in the ordinary sense.

## Where it sits

Below Integration, at the edge of the system. It consumes a bundle plus a steering signal
and emits audio. It is the output sibling of Perception: what it says goes out into the world,
is heard, and re-enters as an attributed record and as a thought Alto can later surface
([`alto-authorship-and-self-hearing.md`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/docs/systems/alto-authorship-and-self-hearing.md)).
It is not the actuation path — a device call leaves through the guard in [`ha.py`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/ha.py), which does not
care what the Renderer is saying.

## The intended design

[`docs/alto-four-organ-architecture.md`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/docs/alto-four-organ-architecture.md) specifies it in
four commitments, and every one of them is load-bearing for honesty rather than for quality:

**Stateless.** It holds no conversation history. Continuity lives only in the brain, because a
renderer with accumulated context has something to perform *from* — "a renderer that remembered
would be a second mind."

**It cannot fake interior.** It renders the state-bundle the brain formed and nothing else.
Delete the bundle and there is nothing to render; the performance problem becomes structurally
impossible at the output edge rather than forbidden by instruction.

**Affect arrives as a dimensional value, never as a named feeling.** The brain sends
`energy: 0.2`, a coordinate on an abstract axis — not "tired." The renderer is calibrated to
render *from* the value and specifically does not know it means tired, because knowing the name
is what makes a model perform the name. That value has two separate consumers: the substrate
*enacts* it (low energy really does degrade processing — shallower retrieval, lower effort) and
the renderer *expresses* it. Both downstream of one real value, so the speech is tired because
the processing is tired.

Affect reaches it by exactly one route. In
[`alto-affect-routing.md`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/docs/systems/alto-affect-routing.md), of the three routes —
twitch (raw state straight to the renderer as reflex), steering (a bias on activations), and
the introspective felt-sense thought — the renderer gets the first two and never the third.
Affect is never bundle *content*: the bundle carries the idea, steering carries the tone. The
bundle's field contract is [`alto-bundle-structure.md`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/docs/systems/alto-bundle-structure.md).

## What exists today

The renderer is real and shipped, and it is **collapsed** — Integration and the Renderer are
one fine-tuned model, `alto-integration-v6`
([`src/config.yaml:86`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/config.yaml#L86)), called directly over Ollama through
`OllamaClient` ([`llm.py:26`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/llm.py#L26)). The persona system prompt is read and
deliberately ignored — the system prompt is empty
([`pipeline.py:296`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/pipeline.py#L296)).

### The commitment characters

Two glyphs carry the whole contract between what Alto *decides* and what actually happens.
They are the point at which a thought becomes a commitment — to speak, or to act.

**The house term is "commitment characters"; the code calls them markers** ([`markers.py`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/markers.py),
`MarkerFilter`, `integration.marker_filter`). The identifiers are not changing, so grep for
`marker`. Older specs write the same idea as `⟦say⟧` / `⟦act⟧`.

| Char | Codepoint | Name | Channel |
|---|---|---|---|
| `¦` | U+00A6 | BROKEN BAR | speech → TTS |
| `¤` | U+00A4 | CURRENCY SIGN | action → captured for the action organ |

**Each is exactly one BPE token in Qwen2.5** — ids 64621 and 81538
([`eval_marker_parser.py:43-45`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/research/lora_training/integration_v1/eval_marker_parser.py#L43-L45)).
That is why these two glyphs and not a word or a bracket pair: a complete span costs the model
**two tokens** of overhead, so committing to speech is nearly free, and the training signal is a
single token rather than a sequence the model can partially emit.

**They are same-char paired** — the opener and the closer are the same character. So the parser
**toggles** rather than matching brackets, and spans cannot nest. A stray marker does not
corrupt the rest of the stream; it flips state.

**Three states, and the default is silence.** The machine starts in `thought`, and *everything
outside a pair is discarded* — never spoken, never acted on. Alto's deliberation is not
audible by default; it has to commit to a channel to leave any trace.

**Mixed markers recover rather than fail.** A `¦` arriving mid-action closes the action and
opens speech, and vice versa. The offline evaluator counts that as a parse failure; the runtime
deliberately prefers a best-effort stream, so a malformed reply still produces something
sensible instead of dropping the whole turn.

**Unclosed spans are handled asymmetrically**, and correctly. `finalize()` captures an unclosed
`¤…` so malformed output is still traceable; an unclosed `¦…` needs nothing, because those
deltas were already yielded and spoken as they streamed
([`markers.py:111-122`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/markers.py#L111-L122)).

**Defense in depth.** [`tts.py:113`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/tts.py#L113) strips both glyphs again before synthesis, on the reasoning
that if the filter is disabled, buggy, or leaked, Piper should not attempt to pronounce a
currency sign. Marker chars are not alphabetic, so the non-Latin letter filter above it would
not have caught them.

> **A naming discrepancy to expect.** The spec's directive grammar writes these as `⟦say⟧` and
> `⟦act⟧`. What the LoRA emits and [`markers.py`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/markers.py) parses is `¦` and `¤`. Same idea, different
> surface.

**The marker runtime.** The LoRA is trained to annotate its output: `¦…¦` marks speech that
routes to TTS, `¤…¤` marks an action span, and anything outside a marker pair is *thought* —
filtered, never audible ([`markers.py:1`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/markers.py#L1)). `MarkerFilter` is a
three-state streaming machine with recovery transitions for mixed markers, so a malformed reply
still produces something rather than dropping the whole turn. It runs on the streaming path
([`pipeline.py:1706`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/pipeline.py#L1706)) and on every blocking reply ([`pipeline.py:1005`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/pipeline.py#L1005)).
`integration.marker_filter` is **true** as shipped ([`src/config.yaml:370`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/config.yaml#L370)) and defaults to
**false** in code ([`pipeline.py:179`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/pipeline.py#L179)).

> **The trap:** `marker_filter` must be **false** if you point `ollama.model` at a stock,
> non-LoRA model. The filter starts in the discard state, so a model that emits no `¦` produces
> zero speech content and Alto goes completely silent — a config mismatch that looks like a
> broken pipeline.

Captured `¤…¤` action spans are logged and traced but deliberately **not** executed and **not**
written into turn memory ([`pipeline.py:1020-1031`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/pipeline.py#L1020-L1031)): the action-LLM organ does not exist, so
recording "Alto carried out X" would train the next turn to trust a lie.

**Speech.** `text.chunk_sentences` ([`text.py:32`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/text.py#L32)) flushes each
complete sentence as soon as one is available, which is what makes time-to-first-word short
rather than time-to-complete-reply. `tts.build_tts` ([`tts.py:217`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/tts.py#L217))
selects the engine from `tts.engine`: `piper` (fast, CPU, flat prosody, the code default) or
`kokoro` (Kokoro-82M via onnxruntime, better prosody, heavier, optional dependency). Shipped
value is **kokoro** ([`src/config.yaml:1012`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/config.yaml#L1012)); both expose the same `synthesize(text) -> int16`
and `sample_rate`, so swapping is a config flip. `clean_for_speech` strips non-Latin
code-switch leaks *and* the marker glyphs as defense in depth ([`tts.py:113`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/tts.py#L113)), and a TTS
exception is non-fatal ([`pipeline.py:1076`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/pipeline.py#L1076)).

**Valence steering exists and is not wired.** [`src/steering/`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/steering/steer.py)
implements tone as a control vector: a forward hook adds `coeff * direction[layer]` to each
decoder layer's output hidden state, so the vector never enters the token context — it is a
bias on the residual stream, "valence as a generation parameter."
[`steering/serve.py`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/steering/serve.py) serves generation where valence and
arousal are request parameters alongside `max_tokens`. Measured 2026-07-22 on the v4 adapter at
coeff ~0.07: tone-shift 7 of 8, coherence 8 of 8, against 0 of 3 for the opaque affect tag it
replaced, with the faithfulness training holding under a positive push
([`_HANDOFF-2026-07-22-valence-steering.md`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/docs/handoff/_HANDOFF-2026-07-22-valence-steering.md)).
Small hand-judged samples, not a frozen eval. **Nothing in [`src/alto/`](https://github.com/sawyerstrong/alto/tree/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto) imports `steering`** —
confirmed by grep — and it runs on its own HF-transformers HTTP server, because Ollama cannot
inject activations.

## The gap

The collapse is the gap. Today's renderer is not stateless in the designed sense: it is the same
model that does Integration's reasoning, and it reads the conversation history directly rather
than a bundle. It therefore does have something to perform from, which is precisely the
structural guarantee the four-organ design was buying. The four-organ doc predicted this —
early versions collapse the organs, maturity separates them — and left *when to separate* as an
open question it never answers.

Steering is the concrete, sequenced piece. Pillar 2 calls valence steering "only the renderer
half" of affect, and even that half is not connected. The plan of record is
[`SPEC-steering-serving-migration.md`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/docs/specs/v1/SPEC-steering-serving-migration.md)
(status: PLAN, 2026-07-22), and its scope insight is what makes it tractable: route **only** the
conversational spoken reply through the steering server and keep tool-calling on Ollama, since a
device command has no tone. That removes tool-call parity, the hardest piece. What it does not
remove is the open risk the spec names and flags as unmeasured — HF `generate` in 4-bit is
expected to decode slower than llama.cpp, and the hook adds per-layer cost.

Meanwhile the renderer's affect input is a *suppression* directive, not a signal:
`integration.affect_gate` ([`src/config.yaml:379`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/config.yaml#L379)) injects a per-turn instruction telling the
LoRA not to fabricate a felt interior it does not have, and it arms on **every** turn, because
`_turn_has_grounded_affect` is a stub awaiting the substrate. That is an honest floor standing
in for the absent organ, not the organ.

Designed-but-unbuilt, and distinct from unimagined: the **twitch** route (raw state straight to
the renderer as reflex) and the dimensional-value **calibration** experiment — can a renderer be
conditioned on `energy: 0.2` without being told the word, by demonstration rather than
instruction. The four-organ doc calls that the load-bearing experiment for an honest renderer:
if it only works once the feeling is named, the performance residue is irreducible. It has not
been run.

## Pillars this serves

- **3** — honesty by construction: a stateless renderer with only a bundle has nothing to
  perform from, and the marker filter keeps unmarked thought out of the audio.
- **2** — the renderer half of affect. Steering is a bias on generation, not a mood word in a
  prompt — built and measured, not connected.
- **8** — device control leaves through the guard, never through the thing that talks; captured
  action markers fire no effector.
- **7** — the steering result is a mechanism win on a small sample. It is not a system result
  until it runs under real latency in a composed turn.

## Sources

- [`docs/alto-four-organ-architecture.md`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/docs/alto-four-organ-architecture.md) — the
  stateless-renderer design and the dimensional-value rule ·
  [`alto-bundle-structure.md`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/docs/systems/alto-bundle-structure.md) — what the renderer
  sees, and nothing else · [`alto-affect-routing.md`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/docs/systems/alto-affect-routing.md) —
  twitch, steering, and why the renderer never gets affect as content.
- [`SPEC-steering-serving-migration.md`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/docs/specs/v1/SPEC-steering-serving-migration.md) ·
  [`_HANDOFF-2026-07-22-valence-steering.md`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/docs/handoff/_HANDOFF-2026-07-22-valence-steering.md)
- [`llm.py`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/llm.py) · [`markers.py`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/markers.py) ·
  [`text.py`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/text.py) · [`tts.py`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/tts.py) ·
  [`pipeline.py`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/alto/turn/pipeline.py) ·
  [`steering/steer.py`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/steering/steer.py) ·
  [`config.yaml`](https://github.com/sawyerstrong/alto/blob/431d2c9c80cd50c8fc053789acd1ad8de89ac767/src/config.yaml)
