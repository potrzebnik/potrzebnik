interface StepItemProps {
  id: number;
  title: string;
  description: string;
  isLast?: boolean;
}

export default function StepItem({
  id,
  title,
  description,
  isLast = false,
}: StepItemProps) {
  return (
    <div className="flex gap-6">
      <div className="flex flex-col items-center">
        <div className="border-foreground bg-accent-blue flex h-20 w-20 shrink-0 items-center justify-center rounded-md border p-2.5 font-semibold">
          {id}
        </div>
        {!isLast && (
          <div className="flex flex-1 gap-6">
            <div className="border-foreground border-l"></div>
            <div className="border-foreground border-l"></div>
            <div className="border-foreground border-l"></div>
          </div>
        )}
      </div>
      <div className={isLast ? '' : 'pb-8'}>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-lg">{description}</p>
      </div>
    </div>
  );
}
