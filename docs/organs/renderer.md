# The Renderer / Voice

> **Path:** hot · **Status:** on — a shell around Integration's words, not an organ with a job of its
> own · **Code:** [`speech_out.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/voice/speech_out.py), [`markers.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/markers.py), [`text.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/text.py), [`tts.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/voice/tts.py), with [`llm.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/llm.py) as the call; [`src/steering/`](https://github.com/sawyerstrong/alto/tree/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/steering) exists
> but is not wired

The Renderer is the part of Alto that talks, and today it is a shell. Integration writes the actual
words — the one fine-tuned model marks which of them are speech — and the Renderer picks those up and
says them. It decides nothing, reshapes nothing and remembers nothing. The owner's position
(2026-09-30) is that this is all it needs to be for now: the organ the design described, which turns
a bundle and a steering signal into speech, has no job while Integration already produces the speech.
What might one day give it a job is an organ that controls tone. None is built.

## Where it sits

Below Integration, at the edge of the system. It takes what Integration marked as speech and emits
audio. Anything outside a `¦…¦` pair is discarded before it arrives, so it never hears Integration's
thoughts. It is the output sibling of Perception: what it says goes out into the world, is heard, and
re-enters as an attributed record and as a thought Alto can later surface
([`alto-authorship-and-self-hearing.md`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-authorship-and-self-hearing.md)).
It is not the actuation path — a device call leaves through the guard in [`ha.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/action/ha.py), which does not
care what the Renderer is saying.

## What exists today

The shell is real and shipped. There is no separate model behind it: Integration and the Renderer are
one fine-tuned model, `alto-integration-v6` ([`src/config.yaml:88`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/config.yaml#L88)), called
directly over Ollama through `OllamaClient` ([`llm.py:26`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/llm.py#L26)). The persona
system prompt is read and deliberately ignored — the system prompt is empty
([`assembly.py:124`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/process/assembly.py#L124)).

What the Renderer *is*, then, is four steps after that call, and they live in `SpeechOutput`
([`speech_out.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/voice/speech_out.py)): the marker filter keeps the `¦…¦` spans,
`chunk_sentences` cuts them into sentences, `clean_for_speech` strips what should not be voiced, and
the TTS engine turns each sentence into audio. Each step works on the text it is handed and nothing
else.

### The commitment characters

Two glyphs carry the whole contract between what Alto *decides* and what actually happens.
They are the point at which a thought becomes a commitment — to speak, or to act.

**The house term is "commitment characters"; the code calls them markers** ([`markers.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/markers.py),
`MarkerFilter`, `integration.marker_filter`). The identifiers are not changing, so grep for
`marker`. Older specs write the same idea as `⟦say⟧` / `⟦act⟧`.

| Char | Codepoint | Name | Channel |
|---|---|---|---|
| `¦` | U+00A6 | BROKEN BAR | speech → TTS |
| `¤` | U+00A4 | CURRENCY SIGN | action → captured for the action organ |

**Each is exactly one BPE token in Qwen2.5** — ids 64621 and 81538
([`eval_marker_parser.py:43-45`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/research/lora_training/integration_v1/eval_marker_parser.py#L43-L45)).
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
([`markers.py:111-122`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/markers.py#L111-L122)).

**Defense in depth.** [`tts.py:113`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/voice/tts.py#L113) strips both glyphs again before synthesis, on the reasoning
that if the filter is disabled, buggy, or leaked, Piper should not attempt to pronounce a
currency sign. Marker chars are not alphabetic, so the non-Latin letter filter above it would
not have caught them.

> **A naming discrepancy to expect.** The spec's directive grammar writes these as `⟦say⟧` and
> `⟦act⟧`. What the LoRA emits and [`markers.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/markers.py) parses is `¦` and `¤`. Same idea, different
> surface.

**The marker runtime.** The LoRA is trained to annotate its output: `¦…¦` marks speech that
routes to TTS, `¤…¤` marks an action span, and anything outside a marker pair is *thought* —
filtered, never audible ([`markers.py:1`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/markers.py#L1)). `MarkerFilter` is a
three-state streaming machine with recovery transitions for mixed markers, so a malformed reply
still produces something rather than dropping the whole turn. It runs on the streaming path
([`speech_out.py:152`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/voice/speech_out.py#L152)) and on every blocking reply ([`speech_out.py:41`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/voice/speech_out.py#L41)).
`integration.marker_filter` is **true** as shipped ([`src/config.yaml:291`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/config.yaml#L291)) and defaults to
**false** in code ([`assembly.py:71`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/process/assembly.py#L71)).

> **The trap:** `marker_filter` must be **false** if you point `ollama.model` at a stock,
> non-LoRA model. The filter starts in the discard state, so a model that emits no `¦` produces
> zero speech content and Alto goes completely silent — a config mismatch that looks like a
> broken pipeline.

Captured `¤…¤` action spans are logged and traced but deliberately **not** executed and **not**
written into turn memory ([`speech_out.py:47-50`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/voice/speech_out.py#L47-L50)): the action-LLM organ does not exist, so
recording "Alto carried out X" would train the next turn to trust a lie.

**Speech.** `text.chunk_sentences` ([`text.py:32`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/text.py#L32)) flushes each
complete sentence as soon as one is available, which is what makes time-to-first-word short
rather than time-to-complete-reply. `tts.build_tts` ([`tts.py:217`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/voice/tts.py#L217))
selects the engine from `tts.engine`: `piper` (fast, CPU, flat prosody, the code default) or
`kokoro` (Kokoro-82M via onnxruntime, better prosody, heavier, optional dependency). Shipped
value is **kokoro** ([`src/config.yaml:646`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/config.yaml#L646)); both expose the same `synthesize(text) -> int16`
and `sample_rate`, so swapping is a config flip. `clean_for_speech` strips non-Latin
code-switch leaks *and* the marker glyphs as defense in depth ([`tts.py:113`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/voice/tts.py#L113)), and a TTS
exception is non-fatal ([`speech_out.py:90`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/voice/speech_out.py#L90)).

**Valence steering is the nearest thing to a tone organ, and it is not wired.**
[`src/steering/`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/steering/steer.py) implements tone as a control vector: a forward hook
adds `coeff * direction[layer]` to each decoder layer's output hidden state, so the vector never
enters the token context — it is a bias on the residual stream, "valence as a generation parameter."
It acts on the model that writes the words, which is Integration's, so it does not need a Renderer to
exist. [`steering/serve.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/steering/serve.py) serves generation where valence and
arousal are request parameters alongside `max_tokens`. Measured 2026-07-22 on the v4 adapter at
coeff ~0.07, hand-judged on a handful of probes: tone moved on 7 of 8 and stayed coherent on 8 of 8,
against 0 of 3 for the opaque affect tag it replaced
([`_HANDOFF-2026-07-22-valence-steering.md`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/handoff/_HANDOFF-2026-07-22-valence-steering.md)).
The same-day correction matters more than that number: the earlier "honesty holds under steering" was
scoped to structured rows, and on adversarial prompts positive valence amplified the failures. Alto
claimed a body — "I'll come along" — in 32% of embodiment probes at neutral and 55% at +0.07 valence,
on the adapter of the day
([`_HANDOFF-2026-07-22-compact-prep.md`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/handoff/_HANDOFF-2026-07-22-compact-prep.md)). The v6
retrain alone cut the +valence figure to 29%. A fix tried on top, an always-on embodiment clamp, cut
the +valence leak from 23% to 6% but pushed 10 of 30 collateral outputs into Chinese, and it is
disabled ([`EMBODIMENT-CLAMP.md`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/steering/EMBODIMENT-CLAMP.md)). Small samples, not a
frozen eval. **Nothing in [`src/alto/`](https://github.com/sawyerstrong/alto/tree/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto) imports `steering`** — confirmed by grep — and it runs on its own
HF-transformers HTTP server, because Ollama cannot inject activations.

## The earlier design, set aside for now

[`docs/alto-four-organ-architecture.md`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/alto-four-organ-architecture.md) specifies a different
organ, in four commitments, and every one of them is load-bearing for honesty rather than for quality.
The owner has set it aside: Integration writes the words, so there is nothing for a second organ to
translate. It stays on this page because it is what a tone organ would have to satisfy if one is built.

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
[`alto-affect-routing.md`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-affect-routing.md), of the three routes —
twitch (raw state straight to the renderer as reflex), steering (a bias on activations), and
the introspective felt-sense thought — the renderer gets the first two and never the third.
Affect is never bundle *content*: the bundle carries the idea, steering carries the tone. The
bundle's field contract is [`alto-bundle-structure.md`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-bundle-structure.md).

## What is open

**Who controls tone.** Nothing does today. Steering is the built piece and it is unwired; whether
tone control becomes an organ of its own later, or stays a bias applied to Integration's generation,
is not decided. The plan of record is
[`SPEC-steering-serving-migration.md`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/specs/v1/SPEC-steering-serving-migration.md)
(status: PLAN, 2026-07-22), and its scope insight is what makes it tractable: route **only** the
conversational spoken reply through the steering server and keep tool-calling on Ollama, since a
device command has no tone. That removes tool-call parity, the hardest piece. What it does not
remove is the open risk the spec names and flags as unmeasured — HF `generate` in 4-bit is
expected to decode slower than llama.cpp, and the hook adds per-layer cost.

**The honesty guarantee the design put here is not in force.** The designed Renderer was
structurally unable to fake interior. The shell is not: it voices whatever Integration marked as
speech, and Integration reads the conversation history directly rather than a bundle. What stands
in is a *suppression* directive, not a signal: `integration.affect_gate` ([`src/config.yaml:298`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/config.yaml#L298))
injects a per-turn instruction telling the LoRA not to fabricate a felt interior it does not
have, and it arms on **every** turn, because `_turn_has_grounded_affect` is a stub awaiting the
substrate. That is an honest floor, not the structural guarantee. Nothing checks the spoken reply
either — see the pillar 3 status in [PILLARS.md](../PILLARS.md).

**The reflex route has no receiver.** The **twitch** route (raw state straight to the renderer as
reflex) and the dimensional-value **calibration** experiment — can a renderer be conditioned on
`energy: 0.2` without being told the word, by demonstration rather than instruction — are
designed-but-unbuilt, and distinct from unimagined. The four-organ doc calls the calibration the
load-bearing experiment for an honest renderer: if it only works once the feeling is named, the
performance residue is irreducible. It has not been run, and it has nowhere to land until there is
a tone organ.

## Pillars this serves

- **3** — honesty by construction: the marker filter keeps unmarked thought out of the audio.
  The stateless-renderer guarantee the design counted on is not in force; see above.
- **2** — the renderer half of affect, in the pillar's words. Steering is a bias on generation, not
  a mood word in a prompt — built and measured, not connected, and it acts on Integration's
  generation.
- **8** — device control leaves through the guard, never through the thing that talks; captured
  action markers fire no effector.
- **7** — the steering result is a mechanism win on a small sample, and the same day's correction
  is part of it. It is not a system result until it runs under real latency in a composed turn.

## Sources

- [`docs/alto-four-organ-architecture.md`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/alto-four-organ-architecture.md) — the
  stateless-renderer design and the dimensional-value rule ·
  [`alto-bundle-structure.md`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-bundle-structure.md) — what the renderer
  would see, and nothing else · [`alto-affect-routing.md`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-affect-routing.md) —
  twitch, steering, and why the renderer never gets affect as content. (These three describe the
  earlier design.)
- [`SPEC-steering-serving-migration.md`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/specs/v1/SPEC-steering-serving-migration.md) ·
  [`_HANDOFF-2026-07-22-valence-steering.md`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/handoff/_HANDOFF-2026-07-22-valence-steering.md) ·
  [`_HANDOFF-2026-07-22-compact-prep.md`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/handoff/_HANDOFF-2026-07-22-compact-prep.md)
- [`llm.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/llm.py) · [`markers.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/markers.py) ·
  [`text.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/text.py) · [`tts.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/voice/tts.py) ·
  [`alto.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/alto.py) ·
  [`steering/steer.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/steering/steer.py) ·
  [`steering/EMBODIMENT-CLAMP.md`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/steering/EMBODIMENT-CLAMP.md) ·
  [`config.yaml`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/config.yaml)
