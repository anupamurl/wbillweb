import { delay } from '@/lib/motion';

/**
 * One heading shape for every section: small brand-coloured eyebrow,
 * the heading, and an optional line of framing underneath.
 */
export default function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  align?: 'left' | 'center';
}) {
  const centered = align === 'center';
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="wb-reveal text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        {eyebrow}
      </p>
      <h2
        className="wb-reveal mt-3 text-3xl font-bold tracking-[-0.025em] text-text-primary sm:text-4xl"
        style={delay(60)}
      >
        {title}
      </h2>
      {lead && (
        <p
          className="wb-reveal mt-4 text-base leading-relaxed text-text-secondary sm:text-lg"
          style={delay(120)}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
