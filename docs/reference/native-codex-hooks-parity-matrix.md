# Native Codex Hooks Parity Matrix

Last real native smoke verified: **April 6, 2026** with **Codex CLI v0.118.0** via actual `codex exec` runs, not synthetic dispatch.

## Status legend

- **direct** — OMX installs a real native Codex hook and forwards the event on the native path.
- **partial** — the native event reaches OMX, but OMX does not implement the full native control/output contract.
- **runtime-fallback** — behavior exists only through notify-hook / derived / tmux / runtime paths, not as a direct native Codex hook capability.
- **unsupported** — no direct OMX-native implementation for that surface.

## Truth boundary

- “native direct” means `.codex/hooks.json` invoked Codex’s native hook runner for the event.
- “works” must not mean “synthetic dispatch”, `notify-hook`, tmux injection, or plugin-only runtime behavior unless the docs say **runtime-fallback** explicitly.
- Raw Codex capability and OMX parity are different questions. This matrix is about **OMX parity on the native path**.

## Raw Codex baseline proved in real runs

The following were verified with real `codex exec` runs on April 6, 2026:

- native `UserPromptSubmit` can inject `additionalContext`
- native `PreToolUse` can block Bash execution with a reason
- native `Stop` can block once, continue one more pass, then finish with `stop_hook_active: true`

Manual rerun script:

```bash
npm run build
node dist/scripts/eval/eval-native-hooks-truth.js
```

## OMX native parity matrix

| Surface | Native Codex event | OMX status | Notes |
| --- | --- | --- | --- |
| SessionStart dispatch | `SessionStart` | direct | OMX installs the native hook in `.codex/hooks.json` and `src/scripts/codex-native-hook.ts` forwards it as `session-start`. |
| UserPromptSubmit dispatch | `UserPromptSubmit` | direct | Real native runs show `hook: UserPromptSubmit`, and OMX forwards it as `user-prompt-submit`. |
| UserPromptSubmit keyword-detector parity | `UserPromptSubmit` | runtime-fallback | Keyword activation currently happens in `src/scripts/notify-hook.ts` via `recordSkillActivation(...)` after turn processing, not inside the native `UserPromptSubmit` bridge. |
| UserPromptSubmit additional context / activation message | `UserPromptSubmit` | unsupported | Raw Codex supports `hookSpecificOutput.additionalContext`, but OMX’s `codex-native-hook.ts` only dispatches and emits no hook control JSON. |
| PreToolUse Bash dispatch | `PreToolUse` (`matcher: Bash`) | direct | OMX installs a native Bash-only `PreToolUse` hook and forwards payloads that include `tool_input` and `tool_use_id`. |
| PreToolUse deny / warn / additional context | `PreToolUse` | unsupported | Raw Codex supports block/decision output, but OMX’s native bridge does not emit any stdout decision payload. |
| PreToolUse non-Bash | `PreToolUse` | unsupported | OMX-managed native config only registers `matcher: "Bash"`. |
| PostToolUse Bash dispatch | `PostToolUse` (`matcher: Bash`) | direct | Real native Bash runs show OMX receiving `tool_response` on the native path. |
| PostToolUse success/failure-specific branching | `PostToolUse` | partial | Raw Codex supports success/failure matcher groups, but OMX-managed config only installs a Bash-level event matcher and forwards the raw payload. |
| PostToolUse additional context / reminder injection | `PostToolUse` | unsupported | OMX’s native bridge does not emit post-hook control JSON back to Codex. |
| `PostToolUseFailure` | none (folded into `PostToolUse`) | unsupported | Native Codex does not expose a separate `PostToolUseFailure` event; failure matching is folded into `PostToolUse`. |
| Stop dispatch | `Stop` | direct | OMX installs and forwards the native `Stop` event; payloads include `stop_hook_active`. |
| Native Stop continuation / continue-one-more-pass | `Stop` | unsupported | Raw Codex supports `decision: "block"` for one-more-pass continuation, but OMX’s native bridge does not emit a Stop control payload. |
| auto-nudge / continue-one-more-pass | none | runtime-fallback | OMX’s current “continue one more pass” behavior lives in `src/scripts/notify-hook/auto-nudge.ts` through notify/tmux runtime logic, not native `Stop`. |
| cancel / user abort / rate-limit / context-limit loop guards | mixed | runtime-fallback | Loop prevention is currently enforced in notify/auto-nudge/runtime paths and tests, not as a native Stop continuation contract. |
| `ask-user-question` | none | runtime-fallback | Runtime/openclaw/notification event only; not a native Codex hook event. |
| `session-end` | none | runtime-fallback | Runtime/openclaw/notification event only; not a native Codex hook event. |
| `session-idle` | none | runtime-fallback | Runtime/openclaw/notification event only; not a native Codex hook event. |
| `SubagentStop` | none | unsupported | No direct native Codex hook equivalent exists in the current bridge. |

## Source anchors

- `src/hooks/native-hooks-config.ts` — managed native hook registration (`SessionStart`, `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Stop`)
- `src/scripts/codex-native-hook.ts` — current OMX native bridge; dispatch-only
- `src/scripts/notify-hook.ts` — runtime fallback path that currently records keyword activation
- `src/scripts/notify-hook/auto-nudge.ts` — notify/tmux fallback continuation logic
- `src/openclaw/types.ts` — runtime/openclaw event surface
