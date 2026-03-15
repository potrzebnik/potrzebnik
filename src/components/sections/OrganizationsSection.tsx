import SectionTemplate from '@/components/shared/SectionTemplate';

export default function OrganizationsSection() {
  return (
    <SectionTemplate
      title="Organizacje"
      descriptions={[
        'Sprawdź, jakie organizacje poszukują wsparcia. To lista zweryfikowanych inicjatyw działających lokalnie i ogólnokrajowo, realnie zmieniając świat na lepsze.',
      ]}
      image={{
        src: '/volunteers.jpg',
        alt: 'Dwoje dzieci bawiących się na świeżym powietrzu',
        frame: false,
        height: 'md',
      }}
      buttonText="Odkrywaj organizacje"
      overlayVariant="blue"
      reversed
    />
  );
}
