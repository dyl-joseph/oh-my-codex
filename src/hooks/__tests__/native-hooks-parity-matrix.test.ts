import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const matrixDoc = readFileSync(
  join(__dirname, '../../../docs/reference/native-codex-hooks-parity-matrix.md'),
  'utf-8',
);

describe('native Codex hooks parity matrix contract', () => {
  it('defines the direct/partial/runtime-fallback/unsupported legend', () => {
    assert.match(matrixDoc, /\*\*direct\*\*/);
    assert.match(matrixDoc, /\*\*partial\*\*/);
    assert.match(matrixDoc, /\*\*runtime-fallback\*\*/);
    assert.match(matrixDoc, /\*\*unsupported\*\*/);
  });

  it('documents the false-confidence boundary against synthetic and fallback paths', () => {
    assert.match(matrixDoc, /not synthetic dispatch/i);
    assert.match(matrixDoc, /must not mean “synthetic dispatch”, `notify-hook`, tmux injection, or plugin-only runtime behavior/i);
  });

  it('pins the five non-native surfaces as runtime-fallback or unsupported', () => {
    assert.match(matrixDoc, /\| `ask-user-question` \| none \| runtime-fallback \|/);
    assert.match(matrixDoc, /\| `PostToolUseFailure` \| none \(folded into `PostToolUse`\) \| unsupported \|/);
    assert.match(matrixDoc, /\| `SubagentStop` \| none \| unsupported \|/);
    assert.match(matrixDoc, /\| `session-end` \| none \| runtime-fallback \|/);
    assert.match(matrixDoc, /\| `session-idle` \| none \| runtime-fallback \|/);
  });

  it('keeps UserPromptSubmit, PreToolUse, PostToolUse, and Stop parity distinctions explicit', () => {
    assert.match(matrixDoc, /\| UserPromptSubmit dispatch \| `UserPromptSubmit` \| direct \|/);
    assert.match(matrixDoc, /\| UserPromptSubmit additional context \/ activation message \| `UserPromptSubmit` \| unsupported \|/);
    assert.match(matrixDoc, /\| PreToolUse Bash dispatch \| `PreToolUse` \(`matcher: Bash`\) \| direct \|/);
    assert.match(matrixDoc, /\| PreToolUse deny \/ warn \/ additional context \| `PreToolUse` \| unsupported \|/);
    assert.match(matrixDoc, /\| PostToolUse success\/failure-specific branching \| `PostToolUse` \| partial \|/);
    assert.match(matrixDoc, /\| Native Stop continuation \/ continue-one-more-pass \| `Stop` \| unsupported \|/);
    assert.match(matrixDoc, /\| auto-nudge \/ continue-one-more-pass \| none \| runtime-fallback \|/);
  });
});
