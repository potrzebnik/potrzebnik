import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

/** Shared by goals and nodes. Hand-set on both; nothing is derived. */
const status = z.enum(['planned', 'in-progress', 'done']);

/**
 * `design` and `implementation` are stages of one node, split into siblings
 * only where the two halves differ in status. `organization` is a kind of
 * work rather than a stage, and reads across every column.
 */
const category = z.enum(['design', 'implementation', 'organization']);

const roadmapNode = z.object({
  name: z.string(),
  category,
  status,
  /** GitHub issue numbers. A link only — nothing reads their state. */
  issues: z.array(z.number().int().positive()).optional(),
  /** Rendered on `in-progress` nodes only. */
  note: z.string().optional(),
});

const roadmapGoal = z.object({
  /** Left-to-right column order. The loader does not promise key order. */
  order: z.number().int().positive(),
  name: z.string(),
  status,
  target: z.string().optional(),
  /** Closing line for a column that is deliberately unfinished. */
  trailer: z.string().optional(),
  nodes: z.array(roadmapNode).min(1),
});

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  roadmap: defineCollection({
    loader: file('src/content/roadmap/roadmap.yml'),
    schema: roadmapGoal,
  }),
};
