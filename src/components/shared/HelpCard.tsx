import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface HelpCardProps {
  title: string;
  description: string;
  image: string;
  badges: string[];
  price: string;
}

export default function HelpCard({
  title,
  description,
  image,
  badges,
  price,
}: HelpCardProps) {
  return (
    <Card className="group relative flex cursor-pointer flex-col overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="tooltip `` group-active:opacity-100">
          <p>{title}</p>
        </div>
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
      <div className="h-70">
        <Image
          src={image}
          alt={title}
          width={400}
          height={300}
          className="h-full w-full object-cover"
        />
      </div>
      <CardFooter className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {badges.map((badge, index) => (
            <Badge key={index} variant="outline" className="text-xs font-bold">
              {badge}
            </Badge>
          ))}
        </div>
        <span className="ml-10 text-lg font-bold">{price}</span>
      </CardFooter>
    </Card>
  );
}
