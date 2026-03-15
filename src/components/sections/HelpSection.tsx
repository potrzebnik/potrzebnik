import HelpCard from '@/components/shared/HelpCard';
import { Button } from '@/components/ui/button';

const helpItems = [
  {
    title: 'Specjalistyczna karma Royal Canin Renal',
    description: 'Schronisko "Promyk" w Gdańsku',
    image: '/dogs-shelter.jpg',
    badges: ['Pilne'],
    price: '150,00 PLN',
  },
  {
    title: 'Zestaw farb akrylowych i podobrazi',
    description: 'Świetlica Środowiskowa "Przystań"',
    image: '/art-supplies.jpg',
    badges: ['Niedługo wygasa'],
    price: '70,00 PLN',
  },
  {
    title: '5 ciepłych śpiworów',
    description: 'Fundacja "Daj Herbatę"',
    image: '/sleeping-bags.jpg',
    badges: ['Pilne'],
    price: '300,00 PLN',
  },
];

export default function HelpSection() {
  return (
    <section className="container mx-auto px-6 py-14 sm:py-24">
      <h2 className="mb-14 cursor-default text-center text-2xl font-bold tracking-tight sm:text-3xl md:mb-18">
        Zobacz jak możesz pomóc
      </h2>
      <div className="mb-10 grid grid-cols-1 gap-8 md:mb-18 md:grid-cols-2 lg:grid-cols-3">
        {helpItems.map((item, index) => (
          <HelpCard
            key={index}
            title={item.title}
            description={item.description}
            image={item.image}
            badges={item.badges}
            price={item.price}
          />
        ))}
      </div>
      <div className="flex justify-end">
        <Button className="cursor-pointer rounded-md border border-black bg-[#F6D94F] px-6 py-5 font-medium text-black transition-colors hover:bg-[#e5c842]">
          Zobacz wszystkie potrzeby
        </Button>
      </div>
    </section>
  );
}
