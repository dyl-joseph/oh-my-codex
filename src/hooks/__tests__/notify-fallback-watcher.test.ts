import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  buildNotifyFallbackWatcherEnv,
  buildWorkerFallbackWatcherLaunchSpec,
  resolveFallbackWatcherStateDir,
} from '../../team/fallback-watcher.js';

describe('notify fallback watcher team-worker support', () => {
  it('resolves shared team state roots for worker sessions', () => {
    const cwd = '/repo/worktrees/worker-1';
    const stateDir = resolveFallbackWatcherStateDir(cwd, {
      OMX_TEAM_WORKER: 'alpha/worker-1',
      OMX_TEAM_STATE_ROOT: '/repo/.omx/state',
    });

    assert.equal(stateDir, '/repo/.omx/state');
  });

  it('falls back to cwd-local state when not in team-worker context', () => {
    const cwd = '/repo';
    const stateDir = resolveFallbackWatcherStateDir(cwd, {});

    assert.equal(stateDir, '/repo/.omx/state');
  });

  it('builds a worker watcher launch spec with shared state-root pid file', async () => {
    const pkgRoot = await mkdtemp(join(tmpdir(), 'omx-fallback-watcher-pkg-'));
    const cwd = await mkdtemp(join(tmpdir(), 'omx-fallback-watcher-cwd-'));
    try {
      await mkdir(join(pkgRoot, 'dist', 'scripts'), { recursive: true });
      await writeFile(join(pkgRoot, 'dist', 'scripts', 'notify-fallback-watcher.js'), '#!/usr/bin/env node\n');
      await writeFile(join(pkgRoot, 'dist', 'scripts', 'notify-hook.js'), '#!/usr/bin/env node\n');

      const spec = buildWorkerFallbackWatcherLaunchSpec({
        cwd,
        teamName: 'alpha',
        workerName: 'worker-1',
        parentPid: 4242,
        pkgRoot,
        env: buildNotifyFallbackWatcherEnv({
          OMX_TEAM_WORKER: 'alpha/worker-1',
          OMX_TEAM_STATE_ROOT: '/repo/.omx/state',
          TMUX: 'socket,1,0',
          TMUX_PANE: '%1',
        }),
      });

      assert.ok(spec);
      assert.equal(spec?.command, process.execPath);
      assert.deepEqual(spec?.args.slice(0, 6), [
        join(pkgRoot, 'dist', 'scripts', 'notify-fallback-watcher.js'),
        '--cwd',
        cwd,
        '--notify-script',
        join(pkgRoot, 'dist', 'scripts', 'notify-hook.js'),
        '--pid-file',
      ]);
      assert.equal(spec?.pidFilePath, '/repo/.omx/state/team/alpha/workers/worker-1/notify-fallback.pid');
      assert.equal(spec?.env.TMUX, undefined);
      assert.equal(spec?.env.TMUX_PANE, undefined);
      assert.equal(spec?.env.OMX_TEAM_WORKER, 'alpha/worker-1');
    } finally {
      await rm(pkgRoot, { recursive: true, force: true });
      await rm(cwd, { recursive: true, force: true });
    }
  });
});
