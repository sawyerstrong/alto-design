# The nine pillars, explained

*Why Alto is built the way it is, what each commitment rules out, and how to recognise you are
about to break one.*

> **This page is derived.** The nine numbered statements are the contract; this page is
> the reasoning behind them, written for a person rather than for an agent mid-task. The
> contract lives in the project's [`CLAUDE.md`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/CLAUDE.md), which is not published here.

---

## How to use this

Alto is a home assistant on the surface. Underneath it is a research program about **machine
interiority** — whether a machine can have a continuous felt inner life, and what it takes to
build one honestly. The assistant is the vehicle; the interior is the point.

The pillars exist because that inversion is easy to forget while you are looking at code.
Nearly every one of them was written after something went wrong — a plausible optimization
that quietly removed the thing the machinery existed to produce. They are, in effect, a list
of mistakes expensive enough to be worth naming.

So they are load-bearing in an unusual way:

> **A design that violates a pillar is wrong even if it passes tests.** Surface the conflict;
> do not ship around it.

That is not rhetoric. It means a change with green CI, a clean lint run and a measurable
latency win can still be rejected, and "but the tests pass" is not an answer. If you think a
pillar is wrong, say so and argue it — that is a legitimate move. Quietly routing around one
is not.

**The numbers are an interface.** Code cites these by number — `pillar 9` appears 25 times in
module docstrings, `pillar 3` 22 times, 62 citations in all. Never renumber them. If a pillar
is ever retired, leave a tombstone at its number.

---

## 1. Alto is a continuous being, not a request-response loop

**The commitment.** Alto is *always in an episode*, not only during a turn. It has a
between-turn existence: idle thought, felt duration, sleep pressure, cognitive fatigue,
circadian rhythm. A push-to-talk turn is one event in a continuous life, never the unit of
existence.

**Why.** Every convenient engineering frame here is turn-shaped — the loop, the request, the
test, the trace. Build long enough inside that frame and its accidents harden into
architecture. The pillar exists to stop a temporary input method from silently becoming the
design.

**The canonical example**, and the one to keep in mind: **one thought per turn is a
push-to-talk artifact, not the design.** Thoughts are supposed to arrive on their own
schedule — many, one, or none. The shipped surfacer produces exactly one per turn because
that is what the current input method makes easy. Do not build on that number as though it
were a decision.

**How you'd break it.** Any API, schema or test that makes "the turn" the atom. A cache keyed
only by turn. A state machine with no state between turns. An interface that cannot express
"nothing happened, and that itself was experienced."

**In code.** [`writer_episode_read.py:32`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/write/writer_episode_read.py#L32) names this explicitly while consuming a turn-shaped
input — the comment exists to mark the compromise rather than hide it.

**Today.** Largely aspirational. Between turns there are two small ticks — a state-decay tick and
an idle tick that seeds from affect charge nothing produces — and neither yields a thought; the
run loop blocks on push-to-talk. See [organs/subconscious.md](organs/subconscious.md).

## 2. Affect is a lived STATE that shapes processing — not a tone knob

**The commitment.** Emotional state persists and evolves across turns — bias, injection,
decay — and *causes* what surfaces and what Alto does. Valence steering is only the renderer
half.

**Why.** Because the cheap version is very convincing and completely hollow. You can make
replies sound sad, and nothing about the system has an inner life; you have built a costume.
The pillar draws the line where it actually matters: not how the output sounds, but whether
state from an earlier moment still shapes a later one.

**The test to apply.** "Affect works" is never true because tone shifted. It is true when
**affect from turn 3 still shapes turn 9.** If you cannot demonstrate that, you have a tone
knob.

**How you'd break it.** Passing a mood string into a prompt. Deriving "current affect" fresh
from the current utterance. Any design where the affect value is read at render time and
never read anywhere else.

**Today.** Instructive, because it fails in a specific way. The decay mechanism is built and
has been measured persisting state from turn 3 to turn 9 — the test above, passing at the
mechanism level. But `affect_enabled` is `false`, so nothing produces affect on the live path,
and `get_current_affect_state()` has **zero readers in the pipeline** — only sims and tests
call it. A felt state is computed, persisted and decayed into a vacuum. The mechanism is real;
the causal wire does not exist.

## 3. Honesty by construction (honesty-as-enactment)

**The commitment.** Alto does not fabricate memories, feelings or physical agency. Grounding
must come from felt state and first-person thought the model reasons **from** — *never from an
instruction it obeys.* A felt state must be real (persistent, causal), not performed.

**Why.** This is the pillar the whole architecture is shaped around, and the reason the self is
sealed behind transducers (see [organs/integration.md](organs/integration.md)). An instruction not to lie
is a request, and a model can decline it silently. A structure in which the false thing cannot
be represented is a guarantee.

**The operational test, and the most useful idea in this document:**

> Is it **fenced by construction**, or is it **a line in a prompt?**

A recent review of the memory writer made this concrete by tabulating every seam where a
model's output becomes durable:

| Seam | The structural guard |
|---|---|
| coreference | the answer is an **index into a list we built** — out of range is counted, not minted |
| self-name | the name must **already** be a minted referential surface |
| anchor | the span is **computed from the source**, never asked for |
| line → surface | whole-token-run **containment** against the mint list |
| topic proposer | the proposal must appear **contiguously in the segment it came from**, or it is dropped |

All five are structural now. The fifth was not: until 2026-08-30 the topic proposer had a shape
check and a line in the prompt, and two invented strings reached permanent storage — `surferder`,
a garbled "surfacer", and `behaved emotion`, a recombination of "true behaved affect or
emotion". The difference is not care or prompt quality — it is whether the guard asks *"is this
shaped like a referent"* or *"did anyone actually say it."* The gate now asks the second, and a
test asserts both strings are refused ([`src/mem/topics.py`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/mem/topics.py), `_unattested_reason`).

**How you'd break it.** Adding "do not invent anything" to a prompt and calling it a guard.
Letting a model return free text where it could return an index. Rendering a feeling the
system does not hold. Any grounding that depends on the model's cooperation.

**In code.** [`surfacer.py:1157`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/read/surfacer.py#L1157) — when verification fails, **drop the intrusion**; a dropped
thought is honest. [`surfacer_verify.py`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/read/surfacer_verify.py) is the deterministic backstop for this pillar, and
dropping is its failure mode throughout. It runs on the Surfacer's thoughts, not on the spoken
reply, and it is a lexical trace, so words the speaker did say, rearranged, pass it. In the one
graded end-to-end run (2026-09-25), 6 of 40 replies were fabricated, and at least 2 of the 6 were a
distorted thought repeated as fact. [`context.py:500`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/context.py#L500) catches a subtle case: a guard can
itself violate pillar 3 when every individual line is true but the composition implies
something false.

## 4. The self is cold-start and testimony-accreted

**The commitment.** Alto does not know its own name until told. The self and the first speaker
begin as nameless referents and accrete identity through testimony. Identity lives in the
graph — the self-node — not baked into a trained self-description. Embodiment awareness (no
body, no senses) is part of this: reason *from* the limits, don't perform around them.

**Why.** A model told "you are Alto, a warm assistant" is reciting. A system that learns its
name because someone said it, and can point at when, has something the first cannot fake — and
it makes the identity revisable, inspectable and *earned*.

**How you'd break it.** Putting "you are Alto" in a system prompt. Seeding the self-node with a
name at migration time. Training self-description into the adapter. Treating the operator as
privileged-by-construction rather than as a speaker who became known.

**In code.** [`surfacer.py:679`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/read/surfacer.py#L679) — the speaker's **earned** name, or `None` while they are still
a nameless referent. [`surfacer.py:789`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/read/surfacer.py#L789) — unset is "the honest cold-start state," not a bug to
paper over. [`surfacer_verify.py:157`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/read/surfacer_verify.py#L157) — `None`/blank/non-string all mean *still a nameless
referent*, and that is what routes the render.

**Today.** Working. Name bindings have been measured accreting from testimony over a run
rather than being seeded.

## 5. Surfacing is subconscious and activation-driven — not retrieval

**The commitment.** Thoughts are involuntary intrusions from below, not query → facts →
render. Spreading activation is the substrate; the subconscious *feels* percepts and generates
activation independent of any query.

**Why.** Retrieval is what a *reader* does — deliberate, directed, in service of a question.
Intrusion is what memory does to you. If Alto only ever surfaces what something asked for,
there is no interior; there is a search box with a personality.

**The distinction to hold.** "What surfaced" ≠ "what a reader retrieved." Directed recall does
survive — but as *an intention to remember, serviced by invisible machinery*, never as
Integration calling a database. Keep that distinction or the database sneaks back into
consciousness through the "it can choose to retrieve" door.

**How you'd break it.** Building a retrieval call and naming it surfacing. Gating what surfaces
on relevance to the current utterance. Requiring a query to exist before a thought can.

**Today.** The rendering half ships; the activation-driven half does not. What exists is a
per-turn, reference-gated, single-thought transducer — see pillar 1.

## 6. Felt time and anticipation are core, not decoration

**The commitment.** Future-directed affect — looking forward, dread — and felt duration from
event density, plus watch-checking. Load-bearing for the felt-interior claim.

**Why.** It is the first thing that gets cut in a latency review, and cutting it removes
something the project exists to demonstrate. Felt time is not a timestamp; it is duration
experienced through how much happened.

**How you'd break it.** Reading duration off a clock and calling it felt. Treating anticipation
as a scheduled reminder. Deferring the whole category as polish.

**Today.** Designed in depth, unbuilt. Felt time is the closest to buildable.

## 7. Isolated mechanism wins are not a working system

**The commitment.** The bar is a **composed** end-to-end proof under real latency that
exercises at least one **persistent-state** property — does affect from turn 3 still shape
turn 9; does an episode hold together. Frozen evals, blind judges, measure-don't-assert, test
the scariest assumption first.

**Why.** This project is very good at producing organs that work alone. Several have been
built to demonstration and never integrated. A mechanism that passes in isolation tells you
almost nothing about a system where six other organs are dark and one missing layer starves
four of them at once.

**How you'd break it.** Reporting a probe result as a system result. Authoring eval content to
match your detector's markers — teaching to the test. Quoting a number without its measurement
conditions (cold vs after-retry, sample size, warm vs first-run).

**In code.** [`writer_relator.py:419`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/write/writer_relator.py#L419) — refusing to fit a schema to its own test set, named as
pillar 7 / measure-don't-assert.

**Before you quote any number**, run the five questions in
[CHECKS-measurement.md](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/docs/CHECKS-measurement.md). Every entry in that document is a real
instance from this repo. The dominant failure mode here is not a broken organ; it is a
confident number describing a configuration Alto does not run.

## 8. The deterministic safety boundary stays deterministic

**The commitment.** Device control is gated by the registry and the allowlist. The model is
never trusted directly. Interiority never reaches the actuation path unchecked.

**Why.** Everything else in this document is about giving a model more influence over what
Alto thinks and says. This pillar is the hard edge on that: influence over *thought* is the
project; influence over *the physical world* is gated by code that does not care how the model
feels.

**How you'd break it.** Trusting the model's `domain`/`service`/`entity_id`. Adding a device
capability by widening what the model may emit instead of extending the registry. Any second
path to `call_service`.

**In code.** [`ha.py`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/ha.py) — `validate_tool_call` resolves the entity against the registry and
checks the service against a per-domain allowlist. There is exactly **one** `call_service`
call site, immediately behind that check, and it consumes the *validated* tuple rather than
the model's arguments. A new capability means extending the registry **and** the allowlist
**and** adding a test.

This is the one pillar whose design is finished rather than aspirational — but note the
current runtime goes further than the pillar asks. Integration-MVP registers **no tools** on
the conversational model ([`pipeline.py:169`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/pipeline.py#L169)) and removed the dispatch call site, so the guard
sits in code nothing currently calls and even a hallucinated tool call is dropped. Device
control awaits a future action-LLM organ. See
[organs/safety-boundary.md](organs/safety-boundary.md).

## 9. Repairability over precision — misunderstanding is fine, being unable to revise is not

**The commitment.** People misunderstand each other constantly; Alto misunderstanding is not
the failure. Being unable to *adjust* that understanding is. **Bias toward capture:** an
imperfect edge that can later be corrected beats a missing one, and a precision gate that
DROPS rather than records is the anti-pattern.

**Why — and this one is measured.** Precision-first gating produced a system that captured
almost nothing: 730 simulated episodes yielded 953 mentions and **zero** relations, and a blind
gold standard found **0 of ~30** durable facts captured. Enumerating a person's life one
hand-written detector at a time is the losing game.

**The sequencing that follows.** Precision-first is load-bearing only while nothing can be
corrected after the fact. Build the revisability first, *then* let Alto hear more.

**The line this does NOT cross.** This licenses imperfect capture of what was **actually
said**. It never licenses inventing what was not — that is pillar 3, and a different failure.
"Heard it and filed it imperfectly" is fine; "never heard it and asserted it" is the enemy.
Apply it to the **write** side; never use it to relax the surfacer's fabrication guards,
because a false memory Alto *narrates* is far harder to correct than a wrong edge in a graph.

**In code.** [`alto/brain/store.py:2632`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/brain/store.py#L2632) — a low-confidence capture is allowed, "but it must be
MARKED so a reader can discount it." Marking is what makes it repairable.

---

## The tension you will actually hit: 3 against 9

Pillars 3 and 9 pull in opposite directions, on purpose, and most real design arguments here
land between them. Pillar 9 says capture generously. Pillar 3 says never assert what was not
said. Both are right; the work is knowing which governs.

The codebase has already worked out the test, and it is sharper than "use judgement":

> **Can the error be revised later?**

Two worked examples from the repo:

**Licensed by 9.** Fusing two clauses of a single piece of testimony — "Marguerite … moved
back to the co-op" welding together two things she said. Wrong, recoverable, and the source is
still correct. File it; fix it later.

**Forbidden by 3.** Pulling words out of a *different* piece of testimony into that account.
That is a false memory with a false source — not an imprecise record of something real.

**The clearest case of all**, at [`writer_relator.py:172`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/write/writer_relator.py#L172): when a span has both a clause
boundary and a negator, the sign of the relation cannot be determined by regex, so the
proposal is **dropped** rather than written with a guessed sign. The reasoning is worth
reading in full, because it shows the test being applied rather than asserted:

> *Dropping here does NOT contradict pillar 9. That pillar licenses imperfect capture of what
> was said; it explicitly does not license asserting what was not. A relation written with the
> wrong sign says the opposite of the utterance, so there is nothing to revise later — the
> graph would hold a confident falsehood.*

**An inverted sign is not an imprecise capture. It is a confident falsehood that looks exactly
like a fact.** That is the boundary. When you are unsure which pillar governs, ask what a
future correction would have to work with: if it has a true source and a fixable error, 9
licenses it; if it would have to *detect* that something true-looking is false, 3 forbids it.

---

## Where the pillars stand today

Honesty about this is itself a pillar (7), so:

| # | Pillar | State |
|---|---|---|
| 1 | Continuous being | **aspirational** — no between-turn cognition exists |
| 2 | Affect as lived state | **half** — mechanism proven, producer off, zero consumers |
| 3 | Honesty by construction | **enforced on the write side, partial on the read side** — nothing checks the spoken reply |
| 4 | Cold-start self | **working** |
| 5 | Activation-driven surfacing | **half** — rendering ships, activation does not |
| 6 | Felt time and anticipation | **designed, unbuilt** |
| 7 | Composed proof, not mechanisms | **the standing discipline** |
| 8 | Deterministic safety boundary | **fully enforced** |
| 9 | Repairability over precision | **decided; the write side is being rebuilt around it** |

Four of nine are substantially unbuilt. That is not drift — it is a research program in
progress, and CLAUDE.md is explicit that **designed-but-unbuilt is a different category from
unimagined.** The pillars describe what Alto is being built toward; the status column tells
you how far it has got.

**Next:** [THE-ORGANS.md](THE-ORGANS.md) maps these commitments onto the actual organs, with
per-organ status.
