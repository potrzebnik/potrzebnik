'use client';

import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';
import WhyWorthCard from '@/components/shared/WhyWorthCard';
import CarouselDots from '@/components/shared/CarouselDots';
import Stripes from '@/components/shared/Stripes';

export interface WhyWorthItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

interface WhyWorthCarouselProps {
  items: WhyWorthItem[];
}

export default function WhyWorthCarousel({ items }: WhyWorthCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const scrollTo = React.useCallback(
    (index: number) => api?.scrollTo(index),
    [api],
  );

  return (
    <div className="mx-auto w-full">
      <div className="bg-why-worth-bg border-why-worth-border relative overflow-hidden border-[0.32px] px-10 pt-9 pb-12">
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2"
          aria-hidden={true}
        >
          <Stripes orientation="horizontal" isMobile />
        </div>

        <Carousel
          setApi={setApi}
          className="w-full"
          aria-label="Dlaczego warto"
        >
          <CarouselContent>
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                aria-label={`Slajd o nazwie ${item.id}`}
                className="pl-4"
              >
                <WhyWorthCard
                  title={item.title}
                  description={item.description}
                  image={item.image}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <CarouselDots
        count={items.length}
        current={current}
        onDotClick={scrollTo}
        className="mt-6"
        itemKeys={items.map((item) => item.id)}
      />
    </div>
  );
}
