import { cn } from '@/lib/utils';

const TAGS = [
  { label: 'dotarcie do darczyńców' },
  { label: 'prosty panel zarządzania' },
  { label: 'bezpłatne narzędzie', accent: true },
  { label: 'zwiększenie widoczności' },
  { label: 'przyspieszenie pracy' },
  { label: 'wsparcie dla organizacji pozarządowych' },
];

function Pill({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span
      className={cn(
        'border-benefits-strip-border text-benefits-strip-fg mr-4 shrink-0 rounded-full border px-6 py-3 text-sm font-medium whitespace-nowrap sm:text-base',
        accent
          ? 'bg-benefits-strip-pill-bg-accent'
          : 'bg-benefits-strip-pill-bg',
      )}
    >
      {label}
    </span>
  );
}

function TagGroup({ decorative = false }: { decorative?: boolean }) {
  return (
    <div className="flex" aria-hidden={decorative || undefined}>
      {TAGS.map(({ label, accent }) => (
        <Pill key={label} label={label} accent={accent} />
      ))}
    </div>
  );
}

export default function BenefitsStripSection() {
  return (
    <section
      aria-label="Zalety Potrzebnika"
      className="bg-benefits-strip-band-bg w-full overflow-hidden py-8"
    >
      <div className="animate-benefits-marquee hover:paused focus-within:paused flex w-max motion-reduce:animate-none">
        <TagGroup />
        <TagGroup decorative />
        <TagGroup decorative />
        <TagGroup decorative />
      </div>
    </section>
  );
}
