# Retrieval and the read layer

> **Path:** hot (the turn reads it) — with one continuous client, the idle tick · **Status:** two read paths over two databases — the graph reader and its cache are built and dark; `mem.read` is built and **on**, feeding the Surfacer · **Code:** [`graph_cache.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/graph_cache.py), [`graph_reader_source.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/graph_reader_source.py), [`reader.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/reader.py), [`spread.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/spread.py); and in [`mem/`](https://github.com/sawyerstrong/alto/tree/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/mem), [`read.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/mem/read.py), [`beliefs.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/mem/beliefs.py), [`surfacer_store.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/mem/surfacer_store.py), [`surfacer_recall.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/mem/surfacer_recall.py)

This is everything on the far side of the Writer: the layer that gets what Alto knows back out
of the graph, and the machinery that decides what is *present* rather than what was *asked
for*. Two things live here and they are easy to conflate. The **shared read/cache layer** is
infrastructure — one in-memory mirror of the graph that several organs query. The **Reader
(L3)** is one client of it: given a cue, it gathers the typed neighbourhood, scores each
candidate fact, and returns a ranked, inspectable list. Pillar 5 governs the distinction
between that and *surfacing*: what surfaces is an involuntary intrusion, not what a reader
retrieved.

**There are now two read paths, and they read different databases.** Everything from here to
[The gap](#the-gap) describes the *graph* path — cache, Reader, `spread()` — over the AGE graph
in `alto_dev`. The other is `mem.read`: `knowledge()` in
[`mem/read.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/mem/read.py) over `alto_mem`, the Writer's own store, switched on
2026-09-22 ([`config.yaml:491`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/config.yaml#L491)). The Surfacer is its only live
consumer. The two share no code and no data, and which of them survives is not decided.

## Where it sits

It consumes exactly what the Writer produced — episode Nodes, `mentions` edges, typed relation
/ `is_a` / `co_occurs` edges — through
[`alto/brain/store.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/brain/store.py), and emits two shapes to two consumers.
`reader.what_alto_knows` returns structured `FactRecord`s, which the pipeline renders as a
`[What Alto knows about X]` block ([`pipeline.py:1425`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/turn/pipeline.py#L1425)) —
facts, deliberately not a felt thought. `spread()` returns an activation-ranked list of node
uuids, which the surfacer turns into an involuntary intrusion. Turning a fact list into prose
is the surfacer's job and is out of the reader's scope on purpose; the structured list *is*
the reader's contract ([`reader.py:1-9`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/reader.py#L1-L9)). Organs either side:
the **Writer** upstream, the **Surfacer** and **Integration** downstream.

The `mem.read` path starts from the `alto_mem` tables instead — `line`, `segment`, `surface`,
`binding`, `cooccurrence`, and the proposition layer where a store has one — and emits a
`Knowledge`: lines that each carry their speaker and a span into their source segment, a separate
`beliefs` field, and a state. The Surfacer consumes it as its store (`mem.read.surfacer_source`,
[`mem_bridge.py:428`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/mem_bridge.py#L428)) and as a second retrieval
(`surfacer_recall`). Nothing else in the live pipeline calls it.

## The intended design

**One read layer, four peer clients.**
[Architecture revisions §5](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/alto-architecture-revisions-june2026.md) settles this as
first-class infrastructure: the subconscious, the writer (recorder *and* consolidator),
Integration's retrieval, and later dreaming are all peer clients of one graph-read/caching
layer. The prompt was the observation that the subconscious and the writer make similar DB
reads; the resolution was explicitly **shared read infrastructure, not co-located
components**, because their query profiles differ — the subconscious reads graph-affect to
*feel* (hot, recent-biased, fast), the writer reads it to *record* (broad, history-inclusive,
correctness over speed). The hot tier of that cache is the **live brain**; the full graph
behind it is the **deep store**, complete but quiet rather than degraded
([docs/README.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/README.md)).

**Retrieval itself is layered, and semantic search is one input among five.**
[retrieval-architecture.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/memory/retrieval-architecture.md) gives the five — recency,
semantic, graph traversal, temporal/confidence weighting, and active context — run in
parallel, scored, deduplicated, ranked into a context budget. L3 graph traversal was promoted
to V1. The coordinating contract is
[SPEC-retrieval-orchestrator.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/specs/v3/SPEC-retrieval-orchestrator.md) (draft, not
interview-gated), over
[SPEC-retrieval-l2-semantic.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/specs/v1/SPEC-retrieval-l2-semantic.md).

**And the read layer is not the point — activation is.** Pillar 5: thoughts are involuntary
intrusions from below, not query → facts → render. Directed recall survives, but as an
intention serviced by invisible machinery, never as Integration calling a database. The
activation half is specified in
[SPEC-subconscious-salience-surfacing.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/specs/v3/SPEC-subconscious-salience-surfacing.md)
and [SPEC-salience-idle-render.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/specs/v3/SPEC-salience-idle-render.md).

**One silence worth naming.** The canonical ingestion-path frame in
[docs/README.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/README.md) lists Perception, Intake, the Subconscious, Integration, the
three transducers, Processing, the Writer and the shared read layer — and **never names the
Reader.** That is a gap in the corpus, not a decision that the Reader does not belong. Do not
read it either way.

### Beliefs — a reader that is built, over a layer the live store does not have

Beliefs are specified as graph nodes carrying *domain, confidence and provenance*
([alto-build-order-v3.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/roadmap/alto-build-order-v3.md)), promoted and demoted by the
Writer's **consolidator** — the sleep-time timescale, which has no code. That is unchanged. What
changed is the read side, and it changes what "nothing writes them" means:

- **A belief reader exists, and it is live.** [`mem/beliefs.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/mem/beliefs.py)
  returns beliefs in their own field, `Knowledge.beliefs`, kept apart from testimony because they
  are different speech acts and the reader does not get to rank one against the other. The entry
  is the claim, embedded; a key may narrow a hit and never add one. A returned belief must also
  answer the question that was asked ([`mem/belief_check.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/mem/belief_check.py)).
- **The live store has nothing for it to read.** The `proposition` tables are defined in
  [`scripts/mem/seed/proposition_schema.sql`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/scripts/mem/seed/proposition_schema.sql),
  a seeding script and not [`mem/schema.sql`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/mem/schema.sql), and are filled in simulation stores (about 130
  beliefs each, per [`beliefs.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/mem/beliefs.py)). Its docstring is direct: `alto_mem` has no proposition tables at
  all. `knowledge()` never raises, so on the real store the belief half comes back empty with a
  named reason and a count (`no_proposition_table` is one of eleven).
- **A belief must be derived from evidence with its provenance intact.** `alto_mem` keeps a
  reserved `belief_confidence` table keyed to a line of testimony, with an evidential `basis`, and
  its DDL is explicit that it stays empty and **nothing may fill it with a model self-report**. A
  belief Alto asserts about itself is not a belief; it is a performance (pillar 3).
- **Belief storage in the live schema is still a prerequisite nobody has scheduled.**
  [BUILD-ORDER.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/roadmap/BUILD-ORDER.md) lists it as an "unscheduled prerequisite —
  build before" the V3 items that need it, and
  [SPEC-consolidation-loop.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/specs/v3/SPEC-consolidation-loop.md) — which depends on it —
  owns the beliefs schema sketch. So the reader is built and on, the seed schema exists, and
  nothing on the live path produces a belief. Worth knowing before you plan anything that
  assumes one.

## What exists today

[`graph_cache.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/graph_cache.py) (439 lines) loads the whole graph once
via a single bulk read and exposes read-only adjacency, degree and property accessors. The
motivation is measured latency: the store-backed reader pays a fresh psycopg connection plus
`LOAD 'age'` per hop against the VM-hosted Postgres, so one `what_alto_knows` call is ~10
round-trips and seconds — for a graph of hundreds of nodes that fits trivially in RAM.
Snapshots are immutable and swapped atomically, so a spread in flight sees one consistent
graph. [`graph_reader_source.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/graph_reader_source.py) (343) is a
store-compatible read facade over that snapshot: because the reader only ever calls read
method names on its `store` argument, handing it this facade reproduces the store-backed
output byte-for-byte in-process. Its scope boundary is documented rather than silent — the
episode hop and the self/person neighbourhood reads delegate to a wrapped store, because the
cache deliberately does not hold episode `turns` blobs.

[`reader.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/reader.py) (627) scores each candidate fact on four
normalized signals — reinforcement, recency, provenance tier, and a read-time degree penalty
— and takes their weighted sum. Normalization is load-bearing: without it, raw magnitude on
one axis would make the reader surface *what is numerous* instead of *what matters*.
[`spread.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/spread.py) (319) does conductance-weighted spreading
activation over the same cache, reusing the reader's `_norm_reinforcement` so the spread's
channel strengths and the reader's scoring agree by construction.

**The `mem.read` path.** `knowledge()` was built and dark until 2026-09-22, when
`mem.read.enabled` went `true` ([`config.yaml:491`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/config.yaml#L491)). The Surfacer
reaches it two ways, each behind its own flag, both built by
[`mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/mem_bridge.py):

- `surfacer_source: mem` ([`config.yaml:540`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/config.yaml#L540), on since 2026-09-22) swaps the Surfacer's *store*.
  [`mem/surfacer_store.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/mem/surfacer_store.py) answers the store contract the
  Surfacer already declares, from `line` rows rather than the AGE graph, so the extractive prompt,
  the verifier and the attribution and absence rules do not change. Rolling back is that one line.
- `surfacer_recall: true` ([`config.yaml:566`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/config.yaml#L566), on since 2026-09-25) adds a second *retrieval*.
  [`mem/surfacer_recall.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/mem/surfacer_recall.py) calls `knowledge()` twice per
  turn — a short cue for the line half, the whole utterance for the belief half — because the two
  halves measurably want different cues. It leaves out Alto's own earlier replies (44% of the live
  index) and lines reached only by graph expansion, since either would become quotable text with
  no relation to what was said.

Shipped read settings: `top_n: 20` (`:518`, the knee of a 5–50 sweep on a simulation store),
`require_anchor: true` (`:498`, withhold a line that cannot point at its own source span),
`salient: true` (`:502`, commands and questions are not durable facts), `expand_hops: 1` (`:507`).

What the config says was measured, and what it says was not. On a 20-utterance trace fixture
against the `alto_mem_sim112` simulation store, the Surfacer's own neighbourhood reaches 17 of 47
cited episodes and delivers 10 after the prompt trim; recall reaches 12 more that the neighbourhood
cannot see (10 belief-only, 2 lines-only). A regrade of 10 non-silent renders graded 8 supported /
2 distorted / 4 useful with recall on against 8 / 2 / 3 with it off — a narrow gain on a small
sample ([armb-regrade-2026-09-25.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/artifacts/armb-regrade-2026-09-25.md)). **The
graph-versus-mem comparison (③b) has not run.** The config says so, and says the flip does not
stand in for it: `surfacer_source` moved to `mem` because the graph arm was found to be reading a
store with one entity node in it, not because `mem` won.

**Flags, as shipped, for the graph path.** `integration.reader_enabled: false`
([`config.yaml:375`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/config.yaml#L375)) — the knowledge block is never injected;
`_compute_knowledge_block` returns early at [`pipeline.py:1448`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/turn/pipeline.py#L1448). `surfacer.salience_enabled` is
unset, because the whole `surfacer:` block is commented out ([`config.yaml:250`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/config.yaml#L250)), so it
defaults false at [`pipeline.py:214`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/turn/pipeline.py#L214). But `salience.idle_tick.enabled: true`
([`config.yaml:967`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/config.yaml#L967)) and `subconscious.enabled: true` ([`config.yaml:938`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/config.yaml#L938)), and the cache-build
gate fires when **any** of reader / cued salience / idle tick is on and a store is present
([`pipeline.py:260`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/turn/pipeline.py#L260)). So in the shipped config the GraphCache *is* built and *is* spread over —
by the between-turn idle tick, not by the reader. The `mem.read` flags above are independent of
these, so turning the graph reader off does not turn Alto's retrieval off.

**What is not shared yet.** Nothing in [`subconscious.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/subconscious.py) or any `writer_*.py` module reads
through `graph_cache`; they go to the store directly. Today's only clients are the reader and
the two salience paths, all constructed by the pipeline. The layer is built as the reader's
cache — the four-peer-client design of §5 has one client family.

## The gap

**On the graph path, the read side is not several broken organs. It is one absent layer, seen
from several angles.**

Follow it concretely. `add_mention_edge` ([`store.py:1236`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/brain/store.py#L1236))
— the edge that says *this episode mentioned this entity* — has exactly **one** caller in the
package, [`writer_resolver.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/write/writer_resolver.py) (at `:1400`, `:2096`,
`:2103`, `:2148`, `:2173`; everything else that calls it is a test, a double, or a script).
Every one of those sites is downstream of the `_llm_enabled` return at
[`writer_resolver.py:1109`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/write/writer_resolver.py#L1109), and `resolver_enabled` is `false`. So **no new mention edges are
written on the live path.**

Mention edges are what `get_entity_neighborhood` is scoped to — its hop-1 is "each episode
that mentions it", hop-2 the other entities those episodes mention
([`store.py:4226-4236`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/brain/store.py#L4226-L4236)). That neighbourhood is what the
reader gathers ([`reader.py:303`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/reader.py#L303)) and — via the cache's undirected adjacency, where mentions are
deduped to distinct (episode, entity) pairs — what both salience paths spread over. **It is no
longer what the Surfacer reads for grounded content:** since `surfacer_source: mem` the Surfacer
reads `alto_mem` lines, so that starvation is bypassed rather than repaired. The graph store is
still nearly empty; the config records one entity node in `alto_dev`.

So the reader returning nothing and salience finding nothing to spread are **not separate
bugs**. Fix the payload layer and both light up at once, which is also why measuring either in
isolation today tells you very little (pillar 7). Closing this gap is gated on the Writer, not on
the read layer — see [writer.md](writer.md) — *if* the graph path is the one that survives.

**That "if" is the open question.** The design (§5 above) is one read layer with four peer
clients. What exists is two read paths over two databases with no shared code: the graph cache,
with one client family and no live consumer of its reader, and `mem.read`, with the Surfacer as
its one consumer and the belief half empty on the live store. Which becomes the durable read
layer, what happens to the other, and whether the Reader is ever repointed at `mem` are
undecided — [`reader_cue.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/reader_cue.py)'s own docstring calls the repointing "a separate decision", and the
config names the comparison that would inform it (③b) and records that it has not run. Before
adding a third path, work out which of these two you are extending.

Two smaller gaps, stated separately so they are not folded into that one: the shared-layer design
of §5 is unbuilt as *shared* — making the subconscious and the writer peer clients is real work
nobody has done; and nothing on the live path produces a belief for the belief reader to return
(see above).

## Pillars this serves

- **Pillar 5 (surfacing is activation-driven, not retrieval)** — [`spread.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/spread.py) is the
  substrate; the reader is explicitly the *other* thing, and conflating them is how a search
  box with a personality gets built. The rendering half ships; the endogenous-activation half
  does not.
- **Pillar 3 (honesty by construction)** — the spread's tier gate conducts only through
  grounded edges, so a node reachable *only* via an inferred or quarantined edge never becomes
  present ([`spread.py:37-40`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/spread.py#L37-L40)).
- **Pillar 3, again, in `mem.read`** — a read returns one of four states, and `unknown` (could
  not check) is never read as `absent` (checked, nothing there). `absent`, the only state that
  licenses "I don't have that", is unreachable in this build by construction
  ([`mem/tool.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/mem/tool.py)).
- **Pillar 1 (continuous being)** — the idle tick is the between-turn half: when the primary
  is idle, seed a spread from whatever is emotionally live and render one intrusion. Sparsity
  is the design; an uncharged graph seeds nothing and the renderer is never invoked.
- **Pillar 7 (composed proof)** — the degree-flavour unification and the byte-for-byte
  equivalence of the cached reader were both verified whole-graph rather than asserted
  ([`graph_cache.py:37-49`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/graph_cache.py#L37-L49)).

## Sources

- [CLAUDE.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/CLAUDE.md) · [docs/README.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/README.md) ·
  [PILLARS.md](../PILLARS.md) · [THE-ORGANS.md](../THE-ORGANS.md) · [writer.md](writer.md).
- [alto-architecture-revisions-june2026.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/alto-architecture-revisions-june2026.md) —
  §5, the shared graph-read / cache layer and its four peer clients.
- [retrieval-architecture.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/memory/retrieval-architecture.md) — the five layers.
- Specs, all drafts (see [specs/README.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/specs/README.md)):
  [SPEC-retrieval-orchestrator.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/specs/v3/SPEC-retrieval-orchestrator.md) ·
  [SPEC-retrieval-l2-semantic.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/specs/v1/SPEC-retrieval-l2-semantic.md) ·
  [SPEC-subconscious-salience-surfacing.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/specs/v3/SPEC-subconscious-salience-surfacing.md) ·
  [SPEC-salience-idle-render.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/specs/v3/SPEC-salience-idle-render.md).
- The `mem.read` path, and the measurements the config cites:
  [`mem/read.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/mem/read.py) · [`mem/beliefs.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/mem/beliefs.py) ·
  [`mem/surfacer_store.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/mem/surfacer_store.py) ·
  [`mem/surfacer_recall.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/mem/surfacer_recall.py) ·
  [`mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/mem_bridge.py) ·
  [three-source-union-2026-09-22.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/artifacts/three-source-union-2026-09-22.md) ·
  [topn-sweep-2026-09-22.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/artifacts/topn-sweep-2026-09-22.md) ·
  [armb-regrade-2026-09-25.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/artifacts/armb-regrade-2026-09-25.md).
- Code: [`graph_cache.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/graph_cache.py) ·
  [`graph_reader_source.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/graph_reader_source.py) ·
  [`reader.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/reader.py) · [`spread.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/spread.py) ·
  [`alto/brain/store.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/brain/store.py) ·
  [`pipeline.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/turn/pipeline.py) ·
  [`config.yaml`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/config.yaml).
