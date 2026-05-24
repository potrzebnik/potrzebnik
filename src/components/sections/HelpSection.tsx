import HelpCard from '@/components/shared/HelpCard';
import { Button } from '@/components/ui/button';
import { BADGES } from '@/lib/constants';

interface HelpItem {
  id: string;
  title: string;
  description: string;
  image: string;
  badges: { id: number; label: string }[];
  price: number;
  currency: string;
}

const helpItems: HelpItem[] = [
  {
    id: 'royal-canin-renal',
    title: 'Specjalistyczna karma Royal Canin Renal',
    description: 'Schronisko "Promyk" w Gdańsku',
    image: '/dogs-shelter.jpg',
    badges: [BADGES.URGENT],
    price: 150.0,
    currency: 'PLN',
  },
  {
    id: 'acrylic-paints-canvases',
    title: 'Zestaw farb akrylowych i podobrazi',
    description: 'Świetlica Środowiskowa "Przystań"',
    image: '/art-supplies.jpg',
    badges: [
      BADGES.EXPIRING,
      BADGES.URGENT,
      BADGES.EXPIRING,
      BADGES.NEW,
      BADGES.ONGOING,
    ],
    price: 70.0,
    currency: 'PLN',
  },
  {
    id: 'warm-sleeping-bags',
    title: '5 ciepłych śpiworów',
    description: 'Fundacja "Daj Herbatę"',
    image: '/sleeping-bags.jpg',
    badges: [BADGES.URGENT, BADGES.EXPIRING, BADGES.NEW, BADGES.ONGOING],
    price: 3000.0,
    currency: 'PLN',
  },
];

export default function HelpSection() {
  return (
    <section className="container mx-auto px-6 py-14 sm:py-24">
      <h2 className="mb-14 text-center text-2xl font-bold tracking-tight sm:text-3xl md:mb-18">
        Zobacz jak możesz pomóc
      </h2>
      <div className="mb-10 grid grid-cols-1 gap-8 md:mb-18 md:grid-cols-2 xl:grid-cols-3">
        {helpItems.map((item) => (
          <HelpCard
            key={item.id}
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
