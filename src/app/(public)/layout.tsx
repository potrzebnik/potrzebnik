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
        <div className="public-footer__lines" aria-hidden="true">
          <div />
          <div />
        </div>

        <div className="public-footer__top">
          <div className="public-footer__brand">
            <span className="public-footer__brand-dot" aria-hidden="true" />
            <span className="public-footer__brand-name">Potrzebnik</span>
          </div>

          <div className="public-footer__contact">
            <div className="public-footer__contact-group">
              <p className="public-footer__heading">Skontaktuj się z nami</p>
              <a
                href="mailto:potrzebnik@mail.com"
                className="public-footer__mail"
              >
                <Mail size={24} aria-hidden="true" />
                <span>potrzebnik@mail.com</span>
              </a>
            </div>

            <div className="public-footer__social-group">
              <p className="public-footer__heading">Obserwuj nas</p>
              <div className="public-footer__social-links">
                <a href="#" aria-label="LinkedIn">
                  <Linkedin size={24} />
                </a>
                <a href="#" aria-label="Facebook">
                  <Facebook size={24} />
                </a>
              </div>
            </div>
          </div>

          <nav className="public-footer__nav" aria-label="Nawigacja w stopce">
            <Link href="/organizations">Zgłoś organizację</Link>
            <Link href="/about">O nas</Link>
            <Link href="/faqs">Najczęściej zadawane pytania</Link>
          </nav>
        </div>

        <div className="public-footer__legal">
          <Link href="/privacy-policy">Polityka prywatności</Link>
          <Link href="/terms">Regulamin serwisu</Link>
        </div>
      </footer>
    </div>
  );
}
