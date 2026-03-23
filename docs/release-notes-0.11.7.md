# Release notes — 0.11.7

## Summary

`0.11.7` packages the current `origin/dev` hotfix train after `0.11.6`, with emphasis on degraded-state auto-nudge recovery and the latest team control-plane correctness fixes.

## Included fixes

### Lane 1 — hooks/scripts watcher, auto-nudge, and leader/dispatch nudges

- `0aa41fe` / `#1002` — team dispatch now reuses the shared runtime-binary resolver instead of a hook-local hardcoded path, which removes wrong-binary regressions during notify-hook dispatch.
- `35a077e` / `#1004` — fallback watchers now debounce Ralph continue-steers across processes with shared timestamp + lock state, reducing duplicate `continue` spam from overlapping watchers.
- `2faa7ab` / `#1020` — auto-nudge upgrades anchored panes to the live sibling Codex pane when possible, and persisted dispatch IDs now match the bridge request IDs used at runtime.
- `eb4cd1c` / `#1021` — successful fallback dispatch confirmation now recovers requests back to `notified` instead of leaving them incorrectly failed.
- `72c52e9` / `#1001` and `1bc3dde` / `#1023` — leader nudges no longer resurface completed teams, stay mailbox-only for leader control, and treat advancing worker turn counts as real progress before declaring a stall.
- `4b84119` / local release follow-up — the release branch adds degraded-state fallback auto-nudge coverage plus live tmux verification for stalled-session recovery.

**User-facing effect:** nudges and dispatch recovery are more reliable in real tmux sessions, especially after stale panes, degraded HUD-only state, or mixed hook/runtime delivery paths.

**Review notes / residual risk:** the fixes are well-covered by targeted hook/runtime tests and live tmux smoke, but the highest remaining risk is still full interactive Codex-session behavior rather than the isolated fake-process smoke used in release verification.

### Lane 2 — team runtime/state/mailbox/tmux-session and linked Ralph follow-ups

- `22b084c` / `#1011` — adds a linked Ralph bridge loop so Ralph stays alive while a linked team is still executing.
- `f981102` / `#1012` — fixes the import conflict introduced by the linked-bridge rollout so team typecheck/build recovers.
- `18ff653` / `#1013` — skips the Ralph bridge in prompt-mode worker launches so the Ralph persistence gate is restored there.
- `8b0b1d3` / `#1017` — worker-to-leader mailbox writes deduplicate identical undelivered messages instead of appending and redispatching duplicates.
- `61533ff` / `#1025` — keeps already-notified leader mailbox sends idempotent and finalizes linked Ralph cleanly if the paired team state disappears.

**User-facing effect:** linked Ralph + team orchestration is less likely to get stuck, and leader mailbox traffic is more idempotent under retries and fallback paths.

**Review notes / residual risk:** the direction is correct and the transition rules are tighter after `#1025`, but this lane still depends on subtle state-machine edges (`pending`/`notified`/`failed`, missing-team cleanup, prompt-mode vs worker-mode launch paths), so future changes should keep the targeted runtime tests mandatory.

### Lane 3 — agents/config/prompts/release metadata consistency

- `a3b7e4d` / `#1009` — the default generated status line now includes `weekly-limit`, improving out-of-the-box Codex HUD visibility.
- `d80cdfb` / `#1016` — exact `gpt-5.4-mini` worker/subagent launches now get a narrow instruction-composition seam with stricter execution/verification guidance, while leaving broader routing unchanged.
- `58a20f4` / `#1018` — AGENTS guidance now prefers inherited/current frontier defaults for native child agents instead of stale explicit model pins.
- `c4c5b75` / local release follow-up — Cargo workspace metadata and lockfile versions are realigned to `0.11.7` so the release stays version-sync consistent with `package.json`.

**User-facing effect:** generated configs expose one more quota signal, subagent prompts are more consistent for exact mini launches, and the release metadata matches across Node/Rust packaging surfaces.

**Review notes / residual risk:** the `gpt-5.4-mini` seam is intentionally narrow and exact-string gated; the main risk is future drift if prompt composition logic is copied elsewhere instead of staying centralized.

### Main-only delta

- `main` has three commits unique vs `dev`: `fa86574` (`#1000`), `4a44f6d` (`#997`), and `a677922` (`#995`). All three are merge commits from `dev`; this review found no main-only product change that needs separate 0.11.7 release-note coverage beyond calling them out as merge-only.

## Verification evidence

### Targeted regression suite

- `npm run build` ✅
- `node --test dist/hooks/__tests__/notify-fallback-watcher.test.js dist/hooks/__tests__/notify-hook-auto-nudge.test.js` ✅
  - result: `49/49` passing

### Real tmux / OMX smoke

#### Degraded-state auto-nudge

- branch: `release/0.11.7-refresh` at `1bc3dde`
- setup: live tmux pane running a long-lived fake `codex` process, stalled `hud-state.json` with `If you want, I can keep going from here.` and 5s stall threshold
- result: **PASS**
  - watcher result: `fallback_auto_nudge.last_reason = sent`
  - `auto-nudge-state.json`: `nudgeCount = 1`
  - pane capture contained: `yes, proceed [OMX_TMUX_INJECT]`

#### Ralph continue-steer anti-spam

- setup: live tmux pane with active `ralph-state.json`, watcher run twice back-to-back in `--once` mode
- result: **PASS** for immediate anti-spam check
  - second run ended in `startup_cooldown`
  - no immediate repeat continue-steer was observed in the back-to-back smoke

## Remaining risk

- The real smoke used isolated disposable tmux sessions with a long-lived fake `codex` process, not a full interactive Codex conversation loop.
- Full release confidence is strong for the nudge / watcher path, but broader team startup behavior should still rely on the targeted runtime suite in addition to this smoke.
