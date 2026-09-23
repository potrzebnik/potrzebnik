import MediaTextSection from '@/components/shared/MediaTextSection';

export default function OrganizationsSection() {
  return (
    <MediaTextSection
      title="Organizacje"
      descriptions={[
        {
          id: 'organizations-intro',
          text: 'Sprawdź, jakie organizacje poszukują wsparcia. To lista zweryfikowanych inicjatyw działających lokalnie i ogólnokrajowo, realnie zmieniając świat na lepsze.',
        },
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
