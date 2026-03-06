/**
 * Model Configuration
 *
 * Reads per-mode model overrides from .omx-config.json under the "models" key.
 *
 * Config format:
 * {
 *   "models": {
 *     "default": "o4-mini",
 *     "team": "gpt-4.1"
 *   }
 * }
 *
 * Resolution: mode-specific > "default" key > DEFAULT_FRONTIER_MODEL (hardcoded fallback)
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { codexHome } from '../utils/paths.js';

export interface ModelsConfig {
  [mode: string]: string | undefined;
}

function readModelsBlock(codexHomeOverride?: string): ModelsConfig | null {
  const configPath = join(codexHomeOverride || codexHome(), '.omx-config.json');
  if (!existsSync(configPath)) return null;
  try {
    const raw = JSON.parse(readFileSync(configPath, 'utf-8'));
    if (raw && typeof raw.models === 'object' && raw.models !== null && !Array.isArray(raw.models)) {
      return raw.models as ModelsConfig;
    }
    return null;
  } catch {
    return null;
  }
}

export const DEFAULT_FRONTIER_MODEL = 'gpt-5.4';
export const HARDCODED_DEFAULT_MODEL = DEFAULT_FRONTIER_MODEL;
export const HARDCODED_TEAM_LOW_COMPLEXITY_MODEL = 'gpt-5.3-codex-spark';

/**
 * Get the configured model for a specific mode.
 * Resolution: mode-specific override > "default" key > DEFAULT_FRONTIER_MODEL
 */
export function getModelForMode(mode: string, codexHomeOverride?: string): string {
  const models = readModelsBlock(codexHomeOverride);
  if (!models) return DEFAULT_FRONTIER_MODEL;

  const modeValue = models[mode];
  if (typeof modeValue === 'string' && modeValue.trim() !== '') {
    return modeValue.trim();
  }

  const defaultValue = models['default'];
  if (typeof defaultValue === 'string' && defaultValue.trim() !== '') {
    return defaultValue.trim();
  }

  return DEFAULT_FRONTIER_MODEL;
}

const TEAM_LOW_COMPLEXITY_MODEL_KEYS = [
  'team_low_complexity',
  'team-low-complexity',
  'teamLowComplexity',
];

/**
 * Get the low-complexity team worker model.
 * Resolution: explicit low-complexity key(s) > hardcoded spark fallback.
 */
export function getTeamLowComplexityModel(codexHomeOverride?: string): string {
  const models = readModelsBlock(codexHomeOverride);
  if (models) {
    for (const key of TEAM_LOW_COMPLEXITY_MODEL_KEYS) {
      const value = models[key];
      if (typeof value === 'string' && value.trim() !== '') {
        return value.trim();
      }
    }
  }
  return HARDCODED_TEAM_LOW_COMPLEXITY_MODEL;
}
