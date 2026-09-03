import { MINIMAL_VIEWPORTS } from 'storybook/viewport';

import { viewportOptions } from '../.storybook/viewports.mjs';

const baseKeys = [
  ...Object.keys(MINIMAL_VIEWPORTS),
  ...Object.keys(viewportOptions),
];

const READ_PATHS = new Map([
  ['globals', 'value'],
  ['parameters', 'defaultViewport'],
]);

const PINNING_KEYS = new Set(READ_PATHS.values());

const OPTION_KEYS = new Set(['options', 'viewports']);

function unwrap(node) {
  if (
    node.type === 'TSAsExpression' ||
    node.type === 'TSSatisfiesExpression' ||
    node.type === 'TSNonNullExpression'
  ) {
    return unwrap(node.expression);
  }
  return node;
}

function staticKeyName(property) {
  if (property.type !== 'Property' || property.computed) return null;
  if (property.key.type === 'Identifier') return property.key.name;
  if (property.key.type === 'Literal') return String(property.key.value);
  return null;
}

function objectProperties(node) {
  const unwrapped = unwrap(node);
  return unwrapped.type === 'ObjectExpression' ? unwrapped.properties : null;
}

const validStoryViewport = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require a known, statically pinned Storybook viewport key on a path the test runner reads.',
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
      unreadViewportPath:
        '`{{container}}.viewport.{{key}}` is never read by the Storybook test runner, which ' +
        'reads only `globals.viewport.value` and the legacy `parameters.viewport.defaultViewport`. ' +
        'This story renders at 1200x900 whatever key is pinned here, so a correct key is as dead ' +
        'as a wrong one. Move the pin to `{{suggestion}}`.',
    },
    schema: [],
  },
  create(context) {
    const localOptionKeys = new Set();
    const pins = [];

    return {
      Property(node) {
        const container = staticKeyName(node);
        const readKey = READ_PATHS.get(container);
        if (readKey === undefined) return;

        const containerProperties = objectProperties(node.value);
        if (!containerProperties) return;

        const viewport = containerProperties.find(
          (property) => staticKeyName(property) === 'viewport',
        );
        if (!viewport) return;

        const viewportProperties = objectProperties(viewport.value);
        if (!viewportProperties) return;

        for (const property of viewportProperties) {
          const key = staticKeyName(property);
          if (key === null) continue;

          if (OPTION_KEYS.has(key) && container === 'parameters') {
            for (const option of objectProperties(property.value) ?? []) {
              const optionKey = staticKeyName(option);
              if (optionKey !== null) localOptionKeys.add(optionKey);
            }
            continue;
          }

          if (!PINNING_KEYS.has(key)) continue;

          if (key !== readKey) {
            pins.push({
              messageId: 'unreadViewportPath',
              node: property,
              data: {
                container,
                key,
                suggestion: 'globals.viewport.value',
              },
            });
            continue;
          }

          const pinned = unwrap(property.value);
          if (pinned.type !== 'Literal' || typeof pinned.value !== 'string') {
            pins.push({
              messageId: 'nonLiteralViewport',
              node: pinned,
              data: { key },
            });
            continue;
          }

          pins.push({ node: pinned, key: pinned.value });
        }
      },

      'Program:exit'() {
        const allowedKeys = new Set([...baseKeys, ...localOptionKeys]);
        const allowed = [...allowedKeys].sort().join(', ');

        for (const pin of pins) {
          if (pin.messageId) {
            context.report({
              node: pin.node,
              messageId: pin.messageId,
              data: { ...pin.data, allowed },
            });
            continue;
          }

          if (allowedKeys.has(pin.key)) continue;

          context.report({
            node: pin.node,
            messageId: 'unknownViewport',
            data: { key: pin.key, allowed },
          });
        }
      },
    };
  },
};

export default validStoryViewport;
