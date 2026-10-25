import type { ReactNode } from 'react';

const alignVariants = {
  left: 'text-left',
  center: 'text-center',
} as const;

const sizeVariants = {
  section: 'text-2xl font-bold sm:text-3xl',
  display: 'text-4xl leading-tight font-semibold sm:text-5xl',
} as const;

const spacingVariants = {
  tight: 'mb-6',
  loose: 'mb-14 md:mb-18',
} as const;

interface SectionHeadingProps {
  children: ReactNode;
  as?: 'h1' | 'h2';
  size?: keyof typeof sizeVariants;
  align?: keyof typeof alignVariants;
  spacing?: keyof typeof spacingVariants;
}

export default function SectionHeading({
  children,
  as: Heading = 'h2',
  size = 'section',
  align = 'left',
  spacing = 'tight',
}: SectionHeadingProps) {
  return (
    <Heading
      className={`tracking-tight ${sizeVariants[size]} ${alignVariants[align]} ${spacingVariants[spacing]}`}
    >
      {children}
    </Heading>
  );
}
