import StepsSection from '@/components/sections/StepsSection';
import OrgSignupSection from '@/components/sections/OrgSignupSection';
import BenefitsStripSection from '@/components/sections/BenefitsStripSection';
import WhyWorthSection from '@/components/sections/WhyWorthSection/WhyWorthSection';

export default function HomePage() {
  return (
    <div>
      <main>
        <h1>Welcome to Potrzebnik</h1>
        <WhyWorthSection />
        <StepsSection />
        <OrgSignupSection />
        <BenefitsStripSection />
      </main>
    </div>
  );
}
