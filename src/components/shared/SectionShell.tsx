import type { ReactNode } from 'react';

const shellVariants = {
  contained: 'container mx-auto px-6',
  bleed: 'relative w-full overflow-hidden',
} as const;

const shellRhythms = {
  default: 'py-14 sm:py-24',
  compact: 'py-12 lg:py-24',
} as const;

interface SectionShellProps {
  children: ReactNode;
  variant?: keyof typeof shellVariants;
  rhythm?: keyof typeof shellRhythms;
}

export default function SectionShell({
  children,
  variant = 'contained',
  rhythm = 'default',
}: SectionShellProps) {
  return (
    <section className={`${shellVariants[variant]} ${shellRhythms[rhythm]}`}>
      {children}
    </section>
  );
}
