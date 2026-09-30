# The Articulator

> **Path:** hot · **Status:** designed — zero code · **Code:** none

The Articulator is the downward transducer at the conscious boundary, the mirror of the
Surfacer. Integration forms an intention to communicate — "I want to tell them the printer's
probably fine, gently" — and the Articulator takes that conscious intent, plus the current
sub-symbolic state, and renders the bundle and steering the Renderer needs. It exists for one
reason: **Integration must not assemble the bundle, because assembling fields is knowing about
the machinery.** The organ is the thing that makes it possible for Integration to intend
without ever learning that a bundle exists.

## Where it sits

Directly below Integration and directly above the Renderer. It consumes a conscious intent (a
thought, not a data structure) and the live sub-symbolic state; it emits the bundle plus the
steering signal. Everything below it — bundle assembly, steering, the renderer, action
execution — is machinery Integration never sees. The mirror is exact: where the Surfacer's
input is machinery and its output is a thought, the Articulator's input is a thought and its
output is machinery.

The analogy in the design doc is speech production. You form the intention to say something;
the motor planning that turns intent into articulated speech happens without your experiencing
it. That is also why the organ has this name and the Surfacer does not — of the three
transducers, only the Renderer kept the word "render"
([`docs/systems/alto-surfacer.md`](https://github.com/sawyerstrong/alto/blob/c01cf0847cf078442b441357c615e4a4ccd54202/docs/systems/alto-surfacer.md), the naming note).

## The intended design

[`docs/systems/alto-conscious-locus.md`](https://github.com/sawyerstrong/alto/blob/c01cf0847cf078442b441357c615e4a4ccd54202/docs/systems/alto-conscious-locus.md) is the only
doc that specifies this organ, and it introduces it as a **correction to prior design**: the
earlier architecture had Integration assemble the bundle itself, and the conscious-locus
principle rules that out. That doc's "Consequences for Existing Design" section is explicit
that [`alto-bundle-structure.md`](https://github.com/sawyerstrong/alto/blob/c01cf0847cf078442b441357c615e4a4ccd54202/docs/systems/alto-bundle-structure.md) and the affect-routing
doc are to be revised so the bundle is produced *below* Integration, not by it. The bundle's
field contract still lives in the bundle-structure doc; what changes is who fills it.

Its build-order position is stated: a real new piece, mirror of the input Surfacer, built with
the bundle and renderer work at Stage 3 or later.

Two smaller things the corpus does fix. The Articulator's output is auditable — the builder can
log the intent Integration formed and the bundle the Articulator produced and ask whether the
render was faithful, which is how every honesty constraint in this architecture is checked.
And it sits inside the self-hearing loop: intent → Articulator → Renderer → speech → perception
→ back in as an attributed record and as a thought Alto can surface
([`alto-authorship-and-self-hearing.md`](https://github.com/sawyerstrong/alto/blob/c01cf0847cf078442b441357c615e4a4ccd54202/docs/systems/alto-authorship-and-self-hearing.md)),
which is why "I meant to say it" and "I did say it" are two different records with a real gap
between them.

**The corpus is silent** on the Articulator's own faithfulness constraint. The Surfacer has a
sharp one — renders form, never adds content — and no equivalent is written for the downward
direction, even though the same question obviously applies (can an Articulator over-specify an
intent into a bundle the intent did not license?). The conscious-locus doc names the *audit*
("did the Articulator render the intent faithfully?") without specifying the *rule*. No spec
exists; [`SPEC-surfacer-mvp.md`](https://github.com/sawyerstrong/alto/blob/c01cf0847cf078442b441357c615e4a4ccd54202/docs/specs/v1/SPEC-surfacer-mvp.md) lists the Articulator
under explicit non-goals.

## What exists today

Nothing. A grep across [`src/`](https://github.com/sawyerstrong/alto/tree/c01cf0847cf078442b441357c615e4a4ccd54202/src) for "articulat" returns only tokenizer vocabulary inside the
LoRA adapter directories — no module, no class, no config key.

That is not an oversight, because the organ directly above it does not exist either:
[`ARCHITECTURE.md:89`](https://github.com/sawyerstrong/alto/blob/c01cf0847cf078442b441357c615e4a4ccd54202/docs/ARCHITECTURE.md#L89) states that the integration layer does not exist
as code and the conversational model is called directly. Integration, the Articulator and the
Renderer are collapsed into one fine-tuned model.

What stands in for the Articulator is the pipeline composing the call itself. The rolling turn
buffer's `messages()` snapshot is run through four independent ephemeral composers — the
memory guard, the reader's knowledge block, the affect-suppression gate, and this turn's
pending surfaced thoughts — and the result is handed straight to the conversational LoRA
([`pipeline.py:1553-1573`](https://github.com/sawyerstrong/alto/blob/c01cf0847cf078442b441357c615e4a4ccd54202/src/alto/turn/pipeline.py#L1553-L1573)). The system prompt is deliberately
empty ([`pipeline.py:296`](https://github.com/sawyerstrong/alto/blob/c01cf0847cf078442b441357c615e4a4ccd54202/src/alto/turn/pipeline.py#L296)). No steering signal is passed at all; no sub-symbolic state is read
at this seam. [`alto/integration/`](https://github.com/sawyerstrong/alto/tree/c01cf0847cf078442b441357c615e4a4ccd54202/src/alto/integration) holds bundle-curation *filters* — one of the four designed —
and nothing imports it outside its own test.

So the shipped arrangement is the one the conscious-locus doc corrects: a bundle assembled
above the line, by code Integration would have to know about if Integration existed.

## The gap

The whole organ. It is **designed-but-unbuilt**, which in this repo is a distinct category from
unimagined — but it is the thinnest design of the three transducers, one section of one doc
rather than a doc of its own.

What gates it is unusual: not hardware, not the payload layer, but the organ above. There is no
conscious intent to articulate *from* until Integration exists as something separate from the
model that also renders the speech. Build the Articulator first and it would take its input
from the same place the pipeline already does, which is the gap rather than the fix. The plan
of record sequences it with the bundle and renderer work
([`alto-conscious-locus.md`](https://github.com/sawyerstrong/alto/blob/c01cf0847cf078442b441357c615e4a4ccd54202/docs/systems/alto-conscious-locus.md), "Build Order Position").

One live corpus contradiction to know about: [`alto-bundle-structure.md`](https://github.com/sawyerstrong/alto/blob/c01cf0847cf078442b441357c615e4a4ccd54202/docs/systems/alto-bundle-structure.md) still reads "the bundle
is what Integration assembles on its branch of the fan-out," which is exactly the sentence the
conscious-locus doc instructs be revised. The revision has not landed. Conscious-locus wins —
it is the later and more specific ruling — but a doc you read tomorrow may tell you otherwise.

## Pillars this serves

- **3** — honesty by construction. Integration cannot perform a state it is handed if it never
  experiences being handed anything; the Articulator is half of what makes that structurally
  true rather than instructed.
- **2** — steering is the machinery half of affect, and the Articulator is where a lived state
  becomes a steering signal rather than a mood word in a prompt.
- **8** — intent descends toward the actuation path here, and the deterministic guard stays
  below it. Interiority never reaches `call_service` unchecked.

## Sources

- [`docs/systems/alto-conscious-locus.md`](https://github.com/sawyerstrong/alto/blob/c01cf0847cf078442b441357c615e4a4ccd54202/docs/systems/alto-conscious-locus.md) — the only
  specification of this organ.
- [`docs/systems/alto-bundle-structure.md`](https://github.com/sawyerstrong/alto/blob/c01cf0847cf078442b441357c615e4a4ccd54202/docs/systems/alto-bundle-structure.md) — the
  bundle's field contract (and the stale "Integration assembles" framing).
- [`docs/systems/alto-integration-bundle-filters.md`](https://github.com/sawyerstrong/alto/blob/c01cf0847cf078442b441357c615e4a4ccd54202/docs/systems/alto-integration-bundle-filters.md) —
  the four curation filters.
- [`docs/systems/alto-authorship-and-self-hearing.md`](https://github.com/sawyerstrong/alto/blob/c01cf0847cf078442b441357c615e4a4ccd54202/docs/systems/alto-authorship-and-self-hearing.md) —
  the intent → speech → perception loop and the in-flight gap.
- [`docs/ARCHITECTURE.md`](https://github.com/sawyerstrong/alto/blob/c01cf0847cf078442b441357c615e4a4ccd54202/docs/ARCHITECTURE.md) — the collapse of Integration / Articulator /
  Renderer into one model.
- [`src/alto/turn/pipeline.py`](https://github.com/sawyerstrong/alto/blob/c01cf0847cf078442b441357c615e4a4ccd54202/src/alto/turn/pipeline.py) ·
  [`src/alto/integration/__init__.py`](https://github.com/sawyerstrong/alto/blob/c01cf0847cf078442b441357c615e4a4ccd54202/src/alto/integration/__init__.py)
