import { PublicHeader } from '@/components/features/PublicHeader';
import { PublicFooter } from '@/components/features/PublicFooter';
import {
  FeedbackActivationScript,
  PageFeedback,
} from '@/components/features/PageFeedback';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FeedbackActivationScript />
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
      <PageFeedback />
    </>
  );
}
