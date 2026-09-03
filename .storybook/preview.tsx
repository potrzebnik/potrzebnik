import type { Preview } from '@storybook/nextjs-vite';
import React from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import '../src/app/globals.css';
import { viewportOptions } from './viewports.mjs';

// Load the same fonts the app applies in `src/app/layout.tsx` so stories render
// with Geist instead of a fallback — otherwise type metrics (and line wrapping)
// diverge from the real app and the Figma designs.
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error',
    },

    viewport: {
      options: viewportOptions,
    },
  },
  decorators: [
    (Story) =>
      React.createElement(
        'div',
        {
          className: `${geistSans.variable} ${geistMono.variable} font-sans antialiased`,
        },
        React.createElement(Story),
      ),
  ],
};

export default preview;
