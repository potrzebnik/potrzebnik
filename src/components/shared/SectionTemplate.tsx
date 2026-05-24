import Image, { StaticImageData } from 'next/image';
import ImageOverlay, {
  overlayVariants,
} from '@/components/shared/ImageOverlay';
import { Button } from '@/components/ui/button';

interface ImageProperties {
  src: string | StaticImageData;
  alt: string;
  frame?: boolean;
  height?: keyof typeof heightVariants;
}

interface DescriptionItem {
  id: string;
  text: string;
}

interface SectionTemplateProps {
  title: string;
  descriptions: DescriptionItem[];
  image: ImageProperties;
  buttonText: string;
  overlayVariant: keyof typeof overlayVariants;
  reversed?: boolean;
}

export const heightVariants = {
  sm: 'h-[250px] md:h-[350px]',
  md: 'h-[300px] md:h-[450px]',
  lg: 'h-[350px] md:h-[550px]',
} as const;

const SectionTemplate = ({
  title,
  descriptions,
  image,
  buttonText,
  overlayVariant,
  reversed = false,
}: SectionTemplateProps) => {
  return (
    <section className="container mx-auto px-6 py-18 sm:py-24">
      <div className="grid grid-cols-1 items-center gap-16 sm:gap-20 lg:grid-cols-2 xl:gap-24">
        <div className={reversed ? 'lg:order-2' : 'lg:order-1'}>
          <div
            className={`relative mx-auto w-11/12 md:max-w-xl lg:mx-0 ${image.frame ? 'rounded-lg bg-white' : ''}`}
          >
            <div
              className={`flex items-center justify-center rounded-lg shadow-md ${
                heightVariants[image.height || 'md']
              }`}
            >
              <ImageOverlay variant={overlayVariant} />
              <Image
                src={image.src}
                alt={image.alt}
                width={400}
                height={400}
                className={`${image.frame ? 'h-[95%] w-[95%]' : 'h-full w-full'} rounded-lg object-cover`}
              />
            </div>
          </div>
        </div>
        <div className={reversed ? 'lg:order-1' : 'lg:order-2'}>
          <div className="px-3 sm:px-6 xl:px-20">
            <h2 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h2>
            {descriptions.map((item) => (
              <p
                className="text-foreground mb-6 text-justify text-base leading-relaxed"
                key={item.id}
              >
                {item.text}
              </p>
            ))}
            <Button
              variant="secondary"
              className="hover:bg-foreground hover:text-background h-auto cursor-pointer rounded-lg border-none px-5 py-3 text-base font-medium transition-colors sm:px-6"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionTemplate;
