import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildRuntimeBundle,
  injectRuntimeBundleIntoHtml
} from './build_runtime_bundle.mjs';

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptPath);
const skillRoot = path.resolve(scriptDir, '..');
const defaultTemplatePath = path.join(skillRoot, 'assets/physics-lab-template.html');

function splitList(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function deriveTitle(outputPath) {
  const baseName = path.basename(outputPath || 'LAB_TITLE', '.html');
  return baseName || 'LAB_TITLE';
}

export function replaceLabTitle(html, title) {
  return html.replace(/LAB_TITLE/g, title);
}

export async function createLabScaffold({
  templatePath = defaultTemplatePath,
  outputPath,
  title,
  group = 'firstWave',
  components = [],
  entries = []
}) {
  if (!outputPath) {
    throw new Error('createLabScaffold requires --out <path>');
  }

  const [templateHtml, runtime] = await Promise.all([
    fs.readFile(templatePath, 'utf8'),
    buildRuntimeBundle({ group, components, entries })
  ]);

  const titledHtml = replaceLabTitle(templateHtml, title || deriveTitle(outputPath));
  const finalHtml = injectRuntimeBundleIntoHtml(titledHtml, runtime.bundle);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, finalHtml, 'utf8');

  return {
    outputPath,
    title: title || deriveTitle(outputPath),
    entries: runtime.entries
  };
}

function parseArgs(argv) {
  const options = {
    templatePath: defaultTemplatePath,
    group: 'firstWave',
    components: [],
    entries: []
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const value = argv[index + 1];

    if (token === '--template') {
      options.templatePath = value;
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
    '  node scripts/create_lab_scaffold.mjs --out /abs/path/实验.html [--title 实验标题] [--group firstWave]',
    '  node scripts/create_lab_scaffold.mjs --out /abs/path/实验.html --components spring-scale,hammer-tuningfork-ball',
    '  node scripts/create_lab_scaffold.mjs --template /abs/path/base.html --out /abs/path/实验.html --entries primitives/snap.js,components/spring-scale.js'
  ];
  process.stdout.write(`${lines.join('\n')}\n`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printUsage();
    return;
  }

  const result = await createLabScaffold(options);
  process.stdout.write(
    `Created ${result.outputPath} with ${result.entries.length} runtime file(s) and title "${result.title}"\n`
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
