import Stripes from '@/components/shared/Stripes';
import WhyWorthCarousel from '@/components/shared/WhyWorthCarousel';
import WhyWorthCard from '@/components/shared/WhyWorthCard';
import { WHY_WORTH_ITEMS } from '@/lib/constants';

export default function WhyWorthSection() {
  return (
    <section className="container mx-auto mb-39.25 max-w-324.25 md:px-6">
      <div className="flex flex-col gap-8 md:gap-12">
        <h2 className="mt-7 text-center text-[1.875rem] leading-9 font-semibold tracking-[-1px] md:mt-12 md:text-[3rem] md:leading-13.5 md:tracking-[-1.5px]">
          Dlaczego warto
        </h2>

        <div className="bg-why-worth-bg relative hidden items-center justify-center rounded-3xl border-[0.5px] border-black px-7 py-8 md:flex">
          <div className="absolute inset-0 flex justify-between overflow-hidden rounded-3xl">
            <Stripes orientation="vertical" side="right" />
            <Stripes orientation="vertical" side="right" />
            <Stripes orientation="vertical" side="left" />
          </div>

          <div className="z-10 grid grid-cols-1 gap-6 md:gap-6.25 lg:grid-cols-2 xl:grid-cols-3">
            {WHY_WORTH_ITEMS.map((card) => (
              <WhyWorthCard
                key={card.id}
                title={card.title}
                description={card.description}
                image={card.image}
              />
            ))}
          </div>
        </div>

        <div className="block md:hidden">
          <WhyWorthCarousel items={WHY_WORTH_ITEMS} />
        </div>
      </div>
    </section>
  );
}
