'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Menu } from 'lucide-react';

type MobileMenuItem = {
  href: string;
  label: string;
  top: number;
  left: number;
  isInverted?: boolean;
};

const navigationItems = [
  { href: '/about', label: 'O nas' },
  { href: '/contact', label: 'Kontakt' },
] as const;

const mobileMenuItems: MobileMenuItem[] = [
  { href: '/about', label: 'O nas', top: 25, left: 8 },
  { href: '/contact', label: 'Kontakt', top: 59, left: 9 },
  { href: '/contact', label: 'Zgłoś organizację', top: 93, left: 9 },
  { href: '/dashboard', label: 'Zaloguj się', top: 127, left: 9 },
  {
    href: '/needs',
    label: 'Dla darczyńców',
    top: 161,
    left: 9,
    isInverted: true,
  },
];

export function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen((current) => !current);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-[#FBFDFF]">
      <div className="relative h-[62px] md:hidden">
        <button
          id="navi-bar-icon-mobile"
          type="button"
          className="absolute top-[13px] right-[19px] inline-flex h-6 w-6 items-center justify-center text-[#525252]"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navbar-panel"
          aria-label="Otwórz menu"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-6 w-6" strokeWidth={2} />
        </button>

        {isMobileMenuOpen ? (
          <div
            id="mobile-navbar-panel"
            className="absolute top-[45px] right-[19px] z-30 h-[360px] w-[132px] rounded-[12.87px] border border-black bg-[#D1E7FE]"
          >
            {mobileMenuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMobileMenu}
                className={`absolute inline-flex h-[22px] w-[116px] items-center justify-center rounded-[6.41px] border text-[12px] leading-4 font-normal ${
                  item.isInverted
                    ? 'border-[#FFD73A] bg-[#5B3DF5] text-[#FFD73A]'
                    : 'border-[#5B3DF5] bg-[#FFD73A] text-[#5B3DF5]'
                }`}
                style={{ left: `${item.left}px`, top: `${item.top}px` }}
              >
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              className="absolute bottom-[95px] left-1/2 inline-flex h-6 w-14 -translate-x-1/2 items-center justify-center gap-0.5 rounded-[6.41px] border border-[#5B3DF5] bg-[#FFD73A] text-[12px] leading-4 font-normal text-black"
              aria-label="Wybierz język"
            >
              ENG
              <ChevronDown className="h-4 w-4 text-[#1D1B20]" strokeWidth={2} />
            </button>

            <div
              className="absolute bottom-[11.06px] left-[19px] h-[77.94px] w-[94px]"
              aria-hidden="true"
            >
              <Image
                src="/mobile-heart-logo.svg"
                alt=""
                fill
                className="object-cover"
                sizes="94px"
              />
            </div>
          </div>
        ) : null}

        <span className="absolute top-[51px] right-0 left-0 border-t-[0.5px] border-black" />
        <span className="absolute top-[61px] right-0 left-0 border-t-[0.5px] border-black" />
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
