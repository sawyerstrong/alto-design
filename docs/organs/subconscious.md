# The Subconscious

> **Path:** continuous · **Status:** not built; the V0 decay tick is archived and the rebuild on `mem` is tracked on the roadmap · **Code:** none on `main`

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
them ([alto-subconscious.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/systems/alto-subconscious.md), "Not a Pipeline Stage").

It **consumes** percepts from Intake — which in the design fans out in parallel to the
Subconscious (to feel), Integration (to attend) and the Writer (to record) — plus a hardware
energy feed from Perception, plus graph-grounded inputs (anticipations, affect baselines,
resolved entity ids) *installed* by the organs that already did the cognition, Integration
and Consolidation.

It **emits** to more than one consumer, and none of it is content. To the **Surfacer** it emits
salience — which charged memories are ready to bubble up — and the Surfacer turns that into a
thought. To **Integration** it emits steering values: a bias on how Integration processes, never
something handed over to perform. The design also has it fire **triggers that wake Integration**
when a threshold crosses. (The design also routes reflexive twitch and
tone coloring to the Renderer. With the Renderer a shell there is nothing to take them, and the
overview picture leaves that out.) The Writer is its
sibling, not its child — the Subconscious may hint at salience ("this mattered, write it dense")
but never supplies content, because the Writer must stay blind to live mood.

## The intended design

The canonical design is [alto-subconscious.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/systems/alto-subconscious.md). The
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

[ALTO-INTERIORITY-MAP.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/ALTO-INTERIORITY-MAP.md) names this loop **the master
dependency**: affect-as-state, involuntary surfacing, felt time, anticipation, wondering,
sleep and dreaming are all facets or outputs of it, so until it exists each of them has
nowhere to live.

## What exists today

**Nothing of the Subconscious runs.** There is no persistent affect state, no between-turn or idle
thought, no decay tick, no felt time and no trigger. The V0 decay tick, the affect state math, the
affect assessor and the idle tick lived on the AGE graph; that implementation is archived at tag
`archive/age-brain-2026-10-11`. Before it was archived the idle tick rendered nothing in October
2026 (417 of 417 ticks found no affect-charged seed), and nothing on the live path minted the
affect it would have seeded from.

The one thing that still touches affect is on the reply path. With no affect state, the
affect-suppression directive arms on every turn ([`src/alto/runtime/reply_guards.py:28`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/runtime/reply_guards.py#L28)): with no
felt state to speak from, Alto is told not to claim one. That is pillar 3 holding while pillar 2 is unbuilt.

The rebuild is on the roadmap, under "Rebuild on mem" in
[BUILD-ORDER.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/roadmap/BUILD-ORDER.md): affect state on `mem` (pillar 2), idle intrusion
and between-turn surfacing on `mem` (pillar 1), and spreading activation on `mem` (pillar 5). All
three are designed and not started. The pre-registered decay measurement
([PRE-REGISTRATION.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/scripts/subconscious_sim/PRE-REGISTRATION.md)) is the
standard the rebuild has to meet again.

## Not the same organ as the Surfacer

Easy to conflate, and an earlier diagram encouraged it by drawing the Subconscious as the
Surfacer's only input. They are near-opposites:

| | Subconscious | Surfacer |
|---|---|---|
| Lifetime | continuous, always running | invoked per event |
| Graph access | **forbidden by design** | required — it holds a store handle |
| Cognition | never reasons or decides | runs a model |
| Output | state and signals — numbers | first-person language |

[`alto-subconscious.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/systems/alto-subconscious.md) is emphatic: reading the graph *"requires cognition… a direct DB
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

Everything continuous. None of the eight facets is built: no emotional state, no anticipation, no
felt time, no cognitive proprioception, no hardware energy, no circadian, no
activation/restlessness — and therefore no triggers, which is half of what the designed organ is
for.

This is designed-but-unbuilt, not unimagined: every facet above has a decided design doc behind it,
listed in the maturity ledger in [ALTO-INTERIORITY-MAP.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/ALTO-INTERIORITY-MAP.md). The gate
is build capacity.

Two things to know before you touch this. First, the first increment the design chose is the
**causal wire**: make the surfacing/share threshold a function of live valence and energy, with
the constraint that affect reaches cognition as *bias*, never as an "I feel X" field the model
narrates. Second, endogenous activation is a separate piece of work: decay alone produces no
un-cued intrusion, so reconciliation #3 in the interiority map (retrieval versus activation
surfacing) stays open until spreading activation is rebuilt.

## Pillars this serves

- **1 (continuous being)** — the Subconscious is the between-turn existence. Unbuilt today.
- **2 (affect is a lived state)** — the loop is what carries a charge from turn 3 to turn 9 instead of leaving it a row in a table. Unbuilt today.
- **5 (surfacing is activation-driven)** — the designed loop is the endogenous activation source pillar 5 needs.
- **7 (composed proof)** — an earlier decay proof was pre-registered with a null arm and scoped as a mechanism result, not a system result; the rebuild owes the same discipline.

## Sources

- [docs/systems/alto-subconscious.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/systems/alto-subconscious.md) — the design of record
- [docs/ALTO-INTERIORITY-MAP.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/ALTO-INTERIORITY-MAP.md) — master dependency, maturity ledger, the three reconciliations
- [docs/identity/alto-emotional-state.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/identity/alto-emotional-state.md) — the emotional-state facet and the threshold design
- [docs/specs/v3/SPEC-salience-idle-render.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-salience-idle-render.md) · [SPEC-subconscious-salience-surfacing.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-subconscious-salience-surfacing.md)
- [docs/handoff/_HANDOFF-2026-07-23-affect-causal-wire.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/handoff/_HANDOFF-2026-07-23-affect-causal-wire.md) — what was built and proven on the archived substrate, and the next increment
- [src/scripts/subconscious_sim/PRE-REGISTRATION.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/scripts/subconscious_sim/PRE-REGISTRATION.md) — the pre-registered decay measurement
- [docs/roadmap/BUILD-ORDER.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/roadmap/BUILD-ORDER.md) — "Rebuild on mem"
- [docs/CHECKS-measurement.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/CHECKS-measurement.md) — before quoting any number above
