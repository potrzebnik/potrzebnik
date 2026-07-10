import { PublicHeader } from '@/components/features/public-header';
import { PublicFooter } from '@/components/features/public-footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </>
  );
}
