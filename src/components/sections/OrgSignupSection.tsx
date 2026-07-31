import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface CollageImage {
  id: string;
  src: string;
  alt: string;
  /** Position + size within the collage frame, taken from the Figma layout. */
  className: string;
  flipped?: boolean;
  /** Optional object-position tweak when object-cover crops an off-centre subject. */
  objectPosition?: string;
}

// Positions/sizes are derived from the Figma frame (778×591) so the collage
// stays faithful regardless of which images are dropped in.
const collageImages: CollageImage[] = [
  {
    id: 'top-wide',
    src: '/child-gift.jpg',
    alt: 'Uśmiechnięty chłopiec otwierający pudełko z darem',
    className: 'top-0 left-0 h-[26.6%] w-[56.3%]',
    flipped: true,
    objectPosition: 'object-[center_28%]',
  },
  {
    id: 'middle',
    src: '/hands-with-flower.png',
    alt: 'Dłonie trzymające żółty kwiat',
    className: 'top-[29.1%] left-[11.4%] h-[30.7%] w-[45.3%]',
  },
  {
    id: 'top-right',
    src: '/volunteers-aid.png',
    alt: 'Wolontariusze pakujący dary rzeczowe do kartonu',
    className: 'top-[14.6%] left-[58.5%] h-[45.3%] w-[33.9%]',
    objectPosition: 'object-[62%_center]',
  },
  {
    id: 'bottom-left',
    src: '/family-embrace.png',
    alt: 'Rodzina przytulająca się razem',
    className: 'top-[62.3%] left-[2%] h-[37.7%] w-[24.3%]',
  },
  {
    id: 'bottom-right',
    src: '/senior-hands.png',
    alt: 'Dłoń wspierająca starszą osobę',
    className: 'top-[62.3%] left-[28.5%] h-[29.8%] w-[71.5%]',
  },
];

export default function OrgSignupSection() {
  return (
    <section className="relative w-full overflow-hidden py-24">
      <div className="container mx-auto grid grid-cols-2 gap-10 px-6">
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
                Zadbaj o uporządkowanie potrzeb rzeczowych
              </h2>
              <p className="mb-6 text-[18px] leading-[27px] text-black">
                Dołącz do Potrzebnika i zacznij profesjonalnie zarządzać darami
                rzeczowymi. Rejestracja jest całkowicie bezpłatna i zajmie Ci
                tylko 2 minuty.
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
          {collageImages.map((image) => (
            <div
              key={image.id}
              className={`absolute overflow-hidden rounded-lg shadow-md ${image.className}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="25vw"
                className={`object-cover ${image.objectPosition ?? ''} ${image.flipped ? '-scale-x-100' : ''}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
