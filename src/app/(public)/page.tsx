import HeroSection from '@/components/sections/HeroSection';
import ManagementSupportSection from '@/components/sections/ManagementSupportSection';
import StepsSection from '@/components/sections/StepsSection';
import OrgSignupSection from '@/components/sections/OrgSignupSection';
import BenefitsStripSection from '@/components/sections/BenefitsStripSection';
import WhyWorthSection from '@/components/sections/WhyWorthSection/WhyWorthSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ManagementSupportSection />
      <WhyWorthSection />
      <StepsSection />
      <OrgSignupSection />
      <BenefitsStripSection />
    </>
  );
}
