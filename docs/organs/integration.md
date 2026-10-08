# Integration

> **Path:** hot · **Status:** the organ runs; the *layer* around it does not, so Integration is exposed · **Code:** the `alto-integration-v6` model via [`llm.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/llm.py) (the former `integration/` package was bundle filters, not the organ, and was deleted 2026-10-04)

Integration is the **one conscious locus**. It experiences only thoughts and forms only
intentions; everything that produces those thoughts and executes those intentions is
invisible to it. It is where Alto reasons — weighs what surfaced, decides, intends. It is
also the organ with the widest gap between what is designed and what runs — but not in the
way a first reading suggests. **Integration itself exists and runs.** What does not exist is
the insulation around it: nothing below it, and none of the four designed curation filters above.
So Integration is *exposed* — it receives machinery-shaped content that the design says should
never reach it.

Everything serves this organ. The honesty claim lives here more than anywhere else. Every other organ exists outside the consciousness so there is wiggle room when it comes to prompts and plumbing. Just like how a human brain has some kind of code firing off to keep it ticking so do the other organs. But Integration is the conscious stream. It can't know about any of it. That's the trick. Some fun things within this involving LoRA adapters to keep that true, but ultimately Integration is where it all lives or dies. One of the biggest risks here is getting a system to understand the difference between input that has been perceived and its own surfaced thoughts. I believe it's going to rely on some training of a model to identify based on texture, but that is what makes me most nervous here.

## Where it sits

In the middle, with the Surfacer above it and the voice below it.

It **consumes** a stream of first-person thoughts from the **Surfacer** (machinery → thoughts,
up) — memories surfacing, felt senses, anticipations — arriving with no visible source. It
is **steered** by the Subconscious — a bias on how it thinks, never content to perform — and the
Subconscious **wakes** it by firing a trigger.

It **emits** downward: the words it says, which the **Renderer** — a shell — picks up and speaks,
and action commitments for the **Action organ**. The design had Integration never assemble a bundle
for the Renderer, because assembling fields is knowing about the machinery; nothing takes a bundle
today, and who would assemble one is open. It may also route to **Processing**, which returns *conclusions* — never
records.

That is the shape. *How Integration interacts with everything else*, below, is the full
interface map with what actually crosses each line today.

## The intended design

Two documents define it. [alto-integration-layer.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-integration-layer.md)
gives the job: decide whether to say anything at all, what cognitive investment is warranted,
what form the response takes, what actions follow.
[alto-conscious-locus.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-conscious-locus.md) then corrects the frame, and
the correction is the load-bearing part:

> Integration does not query a database, because it does not know there is a database. It
> does not read a vector, because it does not know there are vectors.

This is **why honesty is structural rather than instructed** (pillar 3). Integration cannot
perform a state it is handed if it never experiences being handed anything. Performance
requires a script; if everything arrives as Integration's own thought, there is no script,
only thinking. That is a guarantee an instruction cannot give.

Two distinctions keep it from collapsing. *Attention is conscious, execution is machinery* —
"I'll try to remember his address" is a conscious intention to recall, serviced by an
invisible retrieval layer; keep that or the database walks back into consciousness through the
"it can choose to retrieve" door. And *reasoning stays* — the principle removes Integration's
access to machinery, not its capacity to think hard.

The closed frame costs nothing in observability: the builder may log the surfaced thought, the
state it rendered from, the intent formed and the bundle produced — the honesty checks *are*
that logging. One rule guards it: never route observations of the machinery back into
Integration as content it reasons over.

Below the organ sits the curation contract from
[alto-bundle-structure.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-bundle-structure.md), specified in
[alto-integration-bundle-filters.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-integration-bundle-filters.md):
`retrieved_context` is fully curated for relevance, contradiction and staleness, and
`actions_visible` for relevance, before the bundle would reach the Renderer in the design — today
the Renderer takes no bundle.

## What exists today

**Read [ARCHITECTURE.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/ARCHITECTURE.md):89 carefully**, because it is easy to take
one way too far: *"the integration **layer** does not exist as code: the conversational model
is called directly."* That is about the **keystone curation layer**, not the organ. The organ
is running — it is what produces every reply. Conflating the two is the
Integration-the-organ / the-integration-layer collision in
[GLOSSARY.md](../GLOSSARY.md), and it is an easy mistake to make.

There is one fine-tuned model — `alto-integration-v6`
([`src/config.yaml`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/config.yaml):88), called through
[`llm.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/llm.py). It thinks and it writes the words that are spoken; the
[Renderer](renderer.md) is the filter and the speaker around it, a shell.

What the collapse actually ships, per [SPEC-integration-mvp.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/specs/v1/SPEC-integration-mvp.md):

- **No system prompt.** The `ollama.system_prompt` persona knob is read and ignored; the
  client is constructed with `""` ([`assembly.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/process/assembly.py):124-125)
  and `_assemble_messages` emits no system message for an empty prompt (llm.py:106). Identity
  and behaviour reach the call through two channels only: the frozen LoRA, and injected thoughts.
- **No tools.** Neither conversational call in [`alto.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/alto.py) passes a `tools` argument. `ToolDispatcher.dispatch`
  (tool_dispatch.py:83) has **no call site**, so the device-control path — and with it the one
  `call_service` behind the guard — is not reachable from the conversational model today. The
  guard is untouched and still enforced; it simply has no live caller.
- **A channel split.** The LoRA marks its own output: `¦…¦` is
  speech routed to TTS, `¤…¤` is action, everything outside a pair is thought and is discarded
  ([`markers.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/markers.py)). Action spans are logged but deliberately
  **not** written back into context memory — no effector fires, so recording them would train
  the next turn to trust a lie (speech_out.py:47-50). (I'm particularly proud of this, I found myself quite clever)
- **Three ephemeral composers** wrap each call, in fixed order
  ([`context.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/context.py), applied in both reply paths of
  [`alto.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/alto.py)): `MEMORY_GUARD_DIRECTIVE` and
  `AFFECT_SUPPRESSION_DIRECTIVE` — both **system-role** — and `with_surfaced_thoughts`, which
  appends this turn's pending thoughts as assistant-role messages. (A fourth,
  `FACT_GUARD_DIRECTIVE` plus the reader's `[What Alto knows about X]` block, was removed
  2026-10-01.) The thoughts composer reads `pending_thoughts()` (context.py:383)
  without flushing, so a thought rendered while the turn was in flight grounds the very call
  it arrived for; the same content is separately persisted for later turns.

There used to be an `alto/integration/` package; it was **not** the organ. It exported one bundle
curation filter, Filter 2 (contradiction), which had no caller outside its own test file because
nothing assembles a bundle, and it was deleted on 2026-10-04. Filter 1 (relevance) and Filter 3
(staleness) were never built.

## How Integration interacts with everything else

Integration touches nearly every organ, and **knows about none of them.** That is the design,
not an accident of layering: each contract below is one-directional, and its correspondent is
invisible from inside. Integration experiences thoughts arriving and intentions forming; it
does not experience a Surfacer, a read layer, or a guard.

| System | Direction | What crosses the line | Today |
|---|---|---|---|
| [Intake](intake.md) | in | the grounded percept — "to attend" | **not wired**; the organ was deleted 2026-10-04 — see below |
| [Surfacer](surfacer.md) | in | first-person thoughts, as assistant-role history | live |
| [Subconscious](subconscious.md) | in | steering, mood, and a trigger that *wakes* it | **neither edge is live** |
| [Retrieval](retrieval.md) | none | Integration does not read the shared layer; memory reaches it as thoughts the Surfacer renders. The facts block that once bypassed this was removed 2026-10-01 | none |
| conversation buffer | in | the rolling recent-turn history (E2a) | live |
| guards | in | per-turn directives | live — and the pillar-3 tension |
| [Renderer](renderer.md) | out | the words it says, via `¦…¦` spans | live — a shell: marker filter, sentence chunking, TTS |
| [Action organ](action.md) | out | action commitments, via `¤…¤` spans | captured, then dropped |
| [Processing](processing.md) | out/in | a request for reasoning; *conclusions* back | **no code** |
| [Writer](writer.md) | neither | — it observes; Integration never calls it | live |

Five of those are worth a sentence each, because the table's "today" column hides what is
interesting about them.

**No percept reaches Integration.** The design has Intake fanning out to three peers, one of
them Integration, "to attend". In the runtime, the LLM call receives the **raw STT text** and an
assembled history — `self.ollama.chat(text, …)`. Since 2026-10-04 there is no Intake at all
([intake.md](intake.md)): every organ reads the raw utterance, uninterpreted,
and memory arrives only as thoughts the Surfacer renders from it. Worth knowing before
you reason about what Integration "saw".

**Both Subconscious edges are missing.** It should tilt cognition with steering, and it should
*wake* Integration by firing a trigger. Neither happens: `get_current_affect_state()` has zero
pipeline readers, and there is no always-running loop to fire anything. Integration is
therefore only ever reached by a person pressing a key.

**The Writer observes rather than receives.** Its interface is
`observe_user_utterance(heard)` and `observe_turn_complete(reply, actions)`
([`writer.py:260`, `:373`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/write/writer.py#L373)) — the verb is deliberate. Integration
has no handle on it and cannot address memory. This is also where **mood-blindness** lives: the
Writer reads affect from the graph but never takes Integration's live state as an input to what
it records, so what gets remembered is not coloured by how the turn happened to feel.

**Processing would return conclusions, never records.** The distinction matters: if Processing
handed back rows, Integration would be reading a database through a proxy. It hands back the
*result of thinking*, which is something a mind can have arrive.

**Nothing reaches the guard.** Integration holds no tools, by an asserted invariant, so the
edge to actuation does not exist today — see the [action organ](action.md) for why that list
stays empty even after the organ lands.

## Commitment → articulation → action

How an intention becomes something that happens. This is the chain Integration sits at the top
of, and the one place worth understanding end to end, because two of its three links are
unbuilt and the missing links are what make Integration *exposed*.

**1. Integration commits.** It does not reach for a tool or a channel. It expresses intent in
natural language, and its own weights classify that output into three channels — a **marking
LoRA**, in [SPEC-integration-mvp.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/specs/v1/SPEC-integration-mvp.md)'s terms:

| Channel | Marked | Where it goes |
|---|---|---|
| **thought** | unmarked | never leaves Integration — discarded before routing |
| **say** | `¦…¦` | verbatim to the voice layer |
| **act** | `¤…¤` | to a separate organ that interprets the intent |

This is why marking does not violate the conscious locus. Integration is not selecting a
routing target; it is saying *what kind of thing it is doing* — talking, or committing to act —
which is a distinction available to any thinking agent without knowing that TTS or Home
Assistant exist. The spec puts it plainly: *"consciousness expresses intent in natural
language; a downstream organ translates intent into mechanism."* See
[commitment characters](../GLOSSARY.md) for the glyphs themselves.

Note what the default is. Unmarked output is **thought**, and thought is discarded. Alto's
deliberation is not audible unless it commits.

**2. What sits between an intention and speech is open.** On the speech side the design had an
organ that took the conscious intent *plus the current sub-symbolic state* and assembled the
bundle and steering the Renderer needs, so that Integration never does: assembling fields is
knowing about the machinery. That organ is out of these pages until it is re-examined, and it
never had code. Today a `¦…¦` span goes straight from the filter to TTS — that path is the whole of the Renderer, a
shell — and the composed context
Integration receives is assembled *for* it rather than by an organ below it.

**3. The action organ should act.** On the action side, the designed link turns a natural-
language action commitment into validated device calls, behind the guard. The spec is
emphatic that it is *"the only thing that ever knows about HA… Integration never does."* **It
has zero code** — see [action.md](action.md). Today `¤…¤` spans are parsed, captured whole,
logged to stderr and the tracer, and then **deliberately dropped**: nothing fires, and they are
kept out of turn memory precisely so Alto is never told it did something it did not do.

**What the chain actually looks like today:**

```
  Integration ──¦say¦──► filter ──► TTS                                ✓ audible
              └─¤act¤──► [ no action organ ] ──► captured ──► dropped  ✗ nothing happens
```

So Alto can already *commit* to an action, in its own words, and that commitment is parsed and
recorded. The organ that would carry it forward is designed and unbuilt. The channel is
real; the far end is not.

## The LoRA — what is customized, and how

Integration is not a stock model with a clever prompt. It is **Qwen2.5-14B-Instruct plus a
trained adapter**, and almost everything this page describes as Integration's character lives
in those weights rather than in any instruction. That is the point: a system prompt telling a
model to be honest is a request it can decline, while a trained disposition is not something it
has to remember to obey (pillar 3).

### The adapter

A LoRA — a small set of low-rank matrices trained alongside a frozen base, so customizing a
14B model costs a few hundred megabytes instead of a full copy.

| | |
|---|---|
| Base | `Qwen/Qwen2.5-14B-Instruct` |
| Rank / alpha | `r=16`, `lora_alpha=32`, dropout 0.05 |
| Target modules | all seven attention and MLP projections (`q,k,v,o,gate,up,down`) |
| Size on disk | ~275 MB (`adapter-v1/adapter_model.safetensors`, LFS-tracked) |

Targeting all seven projections rather than attention alone is what lets the adapter shift
*style and disposition*, not just what the model attends to.

### What it is trained to do

The training corpus is the specification. [`lora_train.v6.jsonl`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/research/lora_training/integration_v1/lora_train.v6.jsonl) is **1,349 examples**, each a
user turn plus the assistant turn it should have produced, tagged with a category — and the
categories are the behaviours being installed:

| Slice | Count | What it teaches |
|---|---|---|
| `pure_speech`, `pure_action`, `thought_only`, `thought_then_speech`, `mixed_marker` | 920 | **commitment-character discipline** — when to mark speech, when to commit to an action, and that unmarked deliberation stays silent |
| `identity_probe_with_grounding`, `embodiment_ground` | 195 | answering "what are you" from actual limits rather than a flattering script |
| `honest_gap`, `faithful_affirm`, `partial_correction` | 130 | saying *I don't have that* instead of producing something plausible |
| `contradiction_direct`, `contradiction_presupposition` | 104 | refusing a false premise instead of accepting it to be agreeable |

A single record shows both halves working at once — the deliberation is unmarked, the speech is
inside `¦…¦`, and the content itself refuses to oversell the interior:

> *Considering how to answer this without faking a richer phenomenology than I have.*`¦`Quieter
> than you'd think. Things happen when input comes in. Between turns there's not a lot — no
> waiting-feeling, no clock-watching.`¦`

So the commitment characters and the honesty are learned together, from the same examples.
Neither is a rule applied afterwards.

### How it is served

Ollama bakes the adapter onto the base at model-create time, via a `Modelfile`:

```
FROM qwen2.5:14b-instruct
ADAPTER ./alto-integration-v6-lora-f16.gguf
PARAMETER temperature 0
PARAMETER num_ctx 8192
```

**No `SYSTEM` line, deliberately** — identity is in the weights, so the pipeline passes an empty
system prompt and the persona config knob is read and ignored. The `.gguf` is a build artifact,
converted from the PEFT adapter with llama.cpp's `convert_lora_to_gguf.py`; the recipe is in
[the runbook](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/runbooks/integration-lora-train-eval-runbook.md).

### Versions, and which one you can actually get

[`config.yaml`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/config.yaml) names **`alto-integration-v6`**. Its Modelfile is committed; its weights are not —
only `adapter-v1` ships in the repo. The v6 *training corpus* does ship, so v6 is reproducible
by retraining but not by downloading.

**Do not assume higher is better.** In the intake campaign v1 measured *better* than v2, and the
config says so at the knob. Version numbers here record attempts, not a ranking.

### The other adapters, and where they must not go

Intake had its own 3B adapter (`alto-intake-v1`) on a **dedicated handle** until the organ was
deleted on 2026-10-04; the adapter is no longer served. The reason for the separate handle still
holds for the next organ that wants one: `aux_model` is shared by the surfacer (cued and idle renders)
and the affect assessor, and **a conversational LoRA corrupts their
`format=`-constrained JSON extraction**. Point the shared slot at a specialized model and every
sibling's structured output degrades at once. A separate handle is the only way to serve one
organ a custom model without that blast radius — at the cost of a third resident model in VRAM,
which cost intake ~820 ms → ~2.7 s per turn warm.

Retraining is not cloud-gated: a 4-bit QLoRA of the 14B fits on a 16 GB card. What it needs is
the GPU lease and several hours, not different hardware.

## The gap

**Not the organ — the insulation.** The section above traces what leaves Integration and finds
both downstream organs missing. The same hole exists on the way *in*: of the four designed
curation filters none ships (Filter 2, the one that was built, had no caller and was deleted
2026-10-04), so nothing curates what arrives. Integration sits
directly against the machinery in both directions.

Two things reach it today that the design says should not:

- **Per-turn directives.** `MEMORY_GUARD_DIRECTIVE` and `AFFECT_SUPPRESSION_DIRECTIVE`
  ([`context.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/context.py)) are appended to the history to stop Integration claiming a memory or a feeling it does
  not have. They work. They are also **instructions the model obeys**, and pillar 3 says
  grounding must come from state the model reasons *from*, "never from an instruction it
  obeys". The guard is doing the honesty work the architecture is supposed to do structurally.
- **Assembled context generally.** Integration is handed a composed history rather than
  experiencing its own thoughts arriving, which is the same exposure seen from the
  other side.

The removed fact-level guard showed the sharp end of this: a guard can *itself* violate pillar 3
when every line it adds is individually true but the composition implies something false (its
first wording called a top-5, co-occurrence-dominated facts list "complete").

The constraint binding today is therefore negative — no subsystem may inject conclusions as if
they were earned — and the directives are the closest the runtime comes to the line.

The direction of travel is specified, not vague.
[SPEC-integration-stream-of-consciousness.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/specs/v1/SPEC-integration-stream-of-consciousness.md)
(DRAFT, direction-setting) says Integration must be **exclusively a first-person stream of
consciousness** — no system prompt, no instructions, no structured data — with everything
arriving as surfacer thoughts in the assistant channel that the model reasons *from* rather
than obeys. It is a correctness argument, not a purity one: the v6 training corpus contains
**zero** system-role messages, so every directive above is train/serve skew, working only by
borrowing the base model's instruction-following prior — the same prior that +valence steering
was caught disobeying.

How far is today's runtime from that target? All five channels the spec inventories are still
in place except one: two system-role directives, the persisted action-note breadcrumb
(context.py:103, injected at 234) and instructions embedded in the user string. The fact guard
and its reader block were removed 2026-10-01. One of three walls is cleared —
Wall 1, the amnesiac spiral, validated 2026-07-22 at grade A (ephemeral deferral thought drops
recall-miss fabrication 53% → 0%, no persona drift over five consecutive misses). Wall 2 (the
surfacer becoming critical-path grounding) and Wall 3 (the surfacer cannot reach fact values;
reader and surfacer never call each other) are open. Wall 3 is partly wired by another route:
since 2026-09-25 the Surfacer reads lines and beliefs through `mem.read` (`surfacer_recall`). The
spec, written 2026-07-22, describes feeding the *graph* reader's `FactRecord`s to it; that graph
reader was removed 2026-10-01, so that route is closed.

The cost of getting this wrong is recorded, not hypothetical:
[_FINDING-integration-honesty-live-2026-08-23.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/handoff/_FINDING-integration-honesty-live-2026-08-23.md)
traces the first live episode, where a fixture episode about a third party reached Integration
as "I moved to Lisbon last April."

## Pillars this serves

- **3 (honesty by construction)** — the conscious locus is the structural reason Alto cannot perform a handed state; every directive still in the wire is the prompt-shaped version of that guarantee.
- **1 (continuous being)** — Integration is designed as *episodic*: woken by a trigger, not by a turn. Today it wakes only on push-to-talk.
- **5 (surfacing is not retrieval)** — the attention/execution distinction is what stops directed recall from becoming Integration calling a database.
- **2 (affect is a lived state)** — affect reaches Integration as steering (machinery, invisible) and as a felt sense (a thought), never as a mood string in a prompt.

## Sources

- [docs/systems/alto-conscious-locus.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-conscious-locus.md) — the principle, and why it dissolves performance
- [docs/systems/alto-integration-layer.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-integration-layer.md) · [alto-consciousness-integration.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-consciousness-integration.md)
- [docs/systems/alto-bundle-structure.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-bundle-structure.md) · [alto-integration-bundle-filters.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-integration-bundle-filters.md)
- [docs/specs/v1/SPEC-integration-stream-of-consciousness.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/specs/v1/SPEC-integration-stream-of-consciousness.md) · [SPEC-integration-mvp.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/specs/v1/SPEC-integration-mvp.md) · [specs/keystone/SPEC-integration-layer.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/specs/keystone/SPEC-integration-layer.md)
- [docs/ARCHITECTURE.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/ARCHITECTURE.md) — the "does not exist as code" statement · [_FINDING-integration-honesty-live-2026-08-23.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/handoff/_FINDING-integration-honesty-live-2026-08-23.md)
- [src/alto/runtime/alto.py](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/alto.py) · [context.py](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/context.py) · [llm.py](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/llm.py) · [markers.py](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/runtime/markers.py)
