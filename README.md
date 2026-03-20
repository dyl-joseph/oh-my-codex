# oh-my-codex (OMX)

<p align="center">
  <img src="https://yeachan-heo.github.io/oh-my-codex-website/omx-character-nobg.png" alt="oh-my-codex character" width="280">
  <br>
  <em>Make Codex easier to steer, reuse, and scale up.</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-codex)](https://www.npmjs.com/package/oh-my-codex)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Discord](https://img.shields.io/discord/1466022107199574193?color=5865F2&logo=discord&logoColor=white&label=Discord)](https://discord.gg/qRJw62Gvh7)

**Website:** https://yeachan-heo.github.io/oh-my-codex-website/  
**Docs:** [Getting Started](./docs/getting-started.html) · [Agents](./docs/agents.html) · [Skills](./docs/skills.html) · [Integrations](./docs/integrations.html) · [Demo](./DEMO.md) · [OpenClaw guide](./docs/openclaw-integration.md)

OMX is an operational layer for [OpenAI Codex CLI](https://github.com/openai/codex).

It keeps Codex as the execution engine and adds:
- installable **prompts** and **skills**
- durable **team orchestration** for bigger tasks
- operator commands like `setup`, `doctor`, `status`, and `cancel`
- project/runtime state under `.omx/`

## Who it is for

Use OMX if you already like Codex and want one or more of these:
- reusable agent prompts such as `/prompts:architect`
- workflow shortcuts such as `$plan`, `$team`, and `$ralph`
- a durable team runtime for bigger tasks
- better visibility into long-running work

If you just want plain Codex with no extra workflow layer, you probably do not need OMX.

## Quick start

### Requirements

- Node.js 20+
- Codex CLI installed: `npm install -g @openai/codex`
- Codex auth configured
- `tmux` if you want `omx team` on macOS/Linux
- `psmux` if you want native Windows team mode

### Install

```bash
npm install -g @openai/codex oh-my-codex
omx setup
omx doctor
```

### Fastest useful example

Launch Codex with OMX:

```bash
omx
```

Then try one command inside Codex:

```text
/prompts:architect "analyze the authentication flow"
```

That is the fastest way to feel what OMX changes: you get installable prompts, skills, and project guidance layered into a normal Codex session.

### First team run

If you want coordinated multi-agent execution:

```bash
omx team 3:executor "fix the failing tests with verification"
```

Check on it later with:

```bash
omx team status <team-name>
omx team resume <team-name>
omx team shutdown <team-name>
```

## Core commands

### In the terminal

| Command | What it does |
| --- | --- |
| `omx` | Launch Codex with OMX wiring |
| `omx setup` | Install prompts, skills, config, and AGENTS scaffolding |
| `omx doctor` | Verify the install |
| `omx team 3:executor "..."` | Start a coordinated tmux-based team |
| `omx team status <team-name>` | Inspect a running team |
| `omx status` | Show active OMX modes |
| `omx cancel` | Cancel active modes |
| `omx explore --prompt "..."` | Read-only repository exploration |
| `omx sparkshell <command>` | Shell-native inspection helper |
| `omx version` | Show version info |

### Inside Codex

| Command | Use it for |
| --- | --- |
| `/prompts:architect "..."` | Analysis and boundary review |
| `/prompts:executor "..."` | Focused implementation work |
| `/skills` | Browse installed skills |
| `$plan "..."` | Build a plan before implementation |
| `$team 3:executor "..."` | Kick off coordinated team execution |
| `$ralph "..."` | Run persistent sequential execution |

## A simple mental model

OMX does **not** replace Codex.

It adds a lightweight runtime around it:
- **Codex** does the actual agent work
- **OMX prompts and skills** make common roles and workflows reusable
- **`omx team`** adds durable tmux/worktree orchestration for bigger jobs
- **`.omx/`** stores runtime state, plans, logs, and memory

## Start here if you are new

1. Run `omx setup`
2. Run `omx`
3. Try `/prompts:architect "analyze <something>"`
4. Try `/skills`
5. When work gets bigger, use `$plan` or `omx team`

## Power-user notes

### Team Mode vs Ultrawork

- **Team Mode** is the default for bigger, shared-context tasks. It gives you durable tmux/state/worktree orchestration.
- **Ultrawork** is lighter parallel fanout for more independent subtasks.

Short version: **Ultrawork is parallelism. Team Mode is orchestration.**

### `omx explore` vs `omx sparkshell`

- Use **`omx explore`** for read-only repo lookup driven by a prompt.
- Use **`omx sparkshell`** when you want direct shell-style inspection or tmux pane capture.

Examples:

```bash
omx explore --prompt "git log --oneline -10"
omx sparkshell git status
omx sparkshell --tmux-pane %12 --tail-lines 400
```

### What `omx setup` writes

`omx setup` installs and updates the OMX surfaces Codex uses:
- prompts under `~/.codex/prompts/`
- skills under `~/.codex/skills/`
- OMX config entries in Codex config
- scope-aware `AGENTS.md` scaffolding
- runtime state under `.omx/`

### Model defaults

OMX uses explicit default model lanes:
- `OMX_DEFAULT_FRONTIER_MODEL`
- `OMX_DEFAULT_STANDARD_MODEL`
- `OMX_DEFAULT_SPARK_MODEL`

You can override them in your shell env or in `~/.codex/.omx-config.json`.

## Platform notes

`omx team` needs a tmux-compatible backend:

| Platform | Install |
| --- | --- |
| macOS | `brew install tmux` |
| Ubuntu/Debian | `sudo apt install tmux` |
| Fedora | `sudo dnf install tmux` |
| Arch | `sudo pacman -S tmux` |
| Windows | `winget install psmux` |
| Windows (WSL2) | `sudo apt install tmux` |

## Documentation

- [Getting Started](./docs/getting-started.html)
- [Demo guide](./DEMO.md)
- [Agent catalog](./docs/agents.html)
- [Skills reference](./docs/skills.html)
- [Integrations](./docs/integrations.html)
- [OpenClaw / notification gateway guide](./docs/openclaw-integration.md)
- [Contributing](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

## Languages

- [English](./README.md)
- [한국어](./README.ko.md)
- [日本語](./README.ja.md)
- [简体中文](./README.zh.md)
- [繁體中文](./README.zh-TW.md)
- [Tiếng Việt](./README.vi.md)
- [Español](./README.es.md)
- [Português](./README.pt.md)
- [Русский](./README.ru.md)
- [Türkçe](./README.tr.md)
- [Deutsch](./README.de.md)
- [Français](./README.fr.md)
- [Italiano](./README.it.md)

## License

MIT
