import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { getPackageRoot } from '../utils/package.js';

const TEAM_WORKER_ENV = 'OMX_TEAM_WORKER';
const TEAM_STATE_ROOT_ENV = 'OMX_TEAM_STATE_ROOT';
const DEFAULT_NOTIFY_FALLBACK_MAX_LIFETIME_MS = 6 * 60 * 60 * 1000;
const TEAM_WORKER_PATTERN = /^([a-z0-9][a-z0-9-]{0,29})\/(worker-\d+)$/;

function parseTeamWorkerEnv(rawValue: string | undefined): { teamName: string; workerName: string } | null {
  if (typeof rawValue !== 'string') return null;
  const match = TEAM_WORKER_PATTERN.exec(rawValue.trim());
  if (!match) return null;
  return { teamName: match[1]!, workerName: match[2]! };
}

export function resolveFallbackWatcherStateDir(
  cwd: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const teamWorker = parseTeamWorkerEnv(env[TEAM_WORKER_ENV]);
  const explicitStateRoot = typeof env[TEAM_STATE_ROOT_ENV] === 'string'
    ? env[TEAM_STATE_ROOT_ENV].trim()
    : '';

  if (teamWorker && explicitStateRoot) {
    return resolve(cwd, explicitStateRoot);
  }

  return join(cwd, '.omx', 'state');
}

export function buildNotifyFallbackWatcherEnv(
  env: NodeJS.ProcessEnv = process.env,
  extraEnv: Record<string, string> = {},
): NodeJS.ProcessEnv {
  const nextEnv = { ...env, ...extraEnv };
  delete nextEnv.TMUX;
  delete nextEnv.TMUX_PANE;
  return {
    ...nextEnv,
    OMX_HUD_AUTHORITY: '0',
  };
}

export interface WorkerFallbackWatcherLaunchSpec {
  command: string;
  args: string[];
  env: NodeJS.ProcessEnv;
  cwd: string;
  pidFilePath: string;
  watcherScript: string;
  notifyScript: string;
  parentPid: number;
}

export function buildWorkerFallbackWatcherLaunchSpec(
  options: {
    cwd: string;
    teamName: string;
    workerName: string;
    parentPid: number;
    env?: NodeJS.ProcessEnv;
    pkgRoot?: string;
    maxLifetimeMs?: number;
  },
): WorkerFallbackWatcherLaunchSpec | null {
  const {
    cwd,
    teamName,
    workerName,
    parentPid,
    env = process.env,
    pkgRoot = getPackageRoot(),
    maxLifetimeMs = DEFAULT_NOTIFY_FALLBACK_MAX_LIFETIME_MS,
  } = options;

  if (!Number.isInteger(parentPid) || parentPid <= 0) return null;

  const watcherScript = join(pkgRoot, 'dist', 'scripts', 'notify-fallback-watcher.js');
  const notifyScript = join(pkgRoot, 'dist', 'scripts', 'notify-hook.js');
  if (!existsSync(watcherScript) || !existsSync(notifyScript)) return null;

  const watcherEnv = buildNotifyFallbackWatcherEnv(env);
  const stateDir = resolveFallbackWatcherStateDir(cwd, watcherEnv);
  const pidFilePath = join(stateDir, 'team', teamName, 'workers', workerName, 'notify-fallback.pid');
  const args = [
    watcherScript,
    '--cwd',
    cwd,
    '--notify-script',
    notifyScript,
    '--pid-file',
    pidFilePath,
    '--parent-pid',
    String(parentPid),
    '--max-lifetime-ms',
    String(maxLifetimeMs),
  ];

  return {
    command: process.execPath,
    args,
    env: watcherEnv,
    cwd,
    pidFilePath,
    watcherScript,
    notifyScript,
    parentPid,
  };
}

export function startWorkerFallbackWatcher(
  options: Parameters<typeof buildWorkerFallbackWatcherLaunchSpec>[0],
): number | null {
  const spec = buildWorkerFallbackWatcherLaunchSpec(options);
  if (!spec) return null;

  const child = spawn(spec.command, spec.args, {
    cwd: spec.cwd,
    env: spec.env,
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.unref();
  return child.pid ?? null;
}
