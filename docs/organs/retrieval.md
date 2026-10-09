# Retrieval and the read layer

> **Path:** hot (the turn reads it) — with one continuous client, the idle tick · **Status:** two read paths over two databases — the graph cache and `spread()` are built and feed the idle tick; `mem.read` is built and **on**, feeding the Surfacer · **Code:** [`graph_cache.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/graph_cache.py), [`reader_cache.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/reader_cache.py), [`spread.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/spread.py); and in [`mem/`](https://github.com/sawyerstrong/alto/tree/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/mem), [`read.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/mem/read.py), [`beliefs.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/surfacing/verify/beliefs.py), [`surfacer_store.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/mem/surfacer_store.py), [`surfacer_recall.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/mem/surfacer_recall.py)

This is everything on the far side of the Writer: the layer that gets what Alto knows back out
of the graph, and the machinery that decides what is *present* rather than what was *asked
for*. Two things live here and they are easy to conflate. The **shared read/cache layer** is
infrastructure — one in-memory mirror of the graph that several organs query. The **Reader
(L3)** — a client that, given a cue, gathered the typed neighbourhood, scored each candidate
fact and returned a ranked list — was removed on 2026-10-01 along with the `[What Alto knows
about X]` block it fed. Pillar 5 governs why: what surfaces is an involuntary intrusion, not what
a reader retrieved, and the Surfacer is now the only channel by which memory reaches a reply.

**There are now two read paths, and they read different databases.** Everything from here to
[The gap](#the-gap) describes the *graph* path — cache and `spread()` — over the AGE graph
in `alto_dev`. The other is `mem.read`: `knowledge()` in
[`mem/read.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/mem/read.py) over `alto_mem`, the Writer's own store, switched on
2026-09-22 ([`config.yaml:389`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/config.yaml#L389)). The Surfacer is its only live
consumer. The two share no code and no data, and which of them survives is not decided.

## Where it sits

It consumes exactly what the Writer produced — episode Nodes, `mentions` edges, typed relation
/ `is_a` / `co_occurs` edges — through
[`alto/brain/store.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/brain/store.py). `spread()` returns an
activation-ranked list of node uuids, which the surfacer turns into an involuntary intrusion.
Until 2026-10-01 there was a second shape: `reader.what_alto_knows` returned structured
`FactRecord`s that the pipeline could render as a `[What Alto knows about X]` block and inject
into Integration's context — dark behind `integration.reader_enabled: false`, and the one path
in the code where Integration read memory directly. The owner ruled that path out (2026-09-30)
and it was deleted: Integration does not read the shared layer, and what it knows of memory
reaches it as thoughts the Surfacer renders. Organs either side: the **Writer** upstream, the
**Surfacer** downstream.

The `mem.read` path starts from the `alto_mem` tables instead — `line`, `segment`, `surface`,
`binding`, `cooccurrence`, and the proposition layer where a store has one — and emits a
`Knowledge`: lines that each carry their speaker and a span into their source segment, a separate
`beliefs` field, and a state. The Surfacer consumes it as its store
([`mem_bridge.py:407`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/mem_bridge.py#L407)) and as a second retrieval
(`surfacer_recall`). Nothing else in the live pipeline calls it.

## The intended design

**One read layer, peer clients.**
[Architecture revisions §5](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/alto-architecture-revisions-june2026.md) settles this as
first-class infrastructure and lists the subconscious, the writer (recorder *and* consolidator),
Integration's retrieval, and later dreaming as peer clients of one graph-read/caching layer.
**Integration's retrieval is struck from that list:** Integration is not a client of the layer.
The Surfacer, which reads it to render thoughts, is. The prompt was the observation that the subconscious and the writer make similar DB
reads; the resolution was explicitly **shared read infrastructure, not co-located
components**, because their query profiles differ — the subconscious reads graph-affect to
*feel* (hot, recent-biased, fast), the writer reads it to *record* (broad, history-inclusive,
correctness over speed). The hot tier of that cache is the **live brain**; the full graph
behind it is the **deep store**, complete but quiet rather than degraded
([docs/README.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/README.md)).

**Retrieval itself is layered, and semantic search is one input among five.**
[retrieval-architecture.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/memory/retrieval-architecture.md) gives the five — recency,
semantic, graph traversal, temporal/confidence weighting, and active context — run in
parallel, scored, deduplicated, ranked into a context budget. L3 graph traversal was promoted
to V1. The coordinating contract is
[SPEC-retrieval-orchestrator.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/specs/v3/SPEC-retrieval-orchestrator.md) (draft, not
interview-gated), over
[SPEC-retrieval-l2-semantic.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/specs/v1/SPEC-retrieval-l2-semantic.md).

**And the read layer is not the point — activation is.** Pillar 5: thoughts are involuntary
intrusions from below, not query → facts → render. Directed recall survives, but as an
intention serviced by invisible machinery, never as Integration calling a database. The
activation half is specified in
[SPEC-subconscious-salience-surfacing.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/specs/v3/SPEC-subconscious-salience-surfacing.md)
and [SPEC-salience-idle-render.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/specs/v3/SPEC-salience-idle-render.md).

**One silence worth naming.** The canonical ingestion-path frame in
[docs/README.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/README.md) lists Perception, Intake, the Subconscious, Integration, the
three transducers, Processing, the Writer and the shared read layer — and **never names the
Reader.** The graph Reader is now gone from the code too (2026-10-01); what that removal
decided is narrower than "no reader": it removed the query → facts → system-message path into
Integration, not the idea of a client that reads the layer.

### Beliefs — a reader that is built, over a layer the live store does not have

Beliefs are specified as graph nodes carrying *domain, confidence and provenance*
([alto-build-order-v3.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/roadmap/alto-build-order-v3.md)), promoted and demoted by the
Writer's **consolidator** — the sleep-time timescale, which has no code. That is unchanged. What
changed is the read side, and it changes what "nothing writes them" means:

- **A belief reader exists, and it is live.** [`mem/beliefs.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/mem/beliefs.py)
  returns beliefs in their own field, `Knowledge.beliefs`, kept apart from testimony because they
  are different speech acts and the reader does not get to rank one against the other. The entry
  is the claim, embedded; a key may narrow a hit and never add one. A returned belief must also
  answer the question that was asked ([`mem/belief_check.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/mem/belief_check.py)).
- **The live store has nothing for it to read.** The `proposition` tables are defined in
  [`scripts/mem/seed/proposition_schema.sql`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/scripts/mem/seed/proposition_schema.sql),
  a seeding script and not [`mem/schema.sql`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/mem/schema.sql), and are filled in simulation stores (about 130
  beliefs each, per [`beliefs.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/surfacing/verify/beliefs.py)). Its docstring is direct: `alto_mem` has no proposition tables at
  all. `knowledge()` never raises, so on the real store the belief half comes back empty with a
  named reason and a count (`no_proposition_table` is one of eleven).
- **A belief must be derived from evidence with its provenance intact.** `alto_mem` keeps a
  reserved `belief_confidence` table keyed to a line of testimony, with an evidential `basis`, and
  its DDL is explicit that it stays empty and **nothing may fill it with a model self-report**. A
  belief Alto asserts about itself is not a belief; it is a performance (pillar 3).
- **Belief storage in the live schema is still a prerequisite nobody has scheduled.**
  [BUILD-ORDER.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/roadmap/BUILD-ORDER.md) lists it as an "unscheduled prerequisite —
  build before" the V3 items that need it, and
  [SPEC-consolidation-loop.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/specs/v3/SPEC-consolidation-loop.md) — which depends on it —
  owns the beliefs schema sketch. So the reader is built and on, the seed schema exists, and
  nothing on the live path produces a belief. Worth knowing before you plan anything that
  assumes one.

## What exists today

[`graph_cache.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/graph_cache.py) (439 lines) loads the whole graph once
via a single bulk read and exposes read-only adjacency, degree and property accessors. The
motivation was measured latency: the store-backed graph reader paid a fresh psycopg connection
plus `LOAD 'age'` per hop against the VM-hosted Postgres, ~10 round-trips and seconds per call —
for a graph of hundreds of nodes that fits trivially in RAM. Snapshots are immutable and swapped
atomically, so a spread in flight sees one consistent graph.
[`reader_cache.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/reader_cache.py) owns its lifecycle: build once at
startup, mark dirty on episode rotation, rebuild off the response path.

[`spread.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/spread.py) does conductance-weighted spreading activation
over the cache. Its `conductance` saturates an edge's weight, or draws a per-family default
for weightless families; it was the graph reader's reinforcement axis and moved into [`spread.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/spread.py)
unchanged when the reader was removed.

**The `mem.read` path.** `knowledge()` was built and dark until 2026-09-22, when
`mem.read.enabled` went `true` ([`config.yaml:389`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/config.yaml#L389)). The Surfacer
reaches it two ways, each behind its own flag, both built by
[`mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/mem_bridge.py):

- The Surfacer's *store* is `mem` (since 2026-09-22; the graph fallback and its selector are
  gone). [`mem/surfacer_store.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/mem/surfacer_store.py) answers the store contract
  the Surfacer declares, from `line` rows. With `mem` unreachable the Surfacer is off.
  Since 2026-10-04 a neighborhood reads only the speaker's segments, and of their lines only the
  ones that name the entity ([`mem/neighborhood_lines.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/mem/neighborhood_lines.py)):
  the renderer had been fusing a segment's other lines onto it ("She can't drive yet." under
  "my dad"). The recall line half below applies the same rule.
- `surfacer_recall: true` ([`config.yaml:441`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/config.yaml#L441), on since 2026-09-25) adds a second *retrieval*.
  [`mem/surfacer_recall.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/mem/surfacer_recall.py) calls `knowledge()` twice per
  turn — a short cue for the line half, the whole utterance for the belief half — because the two
  halves measurably want different cues. It leaves out Alto's own earlier replies (44% of the live
  index) and lines reached only by graph expansion, since either would become quotable text with
  no relation to what was said.

Shipped read settings: `top_n: 20` (`:470`, the knee of a 5–50 sweep on a simulation store),
`require_anchor: true` (`:450`, withhold a line that cannot point at its own source span),
`salient: true` (`:454`, commands and questions are not durable facts), `expand_hops: 1` (`:459`).

What the config says was measured, and what it says was not. On a 20-utterance trace fixture
against the `alto_mem_sim112` simulation store, the Surfacer's own neighbourhood reaches 17 of 47
cited episodes and delivers 10 after the prompt trim; recall reaches 12 more that the neighbourhood
cannot see (10 belief-only, 2 lines-only). A regrade of 10 non-silent renders graded 8 supported /
2 distorted / 4 useful with recall on against 8 / 2 / 3 with it off — a narrow gain on a small
sample ([armb-regrade-2026-09-25.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/artifacts/armb-regrade-2026-09-25.md)). **The
graph-versus-mem comparison (③b) has not run.** The config says so, and says the flip does not
stand in for it: the Surfacer moved to `mem` because the graph arm was found to be reading a
store with one entity node in it, not because `mem` won.

**Flags, as shipped, for the graph path.** `salience.idle_tick.enabled: true` and
`subconscious.enabled: true`, and the cache-build gate (`build_reader_cache` in
[`assembly.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/runtime/process/assembly.py)) fires when the idle tick is on and
a store is present. So in the shipped config the
GraphCache *is* built and *is* spread over — by the between-turn idle tick. The `mem.read`
flags above are independent of these.

**What is not shared yet.** Nothing in [`subconscious.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/subconscious.py) or any `writer_*.py` module reads
through `graph_cache`; they go to the store directly. Today's only client is the idle
tick, constructed by the pipeline. The four-peer-client design of §5 has one
client family.

## The gap

**On the graph path, the read side is not several broken organs. It is one absent layer, seen
from several angles.**

Follow it concretely. `add_mention_edge` ([`store.py:1114`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/brain/store.py#L1114))
— the edge that says *this episode mentioned this entity* — has **no** caller in the package.
Its only caller was the writer-resolver's LLM half, off from 2026-08-15 and deleted on
2026-10-04. So **no new mention edges are written on the live path.**

Mention edges are what `get_entity_neighborhood` is scoped to — its hop-1 is "each episode
that mentions it", hop-2 the other entities those episodes mention
([`store.py:2958-2968`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/brain/store.py#L2958-L2968)). Via the cache's undirected
adjacency, where mentions are deduped to distinct (episode, entity) pairs, that neighbourhood
is what the idle tick spreads over. **It is no
longer what the Surfacer reads for grounded content:** the Surfacer
reads `alto_mem` lines, so that starvation is bypassed rather than repaired. The graph store is
still nearly empty; the config records one entity node in `alto_dev`.

So the idle tick finding nothing to spread is **not a separate bug** from the empty graph. Fix the
payload layer and it lights up, which is also why measuring either in
isolation today tells you very little (pillar 7). Closing this gap is gated on the Writer, not on
the read layer — see [writer.md](writer.md) — *if* the graph path is the one that survives.

**That "if" is the open question.** The design (§5 above) is one read layer with peer
clients, Integration no longer among them. What exists is two read paths over two databases
with no shared code: the graph cache, with one client family (the spreads), and `mem.read`, with
the Surfacer as its one consumer and the belief half empty on the live store. Which becomes the
durable read layer and what happens to the other are undecided; the config names the comparison
that would inform it (③b) and records that it has not run. Before adding a third path, work out
which of these two you are extending.

Two smaller gaps, stated separately so they are not folded into that one: the shared-layer design
of §5 is unbuilt as *shared* — making the subconscious and the writer peer clients is real work
nobody has done; and nothing on the live path produces a belief for the belief reader to return
(see above).

## Pillars this serves

- **Pillar 5 (surfacing is activation-driven, not retrieval)** — [`spread.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/spread.py) is the
  substrate. The graph reader was explicitly the *other* thing, and conflating them is how a
  search box with a personality gets built; its facts block into Integration was removed
  2026-10-01 for that reason. The rendering half ships; the endogenous-activation half
  does not.
- **Pillar 3 (honesty by construction)** — the spread's tier gate conducts only through
  grounded edges, so a node reachable *only* via an inferred or quarantined edge never becomes
  present ([`spread.py:76-79`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/spread.py#L76-L79)).
- **Pillar 3, again, in `mem.read`** — a read returns one of four states, and `unknown` (could
  not check) is never read as `absent` (checked, nothing there). `absent`, the only state that
  licenses "I don't have that", is unreachable in this build by construction
  ([`mem/tool.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/mem/tool.py)).
- **Pillar 1 (continuous being)** — the idle tick is the between-turn half: when the primary
  is idle, seed a spread from whatever is emotionally live and render one intrusion. Sparsity
  is the design; an uncharged graph seeds nothing and the renderer is never invoked.
- **Pillar 7 (composed proof)** — the degree-flavour unification was verified whole-graph
  rather than asserted ([`graph_cache.py:29-41`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/graph_cache.py#L29-L41)).

## Sources

- [CLAUDE.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/CLAUDE.md) · [docs/README.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/README.md) ·
  [PILLARS.md](../PILLARS.md) · [THE-ORGANS.md](../THE-ORGANS.md) · [writer.md](writer.md).
- [alto-architecture-revisions-june2026.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/alto-architecture-revisions-june2026.md) —
  §5, the shared graph-read / cache layer and its four peer clients as originally listed
  (Integration's has been struck).
- [retrieval-architecture.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/memory/retrieval-architecture.md) — the five layers.
- Specs, all drafts (see [specs/README.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/specs/README.md)):
  [SPEC-retrieval-orchestrator.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/specs/v3/SPEC-retrieval-orchestrator.md) ·
  [SPEC-retrieval-l2-semantic.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/specs/v1/SPEC-retrieval-l2-semantic.md) ·
  [SPEC-subconscious-salience-surfacing.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/specs/v3/SPEC-subconscious-salience-surfacing.md) ·
  [SPEC-salience-idle-render.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/docs/specs/v3/SPEC-salience-idle-render.md).
- The `mem.read` path, and the measurements the config cites:
  [`mem/read.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/mem/read.py) · [`mem/beliefs.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/mem/beliefs.py) ·
  [`mem/surfacer_store.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/mem/surfacer_store.py) ·
  [`mem/surfacer_recall.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/mem/surfacer_recall.py) ·
  [`mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/mem_bridge.py) ·
  [three-source-union-2026-09-22.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/artifacts/three-source-union-2026-09-22.md) ·
  [topn-sweep-2026-09-22.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/artifacts/topn-sweep-2026-09-22.md) ·
  [armb-regrade-2026-09-25.md](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/artifacts/armb-regrade-2026-09-25.md).
- Code: [`graph_cache.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/graph_cache.py) ·
  [`reader_cache.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/reader_cache.py) ·
  [`spread.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/read/spread.py) ·
  [`alto/brain/store.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/brain/store.py) ·
  [`alto.py`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/alto/runtime/alto.py) ·
  [`config.yaml`](https://github.com/sawyerstrong/alto/blob/7a50692a511aa5f0c5675e294af7a9e5685c1a71/src/config.yaml).
