import { Button } from '@/components/ui/button';

interface CarouselDotsProps {
  count: number;
  current: number;
  onDotClick: (index: number) => void;
  className?: string;
  itemKeys?: (string | number)[];
}

export default function CarouselDots({
  count,
  current,
  onDotClick,
  className = '',
  itemKeys,
}: CarouselDotsProps) {
  if (count <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Button
          key={itemKeys?.[index] ?? `dot-${index}`}
          type="button"
          variant="dot"
          size="dot"
          onClick={() => onDotClick(index)}
          className={`transition-all duration-300 ${
            current === index
              ? 'bg-carousel-dot-bg-active w-6'
              : 'bg-carousel-dot-bg hover:bg-carousel-dot-bg-hover'
          }`}
          aria-label={`Przejdź do slajdu ${index + 1}`}
          aria-current={current === index ? 'true' : undefined}
        />
      ))}
    </div>
  );
}
