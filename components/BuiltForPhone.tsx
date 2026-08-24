const points = [
  { title: 'No laptop required', description: 'Create and send a bill entirely from your phone, standing at the job site.' },
  { title: 'Sign in with your phone number', description: 'An OTP, not a password to remember or a form to fill out.' },
  { title: 'Your first bill in minutes', description: "No onboarding course. Add your business, and you're billing." },
];

export default function BuiltForPhone() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Built for the phone in your hand, not a desk you&rsquo;re not at
          </h2>
          <p className="mt-4 text-text-secondary">
            wbill isn&rsquo;t accounting software with a mobile app bolted on. It&rsquo;s built mobile-first, for
            the moment you&rsquo;re standing in front of a customer and need to hand them a bill.
          </p>
        </div>
        <ul className="space-y-6">
          {points.map((point) => (
            <li key={point.title}>
              <p className="font-semibold text-text-primary">{point.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">{point.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
