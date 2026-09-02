const TAGS = [
  'dotarcie do darczyńców',
  'prosty panel zarządzania',
  'bezpłatne narzędzie',
  'zwiększenie widoczności',
  'przyspieszenie pracy',
  'wsparcie dla organizacji pozarządowych',
];

function Pill({ label }: { label: string }) {
  return (
    <span className="border-benefits-strip-border bg-benefits-strip-pill-bg text-benefits-strip-fg mr-4 shrink-0 rounded-full border px-6 py-3 text-sm font-medium whitespace-nowrap sm:text-base">
      {label}
    </span>
  );
}

function TagGroup({ decorative = false }: { decorative?: boolean }) {
  return (
    <div className="flex" aria-hidden={decorative || undefined}>
      {TAGS.map((label) => (
        <Pill key={label} label={label} />
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
