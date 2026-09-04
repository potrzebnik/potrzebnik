interface StripesProps {
  orientation?: 'vertical' | 'horizontal';
  side?: 'left' | 'right';
  count?: number;
  isMobile?: boolean;
}

export default function Stripes({
  orientation = 'vertical',
  side = 'right',
  count = 21,
  isMobile = false,
}: StripesProps) {
  const items = Array.from({ length: count });

  return (
    <div
      className={`flex ${
        orientation === 'vertical'
          ? 'flex-row justify-between'
          : 'flex-col justify-between'
      }`}
    >
      {items.map((_, index) => (
        <div
          key={`${orientation}-${side}-${index}`}
          className={
            orientation === 'vertical'
              ? `h-full w-2.5 ${side === 'right' ? 'border-r-[0.5px]' : 'border-l-[0.5px]'} border-why-worth-border`
              : `${isMobile ? 'h-2 border-t-[0.32px]' : 'h-2.5 border-t-[0.5px]'} border-why-worth-border w-full`
          }
          aria-hidden={true}
        />
      ))}
    </div>
  );
}
