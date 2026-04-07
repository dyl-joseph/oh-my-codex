# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is OMX

oh-my-codex (OMX) is a multi-agent orchestration layer for OpenAI Codex CLI. It provides structured workflow coordination, 35+ agent role prompts, 38+ workflow skills, durable team runtime via tmux/worktrees, and MCP servers for state/memory/code-intel.

## Commands

```bash
# Build
npm run build              # TypeScript → dist/
npm run build:full         # TS + Rust explore harness + sparkshell
npm run dev                # TypeScript watch mode

# Lint & typecheck
npm run lint               # Biome linter
npx tsc --noEmit           # TypeScript type checking

# Test
npm test                   # Full suite (build + test:node + catalog doc check)
npm run test:node          # Node test runner only (requires prior build)
npm run test:explore       # Rust + Node explore harness tests
npm run test:team:cross-rebase-smoke

# Run a single test file (must build first)
node --test dist/path/to/__tests__/foo.test.js

# Coverage (team/state critical — CI enforces 78% lines, 90% functions, 70% branches)
npm run coverage:team-critical

# Rust
cargo build -p omx-explore-harness
cargo test -p omx-explore-harness
cargo clippy --workspace --all-targets -- -D warnings

# CLI
omx setup                  # Install prompts, skills, AGENTS.md to ~/.codex/
omx doctor                 # Validate installation
```

## Architecture

### Layers

- **CLI** (`src/cli/`) — Entry point `omx.ts`, command router `index.ts`. Commands: setup, doctor, team, explore, sparkshell, cleanup, etc.
- **Team Runtime** (`src/team/`) — Durable multi-agent orchestration. `runtime.ts` manages tmux sessions and workers; `state.ts` is a state machine (plan→execute→verify→fix); `api-interop.ts` handles Codex CLI communication; `scaling.ts` manages worker allocation.
- **Hooks** (`src/hooks/`) — Lifecycle hooks. `keyword-detector.ts` routes user messages to skills; `agents-overlay.ts` generates agent prompts with runtime context.
- **MCP Servers** (`src/mcp/`) — State server, code-intel server, memory server, trace server.
- **Config** (`src/config/`) — Config generation/merging, model routing, MCP registry, native Codex hook registration.
- **Notifications** (`src/notifications/`) — Slack, Discord, Telegram integrations.
- **Rust crates** (`crates/`) — `omx-explore` (codebase exploration harness), `omx-runtime` (native runtime), `omx-runtime-core` (shared utils), `omx-mux` (tmux utils), `omx-sparkshell` (shell output summarizer).

### Distributed assets

`omx setup` installs to `~/.codex/`:
- `prompts/*.md` — 35+ agent role prompts (executor, architect, debugger, planner, etc.)
- `skills/*/SKILL.md` — 38+ workflow skills (ralph, ralplan, team, autopilot, etc.)
- `AGENTS.md` — Top-level orchestration brain (from `templates/`)

### Key files

- `AGENTS.md` — Orchestration contract for Codex agents (autonomy directive, delegation rules, keyword routing). Not developer docs — it's the runtime operating contract.
- `src/team/runtime.ts` — Core team runtime engine (largest file ~145KB).
- `src/team/state.ts` — Durable state machine (~70KB).
- `docs/guidance-schema.md` — Prompt guidance contract schema.

## Conventions

- **TypeScript**: ES2022, strict mode, NodeNext modules. Source in `src/`, compiled to `dist/`.
- **Testing**: Node.js built-in test runner (`node:test` + `node:assert/strict`). Tests in `__tests__/` dirs as `.test.ts`. No external test framework.
- **Linting**: Biome only (no ESLint/Prettier). Config in `biome.json`.
- **Rust**: Edition 2021. `cargo fmt` + `cargo clippy -D warnings` enforced in CI.
- **Commits**: Semantic prefixes — `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.
- **Node**: Requires >= 20. CI tests on 20 and 22.
- **Runtime markers**: Prompts use `<!-- OMX:RUNTIME:START -->` / `<!-- OMX:TEAM:WORKER:START -->` bounded overlays for runtime injection. Keep these stable.

## Environment variables

Model config: `OMX_DEFAULT_FRONTIER_MODEL`, `OMX_DEFAULT_STANDARD_MODEL`, `OMX_DEFAULT_SPARK_MODEL`.
Team runtime: `OMX_TEAM_STATE_ROOT`, `OMX_TEAM_WORKER`, `OMX_TEAM_LEADER_CWD`, `OMX_TEAM_WORKER_LAUNCH_ARGS`.
MCP: `OMX_STATE_SERVER_DISABLE_AUTO_START`, `OMX_CODE_INTEL_SERVER_DISABLE_AUTO_START`.

## CI

GitHub Actions: `ci.yml` (lint, typecheck, test, coverage gates, build), `release.yml` (multi-platform native builds, npm publish). Coverage gates on team/state modules are enforced — don't lower thresholds.

## Progress log

- 2026-04-07T19:22:51Z: Restored AGENTS/template guidance-contract wording for explore/sparkshell routing and worker handoff phrasing to satisfy regex-based test contracts.
