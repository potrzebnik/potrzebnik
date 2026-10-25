import Image from 'next/image';

export interface Asset {
  src: string;
  alt: string;
  flipped?: boolean;
  /** Optional object-position tweak when object-cover crops an off-centre subject. */
  objectPosition?: string;
}

// The five collage photos, referenced by both the desktop and mobile layouts.
export const photos = {
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

export function Photo({ asset, sizes }: { asset: Asset; sizes: string }) {
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

export default function OrgSignupCollage() {
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

  return (
    <>
      {desktopSlots.map((slot) => (
        <div
          key={slot.asset.src}
          className={`absolute overflow-hidden rounded-lg shadow-md ${slot.className}`}
        >
          <Photo asset={slot.asset} sizes="25vw" />
        </div>
      ))}
    </>
  );
}
