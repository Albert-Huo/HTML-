import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const manifest = require('../assets/runtime/manifest.js');

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptPath);
const skillRoot = path.resolve(scriptDir, '..');
const runtimeRoot = path.join(skillRoot, 'assets/runtime');
const slotPattern = /(<script id="physicsRuntimeBundle">\s*)([\s\S]*?)(\s*<\/script>)/;

function unique(values) {
  return [...new Set(values)];
}

function splitList(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeComponentEntry(name) {
  if (name.startsWith('components/')) return name;
  return `components/${name.endsWith('.js') ? name : `${name}.js`}`;
}

function knownEntries() {
  return new Set(unique([
    ...manifest.primitives,
    ...manifest.components,
    ...manifest.firstWave
  ]));
}

export function resolveBundleEntries({ group = 'firstWave', components = [], entries = [] } = {}) {
  const selected = new Set();
  const known = knownEntries();
  const visiting = new Set();

  function addEntryWithDeps(entry) {
    if (selected.has(entry)) {
      return;
    }
    if (visiting.has(entry)) {
      throw new Error(`Circular runtime dependency detected: ${entry}`);
    }
    if (!known.has(entry)) {
      throw new Error(`Unknown runtime entry: ${entry}`);
    }

    visiting.add(entry);
    const deps = manifest.componentDeps[entry] || [];
    deps.forEach((dep) => addEntryWithDeps(dep));
    visiting.delete(entry);
    selected.add(entry);
  }

  if (components.length > 0) {
    for (const rawName of components) {
      const entry = normalizeComponentEntry(rawName);
      if (!known.has(entry) || !manifest.componentDeps[entry]) {
        throw new Error(`Unknown runtime component: ${rawName}`);
      }
      addEntryWithDeps(entry);
    }
  }

  if (entries.length > 0) {
    for (const entry of entries) {
      addEntryWithDeps(entry);
    }
  }

  if (selected.size === 0) {
    const groupEntries = manifest[group];
    if (!Array.isArray(groupEntries)) {
      throw new Error(`Unknown runtime group: ${group}`);
    }
    groupEntries.forEach((entry) => selected.add(entry));
  }

  const order = manifest.loadOrder || unique([
    ...manifest.primitives,
    ...manifest.components,
    ...manifest.firstWave
  ]);

  return order.filter((entry) => selected.has(entry));
}

export async function buildRuntimeBundle(options = {}) {
  const entries = resolveBundleEntries(options);
  const parts = [];

  for (const entry of entries) {
    const filePath = path.join(runtimeRoot, entry);
    const source = await fs.readFile(filePath, 'utf8');
    parts.push(`/* physics-runtime: ${entry} */\n${source.trim()}`);
  }

  return {
    entries,
    bundle: parts.join('\n\n')
  };
}

export function injectRuntimeBundleIntoHtml(html, bundle) {
  if (!slotPattern.test(html)) {
    throw new Error('Target HTML is missing the physicsRuntimeBundle slot');
  }

  return html.replace(slotPattern, (_, start, __existing, end) => `${start}${bundle}\n  ${end.trimStart()}`);
}

export async function inlineRuntimeBundle({
  htmlPath,
  outputPath,
  group = 'firstWave',
  components = [],
  entries = []
}) {
  if (!htmlPath) {
    throw new Error('inlineRuntimeBundle requires --html <path>');
  }

  const [html, runtime] = await Promise.all([
    fs.readFile(htmlPath, 'utf8'),
    buildRuntimeBundle({ group, components, entries })
  ]);

  const nextHtml = injectRuntimeBundleIntoHtml(html, runtime.bundle);
  const finalPath = outputPath || htmlPath;
  await fs.writeFile(finalPath, nextHtml, 'utf8');

  return {
    outputPath: finalPath,
    entries: runtime.entries
  };
}

function parseArgs(argv) {
  const options = {
    group: 'firstWave',
    components: [],
    entries: []
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const value = argv[index + 1];

    if (token === '--html') {
      options.htmlPath = value;
      index += 1;
    } else if (token === '--out') {
      options.outputPath = value;
      index += 1;
    } else if (token === '--group') {
      options.group = value;
      index += 1;
    } else if (token === '--components') {
      options.components = splitList(value);
      index += 1;
    } else if (token === '--entries') {
      options.entries = splitList(value);
      index += 1;
    } else if (token === '--help') {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${token}`);
    }
  }

  return options;
}

function printUsage() {
  const lines = [
    'Usage:',
    '  node scripts/build_runtime_bundle.mjs --html /abs/path/lab.html [--group firstWave]',
    '  node scripts/build_runtime_bundle.mjs --html /abs/path/lab.html --components spring-scale,hammer-tuningfork-ball',
    '  node scripts/build_runtime_bundle.mjs --html /abs/path/lab.html --entries primitives/snap.js,components/spring-scale.js'
  ];
  process.stdout.write(`${lines.join('\n')}\n`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  const result = await inlineRuntimeBundle(options);
  process.stdout.write(
    `Injected ${result.entries.length} runtime file(s) into ${result.outputPath}\n`
  );
}

if (path.resolve(process.argv[1] || '') === scriptPath) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
