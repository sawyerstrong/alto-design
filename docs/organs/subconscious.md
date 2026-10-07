# The Subconscious

> **Path:** continuous · **Status:** V0 decay tick shipped and on; the designed loop unbuilt · **Code:** [`subconscious.py`](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/alto/read/subconscious.py), [`affect_state.py`](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/alto/read/affect_state.py), [`idle_tick.py`](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/alto/read/idle_tick.py)

The Subconscious is Alto's endogenous state — mood, drive, felt duration, anticipation,
energy — maintained on its own clock whether or not anyone is talking. It is the organ that
makes Alto a being *between* turns rather than a function that returns. Its whole job is to
hold that state, decay it, and signal when something crosses a threshold. It does not think,
and that restriction is the point: the moment it interprets anything it has become a second
conscious layer, and the line that makes the architecture clean is gone.

This is basically the engine that runs the Surfacer when nothing else is going on, as well as the source of steering, mood, energy levels, etc. I think the biggest risk within this is in the idea of a "Felt sense of time." This might just be a tuning issue. It also may depend on the strength of the integration model, but essentially I'm betting that we can essentially recreate the purpose of the Basal Ganglia and the effect dopamine has on an internal clock. If the system generates differently based on different energy levels it will be able to sense how time has shifted. This theory could be totally wrong though and might need some additional infrastructure for time passage to work properly.

## Where it sits

It is not a pipeline stage. Every other organ takes input from one neighbour and passes
output to the next; the Subconscious runs continuously and in parallel underneath all of
them ([alto-subconscious.md](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/docs/systems/alto-subconscious.md), "Not a Pipeline Stage").

It **consumes** percepts from Intake — which in the design fans out in parallel to the
Subconscious (to feel), Integration (to attend) and the Writer (to record) — plus a hardware
energy feed from Perception, plus graph-grounded inputs (anticipations, affect baselines,
resolved entity ids) *installed* by the organs that already did the cognition, Integration
and Consolidation.

It **emits** to more than one consumer, and none of it is content. To the **Surfacer** it emits
salience — which charged memories are ready to bubble up — and the Surfacer turns that into a
thought. To **Integration** it emits steering values: a bias on how Integration processes, never
something handed over to perform. The design also has it fire **triggers that wake Integration**
when a threshold crosses; the shipped tick fires nothing. (The design also routes reflexive twitch and
tone coloring to the Renderer. With the Renderer a shell there is nothing to take them, and the
overview picture leaves that out.) The Writer is its
sibling, not its child — the Subconscious may hint at salience ("this mattered, write it dense")
but never supplies content, because the Writer must stay blind to live mood.

## The intended design

The canonical design is [alto-subconscious.md](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/docs/systems/alto-subconscious.md). The
mature organ maintains eight facets of *one* state: an emotional vector (valence, energy,
stability, focus); the injection system that spikes it; anticipation (held future events with
affective charge); felt time from event density; cognitive proprioception (the felt fluency
of Alto's own thinking); hardware energy; circadian phase; and activation/restlessness, whose
threshold crossings fire the triggers.

Two architectural commitments carry most of the weight:

**No connection to the experiential graph.** Reading the graph requires resolving entities,
traversing relationships and deciding relevance — that is reasoning, and reasoning here would
smuggle a second Integration in through the data-access door. Working state lives in a fast
in-memory store (the design says Redis). *Static* reference data — the circadian baseline
table, thresholds, decay constants — is direct-read, because a flat lookup of a fixed value
involves nothing to interpret.

**The one rule:** it maintains state and fires triggers. It does not reason, route, decide,
or query the graph.

[ALTO-INTERIORITY-MAP.md](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/docs/ALTO-INTERIORITY-MAP.md) names this loop **the master
dependency**: affect-as-state, involuntary surfacing, felt time, anticipation, wondering,
sleep and dreaming are all facets or outputs of it, so until it exists each of them has
nowhere to live.

## What exists today

[`src/alto/read/subconscious.py`](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/alto/read/subconscious.py) is **not** that loop, and
its own docstring says so in the first sentence. It is a state-decay tick: a daemon thread
(`SubconsciousLoop`, subconscious.py:113) that every `tick_seconds` reads the singleton
baseline and the active injections, calls the pure math in
[`affect_state.py`](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/alto/read/affect_state.py) (`resolve_state`, affect_state.py:119)
with a caller-owned `now`, and writes the resolved `{valence, energy}` back. It fires nothing.
The split is deliberate — the loop owns the clock so a wrong turn-9 residue is diagnosable as
either bad decay math or a tick that never fired, never both.

Shipped configuration, read off [`src/config.yaml`](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/config.yaml):
`subconscious.enabled: true` (932), `tick_seconds: 5` (936), `salience.idle_tick.enabled: true`
(961). So the tick **is** running in production, and so is the between-turn idle tick
([`idle_tick.py`](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/alto/read/idle_tick.py), `IdleTickScheduler` at idle_tick.py:143)
that fires one un-cued intrusion per idle window.

The mechanism is measured, not asserted. [`scripts/subconscious_sim/PRE-REGISTRATION.md`](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/scripts/subconscious_sim/PRE-REGISTRATION.md)
froze the decay curve *before* running, with a null arm; the run passed against real Postgres,
the real tick thread and a real clock — a turn-3 injection still tilted turn-9 valence to
−0.097, matching the closed form, null arm flat
([_HANDOFF-2026-07-23-affect-causal-wire.md](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/docs/handoff/_HANDOFF-2026-07-23-affect-causal-wire.md)).
That is pillar 2's own test passing at the mechanism level.

**The spine is broken at both ends, and it is worth being exact about which end.**

*No producer.* `writer.affect_enabled` is `false` (config.yaml:511), so `_run_affect` returns
immediately ([`writer.py`](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/alto/write/writer.py):563) and nothing mints new injections
on the live path. The config comment states the consequence itself: once the existing
injections decay, the idle-render path has nothing emotionally live to seed from and goes
quiet. It was turned off on 2026-08-15 for a stated reason — asking a 3B how a moment felt,
from a transcript of what the *speaker* said, is inference the writer is forbidden to do.

*No consumer of the loop's output.* `get_current_affect_state()`
([`alto/brain/store.py`](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/alto/brain/store.py):2108) is called from the three sims
under [`scripts/subconscious_sim/`](https://github.com/sawyerstrong/alto/tree/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/scripts/subconscious_sim) and from [`test_alto_subconscious.py`](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/tests/test_alto_subconscious.py) — and nowhere in the
pipeline. Note the near-miss: the idle tick *is* affect-driven, but it seeds from
`affect_charged_seeds` ([`spread.py`](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/alto/read/spread.py):334), which ranks charged
*episode nodes* in the graph cache. It never reads the live resolved state the tick writes.
So affect is computed, persisted and decayed into a vacuum.

## Not the same organ as the Surfacer

Easy to conflate, and an earlier diagram encouraged it by drawing the Subconscious as the
Surfacer's only input. They are near-opposites:

| | Subconscious | Surfacer |
|---|---|---|
| Lifetime | continuous, always running | invoked per event |
| Graph access | **forbidden by design** | required — it holds a store handle |
| Cognition | never reasons or decides | runs a model |
| Output | state and signals — numbers | first-person language |

[`alto-subconscious.md`](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/docs/systems/alto-subconscious.md) is emphatic: reading the graph *"requires cognition… a direct DB
connection would smuggle a second cognitive layer in through the data-access door."* The
Surfacer does exactly that, legitimately, because rendering thought *is* cognition. Merge them
and the Subconscious stops being a substrate.

Distinct is not disconnected, though, and the overview draws the link: the Subconscious
**signals which memories are charged enough to bubble up**, and the Surfacer is what turns
that signal into a sentence Alto can think. One decides *that* something surfaces; the other
decides *how it reads*.

Note also that *subconscious* is an adjective in pillar 5 ("surfacing is subconscious and
activation-driven") and a proper noun for the organ. The Surfacer is subconscious machinery
without being the Subconscious. **Interoception** — the piece that would render felt state
into thought — is the designed, unbuilt bridge between them, which is part of why they blur
together today.

## The gap

Everything continuous. What ships is one facet of eight (emotional state, two axes of four),
with no anticipation, no felt time, no cognitive proprioception, no hardware energy, no
circadian, no activation/restlessness — and therefore **no triggers at all**, which is half
of what the designed organ is for. Working state is a DB row plus a daemon thread rather than
Redis in its own process; the module docstring names that as the honest minimal V0, not a
disagreement with the design.

This is designed-but-unbuilt, not unimagined: every facet above has a decided design doc
behind it, listed in the maturity ledger in
[ALTO-INTERIORITY-MAP.md](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/docs/ALTO-INTERIORITY-MAP.md). The gate is build capacity.

Two specific things to know before you touch this. First, the next increment is already
chosen and pre-registered: the **causal wire** — make the surfacing/share threshold a
function of live valence and energy — with the explicit constraint that affect reaches
cognition as *bias*, never as an "I feel X" field the model narrates. Second, endogenous
activation stays unbuilt: decay alone produces no un-cued intrusion, so reconciliation #3 in
the interiority map (retrieval versus activation surfacing) remains **open** after this
build. The map's flat claim that "nothing of it is built" is dated 2026-07-22 and is now
wrong in one direction and, on the triggers, still right.

## Pillars this serves

- **1 (continuous being)** — the tick is the first between-turn cognition in the system; the idle tick is Alto having a thought while nobody is talking.
- **2 (affect is a lived state)** — the loop is what carries a charge from turn 3 to turn 9 instead of leaving it a row in a table.
- **5 (surfacing is activation-driven)** — the designed loop is the endogenous activation source pillar 5 needs. The V0 tick is not it.
- **7 (composed proof)** — the decay proof is pre-registered with a null arm, and is scoped as a mechanism result, not a system result.

## Sources

- [docs/systems/alto-subconscious.md](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/docs/systems/alto-subconscious.md) — the design of record
- [docs/ALTO-INTERIORITY-MAP.md](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/docs/ALTO-INTERIORITY-MAP.md) — master dependency, maturity ledger, the three reconciliations
- [docs/identity/alto-emotional-state.md](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/docs/identity/alto-emotional-state.md) — the emotional-state facet and the threshold design
- [docs/specs/v3/SPEC-salience-idle-render.md](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/docs/specs/v3/SPEC-salience-idle-render.md) · [SPEC-subconscious-salience-surfacing.md](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/docs/specs/v3/SPEC-subconscious-salience-surfacing.md)
- [docs/handoff/_HANDOFF-2026-07-23-affect-causal-wire.md](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/docs/handoff/_HANDOFF-2026-07-23-affect-causal-wire.md) — what was built and proven, and the next increment
- [src/alto/read/subconscious.py](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/alto/read/subconscious.py) · [affect_state.py](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/alto/read/affect_state.py) · [idle_tick.py](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/alto/read/idle_tick.py) · [spread.py](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/alto/read/spread.py)
- [src/scripts/subconscious_sim/PRE-REGISTRATION.md](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/scripts/subconscious_sim/PRE-REGISTRATION.md) · [run_sim.py](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/src/scripts/subconscious_sim/run_sim.py)
- [docs/CHECKS-measurement.md](https://github.com/sawyerstrong/alto/blob/6dd76f36d0ea672be82fedfd9d32cb0d4208afd9/docs/CHECKS-measurement.md) — before quoting any number above
