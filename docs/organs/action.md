# The action organ

> **Path:** hot · **Status:** named and sketched, no spec and no code — but the channel into it ships and is live · **Code:** none; [`markers.py`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/runtime/markers.py) is the channel

Alto's conversational model has no tools, and under the target design it never will. When Alto
wants something done in the world it *says so*, in its own words, inside a commitment pair (`¤…¤`) — and a
separate organ, the only thing in the system that knows Home Assistant exists, turns that
stated intent into a validated tool call. That organ is the missing half of device control, and
the interesting part is how far the wiring goes without it: **the LoRA emits action spans, the
runtime parses and captures them, and they go nowhere by design.**

## Where it sits

Between Integration and the guard (below). Its input is an action intent in
natural language — not a structured call — and its output is `call_ha_service` /
`get_device_state` arguments that `validate_tool_call` accepts or rejects. It owns the tool
schemas; nothing above it does. Everything below it is the guard, described at the end of this
page, and none of that changes when this organ lands.

**Where the action path attaches is not settled by the corpus.**
[`alto-conscious-locus.md`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/docs/systems/alto-conscious-locus.md) draws intent rendered down
into `[machinery: bundle, steering, renderer, action]` — action inside the block below
Integration. The overview diagram draws the opposite:
[`alto-organs-overview.mmd`](../assets/alto-organs-overview.mmd) has
`IN -.->|⟦act⟧ intent| ACT`, straight from Integration to the Action organ. Neither states the
rule, so **the corpus is silent on this.** What it does fix is the part pillar 8 depends on: the action path
descends *below* the conscious line, and Integration never holds a tool. The shipped runtime is
a third answer and a temporary one — the LoRA marks its own output, a channel split where a
transducer would go ([integration.md](integration.md)).

## The intended design

**The design statement is Integration-MVP (2026-06-30)**, written out in
[`SPEC-integration-mvp.md`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/docs/specs/v1/SPEC-integration-mvp.md) (lines 5 and 123); the code keeps only its consequence, as the
comment above the reply paths ([`alto.py:332-336`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/runtime/alto.py#L332-L336)). A marking LoRA
splits Integration's output into three channels: internal **thought**, filtered before anything
routes; `⟦say⟧`-marked **words**, verbatim to voice; and `⟦act⟧`-marked **actions**, routed to a
separate action-LLM "whose job is *exclusively* to turn natural-language action commitments into
validated tool calls." The ownership line is the sharp one: that organ is the only thing that
ever knows about HA, the project store or web search — Integration never does. It inverts the
pre-MVP model, where the conversational LLM invoked tools itself.

**Two reasons keep tools off the conversational model, and only one of them expires**. Reason one is Integration-MVP's accepted
regression. Reason two is SPEC-writer-build_14 §1.7, the section the code
comment cites ([`alto.py:332-336`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/runtime/alto.py#L332-L336)): the route from a surfaced memory to
`call_ha_service` is otherwise complete, so registering one tool there lets a fabricated memory
become a device call. When this organ lands and reason one expires, **reason two does not** —
the organ gets the tools, the conversational path never does.

**The internal shape is drafted** in
[`SPEC-two-stage-executor.md`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/docs/specs/v1/SPEC-two-stage-executor.md) over
[`two-stage-action-executor.md`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/docs/systems/two-stage-action-executor.md): a full-context
orchestrator (no tools, resolves referents like "turn it back on", emits a directive) plus a
fresh-context executor (tools only, no history), because tool-call reliability decays as history
grows. Carry its framing — *"the executor proposes, the registry disposes"* — and read its status
honestly: a 2026-06-12 sweep spec, adversarially reviewed, **not owner-interviewed**, and a gated
build-if-needed item ([BUILD-ORDER.md item 10](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/docs/roadmap/BUILD-ORDER.md)) whose gate is a
measured silent-failure counter plus a latency arm. Its evidence is three single deterministic
trajectories (1/6 → 4/6 → 5/6) the spec itself calls directional — **not a result to quote.**

**Consent is already decided.** [`tool-capability-model.md`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/docs/systems/tool-capability-model.md)
maps every future tool onto the existing Three-Tier Action Model — autonomous / act-and-notify /
confirm-first ([`Alto-Design-Spec.md`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/docs/Alto-Design-Spec.md), from line 519) — rather than
inventing a second consent system. Reads are Tier 1; writes that act under your identity are
Tier 2/3.

## What exists today

**The channel, in full, on the live path.** [`markers.py`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/runtime/markers.py) is a
three-state streaming machine over the raw delta stream: `¦…¦` is speech and routes to TTS, `¤…¤`
is an action span, anything outside a pair is thought and is discarded. Spans are captured whole
rather than per-delta — `_close_action` ([`markers.py:52`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/runtime/markers.py#L52)) appends the stripped span to
`self.actions` — because the organ, when it lands, needs a complete action string to dispatch,
not fragments; `finalize` ([`markers.py:111`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/runtime/markers.py#L111)) captures a span left open by a truncated stream.
None of this is dormant: `integration.marker_filter` is **`true` as shipped**
([`config.yaml:370`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/config.yaml#L370)), `ollama.model` is the LoRA
(`alto-integration-v6`, [`config.yaml:88`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/config.yaml#L88)), and 300 of that adapter's 716-row training corpus are
`pure_action` or `mixed_marker` rows
([`SPEC-integration-retrain-v2.md:31-36`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/docs/specs/v1/SPEC-integration-retrain-v2.md#L31-L36)).

**What happens to a captured span today is the whole story of this organ.** It is printed to
stderr as `action (unwired in MVP)` and handed to the tracer's `record_marker_action`
([`speech_out.py:58-60`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/runtime/speech_out.py#L58-L60) blocking, `:192-194` streaming; [`trace.py:249`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/runtime/trace.py#L249)). Then nothing. It is
deliberately **not** appended to the exchange's actions, and the reason is pillar 3 in one
sentence: no effector fires, so recording it would append an `[Earlier this session Alto carried
out: X]` breadcrumb for something Alto did not do, "training the next-turn LLM to trust a lie"
([`speech_out.py:47-50`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/runtime/speech_out.py#L47-L50)). The note pre-empts the obvious future edit — when the organ lands, do
**not** restore that extend; feed a separate list from effector success. That discipline
already exists on the real path, where the one writer of an exchange's actions,
`Alto._record_action` ([`alto.py:325-326`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/runtime/alto.py#L325-L326)), is called only from the successful-call branch of
`ToolDispatcher.execute_tool_calls` ([`tool_dispatch.py:284`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/action/tool_dispatch.py#L284)), after `call_service` returned.

The fix cost something, and the code says so rather than hiding it: dropping the extend also
dropped the user's utterance on every pure-action turn, since turn persistence had been guarding
on `assistant_text or action_note`. The repair was to record the user alone
([`context.py:205-213`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/runtime/context.py#L205-L213)).

**And the conversational model still holds nothing.** Neither reply path in [`alto.py`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/runtime/alto.py) passes a
`tools` argument to the model, and the `ToolDispatcher.dispatch` call site is gone from both turn
handlers. That absence is asserted: `test_no_conversational_llm_call_passes_tools`
([`test_alto_v0.py`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/tests/test_alto_v0.py)) AST-scans [`src/alto/`](https://github.com/sawyerstrong/alto/tree/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto) and fails on any
`.chat(` / `.chat_stream(` call that passes tools, and `test_a_blocking_turn_sends_no_tools` /
`test_a_streaming_turn_sends_no_tools` run a turn through each path and check the request body
has no `tools` key. An edit that registers a tool on the conversational path has to delete those
tests to do it.

## The guard

Below this organ is the guard, the hard edge on everything else in the project. Influence over thought
is the project; **influence over the physical world is gated by code that does not care how the model
feels.** The guard is a small pure function, `validate_tool_call`
([`ha.py:148`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/action/ha.py#L148)). It takes a proposed device call, throws away most of what
the model said, resolves the entity against a registry it controls, checks the service against a
per-domain allowlist, and returns a validated tuple or `None`. The model's own `domain` argument is
discarded rather than checked ([`ha.py:154`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/action/ha.py#L154)): the registry is trusted over the model. A read-only sibling,
`validate_state_query` ([`ha.py:169`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/action/ha.py#L169)), checks state queries against the same registry.

There is exactly one `call_service` call site in the code
([`tool_dispatch.py:279`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/action/tool_dispatch.py#L279)), and it consumes the *validated*
tuple, never the model's arguments. Adding a device capability is three edits and never fewer: the
registry (`entities:` in [`config.yaml`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/config.yaml)), the allowlist, and a new test.
Widening what the model may emit is not one of them, and neither is a second path to `call_service`.

The guard is complete, and today nothing calls it, because the conversational model has no tools (see
above). So it is the one piece of this organ with no gap of its own. The gap is the caller, and the day
this organ lands the guard goes hot with no further review, which is the argument for keeping its unit
tests. The outbound sibling, which guards what may *leave* rather than what may act
(`validate_search_query`), belongs to [Processing](processing.md).

## The gap

**The consumer. All of it.** No module, no spec file of its own, no name in code beyond the
comments that promise it. It is designed-but-unbuilt at its thinnest: the contract is fixed on
both sides — what may reach it (a `¤` span of natural language) and what it must produce
(arguments that survive `validate_tool_call`) — while the organ between them has a sketch and a
slot. Three things are genuinely unstated, which is a different category again:

- **How a `¤` span becomes a directive.** The two-stage spec's directive contract (`ACTION:` /
  `CHECK:` / `REPLY`, with a terminal `---` sentinel) was authored 2026-06-12, eighteen days
  before Integration-MVP, against the single-stage tool-calling pipeline. It never mentions
  commitment spans. Whether the `¤` span *is* the directive or is parsed into one is unresolved.
- **Confirm-first has no spec.** The tier exists and the taxonomy maps tools onto it, but nothing
  specifies the action-side confirm flow.
  [`SPEC-ask-confirmation.md`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/docs/specs/v1/SPEC-ask-confirmation.md) is *not* it — that spec
  resolves sub-certain memory facts, and its v1 reversed out of the voice-ask channel.
- **The gate's instrument is attached to dead code.** Arm A proposes extending `_dispatch_tools`
  (now `ToolDispatcher.dispatch`) to log silent-failure candidates, and it ([`tool_dispatch.py:83`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/action/tool_dispatch.py#L83)) has no call site,
  so nothing is counting. The gate cannot pass on its own terms until something calls the
  effector path again — which is this organ. Plan that measurement to run somewhere else.

Everything past Home Assistant — calendar, email, autonomous research
([V3](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/docs/specs/v3/SPEC-autonomous-research.md)) — is design direction, and reuses this organ
and this guard rather than growing its own.

## Pillars this serves

- **Pillar 8 (the deterministic safety boundary stays deterministic)** — the organ exists so the
  thing holding the tools is not the thing with an interior. It proposes; the registry disposes.
- **Pillar 3 (honesty by construction)** — twice. Structurally, in keeping a fabricated memory
  from reaching `call_ha_service`. And concretely in R18: a captured intent is not a performed
  act, so it is logged and never written to memory. Alto not claiming to have done what it did
  not do is the same commitment as not claiming to remember what it never heard.
- **Pillar 7 (composed proof, not mechanisms)** — three deterministic n=1 trajectories are a
  direction, not a distribution; the spec's own criteria demand a multi-turn harness re-run.

## Sources

- [CLAUDE.md](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/CLAUDE.md) · [PILLARS.md](../PILLARS.md) ·
  [THE-ORGANS.md](../THE-ORGANS.md) — pillars 8 and 3, and the dashed guard-caller.
- [SPEC-ha-tool-calling.md](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/docs/specs/SPEC-ha-tool-calling.md) — the approved contract for the
  guard.
- [SPEC-integration-mvp.md](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/docs/specs/v1/SPEC-integration-mvp.md) — the marking-LoRA /
  action-LLM split and the accepted regression.
- [SPEC-two-stage-executor.md](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/docs/specs/v1/SPEC-two-stage-executor.md) ·
  [two-stage-action-executor.md](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/docs/systems/two-stage-action-executor.md) — draft, gated, not
  owner-interviewed. [tool-capability-model.md](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/docs/systems/tool-capability-model.md) ·
  [Alto-Design-Spec.md](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/docs/Alto-Design-Spec.md) — taxonomy and Three-Tier consent.
  [alto-conscious-locus.md](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/docs/systems/alto-conscious-locus.md) — intentions go down.
- Neighbours: [integration.md](integration.md) · [renderer.md](renderer.md).
- Code: [`markers.py`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/runtime/markers.py) ·
  [`alto.py`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/runtime/alto.py) · [`context.py`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/runtime/context.py) ·
  [`trace.py`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/runtime/trace.py) · [`ha.py`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/alto/action/ha.py) ·
  [`config.yaml`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/config.yaml) ·
  [`test_alto_v0.py`](https://github.com/sawyerstrong/alto/blob/587b40d4978e5a6d1997290d2dc1992188516e49/src/tests/test_alto_v0.py).
