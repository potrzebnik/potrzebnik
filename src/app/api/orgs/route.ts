import { NextResponse } from 'next/server';
type Org = {
  orgName: string;
  needs: {
    name: string;
    link: string;
  }[];
};

const inMemoryDB: Org[] = [
  {
    orgName: 'Fundacja X',
    needs: [
      {
        name: 'karma',
        link: 'https://allegro.pl/123',
      },
      {
        name: 'koce',
        link: 'https://allegro.pl/321',
      },
    ],
  },
];

export async function GET() {
  return NextResponse.json(inMemoryDB);
}
