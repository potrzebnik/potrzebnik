import Image from 'next/image';
import SectionHeading from '@/components/shared/SectionHeading';
import SectionShell from '@/components/shared/SectionShell';

export const MANAGEMENT_SUPPORT_ID = 'management-support';

const HEADING = 'Wsparcie w zarządzaniu potrzebami';
const HIGHLIGHT = 'Chaos zamieniamy w uporządkowaną listę.';
const DETAIL =
  'Zamiast odpisywać na dziesiątki pytań darczyńców, udostępniasz jeden, zawsze aktualny link. Darczyńca widzi, co jest priorytetem, wybiera przedmiot i wysyła go prosto do Ciebie.';

const PHOTO = {
  src: '/volunteers-van.webp',
  alt: 'Wolontariusze pakują kartony z pomocą i ładują je do busa',
  width: 1278,
  height: 1362,
};

// The band outline is the Figma "Rectangle 287" vector path in its own
// 1441×689 box. It stretches with the section, and the photo is close enough
// to square that the corners stay round.
const BAND = { width: 1441, height: 689 };
const BAND_PATH =
  'M1.77 19.94C1.81 8.92 10.75 0 21.77 0L698.2 0C709.43 0 718.45 9.24 718.19 20.47L717.32 57.82C717.05 69.04 726.08 78.28 737.31 78.28L1421 78.28C1432.05 78.28 1441 87.24 1441 98.28L1441 669C1441 680.05 1432.05 689 1421 689L739.77 689C728.72 689 719.77 680.05 719.77 669L719.77 639.6C719.77 628.55 710.81 619.6 699.77 619.6L20.06 619.6C8.99 619.6 0.03 610.61 0.06 599.54Z';
const GUIDE_LINES_X = [124, 134, 144];
const LEFT_PANEL_BOTTOM = 619.6;

function Band() {
  return (
    <div
      aria-hidden="true"
      className="absolute top-40 right-6 bottom-0 left-0 hidden lg:block"
    >
      <svg
        viewBox={`0 0 ${BAND.width} ${BAND.height}`}
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
      >
        <g className="stroke-management-support-border" strokeWidth={0.5}>
          <path
            d={BAND_PATH}
            className="fill-management-support-band-bg"
            vectorEffect="non-scaling-stroke"
          />
          {GUIDE_LINES_X.map((x) => (
            <line
              key={x}
              x1={x}
              y1={0}
              x2={x}
              y2={LEFT_PANEL_BOTTOM}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

export default function ManagementSupportSection() {
  return (
    <SectionShell id={MANAGEMENT_SUPPORT_ID} variant="bleed">
      <div
        aria-hidden="true"
        className="bg-management-support-band-bg absolute inset-0 lg:hidden"
      />
      <Band />

      <div className="relative container mx-auto grid gap-10 px-6 lg:grid-cols-2 lg:gap-x-16">
        <div className="lg:pt-36 lg:pl-24">
          <SectionHeading size="display">{HEADING}</SectionHeading>
          <p className="text-lg">
            Potrzebnik to darmowe narzędzie stworzone dla{' '}
            <strong className="font-semibold">
              organizacji pożytku publicznego
            </strong>
            , które chcą profesjonalnie zarządzać darami rzeczowymi.
          </p>
          <p className="mt-6 text-lg font-semibold">{HIGHLIGHT}</p>
          <p className="mt-3 text-lg">{DETAIL}</p>
        </div>

        <Image
          src={PHOTO.src}
          alt={PHOTO.alt}
          width={PHOTO.width}
          height={PHOTO.height}
          sizes="(min-width: 1024px) 45vw, 90vw"
          className="h-auto w-full rounded-2xl"
        />
      </div>
    </SectionShell>
  );
}
