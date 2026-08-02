import Image from 'next/image';
import Link from 'next/link';
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
    <section className="relative w-full overflow-hidden py-12 lg:py-24">
      {/* ---------- Mobile (< lg): stacked panel + vertical collage ---------- */}
      <div className="lg:hidden">
        {/* Blue panel (Figma #D1E7FE, ~13px radius), near full-bleed width */}
        <div className="mx-3 rounded-[13px] border border-black bg-[#D1E7FE] px-6 py-8">
          <div className="flex flex-col gap-6">
            <h2 className="text-[20px] leading-[24px] font-semibold text-[#0A0A0A]">
              {HEADING}
            </h2>
            <p className="text-[16px] leading-[24px] text-[#171717]">{BODY}</p>
            <Button
              asChild
              className="h-auto min-h-[47px] w-fit rounded-lg border border-black bg-[#FFD73A] px-6 py-2.5 text-[14px] leading-[20px] font-medium text-[#0A0A0A] hover:bg-[#F5C800]"
            >
              <Link href="/contact">Zgłoś organizację</Link>
            </Button>
          </div>
        </div>

        {/* Collage: vertical stack with a two-up row in the middle */}
        <div className="mt-6 flex flex-col gap-[10px] px-5">
          <div className="relative h-[125px] w-full overflow-hidden rounded-lg shadow-md">
            <Photo asset={photos.child} sizes="100vw" />
          </div>
          <div className="relative h-[124px] w-full overflow-hidden rounded-lg shadow-md">
            <Photo asset={photos.flower} sizes="100vw" />
          </div>
          <div className="flex gap-[11px]">
            <div className="relative h-[176px] grow-[187] basis-0 overflow-hidden rounded-lg shadow-md">
              <Photo asset={photos.volunteers} sizes="55vw" />
            </div>
            <div className="relative h-[176px] grow-[152] basis-0 overflow-hidden rounded-lg shadow-md">
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
            className="pointer-events-none absolute top-0 right-[-40px] -z-10 h-full w-auto"
            viewBox="-1500 0 2229 591"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M-1500 0.25H616.5C627.408 0.25 636.25 9.09238 636.25 20V164C636.25 175.184 645.316 184.25 656.5 184.25H709C719.908 184.25 728.75 193.092 728.75 204V322C728.75 332.908 719.908 341.75 709 341.75H691.5C680.316 341.75 671.25 350.816 671.25 362V571C671.25 581.908 662.408 590.75 651.5 590.75H-1500V0.25Z"
              fill="#DBEAFE"
              stroke="black"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="w-full py-16 pr-12 pl-[100px]">
            <div className="max-w-[462px]">
              <h2 className="mb-5 text-[48px] leading-[54px] font-semibold tracking-[-1.5px] text-black">
                {HEADING}
              </h2>
              <p className="mb-6 text-[18px] leading-[27px] text-black">
                {BODY}
              </p>
              <Button
                asChild
                className="h-auto min-h-14 rounded-lg border border-black bg-[#FFD73A] px-8 py-2.5 text-[18px] leading-[27px] font-medium text-black hover:bg-[#F5C800]"
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
    </section>
  );
}
