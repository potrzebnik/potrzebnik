const TAGS = [
  'dotarcie do darczyńców',
  'prosty panel zarządzania',
  'bezpłatne narzędzie',
  'zwiększenie widoczności',
  'przyspieszenie pracy',
  'wsparcie dla organizacji pozarządowych',
];

function Pill({ label, hidden }: { label: string; hidden?: boolean }) {
  return (
    <span
      aria-hidden={hidden}
      className="border-benefits-strip-border bg-benefits-strip-pill-bg text-benefits-strip-fg mr-4 shrink-0 rounded-full border px-6 py-3 text-sm font-medium whitespace-nowrap sm:text-base"
    >
      {label}
    </span>
  );
}

export default function BenefitsStripSection() {
  return (
    <section
      aria-label="Zalety Potrzebnika"
      className="bg-benefits-strip-band-bg w-full overflow-hidden py-8"
    >
      <div className="animate-benefits-marquee flex w-max motion-reduce:animate-none">
        <div className="flex">
          {TAGS.map((label) => (
            <Pill key={label} label={label} />
          ))}
        </div>
        <div className="flex" aria-hidden>
          {TAGS.map((label) => (
            <Pill key={`${label}-duplicate`} label={label} hidden />
          ))}
        </div>
      </div>
    </section>
  );
}
