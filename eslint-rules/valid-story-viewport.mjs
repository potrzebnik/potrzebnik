import { MINIMAL_VIEWPORTS } from 'storybook/viewport';

import { viewportOptions } from '../.storybook/viewports.mjs';

const allowedKeys = new Set([
  ...Object.keys(MINIMAL_VIEWPORTS),
  ...Object.keys(viewportOptions),
]);

const allowedList = [...allowedKeys].sort().join(', ');

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
        'Require a known viewport key in `parameters.viewport.value` of a story.',
    },
    messages: {
      unknownViewport:
        '`{{key}}` is not a known Storybook viewport key. An unknown key is not an error ' +
        'at runtime: setViewport silently falls back to 1200x900, so a story named "Mobile" ' +
        'quietly renders — and gets tested — as desktop. Define the key once in ' +
        '`viewportOptions` in .storybook/viewports.mjs, or pin one of: {{allowed}}.',
    },
    schema: [],
  },
  create(context) {
    return {
      Property(node) {
        if (staticKeyName(node) !== 'viewport') return;
        if (node.value.type !== 'ObjectExpression') return;

        const pinned = node.value.properties.find(
          (property) => staticKeyName(property) === 'value',
        );
        if (!pinned) return;

        const key = pinned.value;
        if (key.type !== 'Literal' || typeof key.value !== 'string') return;
        if (allowedKeys.has(key.value)) return;

        context.report({
          node: key,
          messageId: 'unknownViewport',
          data: { key: key.value, allowed: allowedList },
        });
      },
    };
  },
};

export default validStoryViewport;
