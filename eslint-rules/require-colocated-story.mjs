import { existsSync } from 'node:fs';
import path from 'node:path';

const requireColocatedStory = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require a co-located `*.stories.tsx` next to every component file.',
    },
    messages: {
      missingStory:
        'No co-located story found — expected `{{expected}}` next to this file. ' +
        'Stories are the primary component test harness in this repository: a component ' +
        'with no `*.stories.tsx` neighbour is never rendered by `pnpm test:storybook`, ' +
        'so nothing checks it and the axe gate never sees it.',
    },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const filename = context.filename;
        if (!filename.endsWith('.tsx')) return;
        if (filename.endsWith('.stories.tsx')) return;

        const expected = filename.replace(/\.tsx$/, '.stories.tsx');
        if (existsSync(expected)) return;

        context.report({
          node,
          messageId: 'missingStory',
          data: { expected: path.basename(expected) },
        });
      },
    };
  },
};

export default requireColocatedStory;
