import Link from 'next/link';
import { Facebook, Linkedin, Mail } from 'lucide-react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header>
        <nav>{/* Add navigation links */}</nav>
      </header>

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
            <Link
              href="/organizations"
              className="public-footer__nav-link--spaced"
            >
              Zgłoś organizację
            </Link>
            <Link href="/about">O nas</Link>
            <Link href="/faqs" className="public-footer__nav-link--constrained">
              Najczęściej zadawane pytania
            </Link>
          </nav>
        </div>

        <nav className="public-footer__legal" aria-label="Informacje prawne">
          <Link href="/privacy-policy">Polityka prywatności</Link>
          <Link href="/terms">Regulamin serwisu</Link>
        </nav>
      </footer>
    </div>
  );
}
