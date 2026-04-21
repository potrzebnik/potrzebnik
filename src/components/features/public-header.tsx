'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';

const navigationItems = [
  { href: '/about', label: 'O nas' },
  { href: '/contact', label: 'Kontakt' },
] as const;

export function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen((current) => !current);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-[#FBFDFF]">
      <div className="relative bg-white md:hidden">
        <div className="relative flex h-[60px] items-center">
          <div className="flex h-9 w-full items-center justify-between px-5">
            <Link
              href="/"
              className="flex h-9 items-center gap-[18px] text-[#0A0A0A]"
            >
              <span className="h-[23px] w-[23px] rounded-full bg-[#0A0A0A]" />
              <span className="inline-flex h-[23px] items-center text-[18px] leading-none font-semibold">
                Potrzebnik
              </span>
            </Link>
            <button
              id="navi-bar-icon-mobile"
              type="button"
              className="inline-flex h-6 w-6 items-center justify-center text-[#525252]"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navbar-panel"
              aria-label={isMobileMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" strokeWidth={2} />
              ) : (
                <Menu className="h-6 w-6" strokeWidth={2} />
              )}
            </button>
          </div>
          <span className="absolute right-0 bottom-0 left-0 border-t-[0.5px] border-black" />
          <span className="absolute right-0 bottom-1 left-0 border-t-[0.5px] border-black" />
        </div>

        {isMobileMenuOpen ? (
          <div
            id="mobile-navbar-panel"
            className="flex min-h-[736px] w-full items-start bg-white pt-5 pr-8 pb-0 pl-5"
          >
            <div className="flex w-full max-w-[349px] flex-col gap-10">
              <div className="flex w-full flex-col">
                <Link
                  href="/about"
                  onClick={closeMobileMenu}
                  className="inline-flex h-14 w-full items-center border-b-[0.5px] border-[#D4D4D4] px-[10px] py-4 text-base leading-6 font-medium text-black"
                >
                  O nas
                </Link>
                <Link
                  href="/contact"
                  onClick={closeMobileMenu}
                  className="inline-flex h-14 w-full items-center px-[10px] py-4 text-base leading-6 font-medium text-black"
                >
                  Kontakt
                </Link>
              </div>
              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className="inline-flex h-14 min-h-10 w-full items-center justify-center rounded-lg border-[0.5px] border-black bg-[#FFD73A] px-8 py-2.5 text-[18px] leading-[27px] font-medium text-[#0A0A0A]"
              >
                Zgłoś organizację
              </Link>
              <button
                type="button"
                className="inline-flex h-9 min-h-9 w-[85px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm leading-5 font-medium text-[#404040]"
                aria-label="Zmień język"
              >
                ENG
                <ChevronDown
                  className="h-4 w-4 text-[#0A0A0A]"
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="hidden border-b-[0.5px] border-black md:block">
        <div className="mx-auto flex h-[84px] w-full max-w-[1440px] items-center justify-between gap-4 bg-[#FBFDFF] px-[100px] pt-5 pb-6">
          <div className="flex h-9 w-[926px] items-center justify-between">
            <Link
              href="/"
              className="flex h-9 items-center gap-[18px] text-[#0A0A0A]"
            >
              <span className="h-[23px] w-[23px] rounded-full bg-[#0A0A0A]" />
              <span className="text-[18px] leading-[27px] font-semibold">
                Potrzebnik
              </span>
            </Link>

            <nav aria-label="Nawigacja główna">
              <ul className="flex h-9 items-center p-0">
                {navigationItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`inline-flex h-9 min-h-9 items-center justify-center rounded-lg px-4 py-2 text-sm leading-5 font-medium text-[#404040] ${
                        item.label === 'O nas' ? 'w-[70px]' : 'w-[84px]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex h-10 w-[260px] items-center gap-3">
            <Link
              href="/contact"
              className="inline-flex h-9 min-h-9 w-[147px] items-center justify-center gap-[23px] rounded-lg border-[0.5px] border-black bg-[#FFD73A] px-4 py-2 text-sm leading-5 font-medium text-[#0A0A0A]"
            >
              Zgłoś organizację
            </Link>
            <button
              type="button"
              className="inline-flex h-10 min-h-10 w-[101px] items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm leading-5 font-medium text-[#404040]"
              aria-label="Zmień język"
            >
              ENG
              <ChevronDown className="h-4 w-4 text-[#0A0A0A]" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
