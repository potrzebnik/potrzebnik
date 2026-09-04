// Generates the data behind the "Agent & skill index" docs page from the
// canonical definitions in .claude/. Output is gitignored and rebuilt every
// docs build, so the index cannot drift. Index only — bodies are never copied.
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = fileURLToPath(new URL('..', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
const claudeDir = join(repoRoot, '.claude');
const outFile = join(siteRoot, 'src/generated/agents-index.json');

/**
 * Reads `name` and `description` out of a YAML frontmatter block.
 * Single-line scalars only: reformatting a description as a YAML block scalar
 * (`description: >-`) would index it as the literal `>-`.
 */
function readFrontmatter(file) {
  const source = readFileSync(file, 'utf8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  const fields = {};
  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
      const field = /^(name|description):\s*(.*)$/.exec(line);
      if (field) fields[field[1]] = field[2].trim().replace(/^['"]|['"]$/g, '');
    }
  }
  return fields;
}

/** Markdown definition files for one `.claude/` subdirectory. */
function collect(kind) {
  const dir = join(claudeDir, kind);
  let entries;
  try {
    entries = readdirSync(dir, { recursive: true });
  } catch {
    return [];
  }
  return entries
    .map((entry) => join(dir, entry))
    .filter((file) => file.endsWith('.md') && statSync(file).isFile())
    .map((file) => {
      const { name, description } = readFrontmatter(file);
      // `.claude/commands/mentor-review.md` carries no `name` — fall back to
      // the slug so every definition still lands in the index.
      const slug =
        basename(file) === 'SKILL.md'
          ? basename(dirname(file))
          : basename(file, '.md');
      return {
        name: name ?? slug,
        description: description ?? '',
        path: relative(repoRoot, file),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Two definitions sharing a name render as indistinguishable rows, and the
// index is documented as the source of truth for what exists. Fail instead.
function assertUniqueNames(items, kind) {
  const seen = new Map();
  for (const item of items) {
    const previous = seen.get(item.name);
    if (previous) {
      throw new Error(
        `agents index: duplicate ${kind} name "${item.name}" in ${previous} and ${item.path}.`,
      );
    }
    seen.set(item.name, item.path);
  }
  return items;
}

const index = {
  agents: assertUniqueNames(collect('agents'), 'agent'),
  commands: assertUniqueNames(collect('commands'), 'command'),
  skills: assertUniqueNames(collect('skills'), 'skill'),
};

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(index, null, 2)}\n`);
console.log(
  `agents index: ${index.agents.length} agents, ${index.commands.length} commands, ${index.skills.length} skills`,
);
