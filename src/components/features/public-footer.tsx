import { Facebook, Linkedin, Mail } from 'lucide-react';

import { Link } from '@/components/ui/link';

export function PublicFooter() {
  return (
    <footer className="text-footer-fg before:border-footer-border after:border-footer-border [&_a:focus-visible]:outline-footer-border before:m-0 before:block before:border-t before:content-none after:m-0 after:mt-3.75 after:block after:border-t after:content-none lg:before:content-[''] lg:after:content-[''] [&_a]:text-inherit [&_a]:no-underline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2">
      <div className="border-footer-border bg-footer-bg flex flex-col items-start gap-16.25 border-t border-b px-12.5 py-12.5 pl-5 lg:grid lg:min-h-71.25 lg:grid-cols-[1fr_255px_255px] lg:items-start lg:gap-12.5 lg:border lg:border-t-0 lg:px-26.25 lg:py-8.75 lg:pb-15">
        <div className="flex items-center gap-5 self-stretch">
          <span
            className="bg-footer-fg inline-block h-6.25 w-6.25 rounded-full"
            aria-hidden="true"
          />
          <span className="text-xl leading-normal font-semibold">
            Potrzebnik
          </span>
        </div>

        <div className="flex w-full max-w-80 flex-col gap-17.5 lg:w-48.75 lg:max-w-none lg:gap-7.5 lg:justify-self-center">
          <div className="flex flex-col justify-center gap-3.75 lg:gap-6.25">
            <h2 className="text-xl leading-normal font-medium">
              Skontaktuj się z nami
            </h2>
            <Link
              href="mailto:potrzebnik@mail.com"
              className="inline-flex items-center gap-2.5 text-[15px] leading-normal font-normal hover:underline"
            >
              <Mail aria-hidden="true" />
              <span>potrzebnik@mail.com</span>
            </Link>
          </div>

          <div className="flex flex-col justify-center gap-3.75 lg:gap-6.25">
            <h2 className="text-xl leading-normal font-medium">Obserwuj nas</h2>
            <div className="flex items-center justify-between gap-7.5 lg:justify-start">
              <Link
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex"
              >
                <Linkedin
                  className="text-footer-fg h-6.25 w-6.25"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex"
              >
                <Facebook
                  className="text-footer-fg h-6.25 w-6.25"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>

        <nav
          aria-label="Nawigacja w stopce"
          className="mt-0 flex w-full max-w-80 flex-col justify-center gap-7.5 lg:w-63.75 lg:max-w-none lg:gap-6.25 lg:justify-self-end [&_a:hover]:underline"
        >
          <Link href="/organizations" variant="footerNav">
            Zgłoś organizację
          </Link>
          <Link href="/about" variant="footerNav">
            O nas
          </Link>
          <Link href="/faqs" variant="footerNav">
            Najczęściej zadawane pytania
          </Link>
        </nav>
      </div>

      <nav
        aria-label="Informacje prawne"
        className="flex flex-col items-start gap-6.25 px-12.5 pl-5 lg:flex-row lg:flex-nowrap lg:items-center lg:justify-start lg:gap-16.25 lg:bg-transparent lg:px-25 lg:py-5 [&_a]:w-full [&_a]:max-w-80 lg:[&_a]:w-auto lg:[&_a]:max-w-none [&_a:hover]:underline"
      >
        <Link href="/privacy-policy" variant="footerLegal">
          Polityka prywatności
        </Link>
        <Link href="/terms" variant="footerLegal">
          Regulamin serwisu
        </Link>
      </nav>
    </footer>
  );
}
