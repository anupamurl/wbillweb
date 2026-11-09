import Link from 'next/link';
import { Eyebrow } from '@/components/landing/primitives';
import { delay } from '@/lib/motion';

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="wb-container pb-24 pt-20 sm:pt-28">
      <div className="grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-20">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow className="wb-in">Legal</Eyebrow>
          <nav aria-label="Legal pages" className="wb-in mt-6 hidden flex-col gap-1 text-sm lg:flex" style={delay(60)}>
            <Link href="/privacy/" className="text-ink-soft transition-colors hover:text-ink">
              Privacy policy
            </Link>
            <Link href="/your-data/" className="text-ink-soft transition-colors hover:text-ink">
              Your data rights
            </Link>
            <Link href="/terms/" className="text-ink-soft transition-colors hover:text-ink">
              Terms of service
            </Link>
            <Link href="/support/" className="text-ink-soft transition-colors hover:text-ink">
              Support
            </Link>
          </nav>
        </aside>
        <div className="max-w-3xl">
          <h1 className="wb-in wb-h2 text-ink" style={delay(60)}>
            {title}
          </h1>
          <p className="wb-in mt-5 text-sm text-ink-soft" style={delay(120)}>
            Last updated {updated}
          </p>
          <div className="wb-prose mt-12 border-t border-line pt-10">{children}</div>
        </div>
      </div>
    </main>
  );
}
