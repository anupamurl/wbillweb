export interface FaqItem {
  question: string;
  answer: string;
}

/** Native <details> accordion: works without JavaScript, animates where supported. */
export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details key={item.question} className="wb-acc group border-b border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-[1.05rem] font-medium tracking-[-0.01em] text-ink transition-colors hover:text-ink-soft">
            {item.question}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors group-open:border-ink group-open:bg-ink group-open:text-canvas" aria-hidden="true">
              <span className="wb-chevron text-lg leading-none">+</span>
            </span>
          </summary>
          <p className="max-w-2xl pb-7 pr-12 leading-relaxed text-ink-soft">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
