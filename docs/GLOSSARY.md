# Glossary

*The vocabulary you need to read anything else here. This repo's language is precise — several
words carry a strict meaning that a loose reading would break — and a number of words mean two
or three different things depending on which document you are in.*

**Read the collisions first.** They are the entries nobody knows to look up, because you do not
discover that "beliefs" means two things until you have already conflated them. Everything
after is alphabetical; skim it once, then come back when a word stops you.

Where an entry and a canonical doc disagree, the canonical doc wins — and tell someone, because
they should not disagree. Entry sources are cited so you can check.

---

## Start here: the words that mean two things

The collisions below, each verified against the source, come first because every one of them
has already cost somebody time, and none is guessable.

### "beliefs" — two different things

**Belief nodes** are designed as graph nodes carrying *domain, confidence and provenance*
([`docs/roadmap/alto-build-order-v3.md:79`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/roadmap/alto-build-order-v3.md#L79)). They are what the consolidator would promote and
demote. Nothing writes them; the AGE graph that would have held them is archived at tag
`archive/age-brain-2026-10-11`.

**`belief_confidence`** is a reserved table in `alto_mem`, keyed to a single *line* of
testimony, holding a confidence and an evidential `basis`. It is empty by design, and its DDL
states that **nothing may fill it with a model self-report**.

One is a claim Alto holds; the other is how sure the store is about one recorded line.

### "subconscious" — an adjective and an organ

Pillar 5 says *"surfacing is subconscious and activation-driven"* — adjective, meaning below
the conscious line. **The Subconscious** is also a specific organ: continuous, maintains state
and signals, never reasons, never reads the graph.

The Surfacer is subconscious machinery **without being** the Subconscious. And no code is the
Subconscious yet: the state-decay tick that stood in for it is archived at tag
`archive/age-brain-2026-10-11`, and the organ is designed, to be rebuilt on `mem`.

### "the four organs" — three different sets of four

| Where | Which four |
|---|---|
| [`alto-four-organ-architecture.md:19-22`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/alto-four-organ-architecture.md#L19-L22) | Intake LLM · Brain · Processing LLM · Voice LLM |
| [`alto-commercialization.md:8`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/alto-commercialization.md#L8) | intake · integration layer · processing · renderer |
| `ALTO-PROJECT-BRIEF.md:44+` | Writer · Reader · Surfacer · Integration |

The third is a list of what is *built*, answering a different question with the same words.
Check which four before you rely on the phrase. The frame itself has been superseded as the
headline structure — see [THE-ORGANS.md](THE-ORGANS.md).

### "intake" — a module that was renamed

Before 2026-06-24, `intake.py` was the module that became the writer's episode recorder, and
old documents and commits saying "intake" often mean it. That recorder is archived at tag
`archive/age-brain-2026-10-11`; `mem` is the recorder now. From 2026-06-24 until 2026-10-04 a
different `intake.py` was the LLM perceptual front-end; that organ is deleted too (see
**Intake** below).

### "episode" — a table, an archived node, and a lived thing
An `episode` **table** in `alto_mem` (L0 testimony, rotated on an idle gap). A `kind:'episode'`
**node** in the archived AGE graph. And the thing pillar 1 means by *"Alto is always in an
episode"* — the felt, continuous unit of experience, which is the one that is not built.

### "surfacing" is not retrieval

The easiest wrong assumption in the repo. **Retrieval** is deliberate and query-driven — you
ask, it answers. **Surfacing** is involuntary: an intrusion from below, arriving without being
asked for. Pillar 5 is the whole distinction. A directed recall does survive, but as *an
intention to remember serviced by invisible machinery* — never as Integration calling a store.

### `alto_mem` and `alto_dev` are two databases

Not two schemas in one database. `alto_mem` is `mem`'s store; `alto_dev` held the archived AGE
brain. [`src/mem/db.py:40-48`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/db.py#L40-L48) resolves `mem`'s database on its own (`ALTO_MEM_DB_NAME`), and the
preflight reports where that name came from: a run has already been invalidated by a database
override nobody noticed.

### "built" usually means "built and dark"

Most of the write side exists in code behind a config flag that ships `false`. A module's
existence is not evidence it runs. Check the flag — each organ page names its own.

### "gate" — at least four things
The worst offender in the repo. **The gate** in CLAUDE.md is the Definition of Done (lint,
tests, docs-check, exercise the real path). **A type gate** is one of the ten `_looks_like_*`
checks in [`src/mem/name_gates.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/name_gates.py), [`phrase_gates.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/phrase_gates.py) and [`value_gates.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/value_gates.py). **The salience gates**
in `mem` decide what is worth keeping. **A build gate** in a spec is the go/no-go criterion
before code is written. Four unrelated meanings; always take it from context. (A fifth, the
turn-activity gate the idle tick waited on, is archived with the writer.)

### "live" — four things

**`live brain`** is the hot cache tier, as against the deep store. **`pytest -m live`** means
a test needing Postgres, which CI deselects. **The live recorder** is the Writer's fast
timescale. **The live path** is production, as against a sim or probe. A sentence like "the
live tests don't run on the live path" is unfortunately coherent.

### "the writer" — three referents

The **organ** on the cold path (design); the **recorder** that ships, which is
[`src/alto/read/mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/mem_bridge.py) handing each heard utterance and finished turn to `mem.append`;
and **[`src/mem/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem)**, the writer's own store under SPEC-writer-build_14. "Writer v2" means the
organ minus the AGE-graph recorder that is now archived.

### "mention" — a table and an archived edge
`mem`'s **`mention` table** keeps filling. The AGE **`mentions` edge** had no writer after the
resolver's LLM half was deleted (2026-10-04), and the graph that held it is archived at tag
`archive/age-brain-2026-10-11`. Both describe an utterance referring to something; neither is
the other.

### "resolver" — two organs

**`writer_resolver.py`** resolved entity *identity* in the graph; it is deleted (its LLM half on
2026-10-04, its eager self-schema learners on 2026-10-05). **`mem`'s corefer step** resolves
pronouns to surfaces and is the only resolver left.

### "renderer" — four things

The **Renderer organ** (Integration's spoken words → audio; a shell today). The **Surfacer's
render step** ([`src/alto/read/surfacing/render_verified.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/surfacing/render_verified.py): render, verify, retry once). The
**absence-renderer**, designed. And in older docs, all three conscious-boundary transducers were
once called renderers — only the organ kept the word.

### "the brain" — three things

The **stateful self** (the four-organ sense: the graph plus state, *is* Alto). The **hot cache
tier**, as against the deep store. And the **project brain**, the typed Postgres layer of
projects and blockers that lived in `src/alto/brain/`; it is archived at tag
`archive/age-brain-2026-10-11`.

### arousal and energy are the same axis

In the designed affect state the live axis is `energy` and the per-episode affect atom's is
`arousal`; the design names the conversion explicitly. `arousal` is also the name of a
steering-vector axis in [`src/steering/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/steering). If two documents disagree about how many affect
dimensions there are, this is usually why.

### markers: the spec says `⟦say⟧`, the code emits `¦`

The spec's directive grammar uses `⟦say⟧` / `⟦act⟧`. What the Integration LoRA actually emits,
and what [`markers.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/runtime/markers.py) parses, is `¦…¦` for speech and `¤…¤` for action.

---

## A–Z

### Absence render (the absence-renderer)
The designed sibling of the Surfacer that says *nothing surfaced* — a fixed, content-free
repertoire ("nothing's there", "I don't have that") that never says anything about the missing
thing, so Integration receives the blank as perception and never learns surfacing exists. It is a
separate producer because a deferral thought is *generated*, while the Surfacer is extractive; the
2026-07-23 philosophy ruling scopes the extractive invariant to non-empty reads. Ruled in
[`docs/ALTO-INTERIORITY-MAP.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/ALTO-INTERIORITY-MAP.md) ("The three reconciliations", #1); designed, no code.
**Trap:** today's self render carries an absence *template* rendered by the same extractive
producer. That is not the absence-renderer, and reading it as one hides an unbuilt organ.

### account
A per-referent prose summary of what an episode said about one thing, keyed by an opaque id
(`a0`, `a1`, …) rather than by a name. The unit the episode-close **picture** pass produces,
replacing the claim/triple form. Designed in [`docs/specs/v3/SPEC-episode-account.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-episode-account.md), with the
reasoning in [`docs/specs/v3/DECISION-picture-shape-and-felt-state.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/DECISION-picture-shape-and-felt-state.md); the AGE-era pass that
built it is archived at tag `archive/age-brain-2026-10-11`, and rebuilding it on `mem` is open.
**Trap:** two accounts may legitimately hold the same surface text — nothing normalizes a
surface and there is no global surface→account index. That is the fix for the lexical collapse
that reduced `my sister` and `his sister` to one key, not an oversight.

### Action organ
The missing half of device control: a separate model whose only job is turning a natural-language
action commitment into arguments that survive the guard. It is the only thing in the system that
would ever know Home Assistant exists — Integration never holds a tool. Designed in
[`docs/specs/v1/SPEC-integration-mvp.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v1/SPEC-integration-mvp.md) and sketched in [`organs/action.md`](organs/action.md); no code.
**Trap:** the channel into it ships and is live — the LoRA emits `¤…¤` spans and [`markers.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/runtime/markers.py)
captures them whole — but nothing consumes them. A captured span is logged and deliberately not
written into turn memory, because no effector fired.

### Activation
How *present* something is, as a number: a salience-weighted sum of decaying traces, one trace per
occurrence and per recall, so important things stay hot longer than merely recent ones. Recall lays
down a new smaller trace (reheat-on-recall). Designed, and not computed anywhere today: the
spreading-activation code that produced it is archived at tag `archive/age-brain-2026-10-11`, and
the roadmap rebuilds it on `mem`. The trace/tier model is described in [`docs/README.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/README.md) under
"Memory tiers & activation" and has no doc of its own yet.

### Actuation firewall
The invariant that the conversational model holds zero tools: neither reply path in [`alto.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/runtime/alto.py) passes
a `tools` argument, and the `ToolDispatcher.dispatch` call site is removed from both turn handlers. It
is asserted, not incidental — `test_no_conversational_llm_call_passes_tools` ([`test_alto_v0.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/tests/test_alto_v0.py))
AST-scans [`src/alto/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto) and fails on any `.chat(` / `.chat_stream(` call that passes tools, and two
behavioural tests check a real turn's request body.
**Trap:** two reasons converge on the missing argument and only the first expires. Integration-MVP cut the
effector channel (temporary); SPEC-writer-build_14 §1.7 says a surfaced thought is indistinguishable
from a spoken reply once it is in history, so one registered tool lets a fabricated memory become a
device call (permanent).

### Affect
Alto's emotional state, treated as a lived state that persists, decays and *causes* what surfaces —
not a tone setting. Pillar 2's test is the one to hold: affect works when state from turn 3 still
shapes turn 9, never because tone shifted. See [`PILLARS.md`](PILLARS.md) §2 and
[`docs/identity/alto-emotional-state.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/identity/alto-emotional-state.md).

### Affect state
The live, between-turn emotional state: a persisted baseline plus decayed injections, resolved on a
tick, on axes `valence` and `energy` (with `stability` and `focus_target` as the designed 4-axis
extension). Pure decay math is meant to sit apart from the loop that owns the clock, so a wrong
turn-9 residue is diagnosable as either bad decay math or a tick that never fired.
**Trap:** none of it runs. The AGE-era implementation is archived at tag
`archive/age-brain-2026-10-11`, and with no affect state the affect-suppression directive arms
every turn ([`src/alto/runtime/reply_guards.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/runtime/reply_guards.py)). Affect state on `mem` is designed and on the roadmap
(pillar 2).

### AGE / `alto_graph`
Apache AGE was the Postgres graph extension that hosted `alto_graph`, the graph of episodes,
entities, the self-node and typed edges. It is retired: the code is archived at tag
`archive/age-brain-2026-10-11`, and the data is a `pg_dump` of `alto_dev` kept off-repo. `mem` is
the only memory store.
**Trap:** specs and handoffs still describe the graph in the present tense. AGE had no CHECK,
foreign key or unique constraint, so those documents' edge vocabulary was enforced only in code.

### Allowlist
The per-domain set of Home Assistant services the guard will pass — `SERVICE_ALLOWLIST` at
[`src/alto/action/ha.py:60`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/action/ha.py#L60), covering `input_boolean`, `switch`, `light`, `media_player` and nothing else.
`normalize_service` ([`src/alto/action/ha.py:82`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/action/ha.py#L82)) applies a synonym map first (the model says "pause", HA wants
`media_pause`), then returns `None` for anything outside its domain's set.
**Trap:** adding a device capability means three edits — the registry, the allowlist, and a test.
Widening what the model is *allowed to emit* is not one of them.

### `alto_agent_<slug>` (scratch DB)
The per-agent database name minted by `agent_db_name(label)`
([`src/scripts/agent_lease.py:283`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/scripts/agent_lease.py#L283)). The `alto_agent_` prefix is load-bearing rather than
cosmetic: it makes the protected-name check total, so no label can ever resolve to `alto` or
`alto_dev`. Write-capable agents get one of these plus their own git worktree.

### `alto_mem`
Alto's memory database, `mem`'s store, holding the
schema in [`src/mem/schema.sql`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/schema.sql) — the layered core, a reserved `belief_confidence`, the
`line_embedding` index, and four `*_history` archives. Default name in [`src/mem/db.py:31`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/db.py#L31); resolved by
`ALTO_MEM_DB_NAME`.
**Trap:** `alto_mem` and `alto_dev` (the archived AGE brain) are separate **databases**, not
schemas inside one ([`src/mem/db.py:40-48`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/db.py#L40-L48)). An override of `mem`'s name must be visible, and
preflight has already caught one run
invalidated by exactly that kind of ambient override.

### `alto` / `alto_dev`
The two protected databases of the archived AGE brain (`alto` was its production name,
`alto_dev` its dev redirect). The runtime no longer reads either: mem's database is named by
`resolve_mem_dbname` ([`src/mem/db.py:40`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/db.py#L40)). Both stay listed in `PROTECTED_DB_NAMES`
([`src/scripts/agent_lease.py:44`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/scripts/agent_lease.py#L44)) and can never be handed out as an agent scratch namespace,
because they hold accreted testimony no rerun regenerates.
**Trap:** a database-name redirect is silent by design — `resolve_mem_dbname` reads env then
`.env` then the default and says nothing. That is right for the pipeline and wrong for an
unattended run, which is what `preflight` exists to catch.

### Anticipation
Future-directed affect: held future events carrying an affective charge, producing looking-forward
and dread, and one of the main things that *makes* time felt. Pillar 6 treats it as load-bearing for
the felt-interior claim rather than decoration. Designed in
[`docs/memory/alto-felt-time-anticipation.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/memory/alto-felt-time-anticipation.md); unbuilt.
**Trap:** anticipation is not a scheduled reminder. A timer that fires is not a state that colours
the interval before it.

### Band (hot / cold / continuous)
The three timing bands every organ sits in, and the first thing to know about one. **Hot**: during a
turn, someone is waiting, milliseconds, never block — degrade, don't crash. **Cold**: after the
turn, seconds, never corrupt — spool and retry. **Continuous**: always, between turns, on its own
clock — and the largest unbuilt part of the system. The table is in
[`THE-ORGANS.md`](THE-ORGANS.md).

### belief
Three different things carry this word, and they are not related.

1. **Belief nodes in the graph** — designed as nodes carrying domain, confidence and
   provenance, promoted and demoted by the consolidator
   ([`docs/roadmap/alto-build-order-v3.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/roadmap/alto-build-order-v3.md); schema sketch owned by
   [`docs/specs/v3/SPEC-consolidation-loop.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-consolidation-loop.md)). **Nothing writes one**, and belief storage is
   listed in [`docs/roadmap/BUILD-ORDER.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/roadmap/BUILD-ORDER.md) as an unscheduled prerequisite.
2. **`belief_confidence`** — a reserved, permanently empty table in `alto_mem`. See its own
   entry.
3. **`belief` as a `self_attr` slot** — one of five free-form `attr_type` values
   (`identity | architecture | belief | norm | preference`) on the self-node's attribute nodes
   in the archived AGE graph. No slot has a writer today.
**Trap:** (1) and (2) mean different things. A belief node is a *promoted conclusion about the
world*; `belief_confidence` is a *per-line confidence score over one piece of testimony*. A
reader will conflate them.

### `belief_confidence`
A table in `alto_mem` keyed to a `line`, carrying a confidence, a derivation timestamp and a
JSONB evidential `basis`. **Reserved and empty by design** — nothing in this build writes to it
([`src/mem/schema.sql:305-313`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/schema.sql#L305-L313)). It is a separate table rather than a column on `line` so that
`line` stays strictly append-only and the one mutable thing in the schema is isolated and
auditable.
**Trap:** the DDL is explicit that nothing may fill it with a model self-report. A confidence
Alto asserts about its own claim is not evidence; it is a performance (pillar 3).

### binding
A pronoun occurrence resolved (or attempted) to a surface: `(segment_id, char_start)` →
`surface_id`, with a `method` of `self | speaker | intake | sole | model`. Written at episode
close by step Ⓐ. [`src/mem/schema.sql:237-251`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/schema.sql#L237-L251).
**Trap:** an unresolved pronoun is a **row with a NULL `surface_id`**, not an absence. Without
the row you cannot tell "no pronoun here" from "a pronoun we failed on", and the failure rate
is uncountable.

### blind judge
An evaluator that scores output without knowing which arm, model or config produced it, and
without having seen the content authored. Named in pillar 7 ([`CLAUDE.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/CLAUDE.md),
[`PILLARS.md`](PILLARS.md)) alongside frozen evals and measure-don't-assert.
**Trap:** blind judging does not rescue an eval whose *content* was authored to match the
detector's markers. That is teaching to the test, and it is a separate failure from a
non-blind judge.

### Bundle
The data structure the Renderer would consume in the design: the idea, the surfaced
content, the self-state, plus curated `retrieved_context` and `actions_visible`. Affect is never
bundle *content* — the bundle carries the idea, steering carries the tone. Field contract in
[`docs/systems/alto-bundle-structure.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/systems/alto-bundle-structure.md); curation rules in [`alto-integration-bundle-filters.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/systems/alto-integration-bundle-filters.md).
**Trap:** nothing assembles a bundle today, and the Renderer, a shell, takes none. The one curation
filter that was built (Filter 2, contradiction) had no caller and was deleted 2026-10-04. Who
should assemble one is open: the organ the design named for it is out of these pages until it is
re-examined.

### Cold path
Work that happens after the turn, off the hot GPU, where seconds are acceptable and corruption is
not. The Writer and its sub-organs live here. The turn-activity gate that held write-side LLM
calls until the user had been idle is archived with the AGE writer; `mem` enrichment runs as a
batch under the GPU lease instead.

### Commitment characters (`¦` and `¤`)
The two glyphs by which Integration commits a thought to a channel — the point where private
deliberation becomes either speech or an action. `¦…¦` (U+00A6 BROKEN BAR) is speech and routes to
TTS; `¤…¤` (U+00A4 CURRENCY SIGN) is an action span, captured whole for the action organ. Everything
outside a pair is **thought** — discarded, never audible, never acted on — so **silence is the
default** and Alto must commit to leave any trace.

Each glyph is **exactly one BPE token** in Qwen2.5 (ids 64621 and 81538, verified against the
tokenizer shipped with `adapter-v1`), so a complete span costs two tokens; that is why these
characters rather than a word or a bracket pair. They are **same-char paired** — opener and closer
identical — so the parser toggles rather than matching brackets and spans cannot nest. Parsed by
[`src/alto/runtime/markers.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/runtime/markers.py); full treatment in [`organs/renderer.md`](organs/renderer.md).

**Trap:** the code and the older docs call these **markers** — [`markers.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/runtime/markers.py), `MarkerFilter`,
`integration.marker_filter`, `record_marker_action`. "Commitment characters" is this project's
term for the concept; the identifiers keep the old name and are not changing. Grep for `marker`,
not `commitment`. Older specs write the same idea as `⟦say⟧` / `⟦act⟧`.

### conductance
How much activation an edge transmits, in (0,1]. Computed, never stored. `mem` derives it in its
projection, where co-occurrence counts become conductance ([`src/mem/projection.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/projection.py)). The AGE-graph
derivation that reused the reader's reinforcement score is archived at tag
`archive/age-brain-2026-10-11`; spreading activation is to be rebuilt on `mem`.
**Trap:** it is never a column. [`src/mem/schema.sql:14-15`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/schema.sql#L14-L15) names `content_w`, `degree` and
`conductance` as the three corpus-dependent numbers that are deliberately absent from every
table — freezing one into a row is what makes a store merely re-derivable in principle instead
of actually rebuildable.

### conformance test
One test per test double asserting that the double's method signatures still match the real
collaborator: `assert_conforms(double, RealClass)` in [`src/testkit/conform.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/testkit/conform.py).
**Trap:** this exists because of two shipped bugs, and the second is the nasty one. A double
that *rejects* a new kwarg fails as a write error and reads as a behaviour regression (cost 28
tests one afternoon). A double that *absorbs* it into `**_` and discards it makes a test
asserting "the value arrived" pass against a producer that never sent one — a vacuous test with
nothing to say so.

### Conscious boundary
The seal around Integration, drawn in the overview diagram as the box holding Surfacer →
Integration. Thoughts come up through it, intentions go down through it, and nothing
else crosses. Its whole purpose is pillar 3: Integration cannot perform a state it is handed if it
never experiences being handed anything.
**Trap:** [`docs/systems/alto-subconscious.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/systems/alto-subconscious.md) and [`alto-integration-layer.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/systems/alto-integration-layer.md) call a *different*
line "the conscious/subconscious boundary" — the one between the Subconscious's maintained state and
Integration sampling it. Related, not the same line.

### Conscious locus
The principle, and Integration is its instance: there is exactly one locus of conscious thought and
it experiences only thoughts, never the machinery that produces them. It does not query a database
because it does not know there is a database. [`docs/systems/alto-conscious-locus.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/systems/alto-conscious-locus.md).
**Trap:** it does not reduce observability. The builder may log the surfaced thought, the state it
rendered from, the intent and the bundle; the honesty checks *are* that logging. The one forbidden
move is routing an observation of the machinery back into Integration as content it reasons over.

### Consolidator
The batched, sleep-time half of the Writer: aggregate standing affect across many episodes,
promote and demote beliefs, detect patterns, prune, restructure. Deliberately not live — it is
expensive and it needs an accumulated backlog (sleep pressure is roughly that backlog's size).
Contract: [`docs/specs/v3/SPEC-consolidation-loop.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-consolidation-loop.md).
**Trap:** it has **no code**. The one consolidation-shaped thing that existed, an offline
duplicate-concept merge on the archived project-brain store, had no caller and was deleted
2026-10-05.

### Continuous (band)
Always, between turns, on its own clock. The Subconscious is the only organ in this band, and the
band is the largest unbuilt part of the system.

### Continuous being
Pillar 1: Alto is *always in an episode*, not only during a turn — idle thought, felt duration,
sleep pressure, cognitive fatigue, circadian. A push-to-talk turn is one event in a continuous life,
never the unit of existence. The pillar exists because every convenient engineering frame here is
turn-shaped, and accidents of the frame harden into architecture.
**Trap:** the canonical example is **one thought per turn** — a push-to-talk artifact, not a
decision. The shipped surfacer produces exactly one because that is what the current input method
makes easy. Do not build on that number.

### Control vector
A per-layer direction added to the residual stream by a forward hook —
`hidden += coeff * direction[layer]` — so the signal never enters the token context. This is how
valence steering works: tone as a generation parameter rather than an instruction the model may
decline. [`src/steering/steer.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/steering/steer.py), served by [`src/steering/serve.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/steering/serve.py) where `valence` and `arousal`
are request parameters alongside `max_tokens`.
**Trap:** nothing in [`src/alto/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto) imports `steering`. It runs on its own HF-transformers HTTP
server, because Ollama cannot inject activations.

### cooccurrence
An episode-scoped edge between two surfaces with `n_segments` = the count of distinct segments
that mentioned both. Rebuilt per episode at close, never incremented
([`src/mem/schema.sql:253-265`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/schema.sql#L253-L265)).
**Trap:** the pair is stored ordered (`CHECK (surface_a < surface_b)`), and this is a CHECK
rather than a convention on purpose: an unordered pair stored twice is a silent 2x on both
endpoints' degree, which under out-normalisation halves every share they emit.

### Cued vs un-cued
Two ways activation gets seeded. **Cued**: the current utterance seeds it. The shipped surfacer
is cued in this sense, but without a spread: `match_cue_entities`
([`src/alto/read/surfacing/store_contract.py:28`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/surfacing/store_contract.py#L28)) finds the entities the raw utterance names and the
surfacer renders their neighbourhoods. **Un-cued**: no utterance at all — the between-turn seeding
from whatever is charged, which the old idle tick did and which is designed to be rebuilt on `mem`
(pillar 1).
**Trap:** un-cued is not the same as endogenous. A between-turn trigger on a clock is not
pillar 5's endogenous activation source, which does not exist.

### dark
Built, tested, shipped in the tree — and switched **off** by a config flag. The word appears in
the config itself (`# DARK 2026-08-15`, [`src/config.yaml`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml)) and in the organ pages
(`mem.read` is not). `mem.enrich` is in this state: it ships `false`. (The resolver's LLM half,
the relation and event extractors and the typer were dark too, and were deleted on 2026-10-04.)
**Trap:** a newcomer reading the module map assumes everything is live. It is not. Check the
organ page's flag table or [`src/config.yaml`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml) before inferring liveness from a module's
existence.

### deep store / live brain
The two tiers of memory. The **live brain** is the hot tier — what is present. The **deep store**
is the full graph behind it, **complete but quiet**: higher retrieval cost, not degraded. Designed;
the in-memory graph snapshot that played the live tier is archived at tag
`archive/age-brain-2026-10-11`. [`docs/README.md:106-107`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/README.md#L106-L107),
[`organs/retrieval.md`](organs/retrieval.md).
**Trap:** "live brain" in the roadmap docs sometimes means something else entirely — the
dev-brain / live-brain *separation*, where the live brain is the protected production instance
and the dev brain is a harness ([`docs/roadmap/alto-development-and-constitution.md:22`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/roadmap/alto-development-and-constitution.md#L22)). Two
senses, both current.

### degree
How many edges a node has. Like conductance, derived at read time — `projection.build` computes
it whole-store for `mem` ([`src/mem/projection.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/projection.py)). Never a stored column.

### derived layer
Everything in `alto_mem` below L0: lines, surfaces, mentions, bindings, co-occurrence, the
projection. Each is a pure function of L0 plus its enrichment inputs, scoped to a unit small
enough to rebuild atomically — segment for lines, episode for bindings and edges, whole store
for the projection. The governing sentence is **"rebuild beats reconcile"**
([`src/mem/__init__.py:7-14`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/__init__.py#L7-L14)).
**Trap:** the scoping is the design, not a detail. Anything that cannot be scoped to an
atomically rebuildable unit does not get to be derived — it has to be precious, and L0 is the
only precious layer.

### Designed but unbuilt
A status category the repo insists on keeping separate from "unimagined". Much of the interior —
persistent affect state, continuous episodes, felt time, anticipation, subconscious activation — is
specified in depth and has no code. Dashed boxes in the overview diagram mean this.
**Trap:** re-deriving an existing design is the most expensive mistake available here. Before
concluding something is undesigned, read its organ page and the maturity ledger in
[`docs/ALTO-INTERIORITY-MAP.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/ALTO-INTERIORITY-MAP.md).

### designed-but-unbuilt vs undesigned
Two categories the corpus keeps apart deliberately. **Designed but unbuilt** means a decision
was made, adversarially reviewed and written down — persistent affect state, continuous
episodes, felt time, the consolidator, beliefs. **Undesigned** means nobody has worked it out.
In the architecture diagram a dashed box is the first, not the second
([`THE-ORGANS.md`](THE-ORGANS.md)).
**Trap:** re-deriving an existing design is the most expensive mistake available here. Before
concluding something is undesigned, read its organ page and [`docs/specs/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs).

### draft spec vs interview-gated
[`docs/specs/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs) holds two generations. The **shipped / in-flight** specs at the root are
interview-gated — an owner interview happened and they are the contract of record. The
**2026-06-12 sweep** specs in the version subdirectories (`v1/`, `v2/`, `v3/`, `keystone/`,
[`evals/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/research/evals), `platform/`) were authored autonomously up front and adversarially reviewed, and
**none is interview-gated** ([`docs/specs/README.md:3-14`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/README.md#L3-L14)).
**Trap:** a `[PROPOSED]` tag marks a decision the source docs left open, not a decision that
was made. A sweep spec still needs an owner interview before its build starts; the sweep's goal
was to surface conflicts early, not to skip the gate.

### edge labels
The committed edge vocabulary of the archived AGE graph. Real labels were for edges queried
*by type*; everything never type-traversed rode `associated_with {label: '…'}` as a property
instead, so `mentions` and `episode_succession` were label properties while `is_a`, `before`,
`agent` and `patient` were real labels. The `VALID_EDGE_LABELS` tuple, archived at tag
`archive/age-brain-2026-10-11`, was the only enforcer. Kept because the v1 specs
([`docs/specs/v1/SPEC-relation-organ.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v1/SPEC-relation-organ.md), [`SPEC-self-schema-event-model.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v1/SPEC-self-schema-event-model.md)) still use the
vocabulary.
**Trap:** a Cypher query for a `:relation` edge type returned nothing while the organ was working
perfectly, because relations were `associated_with {label: …}`. That exact query cost a full
verification cycle ([`docs/CHECKS-measurement.md:50-53`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/CHECKS-measurement.md#L50-L53)).

### Energy
The activation axis of the designed live affect state, 0.0 (flat) to 1.0 (animated) — the
norepinephrine analog.
**Trap:** the same axis is called **arousal** one layer away: the per-episode affect atom is
`{valence, arousal}`, and the design converts the atom's arousal to the state's energy axis.
`arousal` is also the name of a steering control-vector axis in [`src/steering/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/steering). Three surfaces,
one idea, two names. None of the first two runs today (see **Affect state**).

### enrichment / the Enricher
The `mem` worker thread that drives steps ② – ⑧ over segments behind the `watermark`
([`src/mem/worker.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/worker.py)). Steps ① – ⑧ hold no writes at all — they return values, none opens a
transaction, and an exception anywhere leaves the mark where it was, so nothing partial is on
disk to reconcile. Durability comes from the watermark, not from a process boundary.
**Trap:** `mem.enrich: false` ships, for a measured VRAM reason rather than a doubt about the
organ: step ⑤'s 14B is 9.57 GiB beside a 9.69 GiB conversational model on a card with ~14.5 GiB
free, so loading it evicts all three production models and costs 8.8s on the next user turn
against ~1s of work ([`src/config.yaml`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml), [`docs/handoff/_FINDING-mem-enrich-vram-2026-08-22.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/handoff/_FINDING-mem-enrich-vram-2026-08-22.md)). Run it
as a batch under the GPU lease instead.

### entity
A thing talked about. In `mem` it is a `surface` row that the cue matcher can find; in the archived
AGE graph it was a `kind:'entity'` node minted by the resolver's LLM half and typed by the typer,
both deleted on 2026-10-04. Deliberately *not* what the self-node or a person node is: `self`,
`person`, `attr` and `value` all stayed out of entity co-occurrence.
**Trap:** the entity/fact line is unsettled. Roughly 34 of 78 graph nodes at the time were real
entities; the rest were roles, substances, derived compounds and events
([`docs/specs/v3/PLAN-writer-v2.md:161-163`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/PLAN-writer-v2.md#L161-L163)). Role nodes (`dad`, `sister`, `best friend`) are a
distinct class on purpose — speaker-relative, legitimately denoting different people over time,
and never duplicates awaiting a merge.

### Episode
A stretch of lived experience. In `mem` it is an `episode` row in L0, with its utterances as
`segment` rows; the writer opens a new one when the idle gap passes ([`src/mem/api.py:277`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/api.py#L277)). In the
design, Alto is *always* in an episode, including between interactions, because anticipation
creates charged experience with nowhere else to live ([`docs/memory/alto-felt-time-anticipation.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/memory/alto-felt-time-anticipation.md)).
The AGE-era `kind:'episode'` node, with its turns inline and chained by `episode_succession`, is
archived at tag `archive/age-brain-2026-10-11`.
**Trap:** every write-side measurement in this repo ran on a corpus of one utterance per episode.
Nothing in it tests cross-turn assembly.

### episode
A stretch of conversation bounded by an idle gap, kept as an `episode` row in `alto_mem`
([`src/mem/schema.sql:31`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/schema.sql#L31)) with its utterances as separate `segment` rows. `mem.append` rotates it
when the gap since the last segment exceeds `idle_gap_s` ([`src/mem/api.py:277`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/api.py#L277)), 600s by default
([`src/mem/api.py:72`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/api.py#L72)), set by `mem.idle_gap_seconds`.
**Trap:** at most **one** `mem` episode may be open, enforced by a partial unique index
(`one_open_episode`) rather than by a single-writer convention — the multi-open race is the
likeliest cause of mid-conversation episode splits, so the schema makes it unrepresentable.

### eval
A measured comparison with a verdict, usually judged. By repo convention an eval harness that
needs a GPU is a **script** named `*_eval.py`, never `test_*.py` — pytest collects on filename
and a module-scope `import torch` aborts the entire suite at collection, with a traceback that
names the missing import and never the file that caused it ([`CLAUDE.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/CLAUDE.md)).

### event extractor
Deleted 2026-10-04 (`writer_event_extractor.py`, off since 2026-08-15). It minted reified
`kind:'event'` nodes for life events (relocation, loss, relationship change); PLAN-writer-v2
phase 3 had planned to collapse it with the other extractors into one organ.

### Extractive
The Surfacer's framing, adopted 2026-06-29 in place of a compositional one: every clause of the
output must point at a verbatim or near-verbatim span already in the fragment. The model is quoting
and tense-shifting, not composing, so invention is structurally hard rather than forbidden by a list
of banned patterns ([`src/prompts/read/surfacer.py:6-17`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/prompts/read/surfacer.py#L6-L17)). [`src/alto/read/surfacing/verify/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/surfacing/verify)
re-derives the same check deterministically.
**Trap:** the current utterance is explicitly *not* source material. It says what the thought is
about; quoting from it is a confabulation, not a recall.

### Felt time
Duration as experienced rather than measured: felt duration is a function of event density and
attention, not elapsed seconds, so Alto should *not* reliably tell five empty minutes from ten — but
should easily tell five packed minutes from five empty ones. Clock time stays available as a
deliberate check, like glancing at a watch. [`docs/memory/alto-felt-time-anticipation.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/memory/alto-felt-time-anticipation.md); pillar 6.
**Trap:** reading a duration off a clock and calling it felt is the named failure. The distortion is
the honesty.

### fidelity
A per-line label — `agree | disagree | undecidable | unanchored` — comparing the line's polarity
against the polarity of the span it anchored to. Computed by step ⑦, stored on `line`, and
**read by nothing** ([`src/mem/fidelity.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/fidelity.py)).
**Trap:** it is an anchor-quality instrument carrying a content-quality name. 241 of 877 lines
flagged, and the flag rate rises with span length, so a `disagree` is more often evidence that
⑥ picked a loose window than that ⑤ dropped a negation. An earlier version multiplied
`content_w` by 0.1 on a flag, which systematically buried the longest and most content-bearing
quarter of the corpus — under a mechanism named after honesty. Do not wire a consumer to it
without a measured relationship between the label and an outcome. And do not quote "zero
disagree at exact" as a fabrication rate; it is not one.

### frozen eval
An eval whose content, cues and judging rubric are fixed before the change under test, so a
later run measures the change rather than the eval. Pillar 7 ([`PILLARS.md`](PILLARS.md)).
**Trap:** freezing does not make a number comparable across a prompt edit. After a one-token
prompt change, 19 of 34 renders changed text including rows with no relationship to the change —
any ±1 delta across that boundary is churn, not effect
([`docs/CHECKS-measurement.md:36-38`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/CHECKS-measurement.md#L36-L38)).

### GPU lease
The mutex that serializes anything loading a model:
`python src/scripts/agent_lease.py acquire gpu --holder <label> --wait <sec> -- <command>`.
One GPU means a mutex, not a slot allocator — `CUDA_VISIBLE_DEVICES` slotting has nothing to
hand out, and VRAM is the contended resource. Exit 75 means the lease never came free: a clean
"did not run", not a failure. [`src/scripts/agent_lease.py:1-25`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/scripts/agent_lease.py#L1-L25).
**Trap:** a second 14B load while the first is resident is how a driver segfault killed an eval
mid-run. Also: unload after testing (`ollama stop <model>`, verify with `/api/ps`) — a pinned
keep-alive does not expire on its own.

### graph cache / the shared read layer
The designed in-memory mirror of the graph: one bulk read, then read-only adjacency, degree and
property accessors over an immutable snapshot swapped atomically, so a spread in flight sees one
consistent graph. The motivation was measured: a store-backed reader paid a fresh connection per
hop against a VM-hosted Postgres, seconds for a graph that fits trivially in RAM.
**Trap:** the AGE-graph implementation (`graph_cache`, `reader_cache`) is archived at tag
`archive/age-brain-2026-10-11` and nothing replaces it. The Surfacer reads `mem` through
`MemSurfacerStore` ([`src/mem/surfacer_store.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/surfacer_store.py)), not through a cache layer.

### GroundedPercept
The structured output intake, the deleted LLM perceptual front-end, produced: speaker, content,
modality and named refs. Nothing live has built one since 2026-10-04, and the type was deleted
with the surfacer's percept entry point; production hands every organ a `Heard` (the raw
`Utterance`, nothing interpreted, [`src/alto/perception/heard.py:30`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/perception/heard.py#L30)). `mem` step ② still reads
the refs of older segments that carry one, as JSON ([`src/mem/refs.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/refs.py)).
**Trap:** three `EntityRef` field names actively mislead. `kind` is a *resolution status*, not a
type label, and `resolved` fires only when an anaphor matched intake's own rolling buffer — so
every proper name, brand, device and place is `unknown` **by construction**. `resolved_id` is a
**name string, not an id**; anything treating it as a key silently matches nothing. And
`extraction_confidence` is per extraction, not per ref, so no per-candidate threshold design is
available.

### Hot path
During a turn, while someone is waiting. Budget is milliseconds because it is *felt*, and the
failure rule is never block — degrade, don't crash. The standing architectural rule that follows:
**the hot loop never writes durable structure**.

### Idle tick
The between-turn trigger that fires one un-cued intrusion per idle window: a daemon thread watches
the idle signal and runs affect-seed → spread → surface → verify. It is the designed shape of
between-turn cognition (pillar 1), and the roadmap rebuilds it on `mem`. The AGE-era
implementation is archived at tag `archive/age-brain-2026-10-11`; nothing runs between turns today.
**Trap:** it was observational by design — it never threaded its thought into conversation
context, because that risks the amnesiac spiral — and it mostly rendered nothing: in October 2026
it found no affect-charged seed on 417 of 417 ticks, because nothing minted charge. Sparsity was the
design; *permanent* sparsity was the producer being off.

### Intake
In the design, the single point of faithful interpretation: raw symbols in, a grounded percept out —
who spoke, what was said, whether it was stated or asked or commanded, what it referred to, how clean
the transcription was — **without inferring past the evidence**. The LLM organ that did this
(the `alto-intake-v1` LoRA) was **deleted on 2026-10-04**: every consumer now reads the raw
utterance [`src/alto/perception/heard.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/perception/heard.py) records, with no model call and no interpretation. See
[organs/intake.md](organs/intake.md).
**Trap (rename):** before 2026-06-24, `intake.py` was the writer's episode recorder, now archived at
tag `archive/age-brain-2026-10-11`. Old docs and commit messages saying "intake" often mean that
recorder. The mem producer value `"intake"` is the same kind of leftover
([`src/alto/read/mem_bridge.py:294-297`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/mem_bridge.py#L294-L297)).

### Integration
The one conscious locus — where Alto reasons, weighs what surfaced, decides and intends. It consumes
a stream of first-person thoughts from the Surfacer, is steered by the Subconscious, and emits intentions
downward. The defining constraint: **it sees thoughts, never machinery.**
[`organs/integration.md`](organs/integration.md).
**Trap:** three different things wear this name. **Integration the organ** runs today — it is the
fine-tuned model producing every reply. **The integration layer** is the keystone curation layer,
and *that* is what [`docs/ARCHITECTURE.md:99`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/ARCHITECTURE.md#L99) means by "does not exist as code" — do not read it as the
organ being absent. A third sense, the `alto/integration/` package that held one bundle curation
filter, was deleted 2026-10-04. Because the layer is missing, Integration is
**exposed** — it receives per-turn directives and assembled context rather than only thoughts, which
is the gap `SPEC-integration-stream-of-consciousness` targets.

### Integration-MVP
The 2026-06-30 decision ([`docs/specs/v1/SPEC-integration-mvp.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v1/SPEC-integration-mvp.md)) that strips the conversational
call to pure consciousness: **no system prompt, no tools**, with a marking LoRA splitting output into
thought / speech / action channels and surfaced thoughts threaded into history via `record_thought`.
Its accepted regression is named in the spec: HA control, project queries and web search all break
from the conversational path until the action organ lands.
**Trap:** the spec writes the channels as `⟦say⟧` / `⟦act⟧`; the shipped runtime uses `¦` and `¤`.
Same design, different glyphs.

### Interoception
The affective special case of the Surfacer: live affect state rendered *up* into a felt-sense thought
("something's off"). It is **graph-blind and pre-causal** by design — it renders the state and never
looks up why, because attribution is Integration's conscious work and may honestly be wrong.
[`docs/systems/alto-affect-routing.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/systems/alto-affect-routing.md). Designed; no code.
**Trap:** it is the missing bridge between the Subconscious and the Surfacer, which is part of why
those two organs blur together today.

### Intrusion (thought)
A thought that arrives unbidden — memory doing something *to* Alto rather than Alto querying. The
Surfacer emits one thought string per call, which reaches Integration by being appended to the
rolling turn buffer as an assistant-role event (`context.record_thought`,
[`src/alto/runtime/context.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/runtime/context.py)), never as a field in a prompt.
**Trap:** when it lands has two answers. The persisted buffer is next-turn (`context.record` flushes
pending thoughts after the turn's own events). A second ephemeral seam, `pending_thoughts()` +
`with_surfaced_thoughts` ([`src/alto/runtime/alto.py:242`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/runtime/alto.py#L242)), appends to the in-flight call's history,
so a thought rendering inside the 10s surfacer wait grounds the very turn that produced it. Check
the consumer's accessor, not the wait. The event stream has no `intrusion` kind; a surfaced thought
is a `thought` event.

### L0
The testimony layer in `alto_mem` — the raw record of what was said. It is **the only precious
layer**: every derived layer is a pure function of L0 and is rebuildable, so the build discipline
protects L0 and nothing else ([`src/mem/__init__.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/__init__.py)).

### L0 / L1
The two named layers in `alto_mem`. **L0** is `episode` + `segment` — testimony, what was
actually said. **L1** is `surface`, `line` and `mention` — what a model extracted from it.
Episode-close artefacts (`binding`, `cooccurrence`) and the projection sit below both. Headers
are in [`src/mem/schema.sql:23`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/schema.sql#L23), `:103`, `:235`.

### line
One claim step ⑤'s 14B extracted from a segment, in plain English, with a `modality`, an
optional anchored span back into the segment text, a `fidelity` label, a `polarity` and its
`content_tokens`. [`src/mem/schema.sql:179-212`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/schema.sql#L179-L212).
**Trap:** a line carries **text and modality only** — no subject, no predicate, no relation
word. The `line` table has no relation column; the nine-predicate allowlist belonged to the
archived AGE-graph relation organ. Also: there is **no unique index**, deliberately. TX2
deletes by `(segment_id, prompt_ver)` and reinserts, because no key over model-produced content
converges on replay — a non-deterministic 14B returns slightly different text, `ordinal` moves
if the count changes, a text hash inserts the near-duplicate as a new row, and keying on the
span collapses two real claims that share a clause, which ⑤ produces by design.

### live recorder
The concurrent, off-the-hot-path half of the Writer: records that an episode is happening,
stamps its date, captures what was perceived, computes that episode's *immediate* valence. Live
so recent memory does not lag experience. Today the recorder is `mem`, fed by
[`src/alto/read/mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/mem_bridge.py) (`observe_user_utterance`, `observe_turn_complete`), and it is
**on** (`mem.enabled`); it records testimony and computes no valence. The other timescale is the
consolidator.
**Trap:** "live recorder" and "`live` test" and "live brain" share a word and share nothing
else.

### `live` tests
Tests marked `@pytest.mark.live` because they need Postgres. [`pyproject.toml`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/pyproject.toml) sets
`addopts = "-q -m 'not live'"`, so a bare `pytest` — the one CI runs — **deselects every test
that touches the database**.
**Trap:** a green CI badge is evidence about ruff and the pure-function layer, and about nothing
else. Every transactional property in the writer — the watermark discipline, TX2's
delete-and-reinsert, TX3, the episode-close readiness gate, the spool drain's store semantics —
is proven on one machine and nowhere else. Whole `mem` test modules carry a module-level
`pytestmark` and are entirely absent from CI. A change under [`src/mem/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem) that touches the store
is not done until `pytest -m live` has been run locally and its result stated. Read the current
counts off pytest's own summary line, never off a doc.

### LoRA
A small trained adapter over the shared base (Qwen2.5). The runtime is one or two resident base
models plus swappable adapters at the transform boundaries, not one full model per organ. Training
is an episodic cost; inference stays local. Shipped adapters: `alto-integration-v6` (the
conversational model, [`config.yaml:85`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml#L85)). `alto-intake-v1` was served until 2026-10-04, when the
intake organ was deleted; its files are kept, unserved ([`config.yaml:92-95`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml#L92-L95)).
**Trap:** `alto-surfacer-14b` is **not** a fine-tune — it is a re-tag of stock Qwen-14B with no
adapter. No surfacer fine-tune has ever been trained. Never credit a result to "the surfacer
fine-tune."

### Marker spans (`¦` and `¤`)
The code's name for the **commitment characters** — see that entry, which is the primary one.
[`markers.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/runtime/markers.py) is a three-state streaming machine with recovery transitions, so a malformed reply
still produces something. `integration.marker_filter` is `true` as shipped ([`config.yaml:240`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml#L240)) and
defaults to `false` in code.
**Trap:** `marker_filter` must be **false** if you point `ollama.model` at a stock non-LoRA model.
The filter starts in the discard state, so a model that emits no `¦` produces zero speech and Alto
goes completely silent — a config mismatch that looks like a broken pipeline.

### measure-don't-assert
The habit of producing the number rather than reasoning to it. Pillar 7's shorthand
([`CLAUDE.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/CLAUDE.md), [`PILLARS.md`](PILLARS.md)); named at the code site in
[`src/config.yaml:358`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml#L358), where `mem.read.top_n` carries the sweep behind its value and its conditions.
**Trap:** the canonical instance is arithmetic wearing a measurement's clothes — "a 3-candidate
turn lands near 15s" blocked an organ for weeks; measured, it was max one verifier call per turn
at 1.1–2.2s wall ([`docs/CHECKS-measurement.md:106-109`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/CHECKS-measurement.md#L106-L109)). If the verb is "computed" rather than
"observed", it is an estimate; label it one.

### mem
The writer's own store: the [`src/mem/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem) package (its own `__init__.py` map) plus the `alto_mem`
database. Built against `SPEC-writer-build_14`. It turns what was said into testimony and then
into retrievable statements, and it is explicitly **not** the consolidator — nothing in it
promotes a belief, merges a referent or summarises an episode.
**Trap:** the old shorthand "shadow mode, write side only" is out of date. `mem.read.enabled` went
`true` on 2026-09-22 ([`src/config.yaml:331`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml#L331)), and [`src/alto/read/mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/mem_bridge.py) — the only
module in [`alto/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto) that imports `mem`, enforced by `docs_check` — records each heard utterance and
finished turn into `mem` and builds the two read providers for the Surfacer: its store
(`MemSurfacerStore`, `build_surfacer_store`) and `MemRecall` (`build_surfacer_recall`). What `mem` writes can reach a reply.
The enricher is a separate matter: `mem.enrich` ships `false`, so lines are derived only when
someone runs the enrichment batch.

### `mem` / `alto_mem`
The Writer's own store — a separate Postgres database and the package under [`src/mem/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem), built to
SPEC-writer-build_14. It is the only memory store and the only recorder; the AGE graph in `alto_dev`
is archived. The only module in [`alto/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto) that imports it is [`src/alto/read/mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/mem_bridge.py), which is
how "nothing else reaches into mem" is enforced rather than asserted.
**Trap:** older documents call it write-only in shadow mode. That stopped being true on 2026-09-22 —
see the entry for `mem`.

### mention
Two things, one word. In `alto_mem`, a **`mention` row** links a segment (and usually a line) to a
surface ([`src/mem/schema.sql:214`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/schema.sql#L214)). In the archived AGE graph, a **`mentions` edge** linked an
episode to an entity.
**Trap:** the AGE `mentions` edge had no writer after the writer-resolver's LLM half was deleted
(2026-10-04), so documents describing the reader or the idle tick starving for mention edges
describe the archived graph. The `mem` table is unaffected and keeps filling.

### Mention edge
The AGE-graph edge that said *this episode mentioned this entity*, the payload the read side ran on:
hop-1 was the episodes that mention a thing, hop-2 the other entities those episodes mention.
Archived at tag `archive/age-brain-2026-10-11`; the `mem` equivalent is the `mention` table.
**Trap:** its only writer, the resolver's LLM half, was deleted 2026-10-04, so the reader returned
nothing and the idle tick found nothing to spread. That was one starvation, not three bugs.

### Modality
Intake's grammatical classification of an utterance. The code enum is five closed values —
`stated`, `asked`, `command`, `observed`, `expressed`. Since intake was deleted
(2026-10-04) nothing live assigns one, and nothing replaced it: the grammar-rule features that
briefly stood in for it (`is_question` / `is_asking` / `is_pure_question`) were removed in
October 2026, so no organ gates on what kind of utterance it heard. Promoting or demoting between modalities was classification, not inference.
**Trap:** [`docs/README.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/README.md) (and the onboarding intake page quoting it) describes modality as
"*stated* vs *fact*". **"fact" is not a modality value in the code** and never has been. Read the
enum, not the prose. Separately, `observed → stated` is the documented prompt-resistant "modality
wall" the intake LoRA was trained to break.

### mood-blind
The Writer's firewall: it reads **graph-affect** freely — prior valences, standing affect,
because computing an episode's valence is its job — but never takes the **live subconscious
mood** as an input to what it records. The rule is architecture-revisions §3. The module that
carried it is archived at tag `archive/age-brain-2026-10-11`; `mem` records testimony and takes
no mood input.
**Trap:** it is current-mood-*blindness*, not affect-neutrality. Alto irritated now does not get
to bend the facts; Alto computing that an episode felt bad is the organ working. The subconscious
legitimately gates *whether and how much* is worth writing; the Writer alone controls *what*.

### Observatory
A window over the **session event stream**: one process on one port (`service.observatory`, off by
default) that tails `runtime/<session>.jsonl`, the ordered record of what a session did — heard,
percept, thought, speech, action, turn_end — each with a monotonic `seq`. It exists
because the older logs could only be re-ordered by joining on the thought's text.
[`src/alto/runtime/observe/eventstream.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/runtime/observe/eventstream.py).
**Trap:** `turn: null` is not a missing value; it means the event happened between turns, such as
a thought that landed after its own turn closed. The stream does not replace the forensic logs —
they keep the large prompt payloads.

### Organ
The unit of architecture here: one narrow job, one band, one place in the map. The organ language is
a deliberate cognitive-architecture analogy, not decoration — but the canonical list is
[`THE-ORGANS.md`](THE-ORGANS.md), and an organ is not the same as a module.
**Trap:** "built" on an organ page usually means "built and switched off." Much of the system exists
behind a config flag that ships `false`; check the flags named on the page rather than inferring
liveness from a module's existence.

### Percept
In the design, what perception emits per utterance and fans out in parallel to three peers that do
not gate each other — the Subconscious (to feel), Integration (to attend), and the Writer's live
recorder (to persist). Today it is a `Heard` (see **GroundedPercept** for the intake-era type); the
event stream still calls its record `percept`.
**Trap:** the fan-out is serial today. `Alto._perceive` runs inline between STT and the
conversational LLM and takes one *completed* utterance — the hard batch boundary the design rules
out. Two of the three designed consumers are unbuilt, so parallelising it now would buy latency,
not the twitch path.

### Perception
The only organ that touches the physical world, and deliberately the stupidest: it converts signal to
raw symbols and knows nothing else. Not what an entity is, not that a graph exists, not that Alto
exists. [`audio.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/runtime/voice/audio.py) and [`stt.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/runtime/voice/stt.py) turn sound into text; [`src/alto/perception/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/perception) wraps the transcript in
a `Heard` (the raw utterance, its speaker and when it was heard), with no model call and no
interpretation.
**Trap:** the designed **perception envelope** — `{modality, content, confidence, timestamp,
metadata}`, uniform across senses — does not exist in code. `transcribe` returns a bare `str` and
Whisper's info object is discarded. The interface is missing, not just the extra modules.

### picture / the episode-close picture pass
The decided replacement for the per-turn LLM cold path: instead of resolving entities turn by
turn, read the whole episode once at close and produce a picture of it. Recorded as a decision
in [`src/config.yaml`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml) (2026-08-15) and shaped by
[`docs/specs/v3/SPEC-episode-account.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/SPEC-episode-account.md) after
[`docs/specs/v3/DECISION-picture-shape-and-felt-state.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/DECISION-picture-shape-and-felt-state.md) found the claim/triple form wrong.
**Trap:** the picture is a set of per-referent **accounts**, not a list of claims. The triple
form failed on things a better binder cannot rescue — an exclusion ("Not the bright ones")
became an entity, a claim got built on the wrong nucleus, and a comparative stance had no slot
at all. The AGE-era write-side passes that implemented it are archived at tag
`archive/age-brain-2026-10-11`; the design stands and nothing builds it on `mem` yet.

### Pillar
One of the nine numbered commitments in [`CLAUDE.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/CLAUDE.md), explained in [`PILLARS.md`](PILLARS.md). A
design that violates a pillar is wrong even if it passes tests; surface the conflict rather than
shipping around it.
**Trap:** the numbers are an interface — code cites `pillar 9` and `pillar 3` by number in module
docstrings, 62 citations in all. Never renumber them; a retired pillar leaves a tombstone.

### polarity
The sign of a claim: `'+'`, `'-'`, or `NULL` for undecidable. One implementation, `sign()` in
[`src/mem/polarity.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/polarity.py), which delegates to `_assertion_polarity` in the same file (moved there
from the deleted relation organ, 2026-10-05) rather than restating it.
**Trap:** a span holding both a clause boundary and a negator returns `None`, because which
clause a negator scopes is not something a regex can decide (measured: 2 of 20 edges written
with an inverted sign). The two organs diverged deliberately — the deleted relator **dropped** the
proposal, because an edge with a guessed sign says the opposite of the utterance and leaves
nothing to revise; `mem` stores `polarity = NULL` and **keeps the line**, because the line
carries its own text and dropping would discard testimony to protect a label.

### preflight
`python src/scripts/agent_lease.py preflight --agent <label>` — run before any sim, eval or
DB-backed run, with its table pasted into the run log. It resolves the database name **and where
it came from** (`resolve_db_provenance`, [`src/scripts/agent_lease.py:302`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/scripts/agent_lease.py#L302)).
**Trap:** the row that matters is `db.OVERRIDE` ([`src/scripts/agent_lease.py:351`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/scripts/agent_lease.py#L351)) — it means `ALTO_MEM_DB_NAME`
is silently redirecting the run, which has already happened once and invalidated a launch. A
discipline that depends on remembering to run a command is one that gets skipped on the run that
mattered, which is why `SpikeRun.start()` does it for you.

### probe
An exploratory harness that measures something without a pass/fail verdict. Named `*_probe.py`
by convention, never `test_*.py`, for the same collection reason as an eval.
**Trap:** probes are where the measurement failures in [`docs/CHECKS-measurement.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/CHECKS-measurement.md) cluster,
because a probe is exactly the thing that quietly differs from production. Every probe passed
`gate=None`, so the resolver's idle gate had never been exercised by any measurement ([#167](https://github.com/sawyerstrong/alto/pull/167)); one
constructed intake directly instead of through `_build_intake_client` and measured the stock 3B
while production served a LoRA ([#159](https://github.com/sawyerstrong/alto/pull/159)); the relator probe force-enabled the flag it was testing, so
no probe run could prove the config path. Name the production seam and confirm the harness goes
through it.

### Processing
The organ Alto uses to work something out: Integration hands a problem down, waits, and gets a
*conclusion* back — never a transcript of a subordinate model's reasoning, which is what keeps the
conscious-locus frame intact. Anything durable it discovers is designed to re-enter through Intake (deleted in code; see **Intake**), tagged
*inherited* so provenance survives. Build order Stage 6.
**Trap:** only the `web_search` seam exists, and it is not wired — the tool is never registered, so
the model is never told it exists. Nothing about Processing is measured because nothing about it
runs; treat any number in this repo about "processing" as being about something else.

### producer
The stamp recording *which organ* wrote a given edge or segment. Shipped on
`writer/producer-provenance`; also a NOT NULL column on `segment` ([`src/mem/schema.sql:78`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/schema.sql#L78)).
**Trap:** it exists because a log counter counts *attempts* per organ and cannot attribute a
*surviving* edge. When the stamp landed it reversed an inference recorded the same day: the
counters said most relations came from the deterministic detectors, the stamp said all five
relation edges across 150 episodes came from the LLM arm — which is off in production
([`docs/specs/v3/PLAN-writer-v2.md:77-98`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/PLAN-writer-v2.md#L77-L98)).

### projection
[`src/mem/projection.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/projection.py) — §17's whole-store read that computes every corpus-derived number
(degree, conductance, content weight) and writes nothing. Reads only, never raises.
**Trap:** it is a whole-store rebuild, not incremental, for the same reason as TX3 — an
incremental projection needs exactly the reconciliation this design keeps deleting. On any
failure it keeps the previous generation and counts it: a stale snapshot is a correct snapshot
of an earlier moment, a partial one is not a snapshot of anything.

### Reader (L3)
A client of the shared read layer that, given a cue, gathered the typed neighbourhood, scored each
candidate fact and returned a ranked `FactRecord` list, rendered as a `[What Alto knows about X]`
block into Integration's context. It shipped dark (`integration.reader_enabled: false`) and was
**removed 2026-10-01**: the Surfacer is the only channel by which memory reaches a reply (pillar 5).
**Trap:** older docs, specs and handoffs still cite `reader.py`, `what_alto_knows` and the block as
current — they are dated records. "Reader" in [`mem/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem) (`mem.read`, the belief reader) is a different
thing and is live.

### referent_class
How a surface's identity is scoped: `referential` (a name — unique globally), `episode_local` (a
generic definite like "the car" — unique only within its episode), or `deictic`.
[`src/mem/schema.sql:105-129`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/schema.sql#L105-L129).
**Trap:** the key is conditional, so it takes **two** partial unique indexes that cannot be
merged (`ON CONFLICT` must name one index). And the original rule that an `episode_local`
surface is never cue-matchable was **replaced** by "matchable, returned grouped by episode"
(decision D-B, 2026-08-20) — 57% of real intake candidates land in `episode_local`, and 31% of
those carry a norm that recurs across episodes. `knowledge()` returning several episodes' worth
of "the PR" is a *correct* result; the episode stamp is what makes it safe.

### Registry
The device registry in [`config.yaml`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml) (`entities:`) — the source of truth the guard trusts over the
model. `DeviceRegistry.resolve` accepts an exact id, an alias, a friendly name or a bare object id,
and returns `None` otherwise, which ends the call.
**Trap:** "the executor proposes, the registry disposes." A new capability is added by extending the
registry, never by trusting the model's `entity_id`.

### relation extractor
Deleted 2026-10-04 (`writer_relation_extractor.py`, off since 2026-08-15). It proposed typed
relation edges between entities from an encyclopedic predicate allowlist, and could not write
without the entity nodes only the resolver's LLM half minted.
**Trap:** in its old measurements, a preferences corpus produced 0 proposals and the organ was
fine — its allowlist was encyclopedic ([`docs/CHECKS-measurement.md:57-59`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/CHECKS-measurement.md#L57-L59)). A zero there is
ambiguous between "did not happen" and "could not happen".

### relator
Deleted 2026-10-05 (`writer_relator.py`, OpenSpec change `remove-grammar-rules`; its LLM arm went
earlier the same day). It wrote typed edges and attributes to the AGE graph from English phrase
detectors: "I like/hate X" preferences, own and third-party birthdays, "you work for me". Nothing on
the normal path read them; stated facts now reach memory only as `mem` lines, which step 5 writes
and `mem.enrich` is off, so until a batch runs a stated fact exists only as raw testimony.
**Trap:** it was promoted on a 0-fabrication gate, but the detectors wrote almost nothing across 150
stamped episodes, and a 0-fabrication rate over 0 writes is trivially satisfied
([`docs/specs/v3/PLAN-writer-v2.md:88-94`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/PLAN-writer-v2.md#L88-L94)). Its negation-scope helper lives on in
[`src/mem/polarity.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/polarity.py).

### Renderer (the organ) / Voice
The thing that talks, and today a shell: Integration writes the words and marks the speech, and the
Renderer picks those spans up — marker filter, sentence chunking, TTS — and says them. The design
was larger: bundle plus steering in, speech out, with four commitments that make it honest rather
than good — stateless (a renderer that remembered would be a second mind), unable to fake interior
(delete the bundle and there is nothing to render), affect arriving as a **dimensional value, never a
named feeling** (`energy: 0.2`, not "tired", because knowing the name is what makes a model perform
the name), and affect reaching it only by twitch and steering, never as content. The owner has set that
design aside (2026-09-30) until there is a tone organ to need it.
**Trap:** "renderer" is heavily overloaded. Three layers were once all called renderer, and only this
one kept the word. The Surfacer's render step ([`render_verified.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/surfacing/render_verified.py)) is a different thing. The
**absence renderer** is a third. And today's Renderer is collapsed into the
same model that does Integration's reasoning, so it is not stateless in the designed sense — a
choice now, not a gap, because the organ the design described is not being built.

### repairability over precision
Pillar 9. Alto misunderstanding is not the failure; being unable to **revise** that
understanding is. Bias toward capture: an imperfect edge that can later be corrected beats a
missing one, and a precision gate that DROPS rather than records is the anti-pattern. Measured
trigger: 730 simulated episodes → 953 mentions, 0 relations; a blind gold standard → 0 of ~30
durable facts captured.
**Trap:** the line it does not cross. This licenses imperfect capture of what was **actually
said**. It never licenses inventing what was not — that is pillar 3, a different failure. "Heard
it and filed it imperfectly" is fine; "never heard it and asserted it" is the enemy. And it
applies to the **write** side only; do not use it to relax the surfacer's fabrication guards,
because a false memory Alto narrates is far harder to correct than a wrong edge in a graph.

### resolver
Two organs shared the job title. **`writer_resolver.py`** is deleted: its entity-binding LLM half
on 2026-10-04 with its `resolver_enabled` flag, its eager self-schema learners (self name,
speaker name, self-type, creation event, the `addressed` edge) on 2026-10-05. **`mem`'s Ⓐ**
([`src/mem/corefer.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/corefer.py)) binds pronouns to surfaces at episode close, writing `binding` rows.
**Trap:** nothing writes entity identity or self-schema to a graph any more. Alto's name comes from
[`src/mem/selfname.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/selfname.py). Separately, PLAN-writer-v2 replaces the LLM's identity adjudication entirely
with a deterministic canonical → alias → create-new cascade; the type gates (now `name_gates` and
siblings under [`src/mem/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem)) and their tests are v2's acceptance suite, which turns "rebuild" into
"port".

### retraction
A table in `alto_mem` marking a line as withdrawn, with a reason, a `by_whom` and a timestamp.
Empty in this build — no UI produces one — but present from day one and respected by **every**
read path ([`src/mem/schema.sql:293-303`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/schema.sql#L293-L303)).
**Trap:** it looks like dead code and is not. It is the substrate a correction mechanism stands
on, which is pillar 9's actual unblock. Deleting it because nothing writes to it removes the
only thing that makes a later correction possible.

### Salience
What deserves to be present. In the design it is a signal the Subconscious emits — "this mattered,
this is charged enough to bubble up" — which the Surfacer turns into a sentence. The salience render
that did this un-cued, from the idle tick, is archived at tag `archive/age-brain-2026-10-11`; the
roadmap rebuilds it on `mem`.
**Trap:** the Subconscious never emitted a live salience signal. The archived tick seeded from
charged *episode nodes* in the graph, not from a resolved affect state. `mem` has separate
**salience gates** (`worth_extracting`, `retrievable`, [`src/mem/salience.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/salience.py)) that decide what is
worth keeping; they are a different thing.

### segment
One utterance in `alto_mem`'s L0: un-prefixed text, an `axis` (`speaker | alto_reply |
alto_thought | action | external`), a speaker column, a producer-supplied `occurred_at`, and an
opaque `structured` record that is `None` on new segments
([`src/alto/read/mem_bridge.py:219`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/mem_bridge.py#L219)) and holds intake's percept on older ones.
[`src/mem/schema.sql:71-93`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/schema.sql#L71-L93).
**Trap:** `speaker` is a **column, never part of `text`** — a prefixed utterance is a bug, which
is why `strip_speaker_prefix` is part of the public API. `occurred_at` is producer-supplied and
never clock-read, while `line.created_at` is *extraction* time and never event time. And
`segment` here is not the same word as the picture pass's segments, which are the units of an
episode walk and assume nothing about a segment being a turn.

### Shadow mode
Built, running, and writing — with nothing reading the output. `mem` was the example until
2026-09-22, when its read path went on.

### Shared read / cache layer
One in-memory mirror of the graph, designed as first-class infrastructure with peer clients —
the Subconscious, the Writer (recorder and consolidator), and later dreaming. Integration's
retrieval, in the original design, is struck: Integration is not a client. Explicitly *shared read
infrastructure, not co-located components*, because their query profiles differ.
**Trap:** it does not exist as code. The AGE-era `graph_cache` and `reader_cache`, which had one
client (the idle tick), are archived at tag `archive/age-brain-2026-10-11`. `mem.read` is a
separate read path and does not read through this layer.

### sim
A simulated conversation run — many synthetic episodes pushed through the real organs to
measure what the write side captures. The measured triggers behind pillar 9 (730 episodes → 0
relations) came from one.
**Trap:** sim content must be authored **blind** — natural speech, never written to match a
detector's markers. Misses are the signal. Also, every write-side measurement to date ran on a
corpus of **one utterance per episode**, so no sim in the record tests cross-turn assembly, and
⑤'s lines are not reproducible run to run (18 of 507 segments differ across two builds on the
same 12 episodes) — read any harness delta against that noise floor.

### SpikeRun
`testkit.spikes.SpikeRun.start(label, agent=...)` — creates the run directory and writes
`preflight.txt` and `manifest.json` (with a top-level `db_override` flag) into it **before** the
caller does any work, reusing `agent_lease.build_preflight` rather than a second copy of the
logic. [`src/testkit/spikes.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/testkit/spikes.py).
**Trap:** it deliberately does **not** wrap `load_config` or `OllamaClient`. Hiding which model
a spike used behind a helper is the opposite of what [`docs/CHECKS-measurement.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/CHECKS-measurement.md) asks for.

### spool
The JSONL file a writer appends to when the database is unreachable, so the turn still succeeds
and the pipeline never fails because the DB is down. Drains on the next append, replaying events
in order with their original timestamps so a gap that elapsed during downtime still rotates the
episode correctly. `mem` spools to `~/.alto/mem_spool.jsonl`
(`DEFAULT_SPOOL_PATH`, [`src/mem/api.py:76`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/api.py#L76); replay in `drain`, [`src/mem/api.py:357`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/api.py#L357)).
**Trap:** older documents name `~/.alto/intake_spool.jsonl`, the archived AGE writer's spool, kept
from when that module was called `alto.intake`. No live code writes it.

### spread / spreading activation
Conductance-weighted activation pushed outward from seed nodes, where each node splits its decayed
budget across its out-edges in proportion to conductance. The AGE-graph implementation
(`spread`, over `GraphCache`) is archived at tag `archive/age-brain-2026-10-11`; the roadmap
rebuilds it on `mem`. See **Spreading activation** for the design.
**Trap:** spread is pillar 5's substrate and the **reader is explicitly the other thing**.
Conflating them is how a search box with a personality gets built. Also, the honesty gate is
structural: only `grounded` (and structurally-provenanced) edges conduct, so a node reachable
*only* through an inferred, dreamed or quarantined edge cannot become present at all.

### Spreading activation
The substrate pillar 5 names: activation flows outward from seed nodes, each node splitting its
outgoing activation across its edges **in proportion to each edge's conductance**, so an `is_a`
backbone edge transmits more than a weak co-occurrence edge. Bounded for a hot path (hop cap,
frontier cap, activation floor). Designed, and not running: no spread runs today, and the roadmap
rebuilds it on `mem`.
**Trap:** spreading activation existing is not pillar 5 being built. What is missing is the
*endogenous* source — something that generates activation continuously, independent of any query.

### Steering / valence steering
Affect reaching cognition as a **bias on activations** rather than as content a model reads: a
control vector added to the residual stream, so it moves the option space without ever being
performable. Integration is *moved and informed* (steering plus an interoceptive thought, because it
reasons); in the design the Renderer is *only moved* (steering, because it does not reason); the Renderer is a
shell now, and the steering that is built acts on Integration's own generation.
**Trap:** built and measured but not connected. Pillar 2 calls valence steering "only the renderer
half" of affect — and even that half is unwired.

### subconscious (the adjective)
Below the conscious line. Pillar 5 says "surfacing is subconscious and activation-driven" — meaning
involuntary and below awareness, not "produced by the Subconscious organ."
**Trap:** this is the sharpest word collision in the corpus. **The Surfacer is subconscious machinery
without being the Subconscious**, and an earlier diagram encouraged the conflation by drawing the
Subconscious as the Surfacer's only input. They are near-opposites: the Subconscious is continuous,
graph-forbidden, never reasons, and outputs numbers; the Surfacer is per-event, holds a store handle,
runs a model, and outputs first-person language.

### Subconscious (the organ)
Alto's endogenous state — mood, drive, felt duration, anticipation, energy — maintained on its own
clock whether or not anyone is talking. **It maintains and signals; it never reasons, decides,
routes, or queries the graph.** Graph access is forbidden by design, because reading the graph means
resolving entities and deciding relevance, which would smuggle a second conscious layer in through
the data-access door.
**Trap:** nothing is this loop today. The state-decay tick that stood in for it — one facet of
eight, two axes of four, no triggers — is archived at tag `archive/age-brain-2026-10-11`. The organ
is designed, and the roadmap rebuilds its affect state on `mem`.

### surface
A row in `alto_mem` for one way of referring to something: a normalised key, the raw text as
said, a `referent_class` and an optional episode scope ([`src/mem/schema.sql:111`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/schema.sql#L111)). Two singleton
surfaces — `__self__` and `__speaker__` — are minted at schema init with `first_seen_at = 0`,
because they precede all testimony; before those rows existed, 97 of 163 pronoun occurrences on
the first live episode resolved with certainty and bound to NULL.
**Trap:** step ④ **mints but never merges**. Exact key match resolves; anything else creates
new, because false-merge is catastrophic-silent-permanent and false-new is
cheap-visible-recoverable. Related trap: "surface" the noun and "surfacing" the pillar-5 verb
are unrelated. A surface is a string in a table; surfacing is an involuntary intrusion from the
subconscious.

### Surfacer
The upward transducer at the conscious boundary: sub-symbolic state — an activated memory, a felt
state, an anticipation — rendered into a first-person thought that arrives in Integration as
Integration's own. It exists so memory reaches the thinking layer in the medium a mind works in, a
thought, rather than the medium storage uses, a record; a mind that can watch its own retrieval is
not remembering, it is reading a briefing. One transducer, three sources.
[`src/alto/read/surfacing/surfacer.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/surfacing/surfacer.py); it reads `mem` only.
**The guardrail:** it renders **form, never content**. A record → "I remember arguing with Brendan in
March" is translation; the same record → "that awful fight where he was so unfair" invents the
framing. A false memory smeared onto a true record is worse than the record ever was.
**Trap:** the organ **never raises** — `safe_call` degrades any substrate error to `None`, and
`build_surfacer` returns a `_NoopSurfacer` whenever Ollama, the store or the self-node is
unavailable, so the pipeline can call it unconditionally. A fresh clone with no database gets the
Noop, silently and by design.

### Surfacing (vs retrieval)
Pillar 5, and the distinction a newcomer will assume away. **Surfacing** is an involuntary intrusion
from below — the subconscious feels a percept, activation crosses a threshold, and Integration finds
itself thinking of something it did not ask for. **Retrieval** is what a *reader* does: deliberate,
directed, in service of a question. If Alto only ever surfaces what something asked for, there is no
interior; there is a search box with a personality.
**Trap:** "what surfaced" ≠ "what a reader retrieved." Directed recall does survive — but as *an
intention to remember, serviced by invisible machinery*, never as Integration calling a database.
Keep that or the database sneaks back into consciousness through the "it can choose to retrieve"
door. Building a retrieval call and naming it surfacing is the named failure mode — and is close to
what ships: `Surfacer.surface_from_heard` matches the entities the raw utterance names and renders
their neighbourhoods, and offers only a self-absence render when it names nothing the store holds.

### Testimony
Something someone actually said, and the only thing identity may be built from. The self and the
first speaker accrete name, creator and type through testimony, each fact traceable to the moment it
was said (pillar 4). In `mem`, L0 is the testimony layer and the only precious one.
**Trap:** pillar 9 licenses imperfect capture of what was *actually said*; it never licenses
inventing what was not. "Heard it and filed it imperfectly" is fine; "never heard it and asserted it"
is pillar 3 and a different failure.

### testimony
What was actually said, recorded verbatim and attributed. L0 in `alto_mem` is testimony and
nothing else. It is also the mechanism of identity: the self and the first speaker accrete names
and facts by being **told**, never by being configured or trained.
**Trap:** this is the word that separates pillar 9 from pillar 3. Filing testimony imperfectly
is acceptable. Asserting something no testimony contains is not, whatever confidence the model
reports.

### The aux model
One shared small non-LoRA handle — `ollama.aux_model`, today `qwen2.5:3b-instruct`
([`src/config.yaml:86`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/config.yaml#L86)) — used by the surfacer's entity, belief and salience renders for `format=`-constrained JSON calls. It must co-reside in VRAM with the 14B
conversational model, which is why it is a 3B.
**Trap:** it is a *shared* slot, so pointing it at any specialised model corrupts every sibling's
JSON call. That is why the intake LoRA had its own `intake_model` handle until intake was deleted
on 2026-10-04 — and that third resident model was a measured cost, not a free one (intake ~820ms →
~2.7s warm).

### The brain
Three different things wear this word. (1) In [`docs/alto-four-organ-architecture.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/alto-four-organ-architecture.md), **the brain**
is the stateful self — graph plus affect plus integration plus continuity — with LLMs quarantined
to the edges as transducers. (2) The **live brain** is the hot tier of the shared read cache, over a
**deep store** that is complete but quiet ([`docs/README.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/README.md)). (3) The **project brain** — V1 Track A,
a typed Postgres layer of projects and blockers, with the `get_projects` voice tool — is archived at
tag `archive/age-brain-2026-10-11`.
**Trap:** "the brain DB" in practice meant the Postgres database `alto_dev`, now archived, not the
`mem` store.

### The four organs
This phrase names at least three different sets, and which one is meant depends entirely on the
document. (1) [`docs/alto-four-organ-architecture.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/alto-four-organ-architecture.md) — **Intake · Brain · Processing · Voice
(Renderer)**: LLMs quarantined to the edges around a stateful self. (2)
[`docs/roadmap/alto-build-order-v2.md:17`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/roadmap/alto-build-order-v2.md#L17) — **Intake → Integration layer → Processing → Renderer**:
the same shape with the integration layer in the brain's slot. (3) [`docs/ALTO-PROJECT-BRIEF.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/ALTO-PROJECT-BRIEF.md) §3 —
**Writer · Reader · Surfacer · Integration**: the four organs that actually exist in code over the
graph. [`docs/perception/alto-perception-layer.md:202`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/perception/alto-perception-layer.md#L202) then extends the list to five by putting
Perception in front, and [`docs/README.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/README.md) states the "four organs" headline is superseded by the
ingestion-path / conscious-locus structure, keeping organ language as a compatible lens.
**Trap:** [`THE-ORGANS.md`](THE-ORGANS.md) lists **eleven**. If a doc says "the four organs" without
naming them, check which set it means before mapping it onto anything.

### the gate (Definition of Done)
The five-step quality gate in [`CLAUDE.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/CLAUDE.md): ruff clean; [`tests/test_alto_v0.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/tests/test_alto_v0.py) **and** `pytest`
both pass; `pytest -m live`; [`docs_check.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/scripts/docs_check.py); and exercise the real pipeline path. Plus the five
measurement questions in [`docs/CHECKS-measurement.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/CHECKS-measurement.md) before quoting any number.
**Trap:** "gate" is overloaded in this repo. It also means the named **type gates** (`_looks_like_*`,
in `name_gates` / `phrase_gates` / `value_gates` under [`src/mem/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem)), `mem`'s two **salience gates**
(`worth_extracting` before ⑤, `retrievable` at read), and a spec's **hard gate** (an eval that must
pass before a capability ships). Nothing but context disambiguates them.
**Trap:** step 4 is the scratch-database live smoke ([`src/scripts/live_smoke.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/scripts/live_smoke.py)). It supplies
no HA token, so it does not exercise HA dispatch; use a real HA turn when the change touches
tool-calling.

### The guard
`validate_tool_call` ([`src/alto/action/ha.py:147`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/action/ha.py#L147)) — the deterministic safety boundary. It takes a proposed device
call, throws away most of what the model said, resolves the entity against the registry and checks
the service against the allowlist, and returns a validated tuple or `None`. The load-bearing line is
[`src/alto/action/ha.py:153`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/action/ha.py#L153): `domain = registry.domain_of(canonical)` — the model's `domain` argument is
*discarded*, not checked. `validate_state_query` ([`src/alto/action/ha.py:168`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/action/ha.py#L168)) is the read-only sibling; [`web.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/action/web.py)'s
`validate_search_query` is the outbound sibling, guarding what may leave rather than what may act.
There is exactly one `call_service` call site ([`src/alto/action/ha.py:294`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/action/ha.py#L294), called at [`src/alto/action/tool_dispatch.py:185`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/action/tool_dispatch.py#L185)).
**Trap:** the guard is complete, correct — and currently uncalled. The conversational model has no
tools, so say "turn on the lights" today and Alto talks about it rather than doing it. This is the
first thing to check before debugging anything device-shaped. Described on the Action organ page,
[`organs/action.md`](organs/action.md).

### The payload layer
Shorthand for the write-side output the read side needs — mention edges, typed relations, entity
neighbourhoods. When an organ page says the payload layer is "dark", it means the producers are off,
not that the consumer is broken. Fix it and several apparently independent organs light up at once,
which is also why measuring any of them in isolation tells you very little. On `mem` the payload is
derived lines, bindings and co-occurrence, and `mem.enrich` ships off.

### the precious layer
L0 — `episode` and `segment` — and nothing else. It is the only thing in `alto_mem` that cannot
be recomputed, so it is the only thing that must never be destroyed
([`src/mem/schema.sql:10-15`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/schema.sql#L10-L15)).
**Trap:** this is what buys TX2 the right to `DELETE` a segment's lines and reinsert them rather
than reconcile them (each replaced row is archived to `line_history` first, since 2026-09-14), and what makes a prompt change a `--rewind` plus one batch pass instead of
a migration. Neither salience gate ever touches L0; a skip is recorded with its reason and the
read path filters.

### The read side
Everything on the far side of the Writer: the Surfacer and the `mem` read path it uses, with
spreading activation and the other between-turn organs designed but not running. Contrast **the
write side** (what perception heard, turned into durable structure). The distinction matters for
pillar 9, which licenses generous capture on the write side and explicitly does not relax the
Surfacer's fabrication guards on the read side.

### The self-node
Alto's identity as a node rather than a persona in a prompt. In `mem` it is the `__self__`
singleton surface, minted at schema init, and `MemSurfacerStore.get_self_node`
([`src/mem/surfacer_store.py:264`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/surfacer_store.py#L264)) hands it to the Surfacer as its POV anchor; the Surfacer refuses
to construct without one. Its name is never stored: [`src/mem/selfname.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/selfname.py) derives it from testimony.
Learned facts were attached in the archived AGE graph as separate attribute nodes under five typed
slots (`identity`, `architecture`, `belief`, `norm`, `preference`); nothing writes them now.
**Trap:** the self may be seeded bare because it is constitutive; the *speaker* may not, because
asserting a user exists before anyone has spoken is an unearned claim. `__speaker__` is likewise a
nameless referent that earns its name by testimony, so every fact attached while nameless stays
attached.

### the self-node
The self as a graph node that **boots empty** — Alto does not know its own name until told — and
accretes name, creator and type through testimony, each fact traceable to the moment it was said
(pillar 4). Today that is the `__self__` surface in `mem`; the AGE `kind:'self'` node and its
`self_attr` nodes are archived at tag `archive/age-brain-2026-10-11`.
**Trap:** it is the *replacement* for a system prompt, not a competitor to one — the
conversational call has an empty system prompt by design, so identity reaches behaviour through
the Surfacer's POV anchor or not at all. Alto's name comes from [`src/mem/selfname.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/selfname.py), which
**derives** it from testimony and stores nothing — a `mem.self_name` config key would be the trained
self-description pillar 4 rules out, just filed somewhere that looks like ops.

### The spool
The recorder's DB-down safety net: if a store call raises, the event is written to JSONL and the
turn still succeeds, so the pipeline never fails because the database is down. See **spool**; the
file is `~/.alto/mem_spool.jsonl`.

### The write side
Everything that turns what was heard into durable structure — `mem`, fed by
[`src/alto/read/mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/mem_bridge.py) (intake, the resolver's LLM half and the extractors were deleted on
2026-10-04; the resolver's learners and the relator on 2026-10-05; the AGE-graph writer was
archived with the graph). Governed by pillar 9: bias toward capture, because an
imperfect edge that can later be corrected beats a missing one, and a precision gate that DROPS
rather than records is the anti-pattern.
**Trap:** the line pillar 9 does not cross is on this side too. An inverted relation sign is not an
imprecise capture — it says the opposite of the utterance, so there is nothing to revise later. It is
a confident falsehood that looks exactly like a fact, and the relator's `_assertion_polarity` (now
[`src/mem/polarity.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/polarity.py)) returned None rather than guess.

### the writer
Three things, and the corpus uses all three.

1. **The Writer organ** — the whole cold path that turns the now into the past: live recorder
   plus consolidator ([`organs/writer.md`](organs/writer.md)). In code today it is [`src/alto/read/mem_bridge.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/alto/read/mem_bridge.py)
   and [`src/mem/`](https://github.com/sawyerstrong/alto/tree/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem).
2. **The AGE-graph recorder** — the module that did episode segmentation and the `kind:'episode'`
   node write. It was named `alto.intake` until 2026-06-24, and is archived at tag
   `archive/age-brain-2026-10-11`.
3. **`mem`'s writer** — SPEC-writer-build_14's subject, which [`src/mem/__init__.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/__init__.py) calls "the
   recorder half of the cold path". Segments → lines, in its own database.
**Trap:** "Writer v2" ([`docs/specs/v3/PLAN-writer-v2.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/PLAN-writer-v2.md)) means sense (1) minus (2): it replaces
the resolver's identity adjudication and collapses the three extractors (all deleted on
2026-10-04 while v2 was still unbuilt), and states explicitly that intake and the
writer/recorder are **not** touched. A doc predating 2026-06-24 that says "intake" almost
certainly means (2).

### tier
Edge provenance in the AGE graph design: `grounded`, `inferred`, `dreamed`, `quarantined`. The
spread's honesty gate reused the store's default-read tiers rather than defining a new set. Both are
archived at tag `archive/age-brain-2026-10-11`; the tiers survive as design in the specs.
**Trap:** unrelated to "memory tiers" (live brain / deep store) and to the self-node spec's
three payoff tiers. Same word, three scales.

### Track A / Track B
Two parallel build tracks. **Track A** is organ-first construction (in V1, the project brain).
**Track B** is the validation track — harness, gating experiments, blind judges, medium-continuity
arc tests — and also the Claude Code integration. The project brain and the Claude Code integration
are both archived at tag `archive/age-brain-2026-10-11`. The development exit gate needs both
tracks. Per the judge-before-adapter rule, a Track-B judge is a prerequisite for the LoRA it
gates.

### Transducer
A model confined to a narrow translation at an edge, never the seat of the self. The Surfacer and — in
the design — the Renderer are the transducers (Intake was one until it was deleted on 2026-10-04); the point of quarantining them is
that the self is sealed behind them and therefore cannot be a performance.

### Twitch (the flinch)
The reflex route for affect: raw state straight to the Renderer, bypassing Integration, so a fast
reaction can fill the beat before deliberation finishes. One of three affect routes alongside
steering and the introspective felt-sense thought ([`docs/systems/alto-affect-routing.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/systems/alto-affect-routing.md); the timing
is [`alto-reaction-timing.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/systems/alto-reaction-timing.md)'s "flinch and settle"). Designed; unbuilt, and with the Renderer a shell nothing is there to receive it.
**Trap:** the twitch path is why the designed Intake must fan out in parallel (today `hear` is serial and model-free) — a reflex has to be able to fire
before deliberation finishes, so a hard batch boundary at Intake contradicts it.

### TX2 / TX3
The two write transactions in `mem`. **TX2** commits one segment's enrichment — it archives that
segment's lines and their mentions to `line_history` and `mention_history`, deletes them by
`(segment_id, prompt_ver)`, reinserts, and advances the `watermark` in the same commit. **TX3**
commits one closed episode's bindings and co-occurrence — archiving the ones it replaces to
`binding_history` and `cooccurrence_history` — and advances `watermark_episode`.
[`src/mem/commit.py`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/commit.py).
**Trap:** delete-and-reinsert is the design, not a shortcut. It is what the precious-layer rule
buys, and it is why `line` has no unique index. Each mark advances only in the commit carrying
the writes it certifies, and the two never interact — except that the episode loop refuses to
certify an episode whose segments the segment loop has not reached. The archive shares the
transaction, so a failed TX2 archives nothing.

### typer
Deleted 2026-10-04 (`writer_typer.py`, off since 2026-08-15). It assigned entity types (`is_a`)
and maintained entity co-occurrence, reading `mentions` edges only the resolver's LLM half wrote.
**Trap:** its shipped `88.9%` precision covered 17 of 39 written edges; the other 22 were
unlabelled. That was never a number about the organ — it was a number about 44% of the data
([`docs/CHECKS-measurement.md:88-91`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/CHECKS-measurement.md#L88-L91)).

### V0 / V1 / V3
Capability generations, not release versions. V0 is the local voice pipeline (shipped 2026-06-06); V1
is the project brain (archived) and the first organ separations; V3 holds consolidation, autonomous
research and the salience/subconscious specs. [`docs/roadmap/BUILD-ORDER.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/roadmap/BUILD-ORDER.md) is the status ledger;
[`alto-build-order-v3.md`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/roadmap/alto-build-order-v3.md) is the sequence of record.

### Valence
How pleasant or unpleasant something felt, −1.0 to 1.0. It appears at three layers: as the affect
atom stamped on a closed episode, as an axis of the designed live affect state, and as a steering
control-vector axis. Only the steering axis runs today.
**Trap:** valence steering being proven is not pillar 2 being satisfied. Steering is the renderer
half; the pillar's test is whether state from an earlier turn still shapes a later one.

### verifier
An LLM skeptic that reviews a proposed edge before it is written, kept deliberately in the Writer v2
plan ([`docs/specs/v3/PLAN-writer-v2.md:23`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/docs/specs/v3/PLAN-writer-v2.md#L23)). The module that did it is archived at tag
`archive/age-brain-2026-10-11` with the AGE writer. Not to be confused with `surfacing/verify`,
which checks the Surfacer's own claims and is live.
**Trap:** the standard objection — "a validator shares the confabulator's failure mode" — does
not hold here, and the counterexample is named: the verifier caught `Sacramento == Portland`, a
fabricated identity edge that cleared every structural guard including the verbatim-span check
proposed as its replacement. Structural provenance catches "you said a word nobody uttered"; the
skeptic catches "every word is real and the claim is still false". Different classes.

### watermark
A single-row high-water mark recording how far a loop has processed. There are **two**, and they
never interact: `watermark.seg_id` (segments, driven by the Enricher) and
`watermark_episode.ep_id` (closed episodes, driven by the EpisodeCloser).
[`src/mem/schema.sql:271-280`](https://github.com/sawyerstrong/alto/blob/479298a4a46a4f8f44537be57d1d7052ae48d930/src/mem/schema.sql#L271-L280).
**Trap:** the `CHECK (only_row)` idiom makes a second row impossible at the schema level, and the
watermark — not a process boundary — is the entire durability story. Kill the worker at any
instant and restarting is a no-op plus a replay of at most one segment. A real failure this
caused: `close_episode`, `commit_episode` and TX3 were built, tested and proven, and called only
from scripts — so on the live path `watermark_episode` never advanced, `cooccurrence` and
`binding` stayed empty, and `projection.build` produced every degree at 0. Four counters reading
a perfectly legal zero, one missing caller.

### worktree
A separate git checkout under `.claude/worktrees/<task>`, given to any write-capable agent
alongside its own `alto_agent_<slug>` scratch DB. Read-only agents may share the main tree.
**Trap:** a worktree can be cut from a stale base (seen 30 commits behind), so give the exact
sha. A worktree also lacks the main tree's gitignored `src/.env`, so database-name and password
resolution differ inside it — which is exactly the ambient difference `preflight` exists to
print.

### Writer
The organ that turns the *now* into the past: it takes a completed turn and persists it — episodes,
the entities mentioned, the relations and events those mentions imply — so a later moment can be
shaped by an earlier one. Everything Alto can ever remember arrives through here. It is a **cold-path
sibling of the Subconscious**, not nested under it and not attached to the designed Intake. Two
timescales: the live **recorder** (concurrent, immediate valence) and the **consolidator** (batched,
sleep-time). Today only the recorder half exists, as `mem`.
**Trap (the firewall):** it is **current-mood-blind, not affect-neutral**. It *must* read
graph-affect — computing an episode's valence is its job — but it never takes the live subconscious
mood as an input to what it records. Alto irritated now does not get to bend the facts. The
Subconscious may gate *whether and how much* is written; the Writer alone controls *what*.

---

## Where to go next

| Question | Read |
|---|---|
| What are the parts, and how do they compose? | [THE-ORGANS.md](THE-ORGANS.md) |
| Why is it built this way? | [PILLARS.md](PILLARS.md) |

If a term is missing, it is probably in an organ page under organs/ — each one
defines the vocabulary local to it.
