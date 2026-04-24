import NextLink from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const linkVariants = cva('', {
  variants: {
    variant: {
      default: '',
      footerNav: 'text-base font-normal leading-[1.5]',
      footerLegal: 'text-base font-normal leading-[1.5] lg:text-[18px]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

function Link({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof NextLink> & VariantProps<typeof linkVariants>) {
  return (
    <NextLink
      data-slot="link"
      data-variant={variant}
      className={cn(linkVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Link, linkVariants };
