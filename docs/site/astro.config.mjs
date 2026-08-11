// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

export default defineConfig({
  site: 'https://potrzebnik.github.io',
  base: '/potrzebnik',
  integrations: [
    starlight({
      title: 'potrzebnik',
      description: 'Contributor documentation for the potrzebnik repository.',
      lastUpdated: true,
      plugins: [starlightLinksValidator()],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/potrzebnik/potrzebnik',
        },
      ],
      sidebar: [
        { label: 'Getting started', link: '/' },
        { label: 'Architecture', link: '/architecture/' },
        { label: 'Database', link: '/database/' },
        { label: 'Auth & OAuth', link: '/auth/' },
        {
          label: 'Design system',
          items: [
            { label: 'Tokens & styling rules', link: '/design-system/tokens/' },
            {
              label: 'Component gallery',
              link: '/potrzebnik/storybook/',
              attrs: { target: '_blank' },
              badge: { text: 'Storybook', variant: 'note' },
            },
          ],
        },
        { label: 'Testing', link: '/testing/' },
        { label: 'Contributing', link: '/contributing/' },
        {
          label: 'Agents & skills',
          items: [
            { label: 'How agents are used here', link: '/agents/usage/' },
            { label: 'Agent & skill index', link: '/agents/index-generated/' },
          ],
        },
        {
          label: 'Decisions',
          items: [
            {
              label: '0001 — Initial stack and tooling',
              link: '/decisions/0001-initial-stack-and-tooling/',
            },
          ],
        },
        { label: 'Deployment & ops', link: '/deployment/' },
      ],
    }),
  ],
});
