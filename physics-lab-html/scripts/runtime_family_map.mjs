import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const runtimeFamilyMap = require('../assets/runtime/runtime-family-map.json');

function normalizePatternName(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function buildPatternMap() {
  const mapping = new Map();
  for (const family of runtimeFamilyMap.families || []) {
    const aliases = new Set([
      family.id,
      family.component,
      family.runtimeFamily,
      ...(family.aliases || [])
    ]);
    for (const alias of aliases) {
      mapping.set(normalizePatternName(alias), [family.component]);
    }
  }
  return mapping;
}

const patternToComponents = buildPatternMap();

export function resolveRuntimeComponentsFromPatterns(patterns = []) {
  const resolved = new Set();
  const unresolved = [];

  for (const pattern of patterns) {
    const key = normalizePatternName(pattern);
    const mapped = patternToComponents.get(key);
    if (!mapped) {
      unresolved.push(pattern);
      continue;
    }
    mapped.forEach((entry) => resolved.add(entry));
  }

  return {
    components: [...resolved],
    unresolved
  };
}

export function getKnownRuntimePatternAliases() {
  return [...patternToComponents.keys()];
}

export function getRuntimeFamilyRegistry() {
  return runtimeFamilyMap.families || [];
}
