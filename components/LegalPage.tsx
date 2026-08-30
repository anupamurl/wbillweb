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
    <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <p className="wb-in text-xs font-semibold uppercase tracking-[0.14em] text-primary">Legal</p>
      <h1
        className="wb-in mt-3 text-4xl font-bold tracking-[-0.03em] text-text-primary sm:text-5xl"
        style={delay(60)}
      >
        {title}
      </h1>
      <p className="wb-in mt-4 text-sm text-text-secondary" style={delay(120)}>
        Last updated {updated}
      </p>
      <div className="mt-12 space-y-8 border-t border-border pt-10 text-text-primary [&_h2]:mb-3 [&_h2]:mt-12 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-[-0.01em] [&_h2]:text-text-primary [&_li]:leading-relaxed [&_p]:leading-relaxed [&_p]:text-text-secondary [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6 [&_ul]:text-text-secondary">
        {children}
      </div>
    </main>
  );
}
