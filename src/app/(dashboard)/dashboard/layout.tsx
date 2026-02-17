import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <header>
        <nav>Dashboard Navigation</nav>
      </header>
      <main>{children}</main>
      <footer>Dashboard Footer</footer>
    </div>
  );
}
