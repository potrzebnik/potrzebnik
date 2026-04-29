import HelpCard from '@/components/shared/HelpCard';
import { Button } from '@/components/ui/button';
import { BADGES } from '@/stories/HelpCard.stories';

const helpItems = [
  {
    title: 'Specjalistyczna karma Royal Canin Renal',
    description: 'Schronisko "Promyk" w Gdańsku',
    image: '/dogs-shelter.jpg',
    badges: [BADGES[0]],
    price: 150.0,
    currency: 'PLN',
  },
  {
    title: 'Zestaw farb akrylowych i podobrazi',
    description: 'Świetlica Środowiskowa "Przystań"',
    image: '/art-supplies.jpg',
    badges: [BADGES[1], BADGES[0], BADGES[1], BADGES[2], BADGES[3]],
    price: 70.0,
    currency: 'PLN',
  },
  {
    title: '5 ciepłych śpiworów',
    description: 'Fundacja "Daj Herbatę"',
    image: '/sleeping-bags.jpg',
    badges: [BADGES[0], BADGES[1], BADGES[2], BADGES[3]],
    price: 3000.0,
    currency: 'PLN',
  },
];

export default function HelpSection() {
  return (
    <section className="container mx-auto px-6 py-14 sm:py-24">
      <h2 className="mb-14 cursor-default text-center text-2xl font-bold tracking-tight sm:text-3xl md:mb-18">
        Zobacz jak możesz pomóc
      </h2>
      <div className="mb-10 grid grid-cols-1 gap-8 md:mb-18 md:grid-cols-2 xl:grid-cols-3">
        {helpItems.map((item, index) => (
          <HelpCard
            key={index}
            title={item.title}
            description={item.description}
            image={item.image}
            badges={item.badges}
            price={item.price}
            currency={item.currency}
          />
        ))}
      </div>
      <div className="flex justify-end">
        <Button className="bg-help-section-btn-bg hover:bg-help-section-btn-bg-hover cursor-pointer rounded-md border border-black px-6 py-5 font-medium text-black transition-colors">
          Zobacz wszystkie potrzeby
        </Button>
      </div>
    </section>
  );
}
