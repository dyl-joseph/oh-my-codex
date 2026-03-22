#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

function parseArgs(argv: string[]): { gameCwd: string } {
  let gameCwd = '';
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--game-cwd' && argv[i + 1]) {
      gameCwd = argv[i + 1]!;
      i += 1;
    }
  }
  if (!gameCwd) throw new Error('missing required --game-cwd');
  return { gameCwd };
}

function runCargoBuild(gameCwd: string): void {
  const result = spawnSync('cargo', ['build'], {
    cwd: gameCwd,
    stdio: 'inherit',
    env: process.env,
  });
  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
}

function main(): void {
  const { gameCwd } = parseArgs(process.argv.slice(2));
  if (!existsSync(join(gameCwd, 'Cargo.toml'))) {
    throw new Error(`missing Cargo.toml in ${gameCwd}`);
  }

  runCargoBuild(gameCwd);
  const binaryPath = join(gameCwd, 'target', 'debug', 'dino-game');
  if (!existsSync(binaryPath)) {
    throw new Error(`missing built dino binary at ${binaryPath}`);
  }

  const child = spawn(binaryPath, {
    cwd: gameCwd,
    stdio: 'ignore',
    env: process.env,
  });

  const forwardTerminate = (): void => {
    if (!child.killed) {
      try {
        child.kill('SIGTERM');
      } catch {
        // ignore
      }
    }
  };

  process.on('SIGTERM', forwardTerminate);
  process.on('SIGINT', forwardTerminate);

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });

  child.on('error', (error) => {
    console.error(`[team-play-window-launch] failed to launch dino-game: ${error.message}`);
    process.exit(1);
  });
}

main();
