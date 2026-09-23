import Image from 'next/image';
import Link from 'next/link';
import SectionShell from '@/components/shared/SectionShell';
import { Button } from '@/components/ui/button';

interface Asset {
  src: string;
  alt: string;
  flipped?: boolean;
  /** Optional object-position tweak when object-cover crops an off-centre subject. */
  objectPosition?: string;
}

// The five collage photos, referenced by both the desktop and mobile layouts.
const photos = {
  child: {
    src: '/child-gift.jpg',
    alt: 'Uśmiechnięty chłopiec otwierający pudełko z darem',
    flipped: true,
    objectPosition: 'object-[center_28%]',
  },
  flower: {
    src: '/hands-with-flower.png',
    alt: 'Dłonie trzymające żółty kwiat',
  },
  volunteers: {
    src: '/volunteers-aid.png',
    alt: 'Wolontariusze pakujący dary rzeczowe do kartonu',
    objectPosition: 'object-[62%_center]',
  },
  family: {
    src: '/family-embrace.png',
    alt: 'Rodzina przytulająca się razem',
  },
  senior: {
    src: '/senior-hands.png',
    alt: 'Dłoń wspierająca starszą osobę',
  },
} satisfies Record<string, Asset>;

// Desktop collage: positions/sizes derived from the Figma frame (778×591).
const desktopSlots: { asset: Asset; className: string }[] = [
  { asset: photos.child, className: 'top-0 left-0 h-[26.6%] w-[56.3%]' },
  {
    asset: photos.flower,
    className: 'top-[29.1%] left-[11.4%] h-[30.7%] w-[45.3%]',
  },
  {
    asset: photos.volunteers,
    className: 'top-[14.6%] left-[58.5%] h-[45.3%] w-[33.9%]',
  },
  {
    asset: photos.family,
    className: 'top-[62.3%] left-[2%] h-[37.7%] w-[24.3%]',
  },
  {
    asset: photos.senior,
    className: 'top-[62.3%] left-[28.5%] h-[29.8%] w-[71.5%]',
  },
];

function Photo({ asset, sizes }: { asset: Asset; sizes: string }) {
  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      fill
      sizes={sizes}
      className={`object-cover ${asset.objectPosition ?? ''} ${
        asset.flipped ? '-scale-x-100' : ''
      }`}
    />
  );
}

const HEADING = 'Zadbaj o uporządkowanie potrzeb rzeczowych';
const BODY =
  'Dołącz do Potrzebnika i zacznij profesjonalnie zarządzać darami rzeczowymi. Rejestracja jest całkowicie bezpłatna i zajmie Ci tylko 2 minuty.';

export default function OrgSignupSection() {
  return (
    <SectionShell variant="bleed" rhythm="compact">
      {/* ---------- Mobile (< lg): stepped panel + notched collage ---------- */}
      <div className="lg:hidden">
        {/* Normalized clip-path for the child photo's top notch (Figma boy card).
            objectBoundingBox units so it scales with the responsive photo width.
            The panel's stepped tab above drops into this notch. */}
        <svg aria-hidden="true" className="absolute h-0 w-0">
          <defs>
            <clipPath
              id="orgSignupChildNotch"
              clipPathUnits="objectBoundingBox"
            >
              <path d="M0.897857 0C0.885234 0 0.875 0.028654 0.875 0.064V0.072367C0.875 0.107712 0.864766 0.136367 0.852143 0.136367L0.632717 0.136367C0.62009 0.136366 0.60986 0.107711 0.60986 0.072367V0.064C0.60986 0.028654 0.599626 0 0.587003 0L0.022857 0C0.010234 0 0 0.028654 0 0.064V0.936C0 0.971344 0.010234 1 0.022857 1H0.977143C0.989766 1 1 0.971344 1 0.936V0.064C1 0.028654 0.989766 0 0.977143 0L0.897857 0Z" />
            </clipPath>
          </defs>
        </svg>

        {/* Blue panel with the stepped bottom-right tab (Figma #D1E7FE),
            full-bleed. The SVG background stretches to the text-driven height;
            the tab drops through the notch of the child photo below it. */}
        <div className="relative w-full">
          <svg
            aria-hidden="true"
            viewBox="-10.75 0.25 409.5 374.5"
            preserveAspectRatio="none"
            className="absolute inset-0 -z-10 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M398.75 12.7197L398.75 333.825C398.75 340.712 393.167 346.295 386.28 346.295H333.72C326.557 346.295 320.75 352.102 320.75 359.265V362.28C320.75 369.167 315.167 374.75 308.28 374.75H255.72C248.833 374.75 243.25 369.167 243.25 362.28V360.283C243.25 353.12 237.443 347.313 230.28 347.313L1.71973 347.313C-5.16697 347.313 -10.75 341.73 -10.75 334.844L-10.75 12.7197C-10.75 5.83303 -5.16697 0.25 1.71973 0.25L386.28 0.25C393.167 0.25 398.75 5.83303 398.75 12.7197Z"
              className="fill-org-signup-panel-bg-mobile stroke-org-signup-border"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="flex flex-col gap-6 px-8 pt-9 pb-20">
            <h2 className="text-org-signup-fg text-[20px] leading-[24px] font-semibold">
              {HEADING}
            </h2>
            <p className="text-foreground text-[16px] leading-[24px]">{BODY}</p>
            <Button
              asChild
              className="border-org-signup-border bg-org-signup-btn-bg text-org-signup-fg hover:bg-org-signup-btn-bg-hover h-auto min-h-[47px] w-fit rounded-lg border px-6 py-2.5 text-[14px] leading-[20px] font-medium"
            >
              <Link href="/contact">Zgłoś organizację</Link>
            </Button>
          </div>
        </div>

        {/* Collage: the child photo's notched top mirrors the panel's stepped
            tab across a constant 17px white channel (Figma spacing), then the
            vertical stack with a two-up row in the middle. */}
        <div className="mt-[17px] flex flex-col gap-2.5 px-5">
          <div className="relative h-[125px] w-full [clip-path:url(#orgSignupChildNotch)]">
            <Photo asset={photos.child} sizes="100vw" />
          </div>
          <div className="relative h-[124px] w-full overflow-hidden rounded-lg shadow-md">
            <Photo asset={photos.flower} sizes="100vw" />
          </div>
          <div className="flex h-44 gap-[11px]">
            <div className="relative h-full grow-[187] basis-0 overflow-hidden rounded-lg shadow-md">
              <Photo asset={photos.volunteers} sizes="55vw" />
            </div>
            <div className="relative h-full grow-[152] basis-0 overflow-hidden rounded-lg shadow-md">
              <Photo asset={photos.family} sizes="45vw" />
            </div>
          </div>
          <div className="relative h-[111px] w-full overflow-hidden rounded-lg shadow-md">
            <Photo asset={photos.senior} sizes="100vw" />
          </div>
        </div>
      </div>

      {/* ---------- Desktop (lg+): two columns, panel + absolute collage ---------- */}
      <div className="container mx-auto hidden grid-cols-2 gap-10 px-6 lg:grid">
        {/* Left: text + CTA on a blue panel (Figma "Rectangle 272" shape) that
            bleeds off the left edge; the left side of the path is extended so it
            runs past the viewport and is clipped by the section overflow. */}
        <div className="relative flex items-center">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute top-0 -right-10 -z-10 h-full w-auto"
            viewBox="-1500 0 2229 591"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M-1500 0.25H616.5C627.408 0.25 636.25 9.09238 636.25 20V164C636.25 175.184 645.316 184.25 656.5 184.25H709C719.908 184.25 728.75 193.092 728.75 204V322C728.75 332.908 719.908 341.75 709 341.75H691.5C680.316 341.75 671.25 350.816 671.25 362V571C671.25 581.908 662.408 590.75 651.5 590.75H-1500V0.25Z"
              className="fill-org-signup-panel-bg stroke-org-signup-border"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="w-full py-16 pr-12 pl-25">
            <div className="max-w-[462px]">
              <h2 className="text-org-signup-fg mb-5 text-[48px] leading-[54px] font-semibold tracking-[-1.5px]">
                {HEADING}
              </h2>
              <p className="text-foreground mb-6 text-[18px] leading-[27px]">
                {BODY}
              </p>
              <Button
                asChild
                className="border-org-signup-border bg-org-signup-btn-bg text-org-signup-fg hover:bg-org-signup-btn-bg-hover h-auto min-h-14 rounded-lg border px-8 py-2.5 text-[18px] leading-[27px] font-medium"
              >
                <Link href="/contact">Zgłoś organizację</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right: 5-image collage */}
        <div className="relative aspect-[778/591] w-full max-w-[778px]">
          {desktopSlots.map((slot) => (
            <div
              key={slot.asset.src}
              className={`absolute overflow-hidden rounded-lg shadow-md ${slot.className}`}
            >
              <Photo asset={slot.asset} sizes="25vw" />
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
