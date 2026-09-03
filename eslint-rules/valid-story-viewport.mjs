import { MINIMAL_VIEWPORTS } from 'storybook/viewport';

import { viewportOptions } from '../.storybook/viewports.mjs';

const allowedKeys = new Set([
  ...Object.keys(MINIMAL_VIEWPORTS),
  ...Object.keys(viewportOptions),
]);

const allowedList = [...allowedKeys].sort().join(', ');

const PINNING_KEYS = new Set(['value', 'defaultViewport']);

function staticKeyName(property) {
  if (property.type !== 'Property' || property.computed) return null;
  if (property.key.type === 'Identifier') return property.key.name;
  if (property.key.type === 'Literal') return String(property.key.value);
  return null;
}

const validStoryViewport = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require a known, statically pinned Storybook viewport key in `globals.viewport.value`.',
    },
    messages: {
      unknownViewport:
        '`{{key}}` is not a known Storybook viewport key. An unknown key is not an error ' +
        'at runtime: the viewport silently falls back to 1200x900, so a story named "Mobile" ' +
        'quietly renders — and gets tested — as desktop. Define the key once in ' +
        '`viewportOptions` in .storybook/viewports.mjs, or pin one of: {{allowed}}.',
      nonLiteralViewport:
        'A viewport must be pinned as a static string literal, so this gate has something to ' +
        'check. A computed `{{key}}` passes lint and still falls back to 1200x900 at runtime ' +
        'if it resolves to an unknown key. Pin one of: {{allowed}}.',
    },
    schema: [],
  },
  create(context) {
    return {
      Property(node) {
        if (staticKeyName(node) !== 'viewport') return;
        if (node.value.type !== 'ObjectExpression') return;

        for (const property of node.value.properties) {
          const key = staticKeyName(property);
          if (!key || !PINNING_KEYS.has(key)) continue;

          const pinned = property.value;
          if (pinned.type !== 'Literal' || typeof pinned.value !== 'string') {
            context.report({
              node: pinned,
              messageId: 'nonLiteralViewport',
              data: { key, allowed: allowedList },
            });
            continue;
          }

          if (allowedKeys.has(pinned.value)) continue;

          context.report({
            node: pinned,
            messageId: 'unknownViewport',
            data: { key: pinned.value, allowed: allowedList },
          });
        }
      },
    };
  },
};

export default validStoryViewport;
