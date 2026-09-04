import StepsSection from '@/components/sections/StepsSection';
import OrgSignupSection from '@/components/sections/OrgSignupSection';
import BenefitsStripSection from '@/components/sections/BenefitsStripSection';
import { Button } from '@/components/ui/button';
import WhyWorthSection from '@/components/sections/WhyWorthSection';

export default async function HomePage() {
  return (
    <div>
      <main>
        <h1>Welcome to Potrzebnik</h1>
        <Button>Click me</Button>
        <WhyWorthSection />
        <StepsSection />
        <OrgSignupSection />
        <BenefitsStripSection />
      </main>
    </div>
  );
}
