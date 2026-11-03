import Icon from './Icon';

export interface FaqItem {
  question: string;
  answer: string;
}

export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
      {items.map((item) => (
        <details key={item.question} className="wb-acc group px-5 transition-colors open:bg-canvas/40 sm:px-7">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-medium text-ink">
            {item.question}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface transition-colors group-open:border-primary/30 group-open:bg-primary/10 group-open:text-primary">
              <Icon name="chevron" className="wb-chevron h-3.5 w-3.5" />
            </span>
          </summary>
          <p className="-mt-1 pb-6 pr-10 text-[0.95rem] leading-relaxed text-ink-soft">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
