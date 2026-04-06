import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, it } from 'node:test';

describe('native hook bridge dispatch-only contract', () => {
  it('does not claim native control-output support in the current bridge', async () => {
    const source = await readFile(join(process.cwd(), 'src', 'scripts', 'codex-native-hook.ts'), 'utf-8');
    assert.match(source, /await dispatchHookEventRuntime/);
    assert.doesNotMatch(source, /process\.stdout\.write/);
    assert.doesNotMatch(source, /console\.log/);
    assert.doesNotMatch(source, /hookSpecificOutput/);
    assert.doesNotMatch(source, /additionalContext/);
    assert.doesNotMatch(source, /decision:\s*['"]/);
  });
});
