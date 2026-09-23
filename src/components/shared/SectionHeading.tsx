import type { ReactNode } from 'react';

const alignVariants = {
  left: 'text-left',
  center: 'text-center',
} as const;

const spacingVariants = {
  tight: 'mb-6',
  loose: 'mb-14 md:mb-18',
} as const;

interface SectionHeadingProps {
  children: ReactNode;
  align?: keyof typeof alignVariants;
  spacing?: keyof typeof spacingVariants;
}

export default function SectionHeading({
  children,
  align = 'left',
  spacing = 'tight',
}: SectionHeadingProps) {
  return (
    <h2
      className={`text-2xl font-bold tracking-tight sm:text-3xl ${alignVariants[align]} ${spacingVariants[spacing]}`}
    >
      {children}
    </h2>
  );
}
