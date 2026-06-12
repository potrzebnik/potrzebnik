'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navigationItems = [
  { href: '/about', label: 'O nas' },
  { href: '/contact', label: 'Kontakt' },
] as const;

export function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen((current) => !current);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-header-bg">
      <div className="relative bg-white md:hidden">
        <div className="relative flex h-[60px] items-center">
          <div className="flex h-9 w-full items-center justify-between px-5">
            <Link
              href="/"
              className="text-header-fg flex h-9 items-center gap-[20px]"
            >
              <span className="bg-header-fg h-[25px] w-[25px] rounded-full" />
              <span className="inline-flex h-[25px] items-center text-[20px] leading-none font-semibold">
                Potrzebnik
              </span>
            </Link>
            <Button
              id="navi-bar-icon-mobile"
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-header-icon-muted"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navbar-panel"
              aria-label={isMobileMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="size-6" strokeWidth={2} />
              ) : (
                <Menu className="size-6" strokeWidth={2} />
              )}
            </Button>
          </div>
          <span className="absolute right-0 bottom-0 left-0 border-t border-black" />
          <span className="absolute right-0 bottom-1 left-0 border-t border-black" />
        </div>

        {isMobileMenuOpen ? (
          <div
            id="mobile-navbar-panel"
            className="flex min-h-[735px] w-full items-start bg-white pt-5 pr-8 pb-0 pl-5"
          >
            <div className="flex w-full max-w-[350px] flex-col gap-10">
              <div className="flex w-full flex-col">
                {navigationItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      'inline-flex h-14 w-full items-center px-[10px] py-4 text-base leading-6 font-medium text-black',
                      index < navigationItems.length - 1 &&
                        'border-header-border border-b',
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <Button
                asChild
                className="bg-header-cta text-header-fg hover:bg-header-cta/90 h-14 min-h-10 w-full rounded-lg border border-black px-8 py-2.5 text-[20px] leading-[25px] font-medium"
              >
                <Link href="/contact" onClick={closeMobileMenu}>
                  Zgłoś organizację
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                aria-label="Zmień język"
                className="text-header-fg-muted h-9 min-h-9 w-[85px] gap-2 rounded-lg px-4 py-2 text-sm leading-5 font-medium"
              >
                ENG
                <ChevronDown
                  className="text-header-fg size-4"
                  strokeWidth={2}
                />
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="hidden border-b border-black md:block">
        <div className="bg-header-bg mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between gap-[15px] px-[100px] pt-5 pb-[25px]">
          <div className="flex h-9 w-[925px] items-center gap-[65px]">
            <Link
              href="/"
              className="text-header-fg flex h-9 items-center gap-[20px]"
            >
              <span className="bg-header-fg h-[25px] w-[25px] rounded-full" />
              <span className="text-[20px] leading-[25px] font-semibold">
                Potrzebnik
              </span>
            </Link>

            <nav aria-label="Nawigacja główna">
              <ul className="flex h-9 items-center p-0">
                {navigationItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-header-fg-muted inline-flex h-9 min-h-9 items-center justify-center rounded-lg px-4 py-2 text-sm leading-5 font-medium"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex h-10 w-[260px] items-center gap-[10px]">
            <Button
              asChild
              className="bg-header-cta text-header-fg hover:bg-header-cta/90 h-9 min-h-9 w-[145px] gap-[25px] rounded-lg border border-black px-4 py-2 text-sm leading-5 font-medium whitespace-nowrap"
            >
              <Link href="/contact">Zgłoś organizację</Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              aria-label="Zmień język"
              className="text-header-fg-muted w-[100px] gap-2 rounded-lg text-sm leading-5 font-medium"
            >
              ENG
              <ChevronDown className="text-header-fg size-4" strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
