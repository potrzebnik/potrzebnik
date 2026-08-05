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
    <Card className="bg-card flex flex-col items-center justify-center rounded-2xl border-[0.32px] border-black px-6.5 py-9 md:rounded-3xl md:border-[0.5px] md:px-8 md:py-10">
      <div className="flex w-full flex-col gap-5.5 md:gap-11.75">
        <CardHeader className="w-full p-0">
          <h3 className="mt-5 text-center text-[1.25rem] leading-6 font-semibold md:mt-6 md:text-[1.5rem] md:leading-[1.8rem] md:tracking-[-1px]">
            {title}
          </h3>
        </CardHeader>
        <CardContent className="flex w-full items-center justify-center p-0">
          <div className="h-32.5 w-51 md:h-50 md:w-80">
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
          <p className="text-center text-[1rem] leading-[1.5rem] md:text-[1.125rem] md:leading-[1.688rem]">
            {description}
          </p>
        </CardFooter>
      </div>
    </Card>
  );
}
