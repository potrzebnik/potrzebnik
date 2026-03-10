import { Facebook, Linkedin, Mail } from 'lucide-react';

import { Link } from '@/components/ui/link';
import { PublicHeader } from '@/components/features/public-header';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicHeader />
      <main>{children}</main>

      <footer className="public-footer">
        <div className="public-footer__top">
          <div className="public-footer__brand">
            <span className="public-footer__brand-dot" aria-hidden="true" />
            <span className="public-footer__brand-name">Potrzebnik</span>
          </div>

          <div className="public-footer__contact">
            <div className="public-footer__contact-group">
              <h2 className="public-footer__heading">Skontaktuj się z nami</h2>
              <Link
                href="mailto:potrzebnik@mail.com"
                className="public-footer__mail"
              >
                <Mail aria-hidden="true" />
                <span>potrzebnik@mail.com</span>
              </Link>
            </div>

            <div className="public-footer__social-group">
              <h2 className="public-footer__heading">Obserwuj nas</h2>
              <div className="public-footer__social-links">
                <Link
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <Linkedin aria-hidden="true" />
                </Link>
                <Link
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <Facebook aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          <nav className="public-footer__nav" aria-label="Nawigacja w stopce">
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

        <nav className="public-footer__legal" aria-label="Informacje prawne">
          <Link href="/privacy-policy" variant="footerLegal">
            Polityka prywatności
          </Link>
          <Link href="/terms" variant="footerLegal">
            Regulamin serwisu
          </Link>
        </nav>
      </footer>
    </>
  );
}
  );
}
