
export default async function Home() {
  const data = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orgs`)
  const orgs = await data.json()
  return (
    <div>
      <main>
        {orgs.map(({orgName, needs}) => (
          <div key={orgName}>
            <h1>{orgName}</h1>
            <h3>Potrzeby:</h3>
            <ul>
              {needs.map(({name, link}) => (
                <li key={link}><a href={link}>{name}</a></li>
              ))}
            </ul>
          </div>
        ))}
        
      </main>
    </div>
  );
}
