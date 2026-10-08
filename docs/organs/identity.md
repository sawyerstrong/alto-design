# Identity — the self

> **Path:** cold (written) · hot (read) · **Status:** working at the identity tier; the recombination tier unbuilt · **Code:** [`mem/selfname.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/mem/selfname.py), [`mem/surfacer_store.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/mem/surfacer_store.py), [`alto/brain/store.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/brain/store.py), [`surfacer.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/read/surfacing/surfacer.py)

Alto does not know its own name until someone tells it. Identity is not a persona written
into a prompt or trained into an adapter — it is a node in the graph that **boots empty** and
accretes name, creator and type through testimony, each fact traceable to the moment it was
said. The human on the other side is treated the same way: the first speaker begins as a
nameless referent and earns a name. That symmetry is the organ.

This is where things get maybe a bit too wonky. And a commercial product **Definitely** couldn't be set up this way. But it is the most honest to the project in a pure research capacity. A commercial product would have to have a set of beliefs, identity, memories etc seeded into it.

## Where it sits

On the **write** side, nothing writes identity as a fact any more. Every utterance is kept in
`mem` as testimony, and Alto's name is *derived* from that testimony on read
([`mem/selfname.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/mem/selfname.py), below). The resolver's eager detectors that
used to write a self-name, speaker name, creation event and self-type `is_a` into the graph were
English phrase rules and were deleted on 2026-10-05 (OpenSpec change `remove-grammar-rules`).

On the **read** side, the Surfacer takes the self-node as its **POV anchor** — it refuses to
construct without one — and lifts the self's learned attributes into first-person thought.
[`verify.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/read/surfacing/verify.py) reads the same earned name to decide how to attribute a clause.

Nothing else consumes identity directly, because there is nowhere else for it to go:
Integration has no system prompt, so the only channels into the conversational call are the
frozen LoRA and surfaced thoughts. Identity reaches behaviour through the Surfacer or not at all.

## The intended design

Three specs, in build order.

[SPEC-writer-self-node.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/specs/v1/SPEC-writer-self-node.md) (**IMPLEMENTED**, 2026-07-06)
establishes the `self_attr` substrate: the self boots empty, learned facts attach as separate
attribute nodes under five typed slots — `identity`, `architecture`, `belief`, `norm`,
`preference` — and the self is deliberately *not* `kind:'entity'`, keeping it out of the
entity co-occurrence graph. It names three ascending payoffs, and is honest that only the
third earns the word "self": tier 1 identity persistence (kills the amnesiac reply), tier 2
grounded self-talk instead of confabulation, tier 3 **per-user behavioural coherence** —
norms and preferences derived by the unbuilt recombination phase.

The spec also runs its own delete-the-analogy check and answers the obvious objection. "Why
not just write a system prompt?" does not apply here: the conversational call has an empty
system prompt by design, so the self-model is not competing with a system prompt — it is the
**replacement** for one, and the only per-user, inspectable, no-retrain channel available.

[SPEC-speaker-identity.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/specs/v1/SPEC-speaker-identity.md) (DESIGN v1, 2026-07-20)
removes the last privileged node. The shipped "operator" was earned but *special* — one
deterministically-keyed person node every organ reached for by slug. It is replaced by a
generic **current speaker**: unknown until it identifies itself, named when a name is stated,
reconciled with an existing person when they turn out to be the same. `self` goes back to
meaning only Alto.

[SPEC-self-schema-event-model.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/specs/v1/SPEC-self-schema-event-model.md) (DESIGN)
adds the relational backbone: identity is relational and attributive, not episodic — what it
is (`is_a`), who made it (a reified creation event), who it serves. The longer-run identity
stack, **Nature → Dispositions → Beliefs**, is indexed in [docs/README.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/README.md).

## What exists today

The cold-start property is enforced at the seed. `seed_substrate` MERGEs one node
`{slug:'self', kind:'self'}` and sets `n.name = 'self'` — the literal string, never a learned
name ([`alto/brain/store.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/brain/store.py):966). The comment immediately
below draws the line that matters: the self is *constitutive* and may be seeded bare, but the
current speaker is an external party, and asserting a user exists before anyone has spoken
would be an unearned claim (store.py:885-891). `add_self_attr` is the earned-only write path
— "the self boots empty and NOTHING is seeded" (store.py:1393).

**The graph's self-schema is frozen.** The store still carries the speaker-naming primitives
(`ensure_current_speaker`, `name_speaker`, which named a provisional person node in place) and
the self-schema writes (`add_self_attr`, `add_self_is_a`, `add_created_by`), but since
2026-10-05 nothing calls them: the resolver learners that did were deleted. Rows they wrote
earlier stay, and one path still reads them — when `mem` is unreachable at boot the Surfacer
falls back to the graph store (registry SF-15).

**Alto's name comes from `mem` only, re-read at each episode start.** The Surfacer holds the
self node (`SurfacerIdentity`, [`src/alto/read/surfacing/identity.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/read/surfacing/identity.py)) and re-reads it when a turn
opens an episode (no spoken turn inside the idle gap); with `surfacer_source: mem` that node is
`mem`'s `__self__` surface named by `selfname.self_name_from_testimony`. Every percept prompt
carries one identity line made from it: the name, or "nobody has told me my name yet", and no
other self fact. The line is context, not a licensed source, so a render that states the name is
dropped by the verifier for now. Until 2026-10-05 the graph's learned `identity/name` attribute
overrode the name; that override is gone. `mem` keys surfaces by their case-folded norm, so "Your
name is Juno" names Alto `juno`. A name given today reaches the next episode only after an
enrichment batch has minted it (`mem.enrich` is off; registry ID-4). Pinned by
[`src/tests/test_alto_self_identity.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/tests/test_alto_self_identity.py) (live) and [`src/tests/test_alto_surfacer_identity.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/tests/test_alto_surfacer_identity.py).

**Reads defend the cold-start state rather than paper over it.** The Surfacer takes
`get_self_node()` as its POV anchor and raises without one
([`surfacer.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/read/surfacing/surfacer.py):590). The speaker's earned name is read through
`get_current_speaker_name` and is `None` while they are still a nameless referent
(speaker.py:26, resolved lazily at 17-29); the cache starts as `None`, the honest
cold-start state (speaker.py:15). In
[`verify.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/read/surfacing/verify.py):154, `None`, blank and non-string
all mean *still a nameless referent*, and that is what routes the render to second person
instead of asserting an identity. There is a deliberate asymmetry to know about: a hard-coded
`OPERATOR_NAME = "Sawyer"` survives at verify.py:150 as a legacy **recognizer** only —
a recognizer that is wrong costs a missed detection; a generator that is wrong states a
falsehood about a person. (The graph reader's cue routing — `self`/`alto`/`you` to the
self-node, `i`/`me`/`myself` to the speaker — went with that reader on 2026-10-01.)

**A corpus bug recorded in the map is closed.** [ALTO-INTERIORITY-MAP.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/ALTO-INTERIORITY-MAP.md)
reconciliation #2 (2026-07-22) reports the identity-probe corpus leaking facts into weights —
`fc_id_002`/`fc_id_003` asserting the name *and its provenance* on an empty context. In the
corpus the shipped model was trained on
([`lora_train.v6.jsonl`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/research/lora_training/integration_v1/lora_train.v6.jsonl)) those
rows now defer: "Nothing set on my end. What've you been calling me?" and "Not one I can point
to." Verified by reading the file. The map's entry is stale on this point.

**`mem` holds a second implementation of the same pillar.**
[`mem/selfname.py`](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/mem/selfname.py) derives what Alto was told its name is from
testimony on every read. There is no `self_name` table and no config key: either would be a value
that outlives its evidence, and a config key would be the trained self-description pillar 4 rules
out, filed under ops. It matches four second-person phrasings on the `speaker` axis ("your name is
X", "you're called X", "I'll call you X" and their kin), and a candidate counts only if step ④ had
already minted it as a referential surface — so a bad pattern can fail to find a name and cannot
invent one. What comes back is a `SelfName` with its receipt (the segment and the evidence) and an
`n_candidates`, so being renamed is surfaced rather than resolved silently. It feeds pronoun binding
when an episode closes, the read side, where a cue naming Alto reaches Alto's own self, and — since
2026-10-05 — the name the surfacer's identity line carries, re-read at each episode start
(perception reads no name). The module calls its closed
pattern list a deliberate limit: if it has to grow past a handful, that is evidence the approach is
wrong and should be escalated. Its regexes are English; making them language-neutral is the next
step after `remove-grammar-rules`.

## The gap

Tier 3 — the part that earns the word "self". The `architecture`, `belief`, `norm` and
`preference` slots exist and are empty; their writer is the recombination/introspection phase,
which is unbuilt. Until then the self can hold its name, its maker and its type, and little
else.

Three smaller gaps, all designed-but-unbuilt rather than unimagined. Speaker name-collision
reconciliation is charged to [SPEC-consolidation-loop.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/specs/v3/SPEC-consolidation-loop.md),
which is neither built nor currently spec'd for it. Within-session refresh is deferred by
design (self-node spec D5): a name learned mid-session surfaces *next* session, because the
Surfacer caches the self's attributes at construction. And the self's relational reach is
limited by the same absent payload layer that starves the rest of the read side — nothing mints
entity nodes per turn since the resolver's LLM half was deleted. A self-schema built from `mem`
(`MemSurfacerStore.get_self_neighborhood` is empty in this build) is the intended home for what
the graph used to accrete.

Embodiment awareness — no body, no senses — is part of this self-model under pillar 4 and is
the one piece already proven in the adapter: the v6 retrain's `self_schema` thoughts reason
*from* the limit ("no body to log miles, but…") rather than performing around it.

## Pillars this serves

- **4 (cold-start, testimony-accreted self)** — this organ *is* pillar 4; the seed writes no name, and both the self and the speaker earn theirs.
- **3 (honesty by construction)** — the guards are structural: a null name routes the render, and a self-name counts only if it was said and step ④ minted it as a surface.
- **9 (repairability over precision)** — a name collision is flagged and left for reconciliation; naming in place keeps every fact attached, so the error stays revisable.
- **5 (surfacing, not retrieval)** — the self-node is the Surfacer's POV anchor; without it there is no first person to surface from.

## Sources

- [docs/specs/v1/SPEC-writer-self-node.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/specs/v1/SPEC-writer-self-node.md) · [SPEC-speaker-identity.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/specs/v1/SPEC-speaker-identity.md) · [SPEC-self-schema-event-model.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/specs/v1/SPEC-self-schema-event-model.md)
- [docs/identity/alto-self-knowledge.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/identity/alto-self-knowledge.md) · [alto-nature.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/identity/alto-nature.md) — the Nature → Dispositions → Beliefs stack
- [docs/ALTO-INTERIORITY-MAP.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/ALTO-INTERIORITY-MAP.md) — reconciliation #2, and the ledger rows for the self-node and the nameless speaker
- [docs/systems/alto-honesty-invariant.md](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/docs/systems/alto-honesty-invariant.md)
- [src/alto/brain/store.py](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/brain/store.py) · [mem/selfname.py](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/mem/selfname.py) · [surfacer.py](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/read/surfacing/surfacer.py) · [verify.py](https://github.com/sawyerstrong/alto/blob/3c382612b8b85cebbe991d8b5fcd53bc793e6a8a/src/alto/read/surfacing/verify.py)
