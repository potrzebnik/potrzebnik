import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import Image from 'next/image';
import BadgeGroup from '@/components/shared/BadgeGroup';

interface HelpCardProps {
  title: string;
  description: string;
  image: string;
  badges: { id: number; label: string }[];
  price: number;
  currency: string;
}

export default function HelpCard({
  title,
  description,
  image,
  badges,
  price,
  currency,
}: HelpCardProps) {
  return (
    <Card className="relative flex cursor-pointer flex-col overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="relative">
          <CardTitle className="line-clamp-1 text-lg leading-tight font-medium">
            {title}
          </CardTitle>
        </div>
        <div className="relative mt-1">
          <CardDescription className="line-clamp-1 text-base">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <div className="h-72">
        <Image
          src={image}
          alt={title}
          width={400}
          height={300}
          className="h-full w-full object-cover"
        />
      </div>
      <CardFooter className="flex flex-wrap items-center justify-between gap-4 px-4">
        <BadgeGroup badges={badges} />
        <div className="shrink-0 flex-grow text-right">
          <span className="text-lg font-bold">
            {price} {currency}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
