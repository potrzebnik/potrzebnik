import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import SectionTemplate from '@/components/shared/SectionTemplate';

const meta = {
  title: 'Shared/SectionTemplate',
  component: SectionTemplate,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SectionTemplate>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Organizacje: Story = {
  args: {
    title: 'Organizacje',
    descriptions: [
      'Sprawdź, jakie organizacje poszukują wsparcia. To lista zweryfikowanych inicjatyw działających lokalnie i ogólnokrajowo, realnie zmieniając świat na lepsze.',
    ],
    image: {
      src: '/volunteers.jpg',
      alt: 'Dwoje dzieci bawiących się na świeżym powietrzu',
      frame: false,
      height: 'md',
    },
    buttonText: 'Odkrywaj organizacje',
    overlayVariant: 'blue',
    reversed: true,
  },
};

export const Onas: Story = {
  args: {
    title: 'O nas',
    descriptions: [
      'Umożliwiamy darczyńcom realne wsparcie organizacji, oferując łatwy dostęp do ich aktualnych potrzeb.',
      'Zostań darczyńcą i pomóż społecznościom w trudnej sytuacji — razem możemy więcej.',
    ],
    image: {
      src: '/children.jpg',
      alt: 'Wolontariusze rozdający wodę i pomoc rzeczową',
      frame: true,
      height: 'lg',
    },
    buttonText: 'Dowiedz się więcej',
    overlayVariant: 'yellow',
  },
};

export const Example: Story = {
  args: {
    title: 'Example',
    descriptions: ['Przykładowy tekst 1.', 'Przykładowy tekst 2.'],

    image: {
      src: '/children.jpg',
      alt: 'Czysty przykład bez ramki i zieloną figurą',
      frame: false,
      height: 'lg',
    },

    buttonText: 'Kliknij w przycisk',
    overlayVariant: 'green',
    reversed: false,
  },
};

export const Example2: Story = {
  args: {
    title: 'Example',
    descriptions: [
      'Przykładowy tekst 1.',
      'Przykładowy tekst 2.',
      'Przykładowy tekst 3.',
    ],
    image: {
      src: '/volunteers.jpg',
      alt: 'Czysty przykład z ramką i zieloną figurą',
      frame: true,
      height: 'lg',
    },
    buttonText: 'Kliknij w przycisk',
    overlayVariant: 'green',
    reversed: true,
  },
};

export const Example3: Story = {
  args: {
    title: 'Example',
    descriptions: [
      'Przykładowy tekst 1.',
      'Przykładowy tekst 2.',
      'Przykładowy tekst 3.',
      'Przykładowy tekst 4.',
    ],
    image: {
      src: '/children.jpg',
      alt: 'Czysty przykład bez ramki i żółtą figurą',
      frame: false,
      height: 'sm',
    },
    buttonText: 'Kliknij w przycisk',
    overlayVariant: 'yellow',
  },
};
