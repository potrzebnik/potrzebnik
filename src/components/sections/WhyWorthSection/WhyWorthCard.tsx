import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

interface WhyWorthCardProps {
  title: string;
  description: string;
  image: string;
}

export default function WhyWorthCard({
  title,
  description,
  image,
}: WhyWorthCardProps) {
  return (
    <Card className="bg-card border-why-worth-border flex flex-col items-center justify-center rounded-2xl border-[0.32px] px-6.5 py-9 lg:rounded-3xl lg:border-[0.5px] lg:px-7.5 lg:pt-11 lg:pb-10">
      <div className="flex w-full flex-col gap-5.5 lg:gap-10">
        <CardHeader className="w-full p-0">
          <h3 className="text-center text-[1.25rem] leading-6 font-semibold lg:text-[1.5rem] lg:leading-[1.8rem] lg:tracking-[-1px]">
            {title}
          </h3>
        </CardHeader>
        <CardContent className="flex w-full items-center justify-center p-0">
          <div className="h-32.5 w-51 lg:h-50 lg:w-80">
            <Image
              src={image}
              alt={title}
              width={320}
              height={200}
              unoptimized
              className="h-full w-full"
            />
          </div>
        </CardContent>
        <CardFooter className="flex w-full items-center justify-center p-0">
          <p className="text-center text-[1rem] leading-6 tracking-tighter lg:text-[1.125rem] lg:leading-[1.688rem]">
            {description}
          </p>
        </CardFooter>
      </div>
    </Card>
  );
}
