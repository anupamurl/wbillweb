const features = [
  { title: 'GST & discounts, handled', description: 'Tax rate per item, discounts, and the totals calculated for you — every time.' },
  { title: 'Branded PDF bills', description: 'A clean, professional bill carrying your business name and details.' },
  { title: 'Sent on WhatsApp', description: 'Share the bill from inside the app — no extra steps, no extra app for your customer.' },
  { title: 'Paid, pending, overdue', description: "Every bill's status, tracked automatically from its due date." },
  { title: 'Customers & items, saved', description: 'Add a customer or item once — pick them for every bill after that.' },
  { title: 'One dashboard', description: 'Total sales, outstanding, overdue, and invoice count — at a glance.' },
];

export default function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">What you get</h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-lg border border-border bg-surface p-6">
            <p className="text-base font-semibold text-text-primary">{feature.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
