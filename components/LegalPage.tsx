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
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-text-primary">{title}</h1>
      <p className="mt-2 text-sm text-text-secondary">Last updated {updated}</p>
      <div className="mt-10 space-y-8 text-text-primary [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-text-primary [&_p]:leading-relaxed [&_p]:text-text-secondary [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ul]:text-text-secondary [&_li]:leading-relaxed">
        {children}
      </div>
    </main>
  );
}
