import SectionShell from '@/components/shared/SectionShell';
import StepItem from '@/components/shared/StepItem';
import Image from 'next/image';

interface Step {
  id: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Zgłoś swoją organizację',
    description:
      'Zgłoś swoją organizację – w formlarzu poprosimy o podanie NIP organizacji. Automatycznie sprawdzimy dane w KRS, aby zapewnić bezpieczeństwo Twoim darczyńcom.',
  },
  {
    id: 2,
    title: 'Wystaw swoje potrzeby rzeczowe',
    description:
      'Dodaj konkretne przedmioty (np. 5 śpiworów, 10 kg karmy). Twoja lista jest zawsze aktualna i publicznie dostępna pod jednym linkiem.',
  },
  {
    id: 3,
    title: 'Sprawnie zarządzaj potrzebami',
    description:
      'Darczyńcy wybierają potrzeby, które chcą sfinansować i wysyłają paczki prosto pod Twój adres. Z panelu zarządzania możesz w prosty sposób monitorować co dzieje się z wystawionymi potrzebami.',
  },
];

export default function StepsSection() {
  return (
    <SectionShell>
      <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <Image
          width={530}
          height={631}
          src="/donation-box-packing.png"
          alt="Wolontariusze pakujący paczkę z wodą i darami do kartonu"
        />
        <div className="max-w-152">
          {steps.map((step, index) => (
            <StepItem
              key={step.id}
              id={step.id}
              title={step.title}
              description={step.description}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
