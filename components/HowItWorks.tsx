const steps = [
  { title: 'Create bill', description: 'Add your customer and items — wbill calculates tax and totals for you.' },
  { title: 'Generate PDF', description: 'A clean, branded bill with your business details, ready in a tap.' },
  { title: 'Send on WhatsApp', description: 'Share it straight from the app — no download, no extra app for your customer.' },
  { title: 'Track payment', description: "See what's paid, pending, or overdue at a glance." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border bg-surface-variant/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Create → Generate → Send → Track
        </h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className="text-sm font-semibold text-primary">{String(index + 1).padStart(2, '0')}</span>
              <p className="mt-2 text-lg font-semibold text-text-primary">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
