# The safety boundary — the guard

> **Path:** hot · **Status:** complete and correct — but currently unreachable from the conversational model, which has no tools registered · **Code:** [`ha.py`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/ha.py) (device control), [`web.py`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/web.py) (the outbound sibling)

Everything else in this project is about giving a model more influence over what Alto thinks
and says. This is the hard edge on that. **Influence over thought is the project; influence
over the physical world is gated by code that does not care how the model feels.** The guard
is a small pure function that takes a proposed device call, throws away most of what the model
said, resolves the rest against a registry it controls, and returns either a validated tuple
or `None`. Nothing reaches Home Assistant except through that tuple.

## Where it sits

It consumes a `call_ha_service(domain, service, entity_id, data?)` tool call and emits either
a validated `(domain, service, entity_id, data)` tuple or a rejection. It sits between the
conversational model (today, Integration collapsed into a fine-tuned LoRA) and
`HomeAssistantClient`, the only thing in the repo that talks to Home Assistant. It has a
read-only sibling on the same boundary (`get_device_state`) and an *outbound* sibling in
[`web.py`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/web.py) guarding the other direction: what may leave, rather than what may act.

## The intended design

Pillar 8 in [CLAUDE.md](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/CLAUDE.md): **the registry is the source of truth, trusted
over the model.** Every model-issued tool call is resolved against the config registry and
checked against a per-domain service allowlist before anything is sent. A new device
capability is added by extending the registry *and* the allowlist — never by bypassing the
guard or trusting the model's `domain`/`service`/`entity_id`. Interiority never reaches the
actuation path unchecked.

The contract is [SPEC-ha-tool-calling.md](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/docs/specs/SPEC-ha-tool-calling.md) (approved
2026-06-06), which replaced a substring phrase-map router with one tool-enabled LLM call plus
this guard. One finding from its evidence base is worth carrying: *"play the tv"* is read as
`turn_on` at every temperature, the guard rejects it, and the command safely fails. Capability
was never the limiter — input ambiguity and the guard are.

Two designed extensions exist, and both are explicit that they do **not** touch the guard. The
**two-stage action executor**
([SPEC-two-stage-executor.md](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/docs/specs/v1/SPEC-two-stage-executor.md), over
[two-stage-action-executor.md](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/docs/systems/two-stage-action-executor.md)) splits an action
turn into a full-context orchestrator (no tools, resolves referents, emits a directive) and a
fresh-context executor (tools only), so reliability stops degrading as history grows — *"the
executor proposes, the registry disposes."* The **tool/capability taxonomy**
([tool-capability-model.md](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/docs/systems/tool-capability-model.md)) maps every future tool
onto the existing Three-Tier Action Model (autonomous / act-and-notify / confirm-first) rather
than inventing a parallel consent system, reusing this guard as the pattern.

## What exists today

All of it. [`ha.py`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/ha.py) is 302 lines and the whole boundary is in it.

**One generic tool, not one per capability.** `HA_TOOL` ([`ha.py:17`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/ha.py#L17)) lets the model assemble
any `domain.service.entity_id`; the guard is what makes that safe. `GET_STATE_TOOL`
([`ha.py:41`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/ha.py#L41)) is its read-only companion. `SERVICE_ALLOWLIST` ([`ha.py:61`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/ha.py#L61)) is a per-domain set
— `input_boolean`, `switch`, `light`, `media_player`, nothing else — and `normalize_service`
([`ha.py:83`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/ha.py#L83)) applies a synonym map (the model emits "pause" and "play" without the `media_`
prefix) before returning `None` for anything outside its domain's set.

**`validate_tool_call`** ([`ha.py:148`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/ha.py#L148)) is the guard proper, and its important line is
[`ha.py:154`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/ha.py#L154):

```python
domain = registry.domain_of(canonical)   # trust the registry, not the model
```

The model's `domain` argument is **discarded**, not checked. The entity resolves through
`DeviceRegistry.resolve` ([`ha.py:122`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/ha.py#L122)) — exact id, alias, friendly name or bare object id — or
returns `None`, which ends the call. On `select_source` the guard narrows further: only apps
known on *that* device resolve, and the data dict is rebuilt from the resolved value rather
than passed through ([`ha.py:160-165`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/ha.py#L160-L165)). `validate_state_query` ([`ha.py:169`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/ha.py#L169)) is the read-only
sibling: same registry check, no service allowlist, because nothing is mutated. What comes
back is narrowed too — `summarize_state` ([`ha.py:191`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/ha.py#L191)) builds a compact string from a small
attribute whitelist ([`ha.py:178`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/ha.py#L178)), never the raw dict, since a `media_player`'s attributes
carry a huge `source_list`.

**There is exactly one `call_service` call site in the codebase.** [`ha.py:295`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/ha.py#L295) defines it;
[`tool_dispatch.py:279`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/tool_dispatch.py#L279) calls it, inside `ToolDispatcher.execute_tool_calls`, which validates at `:268`,
destructures the *validated* tuple at `:274`, and only then reaches Home Assistant. On `None`
it logs the rejected call and speaks "Sorry, I can't do that." The read path mirrors it at
[`tool_dispatch.py:115`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/tool_dispatch.py#L115).

**The outbound sibling.** [`web.py`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/web.py) (147 lines) guards the other
direction: `validate_search_query` ([`web.py:63`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/web.py#L63)) enforces the **"no corpus in the query" hard
rule** — a query carrying any blocklisted personal term is rejected, as is an empty one or one
over 300 characters, both sides NFKC-normalized and casefolded so casing and compatibility
variants cannot slip a term past. Its scope note does not overclaim: this defends against the
local model *accidentally* echoing a known personal term and is **not** a defense against
deliberate homoglyph evasion, which NFKC does not fold. The blocklist lives in
`ALTO_SEARCH_BLOCKLIST` (env or gitignored `.env`), not in the committed config, because the
terms are themselves sensitive. `web_search.enabled` is `false`
([`config.yaml:1097`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/config.yaml#L1097)); with it off the model never sees the tool.

**Adding a device capability** means three edits and never fewer: the registry (`entities:` in
[`config.yaml`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/config.yaml), line 1113), the allowlist ([`ha.py:61`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/ha.py#L61)), and a new
test in [`test_alto_v0.py`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/tests/test_alto_v0.py) (guard cases from line 172,
read-query cases from `:242`). Widening what the model is *allowed to emit* is not one of the
three; neither is a second path to `call_service`. Separately, the HA long-lived token comes
only from `ALTO_HA_TOKEN` or a gitignored `.env`, resolved in
[`config.py`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/config.py), and is never logged or written to [`config.yaml`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/config.yaml).

**And nothing currently calls any of it.** This is the most surprising fact about the organ
and the one to check before debugging anything device-shaped: **the conversational model
cannot reach Home Assistant at all today.** `self._conversational_tools` is `[]`
([`pipeline.py:169`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/pipeline.py#L169)), the `ToolDispatcher.dispatch` call site was
removed from both turn handlers ([`pipeline.py:1538-1545`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/pipeline.py#L1538-L1545), `:1587-1594`), and `tool_sink` is
omitted from the streaming call entirely, so even a hallucinated tool call is dropped
silently. Say "turn on the lights" today and Alto talks about it rather than doing it.

**That empty list is an asserted invariant, not a leftover** — the *actuation firewall*
([`pipeline.py:141-169`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/pipeline.py#L141-L169)), backed by `test_the_actuation_firewall_is_an_invariant`
([`test_alto_v0.py:4334`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/tests/test_alto_v0.py#L4334)), which AST-scans [`src/alto/`](https://github.com/sawyerstrong/alto/tree/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto) and
fails on any append, extend, insert or reassignment. Two reasons converge on the same value
and **only the first expires.** One: Integration-MVP cut the effector channel, so device
control, project queries and web search are all broken from the conversational path — the
bounded regression that spec accepted. Two, SPEC-writer-build_14 §1.7: the route *memory →
surfaced thought → assistant-role history → primary LLM → `call_ha_service`* is otherwise
complete, and a surfaced thought is indistinguishable from a spoken reply once it is in
history. Register one tool there and **a fabricated memory becomes a device call.** So tools
belong to the future action-LLM organ, behind this guard — never on the conversational call.

## The gap

**For the guard itself, there is none.** Its designed behaviour and its shipped behaviour are
the same thing, and that is worth knowing as a reference point: it is what "fenced by
construction" looks like when it is finished. The gap is the missing *caller*, not the
boundary — and the guard's correctness is therefore unexercised on the live path today, which
is an argument for keeping its unit tests rather than relaxing them. The day the action organ
lands, this code goes hot with no further review.

What is unbuilt sits *around* it. The two-stage executor is a **draft** — authored in the
2026-06-12 spec sweep, adversarially reviewed, **not owner-interviewed**, and a gated
build-if-needed item whose gate is a measured silent-failure counter plus a latency arm
([specs/README.md](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/docs/specs/README.md)). Its evidence is three single deterministic
trajectories (1/6 → 4/6 → 5/6 correct tool calls); the spec itself calls the 4→5 improvement
directional, pending a multi-turn harness re-run. Do not quote it as a result. The broader
tool surface beyond Home Assistant and owner-invoked search is design direction in
[`tool-capability-model.md`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/docs/systems/tool-capability-model.md), not code; autonomous research is V3 and will reuse this same guard
rather than growing its own.

## Pillars this serves

- **Pillar 8 (the deterministic safety boundary stays deterministic)** — this organ *is*
  pillar 8: registry trusted over the model, one validated call site, and an actuation
  firewall keeping the conversational model off the effector channel entirely.
- **Pillar 3 (honesty by construction)** — the same structural move applied to actuation
  rather than memory: the guard asks "did the registry resolve this," not "is this shaped like
  a device." A model cannot cooperate its way past a lookup that fails. The firewall's second
  reason is pillar 3 in its sharpest form — a fabricated memory must not be able to become a
  device call.
- **Pillar 7 (composed proof)** — every guard behaviour has a test, and the gate requires a
  new one for new behaviour. Note that `--dry-run` prints and returns before the pipeline, so
  it exercises argument parsing, not this path.

## Sources

- [CLAUDE.md](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/CLAUDE.md) · [PILLARS.md](../PILLARS.md) ·
  [THE-ORGANS.md](../THE-ORGANS.md) — pillar 8 and the guard in the turn diagram.
- [SPEC-ha-tool-calling.md](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/docs/specs/SPEC-ha-tool-calling.md) — the approved contract.
- [SPEC-writer-build_14](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/docs/specs/v3/SPEC-writer-build_14.html) §1.7 — the actuation
  firewall's second and non-expiring reason.
- [SPEC-two-stage-executor.md](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/docs/specs/v1/SPEC-two-stage-executor.md) ·
  [two-stage-action-executor.md](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/docs/systems/two-stage-action-executor.md) — draft.
- [tool-capability-model.md](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/docs/systems/tool-capability-model.md) — the tool taxonomy and
  the Three-Tier consent mapping.
- Code: [`ha.py`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/ha.py) · [`web.py`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/web.py) ·
  [`pipeline.py`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/pipeline.py) ·
  [`config.py`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/alto/turn/config.py) ·
  [`config.yaml`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/config.yaml) ·
  [`test_alto_v0.py`](https://github.com/sawyerstrong/alto/blob/ec6be39e3f064cdb8287629996cbcefb33e50715/src/tests/test_alto_v0.py).
