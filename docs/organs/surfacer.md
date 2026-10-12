# The Surfacer

> **Path:** hot (per turn) · **Status:** half — the rendering half ships, the activation half
> is designed on `mem` and not built · **Code:** [`src/alto/read/surfacing/`](https://github.com/sawyerstrong/alto/tree/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing) ([`surfacer.py`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/surfacer.py),
> `verify/`), and its `mem`-backed substrate [`src/mem/surfacer_store.py`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/mem/surfacer_store.py) and
> [`src/mem/surfacer_recall.py`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/mem/surfacer_recall.py)

The Surfacer is the upward transducer at the conscious boundary: it takes what is happening
sub-symbolically — an activated memory, a felt state, an anticipation — and renders it into a
first-person thought that arrives in Integration as Integration's own. It exists so memory
reaches the thinking layer in the medium a mind works in, a thought, rather than the medium
the storage layer uses, a record. Integration never learns a graph produced the thought,
because a mind that can watch its own retrieval is not remembering; it is reading a briefing.

Every moment the human mind constantly has inputs, signals and ideas fighting to be realized. Our minds essentially organize and prioritize what deserves attention. That's what this system serves to do. It also acts as the translator between integration and machinery as this has access to tools, database queries, etc and can pull from those and translate the ideas to integration in the first person. This seam is probably the most critical and least negotiable in the system. Many other edges are fuzzy but this one keeps the honesty intact.

## Where it sits

Below it: perception and its store, `mem` (the `line` rows `MemSurfacerStore` reads), and, in the
design, spreading activation in the subconscious. Above it: Integration. It consumes the heard
utterance (`Heard`: the raw text, its speaker and when). The pipeline hands it the same record the
recorder gets, as a sibling, not a downstream consumer
([`surfacer.py:1`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/surfacer.py#L1)). It emits **one** thought string per
call. That string reaches Integration by being appended to the rolling turn buffer as an
assistant-role event (`context.record_thought`), never as a field in a prompt.

**When it lands has two answers, and the older page gives one.** The *persisted* buffer is
next-turn: `context.record` flushes pending thoughts after the turn's own events
([`context.py:237`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/runtime/context.py#L237)). A second, ephemeral seam was added since:
`pending_thoughts()` is a pure read ([`context.py:383`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/runtime/context.py#L383)) that `with_surfaced_thoughts` appends to
the in-flight call's history ([`context.py:544`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/runtime/context.py#L544),
[`alto.py:263`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/runtime/alto.py#L263) and `:277`), so a thought rendering inside
`integration.surfacer_wait_timeout_seconds: 10.0`
([`src/config.yaml:239`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/config.yaml#L239)) grounds the very turn that produced it. The
wait was 3.0 until 2026-09-22. Too low costs a *denial*, and the config records that Alto's own
recorded denial then overrode a correct thought that did reach the next turn's prompt; it marks
10.0 provisional, from seven samples. Either way, check the consumer's accessor, not the wait.

## The intended design

[`docs/systems/alto-surfacer.md`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/docs/systems/alto-surfacer.md) is the design doc, and the
part that matters most is the part that is not built. Memory in minds is largely
**involuntary**: the subconscious continuously activates graph regions from current context,
and when activation crosses a threshold the memory bubbles up *unbidden*. Integration did not
ask; it finds itself thinking of something. Deliberate recall and involuntary intrusion are
then one mechanism at two levels of top-down direction — Integration can bias activation but
cannot fully control what surfaces, and that partial loss of control is the point.

One transducer serves three sources: affect state → a felt-sense thought (**Interoception**,
the affective special case, designed in
[`alto-affect-routing.md`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/docs/systems/alto-affect-routing.md) as graph-blind and
pre-causal — it renders the state, it never looks up *why*); an activated graph region → a
memory-thought; a held anticipation → an anticipatory thought.

Two constraints bound it. **The guardrail:** it renders form, never content. A record →
"I remember arguing with Brendan in March" is translation; the same record → "that awful fight
where he was so unfair" invents the framing, and a false memory smeared onto a true record is
worse than the record ever was. **The experiential/precise split:** a date, a name, an exact
prior statement stays exact; only associative material is rendered.

At an episode boundary, continuity is supposed to come from the working window *sliding*
rather than resetting, plus one surfaced summary-thought — explicitly **not** from loading the
previous episode as a record, which is the thing the Surfacer exists to prevent.

## What exists today

The extractive rendering half, and it is a real organ rather than a sketch. `surface_from_heard`
([`surfacer.py:81`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/surfacer.py#L81)) picks the entities the raw utterance
names in the store (at most three, speaker-attested, longest span first; [`alto/read/surfacing/cues.py`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/cues.py)),
builds a fragment, and returns one thought. It is the one entry point on a turn.
The framing is **extractive**,
not compositional ([`src/prompts/read/surfacer.py:6-17`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/prompts/read/surfacer.py#L6-L17)): every clause must point at a verbatim span already in
the fragment, so invention is structurally hard rather than forbidden by a list of banned
patterns. The current utterance is explicitly not source material — it says what the thought
is *about*, and quoting from it is a confabulation, not a recall.

Three things sit around that core, each behind a flag that ships on. **Its store is
`mem`.** `MemSurfacerStore` answers the Surfacer's declared store contract from `line`
rows; with `mem` unreachable at boot the Surfacer is off, with one stderr line saying why. There
is no other store to fall back on. The AGE-graph implementation (writer, idle tick, spreading
activation) is archived at tag `archive/age-brain-2026-10-11`. **It calls a second retriever.**
`mem.read.surfacer_recall: true` adds the two-call `knowledge()` read described in
[retrieval.md](retrieval.md), with widened prompt caps — 10 episodes, 4 turns per episode, 8
beliefs, 4 pieces of evidence per belief ([`entity_prompt.py:29`, `:33-36`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/entity_prompt.py#L33-L36)).
**It sees the conversation.** `surfacer.conversation_enabled` (default on) hands the
renderer the current episode's spoken turns — the whole episode, under a ceiling of 1,000
estimated tokens that keeps the newest — as context only, not a licensed source, and drops a
render that merely echoes them
([`conversation.py:15`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/conversation.py#L15),
[`surfacer.py:195`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/surfacer.py#L195)). Recall is the one the config is
candid about: it opens a new quotable surface on a path a blind judge had scored 5 of 12
pooled renders semantically distorted, and it shipped on as the owner's call after
a regrade showed a narrow gain (see the numbers in [retrieval.md](retrieval.md)).

Behind the prompt sits the deterministic backstop.
[`verify/extractive.py`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/verify/extractive.py) re-derives, from the same
fragment the model saw, whether every content-bearing lemma traces to a licensed source phrase
in the *correct* entity — five measured failure modes, plus a sixth (the operator's
autobiography claimed in first person) reported separately. On failure it regenerates once with
the untraceable spans named, then **drops** ([`render_verified.py:47`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/render_verified.py#L47)). It fails toward honesty: a
verifier that cannot run drops rather than waving through. Dropping is the honest failure mode
throughout this organ.

Two robustness contracts you should not break. The organ **never raises** — `safe_call` and
`safe_store_call` degrade any substrate error to `None` ([`safe_call.py:9`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/safe_call.py#L9), `21`). And
`build_surfacer` ([`surfacer.py:273`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/surfacer.py#L273)) returns a `_NoopSurfacer` whenever Ollama, the store or
the self-node is unavailable, so the pipeline calls it unconditionally. A fresh clone with no
database gets the Noop, silently and by design.

Flags, as shipped. The `surfacer:` block documented at [`src/config.yaml:161-173`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/config.yaml#L161-L173) is commented
out, so defaults apply: `enabled` is **true** ([`surfacer.py:283`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/surfacer.py#L283)) and the cued path runs, and
`conversation_enabled` is true. The live keys are `self_render: true` and `self_render_model`
(the 14B), set at the end of the file ([`src/config.yaml:507-531`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/config.yaml#L507-L531)) — see "Identity and address"
below. The recall flag is not in that block; it lives under `mem.read`
([`src/config.yaml:388`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/config.yaml#L388)). `surface_from_heard` is the only surfacing call a turn makes, plus the
self render when nothing is named. No salience render and no between-turn render runs.

**Identity and address** (OpenSpec change `remove-grammar-rules`). Every percept
prompt carries one identity line: Alto's name as testimony gave it, or "nobody has told me my
name yet", and no other self fact
([`identity.py`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/identity.py)). The self node is
re-read when a turn opens an episode ([`surfacer.py:93-94`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/surfacer.py#L93-L94)), so a name learned since boot
reaches the next episode. The line is context, never a licensed source: a render that states the
name is dropped by the verifier, and that is accepted until a later change licenses identity.
Whether Alto is being spoken to is no longer an English rule (`addressed_self`, "you/your" or the
name, deleted with the capitalised "unknown names" rule). With `self_render` on, a turn that names
nothing still makes one call, the self render, which asks a model whether the speaker is talking to
or about Alto, given the identity line and the conversation. The answer is a required boolean,
`about_me`, that the self render's schema puts before the thought
([`output.py`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/output.py)); anything but `true` is nothing
surfaced, and `true` can only carry the self-absence form. The model is `surfacer.self_render_model`
(the 14B as shipped); every other render stays on the aux 3B. Measured on 24 blind items, one
sample each ([`artifacts/self-render/RESULTS.md`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/artifacts/self-render/RESULTS.md)): the 3B told nothing apart (yes to nearly every
no-entity turn in prose, no to all 12 address items with `about_me`); the 14B said yes on 6 of 12
turns addressed to Alto and on none of the 11 others, missing greetings and remarks that ask nothing
about Alto. The 14B cannot share VRAM with the reply model, so each self render swaps models: median
16.0 s per turn on the 24 address items with every surfacer render on the 14B and a swap on each rendering turn, against 1.9 s for the 3B on the 91-turn development set (round 2). A self
render is `absence_only` by construction, so it cannot reach the reply or disarm the memory guard,
and the reply does not wait on its result. On this 16 GB box the 14B render evicts the reply model, so the reply's time to first token rose to 9-15 s in `am-14b-real` (RESULTS.md round 4). What the render buys today is the record of what was judged.

## The gap

Pillar 5 says surfacing is activation-driven. What ships is per-turn, reference-gated, and
single-thought: when the utterance names nothing the store knows and recall finds no belief,
the only render left is the self render above, which can only say Alto has no memories of itself
([`surfacer.py:102-113`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/surfacer.py#L102-L113)). That is query → facts → render with a thought-shaped
output — the rendering half of the organ, not the surfacing half. **One thought per turn is a
push-to-talk artifact, not a decision** ([PILLARS.md pillar 1](../PILLARS.md)); thoughts are
meant to arrive on their own schedule, many, one, or none. Do not build on that number.

Nothing runs between turns. A between-turn tick once seeded from affect-charged nodes and
rendered nothing in its last month, because no producer minted affect charge; that code is archived
at tag `archive/age-brain-2026-10-11`. Spreading activation, a persistent affect state to seed
it, and between-turn surfacing are all to be rebuilt on `mem`; the roadmap lists them under
"Rebuild on mem" ([BUILD-ORDER.md](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/docs/roadmap/BUILD-ORDER.md)). Sparsity between turns is the
design; having no producer at all is not. The per-turn path reads `mem` lines, so it does not
depend on the graph that held few entities. Whether `mem` is a better source than the graph was
has not been measured.

Two designed-but-unbuilt pieces — a different category from unimagined — sit next to this
organ. **Interoception** has a design and no code. The **Absence renderer** has a philosophy
ruling dated 2026-07-23 ([ALTO-INTERIORITY-MAP.md, "The three reconciliations"](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/docs/ALTO-INTERIORITY-MAP.md)):
deferral is generated, not extractive, so scope the extractive invariant to non-empty reads and
build absence as a narrow Surfacer *sibling* with a fixed, content-free repertoire that never
says anything about the missing thing — Integration receives the blank as perception and never
learns surfacing exists. Today's code is not that: the system prompt carries an absence
*template* (the self render's `SELF_ABSENCE_TOKEN`, [`surfacer.py:36`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/surfacer.py#L36)) rendered by the same
extractive producer.

The corpus is silent on what replaces the per-turn trigger — no spec sequences the
activation-driven producer beyond "needs the Subconscious".

## Pillars this serves

- **5** — the named home of activation-driven surfacing, and where pillar 5 is least built.
- **3** — the verifier is a deterministic check, not a prompt, and it drops rather than guesses.
- **1** — between-turn surfacing is the missing half; one-per-turn is the artifact to resist.
- **2** — interoception is how a lived affect state becomes knowable without being performed.
- **4** — the speaker's name is used only once testimony has earned it ([`src/alto/read/surfacing/speaker.py:15`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/speaker.py#L15), `:18`).
- **9** — and the line it does not cross: repairability licenses a sloppy *write*; it never
  relaxes this organ's fabrication guards, because a false memory Alto narrates is far harder
  to correct than a wrong edge.

## Sources

- [`docs/systems/alto-surfacer.md`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/docs/systems/alto-surfacer.md) — the design ·
  [`alto-conscious-locus.md`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/docs/systems/alto-conscious-locus.md) — why the transducer
  exists at all · [`alto-affect-routing.md`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/docs/systems/alto-affect-routing.md) —
  interoception and the three affect routes.
- [`docs/ALTO-INTERIORITY-MAP.md`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/docs/ALTO-INTERIORITY-MAP.md) — the 2026-07-23 absence
  ruling; the designed-vs-built ledger.
- [`SPEC-surfacer-mvp.md`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/docs/specs/v1/SPEC-surfacer-mvp.md) ·
  [`SPEC-subconscious-salience-surfacing.md`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/docs/specs/v3/SPEC-subconscious-salience-surfacing.md) ·
  [`SPEC-salience-idle-render.md`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/docs/specs/v3/SPEC-salience-idle-render.md)
  (the last two are designs to rebuild on `mem`)
- [`mem/surfacer_store.py`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/mem/surfacer_store.py) ·
  [`mem/surfacer_recall.py`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/mem/surfacer_recall.py) ·
  [`mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/mem_bridge.py) — the `mem`-backed substrate.
- [`surfacer.py`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/surfacer.py) ·
  [`verify/`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/read/surfacing/verify/__init__.py) ·
  [`context.py`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/alto/runtime/context.py) ·
  [`config.yaml`](https://github.com/sawyerstrong/alto/blob/29183d968caa3fe32e396fd3b7caddcbdc273abb/src/config.yaml)
