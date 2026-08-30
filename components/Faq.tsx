import Icon from './Icon';

export interface FaqItem {
  question: string;
  answer: string;
}

export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {items.map((item) => (
        <details key={item.question} className="group px-5 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-medium text-text-primary">
            {item.question}
            <Icon name="chevron" className="wb-chevron h-4 w-4 shrink-0 text-text-secondary" />
          </summary>
          <p className="-mt-1 pb-5 pr-8 text-sm leading-relaxed text-text-secondary">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
