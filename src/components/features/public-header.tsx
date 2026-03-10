import Link from 'next/link';
import { CircleUserRound, Heart, Search } from 'lucide-react';

const navigationItems = [
  { href: '/needs', label: 'Potrzeby' },
  { href: '/organizations', label: 'Organizacje' },
  { href: '/about', label: 'O nas' },
  { href: '/contact', label: 'Dla organizacji' },
] as const;

export function PublicHeader() {
  return (
    <header className="overflow-x-auto border-b-[0.5px] border-black bg-[#FBFDFF]">
      <div className="mx-auto flex h-20 max-w-[1440px] min-w-[1180px] items-center justify-between px-10 xl:px-[100px]">
        <div className="flex items-center gap-16">
          <Link
            href="/"
            className="flex items-center gap-[18px] text-[#0A0A0A]"
          >
            <span className="h-[23px] w-[23px] rounded-full bg-[#0A0A0A]" />
            <span className="text-[18px] leading-[27px] font-semibold">
              Potrzebnik
            </span>
          </Link>

          <nav aria-label="Nawigacja główna">
            <ul className="flex items-center gap-0">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex h-10 items-center justify-center rounded-lg px-6 text-sm leading-5 font-medium text-[#404040] transition-colors hover:bg-black/5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-[27px]">
          <label className="flex h-10 w-[191px] items-center gap-3 rounded-lg border border-[#E5E5E5] bg-white px-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <input
              type="search"
              placeholder="Szukaj ..."
              className="w-full border-0 bg-transparent text-sm leading-5 font-normal text-[#171717] placeholder:text-[#737373] focus:outline-none"
              aria-label="Szukaj"
            />
            <Search className="h-4 w-4 text-[#737373]" strokeWidth={1.8} />
          </label>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#0A0A0A] transition-colors hover:bg-black/5"
            aria-label="Ulubione"
          >
            <Heart className="h-5 w-5" strokeWidth={1.8} />
          </button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#0A0A0A] transition-colors hover:bg-black/5"
            aria-label="Profil"
          >
            <CircleUserRound className="h-5 w-5" strokeWidth={1.8} />
          </button>

          <button
            type="button"
            className="inline-flex h-10 min-h-10 items-center justify-center rounded-lg px-6 text-sm leading-5 font-medium text-[#404040] transition-colors hover:bg-black/5"
            aria-label="Zmień język"
          >
            ENG
          </button>
        </div>
      </div>
    </header>
  );
}
