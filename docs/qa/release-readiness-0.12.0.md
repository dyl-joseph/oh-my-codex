# Release Readiness Draft - 0.12.0

Date: **2026-04-06**
Target version: **0.12.0**
Comparison base: **`v0.11.13..HEAD`**
Verdict: **NO-GO (draft)** ❌

`0.12.0` is shaping up as a feature/minor release rather than another patch cut. The release window since `v0.11.13` is broad (`180` files changed, `+9725 / -2736`, `88` commits total / `63` non-merge commits), so the release notes need to emphasize the new native Codex hook lane, the team/runtime delivery contract hardening, and the prompt/docs contract refresh rather than treating this as routine metadata churn.

## Scope reviewed

- native Codex hook ownership and lifecycle continuity (`src/scripts/codex-native-hook.ts`, `src/config/codex-hooks.ts`, `src/cli/setup.ts`, `docs/codex-native-hooks.md`)
- first-party Bash `PreToolUse` / `PostToolUse` support (`src/scripts/codex-native-pre-post.ts`, native-hook tests/docs)
- team delivery/runtime state hardening, mailbox/dispatch observability, pane status, and e2e smoke coverage (`src/team/**`, `src/scripts/notify-hook/team-*.ts`, `docs/contracts/team-*.md`)
- notification/session reliability and Windows/tmux command-path fixes (`src/hooks/**`, `src/notifications/**`, `src/utils/platform-command.ts`)
- quality-first guidance + agent contract refresh (`AGENTS.md`, `templates/AGENTS.md`, `prompts/*.md`, `docs/prompt-guidance-*`, `skills/team/SKILL.md`)
- documentation and localization refresh (`docs/readme/**`, `docs/openclaw-integration.uk.md`, `README.md`, `.github/ISSUE_TEMPLATE/config.yml`)

## Current release-shape evidence

- current `package.json` version: **`0.11.13`**
- current `Cargo.toml` workspace version: **`0.11.13`**
- detached worker HEAD: **`d850927`** (contained by `dev` and `release/0.12.0`)
- diff reviewed against explicit release base: **`v0.11.13..HEAD`**
- release-notes artifact for `0.12.0`: **not yet present** at review time
- `RELEASE_BODY.md`: **still targets `v0.11.13`** at review time

## Required release-note items

1. **Native Codex hook ownership moved into the repo/runtime contract.**
   - Call out that non-team OMX sessions now own native Codex hook setup locally, preserve session-start + stop-state continuity, and expose documented setup/uninstall behavior.
2. **First-party native Bash pre/post tool hooks landed.**
   - Mention `PreToolUse` / `PostToolUse` guidance and the new native hook execution lane instead of burying it under general hook cleanup.
3. **Team runtime delivery/state handling was substantially hardened.**
   - Highlight mailbox/dispatch integrity, leader nudge delivery, pane-status visibility, worker bootstrap/runtime coordination, and dedicated delivery telemetry/state contracts.
4. **Session/notification behavior became more reliable under real operator workflows.**
   - Mention stale-log avoidance, reminder/nudge dedupe, same-thread Ralph continuity, idle cooldown cleanup, and Windows/tmux startup fixes.
5. **Prompt + AGENTS guidance defaults shifted to quality-first operation.**
   - Mention the generated prompt contract refresh, stronger sequencing/verification guidance, and the removal of stale legacy aliases/surfaces.
6. **Docs/i18n collateral changed enough to merit explicit mention.**
   - Include the translated README relocation under `docs/readme/`, the new Ukrainian docs coverage, and the OpenClaw integration update.

## Module-by-module verification plan

| Module | Representative paths | Release-note focus | Verification emphasis |
|---|---|---|---|
| Native hook ownership + lifecycle | `src/scripts/codex-native-hook.ts`, `src/config/codex-hooks.ts`, `src/cli/setup.ts`, `src/cli/uninstall.ts`, `docs/codex-native-hooks.md` | repo-local native hook ownership; session-start/stop continuity | `npm run build`; `node --test dist/scripts/__tests__/codex-native-hook.test.js dist/config/__tests__/generator-idempotent.test.js dist/cli/__tests__/setup-scope.test.js dist/cli/__tests__/uninstall.test.js` |
| Native pre/post tool hooks | `src/scripts/codex-native-pre-post.ts`, `src/scripts/__tests__/codex-native-hook.test.ts`, `docs/codex-native-hooks.md` | first-party `PreToolUse` / `PostToolUse` Bash guidance | `node --test dist/scripts/__tests__/codex-native-hook.test.js` |
| Team runtime / delivery contract | `src/team/**`, `src/scripts/notify-hook/team-dispatch.ts`, `src/scripts/notify-hook/team-leader-nudge.ts`, `docs/contracts/team-delivery-state-contract.md`, `docs/contracts/team-runtime-state-contract.md` | mailbox + dispatch integrity, pane-status visibility, worker/bootstrap reliability | `node dist/scripts/run-test-files.js dist/team/__tests__/delivery-e2e-smoke.test.js dist/team/__tests__/runtime.test.js dist/team/__tests__/state.test.js dist/team/__tests__/worker-bootstrap.test.js` |
| Notify / reminder / session stability | `src/hooks/**`, `src/notifications/**`, `src/utils/platform-command.ts`, `src/scripts/notify-fallback-watcher.ts` | stale-log protection, nudge dedupe, same-thread continuity, Windows/tmux resilience | `node dist/scripts/run-test-files.js dist/hooks/__tests__/notify-hook-team-dispatch.test.js dist/hooks/__tests__/notify-hook-team-leader-nudge.test.js dist/hooks/__tests__/notify-hook-team-tmux-guard.test.js dist/hooks/__tests__/notify-hook-worker-idle.test.js dist/hooks/__tests__/notify-fallback-watcher.test.js dist/notifications/__tests__/idle-cooldown.test.js dist/utils/__tests__/platform-command.test.js` |
| CLI / prompt contract / docs surface | `src/cli/index.ts`, `AGENTS.md`, `templates/AGENTS.md`, `prompts/*.md`, `docs/prompt-guidance-*`, `skills/team/SKILL.md` | quality-first prompt defaults; legacy alias cleanup; stronger verification language | `node --test dist/cli/__tests__/index.test.js dist/cli/__tests__/autoresearch-guided.test.js dist/cli/__tests__/cleanup.test.js dist/cli/__tests__/error-handling-warnings.test.js` plus `node dist/scripts/generate-catalog-docs.js --check` |
| Docs + localization collateral | `docs/readme/**`, `docs/openclaw-integration.uk.md`, `README.md`, `.github/ISSUE_TEMPLATE/config.yml` | translated README relocation; Ukrainian docs; release-facing docs cleanup | `git diff --check v0.11.13..HEAD`; manual doc spot-check against release note bullets |

## Local validation evidence completed for this review draft

| Check | Command | Result |
|---|---|---|
| Diff scope inventory | `git diff --name-only v0.11.13..HEAD` | PASS |
| Commit inventory | `git log --oneline v0.11.13..HEAD` | PASS |
| Diff size summary | `git diff --stat v0.11.13..HEAD` | PASS |
| Release metadata spot-check | `node -p "require('./package.json').version"` + `python` read of `Cargo.toml` | PASS (`0.11.13` / `0.11.13`; confirms bump still pending) |

## Current blockers before tag/release

- `package.json`, `Cargo.toml`, lockfiles, and generated release collateral have **not** been bumped to `0.12.0` yet.
- `docs/release-notes-0.12.0.md` is not present yet, and `RELEASE_BODY.md` still describes `v0.11.13`.
- Because the release window is broad across runtime, notify-hook, CLI, and docs surfaces, a full release verification sweep should be rerun **after** the version bump + final collateral land.

## Final draft verdict

Release **0.12.0** is **not ready to tag/publish yet** based on the current tree, but the release-note inventory and verification plan above identify the major modules and the minimum evidence expected once the final release artifacts land.
