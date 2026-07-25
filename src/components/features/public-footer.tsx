import { Facebook, Linkedin, Mail } from 'lucide-react';

import { Link } from '@/components/ui/link';

export function PublicFooter() {
  return (
    <footer className="text-footer-fg before:border-footer-border after:border-footer-border [&_a:focus-visible]:outline-footer-border before:m-0 before:block before:border-t before:content-none after:m-0 after:mt-[15px] after:block after:border-t after:content-none lg:before:content-[''] lg:after:content-[''] [&_a]:text-inherit [&_a]:no-underline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2">
      <div className="border-footer-border bg-footer-bg flex flex-col items-start gap-[65px] border-t border-b px-[50px] py-[50px] pl-[20px] lg:grid lg:min-h-[285px] lg:grid-cols-[1fr_255px_255px] lg:items-start lg:gap-[50px] lg:border lg:border-t-0 lg:px-[105px] lg:py-[35px] lg:pb-[60px]">
        <div className="flex items-center gap-[20px] self-stretch">
          <span
            className="bg-footer-fg inline-block h-[25px] w-[25px] rounded-full"
            aria-hidden="true"
          />
          <span className="text-[20px] leading-[1.5] font-semibold">
            Potrzebnik
          </span>
        </div>

        <div className="flex w-full max-w-[320px] flex-col gap-[70px] lg:w-[195px] lg:max-w-none lg:gap-[30px] lg:justify-self-center">
          <div className="flex flex-col justify-center gap-[15px] lg:gap-[25px]">
            <h2 className="text-[20px] leading-[1.5] font-medium">
              Skontaktuj się z nami
            </h2>
            <Link
              href="mailto:potrzebnik@mail.com"
              className="inline-flex items-center gap-[10px] text-[15px] leading-[1.5] font-normal hover:underline"
            >
              <Mail aria-hidden="true" />
              <span>potrzebnik@mail.com</span>
            </Link>
          </div>

          <div className="flex flex-col justify-center gap-[15px] lg:gap-[25px]">
            <h2 className="text-[20px] leading-[1.5] font-medium">
              Obserwuj nas
            </h2>
            <div className="flex items-center justify-between gap-[30px] lg:justify-start">
              <Link
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex"
              >
                <Linkedin
                  className="text-footer-fg h-[25px] w-[25px]"
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
                  className="text-footer-fg h-[25px] w-[25px]"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>

        <nav
          aria-label="Nawigacja w stopce"
          className="mt-0 flex w-full max-w-[320px] flex-col justify-center gap-[30px] lg:w-[255px] lg:max-w-none lg:gap-[25px] lg:justify-self-end [&_a:hover]:underline"
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
        className="flex flex-col items-start gap-[25px] px-[50px] pl-[20px] lg:flex-row lg:flex-nowrap lg:items-center lg:justify-start lg:gap-[65px] lg:bg-transparent lg:px-[100px] lg:py-[20px] [&_a]:w-full [&_a]:max-w-[320px] lg:[&_a]:w-auto lg:[&_a]:max-w-none [&_a:hover]:underline"
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
