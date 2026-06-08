import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLabScaffold } from './create_lab_scaffold.mjs';
import { resolveRuntimeComponentsFromPatterns } from './runtime_family_map.mjs';

const scriptPath = fileURLToPath(import.meta.url);

function splitList(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values)];
}

function readSpecSelections(spec) {
  const runtime = spec.runtime || {};
  const patterns = spec.apparatusPatterns || spec.patterns || runtime.patterns || [];
  const explicitComponents = unique([
    ...(spec.components || []),
    ...(runtime.components || [])
  ]);
  const explicitEntries = unique([
    ...(spec.entries || []),
    ...(runtime.entries || [])
  ]);

  return {
    title: spec.labTitle || spec.title,
    outputPath: spec.outputPath || runtime.outputPath,
    templatePath: spec.templatePath || runtime.templatePath,
    group: runtime.group || spec.group,
    patterns,
    explicitComponents,
    explicitEntries
  };
}

export async function createLabFromSpec({
  specPath,
  outputPath,
  title,
  group,
  templatePath
}) {
  if (!specPath) {
    throw new Error('createLabFromSpec requires --spec <path>');
  }

  const raw = await fs.readFile(specPath, 'utf8');
  const spec = JSON.parse(raw);
  const selected = readSpecSelections(spec);
  const mapped = resolveRuntimeComponentsFromPatterns(selected.patterns);

  if (selected.patterns.length > 0 && mapped.components.length === 0 && selected.explicitComponents.length === 0 && selected.explicitEntries.length === 0 && !group && !selected.group) {
    throw new Error(`No runtime component mapping found for patterns: ${selected.patterns.join(', ')}`);
  }

  const components = unique([...mapped.components, ...selected.explicitComponents]);
  const scaffoldGroup = group || selected.group || (components.length === 0 && selected.explicitEntries.length === 0 ? 'firstWave' : undefined);

  const result = await createLabScaffold({
    templatePath: templatePath || selected.templatePath,
    outputPath: outputPath || selected.outputPath,
    title: title || selected.title,
    group: scaffoldGroup,
    components,
    entries: selected.explicitEntries
  });

  return {
    ...result,
    components,
    unresolvedPatterns: mapped.unresolved
  };
}

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const value = argv[index + 1];

    if (token === '--spec') {
      options.specPath = value;
      index += 1;
    } else if (token === '--out') {
      options.outputPath = value;
      index += 1;
    } else if (token === '--title') {
      options.title = value;
      index += 1;
    } else if (token === '--group') {
      options.group = value;
      index += 1;
    } else if (token === '--template') {
      options.templatePath = value;
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
    '  node scripts/create_lab_from_spec.mjs --spec /abs/path/spec.json --out /abs/path/实验.html',
    '  node scripts/create_lab_from_spec.mjs --spec /abs/path/spec.json --out /abs/path/实验.html --group firstWave',
    'Spec fields:',
    '  { "labTitle": "实验标题", "apparatusPatterns": ["Pattern F"], "runtime": { "components": [] } }'
  ];
  process.stdout.write(`${lines.join('\n')}\n`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  const result = await createLabFromSpec(options);
  process.stdout.write(
    `Created ${result.outputPath} from ${path.basename(options.specPath)} with components: ${result.components.join(', ') || '(group selection)'}\n`
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
