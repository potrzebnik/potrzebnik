import { PublicHeader } from '@/components/features/PublicHeader';
import { PublicFooter } from '@/components/features/PublicFooter';

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
