import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// ROADMAP SPECIFICS
const status = z.enum(['planned', 'in-progress', 'done']);
const category = z.enum(['design', 'implementation', 'organization']);

const roadmapNode = z.object({
  name: z.string(),
  category,
  status,
  issues: z.array(z.number().int().positive()).optional(),
  note: z.string().optional(),
});

const roadmapGoal = z.object({
  order: z.number().int().positive(),
  name: z.string(),
  status,
  target: z.string().optional(),
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
