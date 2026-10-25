import Image from 'next/image';
import Link from 'next/link';
import { ChevronsDown } from 'lucide-react';
import SectionHeading from '@/components/shared/SectionHeading';
import SectionShell from '@/components/shared/SectionShell';
import { MANAGEMENT_SUPPORT_ID } from '@/components/sections/ManagementSupportSection';
import { Button } from '@/components/ui/button';

const HEADING = 'Proste zarządzanie potrzebami';
const BODY =
  'Przenieś listę potrzeb rzeczowych swojej organizacji na profesjonalną tablicę i zarządzaj nią z jednego miejsca.';

const PHOTO = {
  src: '/team-laptops.webp',
  alt: 'Zespół pracujący przy laptopach przy wspólnym stole',
};

// The collage geometry is the Figma "Group 147" (687×500) in its own
// coordinates, so the SVG layers and the photo slot stay aligned at any width.
const COLLAGE = { width: 687, height: 500 };
const VIEWBOX = `0 0 ${COLLAGE.width} ${COLLAGE.height}`;
const PHOTO_SLOT = { x: 79, y: 112, width: 551, height: 331 };
const CARDS = [
  { x: 51, y: 78, width: 636, height: 422, rx: 30 },
  { x: 51, y: 18, width: 608, height: 455, rx: 30 },
  { x: 567, y: 18, width: 120, height: 38, rx: 19 },
];
const PIN = { endY: 187, dotY: 190, dotRadius: 3 };

// Pills top to bottom; each leader runs from its pill to the top of a pin.
const FEATURES = [
  {
    label: 'wsparcie organizacji dobra publicznego',
    leader: { x1: 279, y1: 18, x2: 318, y2: 112 },
    pinTop: 112,
  },
  {
    label: 'weryfikacja organizacji',
    leader: { x1: 175, y1: 84, x2: 265, y2: 112 },
    pinTop: 112,
  },
  {
    label: 'darmowe narzędzie',
    leader: { x1: 149, y1: 133, x2: 212, y2: 182 },
    pinTop: 158,
  },
];

const toPercent = (value: number, total: number) => `${(value / total) * 100}%`;
const photoSlotStyle = {
  left: toPercent(PHOTO_SLOT.x, COLLAGE.width),
  top: toPercent(PHOTO_SLOT.y, COLLAGE.height),
  width: toPercent(PHOTO_SLOT.width, COLLAGE.width),
  height: toPercent(PHOTO_SLOT.height, COLLAGE.height),
};

const isOnPhoto = (y: number) => y > PHOTO_SLOT.y;

function CollageCards() {
  return (
    <svg
      aria-hidden="true"
      viewBox={VIEWBOX}
      className="absolute inset-0 h-full w-full overflow-visible"
    >
      <g className="fill-hero-surface stroke-hero-border">
        {CARDS.map((card) => (
          <rect
            key={`${card.x}-${card.y}`}
            {...card}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  );
}

// Only drawn at xl, where the pills sit at their Figma positions over the
// collage; below that they wrap into a row and the lines would miss them.
function CollageLeaders() {
  return (
    <svg
      aria-hidden="true"
      viewBox={VIEWBOX}
      className="absolute inset-0 hidden h-full w-full overflow-visible xl:block"
      fill="none"
    >
      {FEATURES.map(({ label, leader, pinTop }) => (
        <g key={label}>
          <line
            {...leader}
            className={
              isOnPhoto(leader.y2) ? 'stroke-hero-pin' : 'stroke-hero-border'
            }
            vectorEffect="non-scaling-stroke"
          />
          <g className="stroke-hero-pin">
            <line
              x1={leader.x2}
              y1={pinTop}
              x2={leader.x2}
              y2={PIN.endY}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={leader.x2}
              cy={PIN.dotY}
              r={PIN.dotRadius}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        </g>
      ))}
    </svg>
  );
}

export default function HeroSection() {
  return (
    <SectionShell>
      <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-14">
        <div className="lg:w-5/12">
          <SectionHeading as="h1" size="display">
            {HEADING}
          </SectionHeading>
          <p className="text-lg">{BODY}</p>
          <Button
            asChild
            className="border-hero-border bg-hero-cta-bg text-foreground hover:bg-hero-cta-bg-hover mt-12 h-auto min-h-14 rounded-lg border px-8 py-2.5 text-lg font-medium"
          >
            <Link href="/contact">Zgłoś organizację</Link>
          </Button>
        </div>

        <div className="relative w-full lg:flex-1">
          <ul className="mb-4 flex flex-wrap gap-2 xl:absolute xl:top-0 xl:left-0 xl:z-10 xl:mb-0 xl:flex-col xl:items-start xl:gap-4">
            {FEATURES.map(({ label }) => (
              <li
                key={label}
                className="border-hero-border bg-hero-surface rounded-full border px-2.5 py-2.5 text-sm leading-5 font-medium"
              >
                {label}
              </li>
            ))}
          </ul>
          <div
            className="relative w-full"
            style={{ aspectRatio: `${COLLAGE.width} / ${COLLAGE.height}` }}
          >
            <CollageCards />
            <div
              className="absolute overflow-hidden rounded-2xl"
              style={photoSlotStyle}
            >
              <Image
                src={PHOTO.src}
                alt={PHOTO.alt}
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover"
              />
            </div>
            <CollageLeaders />
          </div>
        </div>
      </div>

      <Link
        href={`#${MANAGEMENT_SUPPORT_ID}`}
        aria-label="Przewiń do sekcji Wsparcie w zarządzaniu potrzebami"
        className="mx-auto mt-16 hidden w-fit lg:block"
      >
        <ChevronsDown aria-hidden="true" strokeWidth={1} className="size-10" />
      </Link>
    </SectionShell>
  );
}
