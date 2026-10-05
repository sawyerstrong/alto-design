# Perception

> **Path:** hot · **Status:** half — audio only, and not through the designed interface · **Code:** [`audio.py`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/runtime/audio.py), [`stt.py`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/runtime/stt.py), and the [`alto/perception/`](https://github.com/sawyerstrong/alto/tree/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/perception) package

Perception turns signal into raw symbols. It is the only organ that touches the physical
world, and it is deliberately the stupidest one in the system: it converts, and it knows
nothing else. A microphone gives it pressure over time; it hands on a string of words. It
does not know what a graph is, what an entity is, or that Alto exists. Everything that looks
like understanding — resolving "he", marking a claim as *stated* rather than *fact*, deciding
anything matters — is designed to happen one organ later, in Intake. That organ was deleted on
2026-10-04 ([intake.md](intake.md)); what stands in for it is a pure, model-free step in the
[`alto/perception/`](https://github.com/sawyerstrong/alto/tree/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/perception) package, described below.

## Where it sits

Perception is the front door. Nothing inside Alto feeds it; the world does. It consumes
microphone audio and emits a transcript ([`ptt_loop.py:22`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/runtime/ptt_loop.py#L22) captures, `:29` transcribes), which
`Alto._perceive` ([`alto.py:265`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/runtime/alto.py#L265)) wraps in a `Heard` for every organ. Under the designed
structure in [docs/README.md](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/docs/README.md) it has exactly one consumer — Intake — which no
longer exists in code. The
`--text` path ([`cli.py:57`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/runtime/cli.py#L57)) skips Perception entirely and injects a transcript directly,
which is why most testing here never exercises a microphone.

## The intended design

[alto-perception-layer.md](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/docs/perception/alto-perception-layer.md) is the design doc, and
its point is a **fixed interface across modalities**. Every perception module, whatever it
senses, emits the same envelope: `{modality, content, confidence, timestamp, metadata}`
(lines 29-42). Intake consumes any of them without knowing which sense produced it. That
uniformity is the whole reason the layer exists as a separate architectural element — adding
computer vision should mean adding a module, not restructuring Intake (lines 16-23).

The doc is explicit about what Perception must *not* do: resolve entities against the graph,
assess significance, extract intent, flag unknowns, write to the database, or know Alto
exists as a system (lines 141-151). Pure signal conversion, nothing more. That restraint is
load-bearing for pillar 3 — an organ that cannot interpret cannot fabricate an interpretation.

**The corpus designs three more senses than the one that is built, so do not treat this as a
single-modality system by design.** Voice recognition runs *parallel* to speech transcription
and emits speaker identity, which Intake combines with the transcript (lines 66-82); it is
specified down to the tool (Pyannote), the enrollment cost (~60s per person) and the
four-person enrolled set in [alto-sensors.md](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/docs/perception/alto-sensors.md), along with a
two-factor voice+face confidence table whose most important row is the conflict case —
disagreement defaults to the *lower* tier and surfaces the conflict rather than picking the
higher-confidence reading. Hardware state (GPU temperature, VRAM, thermal throttling) is a
polled perception module feeding the energy dimension of affect (lines 84-101), and
[alto-cognitive-proprioception.md](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/docs/perception/alto-cognitive-proprioception.md) designs
a fourth: a sense of Alto's own thinking — effort, fluency, speed — so that an upgrade would
be noticeable *from the inside* rather than silently producing better answers.

**Computer vision is designed at the interface and undesigned at the implementation**, and
the split is worth stating precisely because it is easy to file as one or the other. Settled:
the output shape it must produce — scene description, detected entities, spatial context,
activity, with a confidence (lines 107-123); that it *"slots into the perception layer without
any changes to intake or downstream organs"*; a VRAM budget line (3-7 GB); and a hard privacy
design in [alto-sensors.md](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/docs/perception/alto-sensors.md) — the camera processes
continuously and **retains nothing raw**, the frame discarded immediately after inference,
which that doc calls *"an architectural commitment about what Alto is,"* not a preference.

Unsettled: which model, what it should attend to, and how a visual percept competes with a
spoken one for Intake's attention. There is no spec in [`docs/specs/`](https://github.com/sawyerstrong/alto/tree/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/docs/specs) and no owner interview.
So the contract is real and the organ behind it is not — do not read the contract's existence
as permission to build past the parts nobody has decided.

**How Perception stops being a button is also designed, and it is the rung-by-rung ladder in
[engagement-ladder.md](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/docs/perception/engagement-ladder.md), not one unlock.** That doc
exists because "off push-to-talk" used to be bundled as a single V2 item, which buried the
cheapest rung behind the hardest. It decomposes into: E0 push-to-talk (shipped) → E1
wake-word single-shot, a detector such as openWakeWord or Porcupine in front of today's
pipeline, needing neither speaker ID nor barge-in → E2a cross-turn conversation memory
(shipped; no audio work at all) → E2b continuous multi-turn with turn detection and barge-in
→ E3 ambient listening over a 60-90s RAM ring buffer that is promoted on address and never
persisted → E4 proactive presence → E5 embodied. Engagement is treated as a tracked axis with
targets, because push-to-talk is the single most tool-like property Alto has.

## What exists today

Two small, honest modules and no interface.

[`audio.py`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/runtime/audio.py) is microphone capture and playback over `sounddevice`, with `pynput` for the
global push-to-talk hotkey — both imported lazily inside the functions that need them
([`audio.py:1-5`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/runtime/audio.py#L1-L5)) so the `--text` path never pulls in the mic stack.
`record_push_to_talk` ([`audio.py:62`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/runtime/audio.py#L62)) opens the stream *before* the key is pressed and gates
frames on key state, so stream-open latency does not clip the first syllable; it carries a
`# noqa: C901` and a standing instruction not to refactor it without hardware in the loop.
Two variants exist for the Claude Code approval path: `record_window` (`:118`) records a
fixed window, and `record_ptt` (`:140`) arms for N seconds and returns empty if the key is
never pressed — silence becomes a clean default-deny. `_resample_to_16k` (`:19`) linearly
resamples to what Whisper wants.

[`stt.py`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/runtime/stt.py) is 32 lines. `SpeechToText` (`:14`) loads faster-whisper after adding the NVIDIA DLL
directories, and `transcribe` (`:27`) returns the concatenated segment text, stripped.
Shipped config is `large-v3-turbo` on CUDA at float16, beam size 5 ([`config.yaml:655-659`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/config.yaml#L655-L659)).
The model is loaded lazily on first use ([`ptt_loop.py:13`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/runtime/ptt_loop.py#L13)).

Note what `transcribe` returns: a bare `str`. Not a modality tag, not a confidence, not a
timestamp, not metadata. Whisper's `_info` is discarded at [`stt.py:31`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/runtime/stt.py#L31). **The designed
perception envelope does not exist in code at all** — there is no type, no interface, and no
second module to be uniform with. There is also no speaker identity: grepping [`src/`](https://github.com/sawyerstrong/alto/tree/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src) for
`pyannote` or `speaker_id` returns nothing, and the one known speaker is hard-coded instead
([`heard.py:26`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/perception/heard.py#L26)), carried in its own field and never parsed out of the text.

The [`alto/perception/`](https://github.com/sawyerstrong/alto/tree/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/perception) package is what turns that string into the record every organ reads,
with no model. `hear` ([`heard.py:58`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/perception/heard.py#L58)) builds an `Utterance` (speaker, raw text, when it was
heard) and computes four features once: whether the speaker addressed Alto
([`addressing.py:29`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/perception/addressing.py#L29)), and whether the utterance asks a question, asks for anything (questions,
commands, device fragments), or is nothing but questions ([`asking.py:203-287`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/perception/asking.py#L203-L287)). The memory
guard arms on the second, the relator's no-beliefs gate on the third. These are rules over the
words, not interpretation: they replaced the intake LLM's modality label after scoring better
against blind labels (87 of 88 asks, 1 false arm in 112 tells, on 200 labelled utterances).

## The gap

Three gaps, in rough order of how much they cost.

**The interface is missing, not just the modules.** Today Perception is a function that
returns a string. Adding voice ID means deciding the envelope for the first time, in
anger, while wiring a second producer — which is exactly the restructuring the layer was
designed to avoid. The design is written; the abstraction is not.

**Only one sense is built, and the missing ones are designed, not unimagined.** Voice ID,
hardware state and cognitive proprioception each have a design doc. Nothing gates voice ID
that is visible in the corpus — it is a small resident model
([alto-perception-layer.md](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/docs/perception/alto-perception-layer.md) budgets ~0.5GB) and it
unblocks real things downstream, including a speaker field perception currently hard-codes. CV is
gated on VRAM and on being worked out at all.

**Push-to-talk is the input method, not the design.** `record_push_to_talk` blocks the run
loop ([`ptt_loop.py:22`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/runtime/ptt_loop.py#L22)), so there is no perception between turns — no ambient sense of
anything, no signal arriving unbidden. Pillar 1 names this exact trap. Alto sits on rung E0
of the engagement ladder; E1 (wake word, single shot) is specified, slotted into V1, and
described as the biggest felt upgrade for the least work. What gates it is build capacity,
not a missing decision.

Nothing here is slated for replacement. [`audio.py`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/runtime/audio.py) and [`stt.py`](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/runtime/stt.py) are the floor the designed
layer would be built *over*, not scaffolding to tear out.

## Pillars this serves

- **Pillar 1 (continuous being)** — and currently breaks it. A blocking push-to-talk call is
  the turn-shaped accident hardening into architecture that the pillar exists to prevent.
- **Pillar 3 (honesty by construction)** — an organ that only converts cannot fabricate an
  interpretation. The Perception/Intake split is a structural guard, not a style choice.
- **Pillar 4 (cold-start self)** — embodiment awareness is part of the self-model. Alto has
  no body and one sense, and is meant to reason *from* that limit rather than perform around
  it. Perception is where that limit physically is.

## Sources

- [docs/perception/alto-perception-layer.md](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/docs/perception/alto-perception-layer.md) — the design doc: the fixed interface, the module list, what Perception must not do
- [docs/perception/alto-sensors.md](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/docs/perception/alto-sensors.md) — voice/face identification, the conflict case, the sensor privacy rules
- [docs/perception/alto-cognitive-proprioception.md](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/docs/perception/alto-cognitive-proprioception.md) — sensing its own thinking, as a perception input
- [docs/perception/engagement-ladder.md](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/docs/perception/engagement-ladder.md) — E0-E5: how Perception gets off the button, rung by rung, with targets
- [docs/README.md](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/docs/README.md) — the canonical ingestion path, and Perception's place in it
- [docs/assets/alto-ingestion-path.png](../assets/alto-ingestion-path.png) — the diagram of that path
- [src/alto/runtime/audio.py](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/runtime/audio.py) · [src/alto/runtime/stt.py](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/runtime/stt.py) — the senses
- [src/alto/perception/](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/perception/__init__.py) — `hear` and the utterance features every organ reads
- [src/alto/runtime/ptt_loop.py](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/alto/runtime/ptt_loop.py) — the call sites (`:13`, `:22`, `:29`)
- [src/config.yaml](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/config.yaml) — the `whisper:` (`:655`) and `audio:` (`:691`) blocks
- [src/scripts/whisper_smoke.py](https://github.com/sawyerstrong/alto/blob/6b1b8a38fa185eab66e96ac1d48fb8d19b332bb9/src/scripts/whisper_smoke.py) — the standalone transcription check
- [THE-ORGANS.md](../THE-ORGANS.md) — the status vocabulary and the whole-system map
