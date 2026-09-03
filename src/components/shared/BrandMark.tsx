import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface BrandMarkProps {
  className?: string;
}

export default function BrandMark({ className }: BrandMarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-5', className)}>
      <span
        className="h-6.25 w-6.25 rounded-full bg-current"
        aria-hidden="true"
      />
      <span className="text-xl leading-tight font-semibold">{APP_NAME}</span>
    </span>
  );
}
