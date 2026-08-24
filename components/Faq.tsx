export interface FaqItem {
  question: string;
  answer: string;
}

export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-border">
      {items.map((item) => (
        <details key={item.question} className="py-5">
          <summary className="cursor-pointer list-none text-base font-medium text-text-primary">
            {item.question}
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
