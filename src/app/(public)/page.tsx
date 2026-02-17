import { Button } from '@/components/ui/button';
const { NEXT_PUBLIC_BASE_URL = 'http://localhost:3000' } = process.env;

export default async function HomePage() {
  return (
    <div>
      <main>
        <h1>Welcome to Potrzebnik</h1>
        <Button>Click me</Button>
      </main>
    </div>
  );
}
