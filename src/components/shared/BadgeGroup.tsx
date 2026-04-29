import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface BadgeItem {
  id: number;
  label: string;
}

interface BadgeGroupProps {
  badges: BadgeItem[];
  charLimit?: number;
}

export default function BadgeGroup({
  badges,
  charLimit = 25,
}: BadgeGroupProps) {
  const visible: BadgeItem[] = [];
  const extra: BadgeItem[] = [];
  let currentChars = 0;

  for (let i = 0; i < badges.length; i++) {
    const currentBadge = badges[i];

    if (
      visible.length === 0 ||
      currentChars + currentBadge.label.length <= charLimit
    ) {
      visible.push(currentBadge);
      currentChars += currentBadge.label.length;
    } else {
      extra.push(currentBadge);
    }
  }

  return (
    <div className="flex gap-3">
      <div className="flex gap-2">
        {visible.map((badge) => (
          <Badge key={badge.id} variant="outline" className="text-xs font-bold">
            {badge.label}
          </Badge>
        ))}
      </div>

      {extra.length > 0 && (
        <Popover>
          <PopoverTrigger className="text-muted-foreground shrink-0 cursor-pointer text-xs font-bold hover:underline">
            +{extra.length}
          </PopoverTrigger>
          <PopoverContent className="flex flex-wrap gap-2">
            {extra.map((b) => (
              <Badge
                variant="outline"
                className="shrink-0 text-xs font-bold"
                key={b.id}
              >
                {b.label}
              </Badge>
            ))}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
