# Retrieval and the read layer

> **Path:** hot (the turn reads it) · **Status:** one read path, over `mem`, feeding the Surfacer; spreading activation and the graph caches are archived · **Code:** [`src/alto/read/mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/mem_bridge.py), [`src/alto/read/surfacing/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/surfacing); in [`src/mem/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem), [`read.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/read.py), [`beliefs.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/surfacing/verify/beliefs.py), [`surfacer_store.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/surfacer_store.py), [`surfacer_recall.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/surfacer_recall.py)

This is everything on the far side of the Writer: the layer that gets what Alto knows back out
of memory, and the machinery that decides what is *present* rather than what was *asked for*.
Two things live here and they are easy to conflate. The **shared read layer** is infrastructure
that several organs query. The **Reader (L3)** — a client that, given a cue, gathered the typed
neighbourhood, scored each candidate fact and returned a ranked list — was removed on 2026-10-01
along with the `[What Alto knows about X]` block it fed. Pillar 5 governs why: what surfaces is an
involuntary intrusion, not what a reader retrieved, and the Surfacer is the only channel by which
memory reaches a reply.

The AGE-graph read path (the graph cache, the reader cache and spreading activation) is archived
at tag `archive/age-brain-2026-10-11`. Spreading activation is designed and is to be rebuilt on
`mem`; see [What exists today](#what-exists-today).

## Where it sits

It consumes what the Writer recorded: `mem`'s tables — `line`, `segment`, `surface`, `binding`,
`cooccurrence`, and the proposition layer where a store has one. Two things read them, both for
the Surfacer: the Surfacer's own store, and a second retrieval, `knowledge()`, that returns a
`Knowledge` — lines that each carry their speaker and a span into their source segment, a separate
`beliefs` field, and a state. Nothing else in the live pipeline calls either.

Until 2026-10-01 there was a second shape: `reader.what_alto_knows` returned structured
`FactRecord`s that the pipeline could render as a `[What Alto knows about X]` block and inject
into Integration's context, and it was the one path where Integration read memory directly. The
owner ruled that path out (2026-09-30) and it was deleted: Integration does not read the shared
layer, and what it knows of memory reaches it as thoughts the Surfacer renders. Organs either
side: the **Writer** upstream, the **Surfacer** downstream.

## The intended design

**One read layer, peer clients.**
[Architecture revisions §5](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/alto-architecture-revisions-june2026.md) settles this as
first-class infrastructure and lists the subconscious, the writer (recorder *and* consolidator),
Integration's retrieval, and later dreaming as peer clients of one graph-read/caching layer.
**Integration's retrieval is struck from that list:** Integration is not a client of the layer.
The Surfacer, which reads it to render thoughts, is. The prompt was the observation that the subconscious and the writer make similar DB
reads; the resolution was explicitly **shared read infrastructure, not co-located
components**, because their query profiles differ — the subconscious reads graph-affect to
*feel* (hot, recent-biased, fast), the writer reads it to *record* (broad, history-inclusive,
correctness over speed). The design's hot tier is the **live brain**; the full store behind it is
the **deep store**, complete but quiet rather than degraded ([docs/README.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/README.md)).

**Retrieval itself is layered, and semantic search is one input among five.**
[retrieval-architecture.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/memory/retrieval-architecture.md) gives the five — recency,
semantic, graph traversal, temporal/confidence weighting, and active context — run in
parallel, scored, deduplicated, ranked into a context budget. L3 graph traversal was promoted
to V1. The coordinating contract is
[SPEC-retrieval-orchestrator.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-retrieval-orchestrator.md) (draft, not
interview-gated), over
[SPEC-retrieval-l2-semantic.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v1/SPEC-retrieval-l2-semantic.md).

**And the read layer is not the point — activation is.** Pillar 5: thoughts are involuntary
intrusions from below, not query → facts → render. The designed mechanism is spreading
activation over the store: the subconscious feels a percept, charge spreads along
conductance-weighted edges, and what crosses a threshold surfaces. Directed recall survives, but as an
intention serviced by invisible machinery, never as Integration calling a database. The
activation half is specified in
[SPEC-subconscious-salience-surfacing.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-subconscious-salience-surfacing.md)
and [SPEC-salience-idle-render.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-salience-idle-render.md).

**One silence worth naming.** The canonical ingestion-path frame in
[docs/README.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/README.md) lists Perception, Intake, the Subconscious, Integration, the
three transducers, Processing, the Writer and the shared read layer — and **never names the
Reader.** The graph Reader is now gone from the code too (2026-10-01); what that removal
decided is narrower than "no reader": it removed the query → facts → system-message path into
Integration, not the idea of a client that reads the layer.

### Beliefs — a reader that is built, over a layer the live store does not have

Beliefs are specified as graph nodes carrying *domain, confidence and provenance*
([alto-build-order-v3.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/roadmap/alto-build-order-v3.md)), promoted and demoted by the
Writer's **consolidator** — the sleep-time timescale, which has no code. That is unchanged. What
changed is the read side, and it changes what "nothing writes them" means:

- **A belief reader exists, and it is live.** [`mem/beliefs.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/beliefs.py)
  returns beliefs in their own field, `Knowledge.beliefs`, kept apart from testimony because they
  are different speech acts and the reader does not get to rank one against the other. The entry
  is the claim, embedded; a key may narrow a hit and never add one. A returned belief must also
  answer the question that was asked ([`mem/belief_check.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/belief_check.py)).
- **The live store has nothing for it to read.** The `proposition` tables are defined in
  [`scripts/mem/seed/proposition_schema.sql`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/scripts/mem/seed/proposition_schema.sql),
  a seeding script and not [`mem/schema.sql`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/schema.sql), and are filled in simulation stores (about 130
  beliefs each, per [`beliefs.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/surfacing/verify/beliefs.py)). Its docstring is direct: `alto_mem` has no proposition tables at
  all. `knowledge()` never raises, so on the real store the belief half comes back empty with a
  named reason and a count (`no_proposition_table` is one of eleven).
- **A belief must be derived from evidence with its provenance intact.** `alto_mem` keeps a
  reserved `belief_confidence` table keyed to a line of testimony, with an evidential `basis`, and
  its DDL is explicit that it stays empty and **nothing may fill it with a model self-report**. A
  belief Alto asserts about itself is not a belief; it is a performance (pillar 3).
- **Belief storage in the live schema is still a prerequisite nobody has scheduled.**
  [BUILD-ORDER.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/roadmap/BUILD-ORDER.md) lists it as an "unscheduled prerequisite —
  build before" the V3 items that need it, and
  [SPEC-consolidation-loop.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-consolidation-loop.md) — which depends on it —
  owns the beliefs schema sketch. So the reader is built and on, the seed schema exists, and
  nothing on the live path produces a belief. Worth knowing before you plan anything that
  assumes one.

## What exists today

**The Surfacer's cued lookup.** On each turn `Surfacer.surface_from_heard`
([`src/alto/read/surfacing/surfacer.py:81`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/surfacing/surfacer.py#L81)) takes the raw utterance, asks the store which entities
it names (`match_cue_entities`, [`src/mem/surfacer_store.py:329`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/surfacer_store.py#L329)), keeps the ones the speaker
attested ([`src/alto/read/surfacing/cues.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/surfacing/cues.py)), reads each one's neighbourhood with the utterance as
the cue, and renders it as a first-person thought. `surfacing/verify` then checks every claim
against a licensed source phrase. There is no spread: nothing activates anything the utterance did
not name. With no entity and no belief, the self render (the 14B) asks whether Alto is addressed.

`mem` is the Surfacer's only store; with `mem` unreachable the Surfacer is off.
[`mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/mem_bridge.py) builds both halves:

- **The store.** `build_surfacer_store` ([`src/alto/read/mem_bridge.py:373`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/mem_bridge.py#L373)) returns
  `MemSurfacerStore` ([`src/mem/surfacer_store.py:247`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/surfacer_store.py#L247)), which answers the store contract the
  Surfacer declares from `line` rows. A neighbourhood reads only the speaker's segments, and of
  their lines only the ones that name the entity
  ([`mem/neighborhood_lines.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/neighborhood_lines.py)), because the renderer
  had been fusing a segment's other lines onto it ("She can't drive yet." under "my dad").
- **The recall.** `surfacer_recall: true` ([`src/config.yaml:383`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml#L383)) adds `MemRecall`
  ([`src/mem/surfacer_recall.py:115`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/surfacer_recall.py#L115), built by `build_surfacer_recall`,
  [`src/alto/read/mem_bridge.py:412`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/mem_bridge.py#L412)). It calls `knowledge()` ([`src/mem/read.py:1015`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/read.py#L1015)) twice per
  turn — a short cue for the line half, the whole utterance for the belief half — because the two
  halves measurably want different cues. It leaves out Alto's own earlier replies (44% of the live
  index) and lines reached only by graph expansion, since either would become quotable text with
  no relation to what was said.

`mem.read.enabled` is `true` ([`src/config.yaml:331`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml#L331)). Shipped read settings: `top_n: 20`
(`:363`, the knee of a 5–50 sweep on a simulation store), `require_anchor: true` (`:343`, withhold
a line that cannot point at its own source span), `salient: true` (`:347`, commands and questions
are not durable facts), `expand_hops: 1` (`:352`).

What was measured: on a 20-utterance trace fixture against the `alto_mem_sim112` simulation store,
the Surfacer's own neighbourhood reaches 17 of 47 cited episodes and delivers 10 after the prompt
trim; recall reaches 12 more that the neighbourhood cannot see (10 belief-only, 2 lines-only). A
regrade of 10 non-silent renders graded 8 supported / 2 distorted / 4 useful with recall on against
8 / 2 / 3 with it off — a narrow gain on a small sample
([armb-regrade-2026-09-25.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/artifacts/armb-regrade-2026-09-25.md)).

**Not built.** Spreading activation, a cache of the store for it, and any between-turn client
(the idle tick) are archived, not running. They are on the roadmap under "Rebuild on mem"
([BUILD-ORDER.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/roadmap/BUILD-ORDER.md)): spreading activation on `mem` (pillar 5) and idle
intrusion on `mem` (pillar 1), both designed and not started.

## The gap

**The read side surfaces what an utterance names; it does not activate.** A memory that no cue in
the utterance points at cannot surface, and nothing surfaces while nobody is talking. That is the
distance between this cued lookup and pillar 5. The mechanism that closes it is the spreading
activation designed above, to be rebuilt on `mem`.

Two smaller gaps, stated separately: the shared-layer design is unbuilt as *shared* — the
Surfacer is the one client, and making the subconscious and the writer peer clients is real work
nobody has done; and nothing on the live path produces a belief for the belief reader to return
(see above). Before adding a read path, check whether `knowledge()` already does what you need.

## Pillars this serves

- **Pillar 5 (surfacing is activation-driven, not retrieval)** — spreading activation is the
  designed substrate and is unbuilt. The graph reader was explicitly the *other* thing, and
  conflating them is how a search box with a personality gets built; its facts block into
  Integration was removed 2026-10-01 for that reason. The rendering half ships; the
  endogenous-activation half does not.
- **Pillar 3 (honesty by construction)** — the designed spread conducts only through grounded
  edges, so a node reachable *only* via an inferred or quarantined edge never becomes present.
  Today `surfacing/verify` holds the same line on what a thought may claim.
- **Pillar 3, again, in `mem.read`** — a read returns one of four states, and `unknown` (could
  not check) is never read as `absent` (checked, nothing there). `absent`, the only state that
  licenses "I don't have that", is unreachable in this build by construction
  ([`mem/tool.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/tool.py)).
- **Pillar 1 (continuous being)** — a between-turn reader is the designed half: when the primary
  is idle, seed a spread from whatever is emotionally live and render one intrusion. Not built.

## Sources

- [CLAUDE.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/CLAUDE.md) · [docs/README.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/README.md) ·
  [PILLARS.md](../PILLARS.md) · [THE-ORGANS.md](../THE-ORGANS.md) · [writer.md](writer.md).
- [alto-architecture-revisions-june2026.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/alto-architecture-revisions-june2026.md) —
  §5, the shared graph-read / cache layer and its four peer clients as originally listed
  (Integration's has been struck).
- [retrieval-architecture.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/memory/retrieval-architecture.md) — the five layers.
- Specs, all drafts (see [specs/README.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/README.md)):
  [SPEC-retrieval-orchestrator.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-retrieval-orchestrator.md) ·
  [SPEC-retrieval-l2-semantic.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v1/SPEC-retrieval-l2-semantic.md) ·
  [SPEC-subconscious-salience-surfacing.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-subconscious-salience-surfacing.md) ·
  [SPEC-salience-idle-render.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-salience-idle-render.md).
- The `mem.read` path, and the measurements the config cites:
  [`mem/read.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/read.py) · [`mem/beliefs.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/beliefs.py) ·
  [`mem/surfacer_store.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/surfacer_store.py) ·
  [`mem/surfacer_recall.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/surfacer_recall.py) ·
  [three-source-union-2026-09-22.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/artifacts/three-source-union-2026-09-22.md) ·
  [topn-sweep-2026-09-22.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/artifacts/topn-sweep-2026-09-22.md) ·
  [armb-regrade-2026-09-25.md](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/artifacts/armb-regrade-2026-09-25.md).
- Code: [`mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/mem_bridge.py) ·
  [`surfacer.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/surfacing/surfacer.py) ·
  [`config.yaml`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml).
