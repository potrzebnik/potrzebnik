import SectionTemplate from '@/components/shared/SectionTemplate';

export default function AboutSection() {
  return (
    <SectionTemplate
      title="O nas"
      descriptions={[
        'Umożliwiamy darczyńcom realne wsparcie organizacji, oferując łatwy dostęp do ich aktualnych potrzeb.',
        'Zostań darczyńcą i pomóż społecznościom w trudnej sytuacji — razem możemy więcej.',
      ]}
      image={{
        src: '/children.jpg',
        alt: 'Wolontariusze rozdający wodę i pomoc rzeczową',
        frame: true,
        height: 'lg',
      }}
      buttonText="Dowiedz się więcej"
      overlayVariant="yellow"
    />
  );
}
