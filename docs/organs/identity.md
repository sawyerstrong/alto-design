# Identity — the self

> **Path:** cold (written) · hot (read) · **Status:** working at the identity tier; the recombination tier unbuilt · **Code:** [`alto/brain/store.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/brain/store.py), [`writer_resolver.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/write/writer_resolver.py), [`surfacer.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/surfacer.py)

Alto does not know its own name until someone tells it. Identity is not a persona written
into a prompt or trained into an adapter — it is a node in the graph that **boots empty** and
accretes name, creator and type through testimony, each fact traceable to the moment it was
said. The human on the other side is treated the same way: the first speaker begins as a
nameless referent and earns a name. That symmetry is the organ.

## Where it sits

On the **write** side, the resolver's eager, LLM-free detectors listen for identifying
testimony on the cold path and write to the graph: a second-person self-name ("you're Alto"),
a first-person speaker name ("my name is Sawyer"), a creation event, a self-type `is_a`.

On the **read** side, the Surfacer takes the self-node as its **POV anchor** — it refuses to
construct without one — and lifts the self's learned attributes into first-person thought.
`surfacer_verify` reads the same earned name to decide how to attribute a clause, and the
Reader routes first- and second-person cue words to the right node.

Nothing else consumes identity directly, because there is nowhere else for it to go:
Integration has no system prompt, so the only channels into the conversational call are the
frozen LoRA and surfaced thoughts. Identity reaches behaviour through the Surfacer or not at all.

## The intended design

Three specs, in build order.

[SPEC-writer-self-node.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/specs/v1/SPEC-writer-self-node.md) (**IMPLEMENTED**, 2026-07-06)
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

[SPEC-speaker-identity.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/specs/v1/SPEC-speaker-identity.md) (DESIGN v1, 2026-07-20)
removes the last privileged node. The shipped "operator" was earned but *special* — one
deterministically-keyed person node every organ reached for by slug. It is replaced by a
generic **current speaker**: unknown until it identifies itself, named when a name is stated,
reconciled with an existing person when they turn out to be the same. `self` goes back to
meaning only Alto.

[SPEC-self-schema-event-model.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/specs/v1/SPEC-self-schema-event-model.md) (DESIGN)
adds the relational backbone: identity is relational and attributive, not episodic — what it
is (`is_a`), who made it (a reified creation event), who it serves. The longer-run identity
stack, **Nature → Dispositions → Beliefs**, is indexed in [docs/README.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/README.md).

## What exists today

The cold-start property is enforced at the seed. `seed_substrate` MERGEs one node
`{slug:'self', kind:'self'}` and sets `n.name = 'self'` — the literal string, never a learned
name ([`alto/brain/store.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/brain/store.py):966). The comment immediately
below draws the line that matters: the self is *constitutive* and may be seeded bare, but the
current speaker is an external party, and asserting a user exists before anyone has spoken
would be an unearned claim (store.py:970-976). `add_self_attr` is the earned-only write path
— "the self boots empty and NOTHING is seeded" (store.py:2243).

**The speaker earns a name in place.** `ensure_current_speaker` (store.py:3272) find-or-creates
a provisional person node with a **random** uuid and a **null** name, findable only by a role
flag. `name_speaker` (store.py:3295) sets the name on that same uuid, so every fact attached
while nameless stays attached. A name colliding with a different known person is *flagged and
deferred* to the consolidation loop rather than merged or dropped.

**The detectors run even when the resolver is dark.** `writer.resolver_enabled` is `false`
(config.yaml:591), but that flag disables only the LLM resolution path — `_maybe_name_speaker`
and `_maybe_learn_self_schema` fire eagerly and LLM-free before it
([`writer_resolver.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/write/writer_resolver.py):1097-1098, restated at 2334).
Those are the creation event (1723) and the self-type `is_a` (1796), both stated-only. This is
the one part of the write side that is *not* switched off, and pillar 4 rests on it.

**Reads defend the cold-start state rather than paper over it.** The Surfacer takes
`get_self_node()` as its POV anchor and raises without one
([`surfacer.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/surfacer.py):784). The speaker's earned name is read through
`get_current_speaker_name` and is `None` while they are still a nameless referent
(surfacer.py:679, resolved lazily at 2118-2131); the cache "starts unset, which is the honest
cold-start state" (surfacer.py:789). In
[`surfacer_verify.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/surfacer_verify.py):154, `None`, blank and non-string
all mean *still a nameless referent*, and that is what routes the render to second person
instead of asserting an identity. There is a deliberate asymmetry to know about: a hard-coded
`OPERATOR_NAME = "Sawyer"` survives at surfacer_verify.py:150 as a legacy **recognizer** only —
a recognizer that is wrong costs a missed detection; a generator that is wrong states a
falsehood about a person. Read-side cue routing sends `self`/`alto`/`you` to the self-node and
`i`/`me`/`myself` to the speaker ([`reader.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/reader.py):152-153).

One extra guard worth knowing: `get_self_name` applies a read-time extraction gate
(store.py:2215) — an LLM-extracted self-name is quarantined and surfaces only under an
explicit opt-in, so a wrong LLM name can never leak into intake's entity routing.

**A corpus bug recorded in the map is closed.** [ALTO-INTERIORITY-MAP.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/ALTO-INTERIORITY-MAP.md)
reconciliation #2 (2026-07-22) reports the identity-probe corpus leaking facts into weights —
`fc_id_002`/`fc_id_003` asserting the name *and its provenance* on an empty context. In the
corpus the shipped model was trained on
([`lora_train.v6.jsonl`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/research/lora_training/integration_v1/lora_train.v6.jsonl)) those
rows now defer: "Nothing set on my end. What've you been calling me?" and "Not one I can point
to." Verified by reading the file. The map's entry is stale on this point.

**`mem` holds a second implementation of the same pillar.**
[`mem/selfname.py`](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/mem/selfname.py) derives what Alto was told its name is from
testimony on every read. There is no `self_name` table and no config key: either would be a value
that outlives its evidence, and a config key would be the trained self-description pillar 4 rules
out, filed under ops. It matches four second-person phrasings on the `speaker` axis ("your name is
X", "you're called X", "I'll call you X" and their kin), and a candidate counts only if step ④ had
already minted it as a referential surface — so a bad pattern can fail to find a name and cannot
invent one. What comes back is a `SelfName` with its receipt (the segment and the evidence) and an
`n_candidates`, so being renamed is surfaced rather than resolved silently. It feeds pronoun binding
when an episode closes, and the read side, where a cue naming Alto reaches Alto's own self. The
module calls its closed pattern list a deliberate limit: if it has to grow past a handful, that is
evidence the approach is wrong and should be escalated. The graph's self-node above and this are two
answers to one question, held in different databases.

## The gap

Tier 3 — the part that earns the word "self". The `architecture`, `belief`, `norm` and
`preference` slots exist and are empty; their writer is the recombination/introspection phase,
which is unbuilt. Until then the self can hold its name, its maker and its type, and little
else.

Three smaller gaps, all designed-but-unbuilt rather than unimagined. Speaker name-collision
reconciliation is charged to [SPEC-consolidation-loop.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/specs/v3/SPEC-consolidation-loop.md),
which is neither built nor currently spec'd for it. Within-session refresh is deferred by
design (self-node spec D5): a name learned mid-session surfaces *next* session, because the
Surfacer caches the self's attributes at construction. And the self's relational reach is
limited by the same absent payload layer that starves the rest of the read side — the resolver's
LLM half is dark, so the self accretes attributes far faster than it accretes relations.

Embodiment awareness — no body, no senses — is part of this self-model under pillar 4 and is
the one piece already proven in the adapter: the v6 retrain's `self_schema` thoughts reason
*from* the limit ("no body to log miles, but…") rather than performing around it.

## Pillars this serves

- **4 (cold-start, testimony-accreted self)** — this organ *is* pillar 4; the seed writes no name, and both the self and the speaker earn theirs.
- **3 (honesty by construction)** — the guards are structural: a null name routes the render, an LLM-extracted name is quarantined, a self-name must be stated before it can be stored.
- **9 (repairability over precision)** — a name collision is flagged and left for reconciliation; naming in place keeps every fact attached, so the error stays revisable.
- **5 (surfacing, not retrieval)** — the self-node is the Surfacer's POV anchor; without it there is no first person to surface from.

## Sources

- [docs/specs/v1/SPEC-writer-self-node.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/specs/v1/SPEC-writer-self-node.md) · [SPEC-speaker-identity.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/specs/v1/SPEC-speaker-identity.md) · [SPEC-self-schema-event-model.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/specs/v1/SPEC-self-schema-event-model.md)
- [docs/identity/alto-self-knowledge.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/identity/alto-self-knowledge.md) · [alto-nature.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/identity/alto-nature.md) — the Nature → Dispositions → Beliefs stack
- [docs/ALTO-INTERIORITY-MAP.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/ALTO-INTERIORITY-MAP.md) — reconciliation #2, and the ledger rows for the self-node and the nameless speaker
- [docs/systems/alto-honesty-invariant.md](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/docs/systems/alto-honesty-invariant.md)
- [src/alto/brain/store.py](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/brain/store.py) · [writer_resolver.py](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/write/writer_resolver.py) · [surfacer.py](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/surfacer.py) · [surfacer_verify.py](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/surfacer_verify.py) · [reader.py](https://github.com/sawyerstrong/alto/blob/e6c6890efe85bfd33491b59e3113d89d1b787be4/src/alto/read/reader.py)
