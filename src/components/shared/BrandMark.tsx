import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

const brandMarkVariants = {
  header: { dot: 'bg-header-fg', wordmark: 'text-header-fg' },
  footer: { dot: 'bg-footer-fg', wordmark: 'text-footer-fg' },
} as const;

interface BrandMarkProps {
  variant: keyof typeof brandMarkVariants;
  className?: string;
}

export default function BrandMark({ variant, className }: BrandMarkProps) {
  const { dot, wordmark } = brandMarkVariants[variant];

  return (
    <span className={cn('inline-flex items-center gap-5', className)}>
      <span
        className={cn('h-6.25 w-6.25 rounded-full', dot)}
        aria-hidden="true"
      />
      <span className={cn('text-xl leading-tight font-semibold', wordmark)}>
        {APP_NAME}
      </span>
    </span>
  );
}
