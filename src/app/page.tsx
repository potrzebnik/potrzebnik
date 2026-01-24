import { Button } from '@/components/ui/button';
const { NEXT_PUBLIC_BASE_URL = 'http://localhost:3000' } = process.env;

export default async function Home() {
  const data = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/orgs`);
  const orgs = await data.json();
  return (
    <div>
      <main>
        {orgs.map(({ orgName, needs }) => (
          <div key={orgName}>
            <h1>{orgName}</h1>
            <h3>Potrzeby:</h3>
            <Button>Click me</Button>
            <ul>
              {needs.map(({ name, link }) => (
                <li key={link}>
                  <a href={link}>{name}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </main>
    </div>
  );
}
