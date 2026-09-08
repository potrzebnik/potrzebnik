import Stripes from './Stripes';
import WhyWorthCarousel, { WhyWorthItem } from './WhyWorthCarousel';
import WhyWorthCard from './WhyWorthCard';

export const WHY_WORTH_ITEMS: WhyWorthItem[] = [
  {
    id: 'donors',
    title: 'Zaufanie darczyńców',
    description:
      'Darczyńcy wiedzą, że ich pomoc trafia w bezpieczne i uczciwe ręce.',
    image: '/donors.svg',
  },
  {
    id: 'needs',
    title: 'Spełnianie realnych potrzeb',
    description:
      'Dzięki aktualizowanej na bieżąco liście unikniesz sytuacji niepotrzebnych darów.',
    image: '/needs.svg',
  },
  {
    id: 'management',
    title: 'Proste zarządzanie',
    description:
      'Intuicyjny panel zarządzania przyspiesza i ułatwia codzienną pracę.',
    image: '/management.svg',
  },
];

export default function WhyWorthSection() {
  return (
    <section
      aria-labelledby="why-worth-heading"
      className="mx-auto py-1.5 md:container lg:px-6 lg:py-14"
    >
      <div className="flex flex-col gap-8 lg:gap-12">
        <h2
          id="why-worth-heading"
          className="mt-7 text-center text-[1.875rem] leading-9 font-semibold tracking-[-1px] lg:mt-12 lg:text-[3rem] lg:leading-13.5 lg:tracking-[-1.5px]"
        >
          Dlaczego warto
        </h2>

        <div className="bg-why-worth-bg border-why-worth-border relative hidden items-center justify-center rounded-3xl border-[0.5px] px-7 py-8 xl:flex">
          <div
            className="absolute inset-0 flex justify-between overflow-hidden rounded-3xl"
            aria-hidden={true}
          >
            <Stripes orientation="vertical" side="right" />
            <Stripes orientation="vertical" side="right" />
            <Stripes orientation="vertical" side="left" />
          </div>

          <div className="z-10 grid gap-6 lg:gap-6.25 xl:grid-cols-3">
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

        <div className="block xl:hidden">
          <WhyWorthCarousel items={WHY_WORTH_ITEMS} />
        </div>
      </div>
    </section>
  );
}
