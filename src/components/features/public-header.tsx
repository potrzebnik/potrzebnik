import Link from 'next/link';

const navigationItems = [
  { href: '/about', label: 'O nas' },
  { href: '/contact', label: 'Kontakt' },
] as const;

export function PublicHeader() {
  return (
    <header className="overflow-x-auto border-b-[0.5px] border-black bg-[#FBFDFF]">
      <div className="mx-auto box-border flex h-[84px] max-w-[1440px] min-w-[1180px] items-center justify-between px-[100px] pt-[20px] pb-[24px]">
        <div className="flex h-9 w-[1016px] flex-1 items-center justify-between">
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
              <ul className="flex h-9 items-center">
                {navigationItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex h-9 items-center justify-center rounded-lg px-4 py-2 text-sm leading-5 font-medium text-[#404040] transition-colors hover:bg-black/5"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <Link
            href="/contact"
            className="inline-flex h-9 min-h-9 items-center justify-center rounded-lg border-[0.5px] border-black bg-[#FFD73A] px-4 py-2 text-sm leading-5 font-medium text-[#0A0A0A] transition-colors hover:bg-[#f2c91f]"
          >
            Zgłoś organizację
          </Link>
        </div>

        <button
          type="button"
          className="ml-[27px] inline-flex h-10 min-h-10 items-center justify-center rounded-lg px-6 text-sm leading-5 font-medium text-[#404040] transition-colors hover:bg-black/5"
          aria-label="Zmień język"
        >
          ENG
        </button>
      </div>
    </header>
  );
}
