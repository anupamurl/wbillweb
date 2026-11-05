'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { CustomerHistory, InvoiceSheet, PaperReceipt } from '@/components/landing/mocks';
import { Eyebrow } from '@/components/landing/primitives';
import { delay } from '@/lib/motion';

const stages = [
  {
    id: 'paper',
    label: 'Paper receipt',
    title: 'Printed at checkout.',
    body: 'Thermal paper fades within months. It gets folded, lost or thrown away — and with it, the record of the purchase.',
  },
  {
    id: 'digital',
    label: 'Digital bill',
    title: 'The same purchase, made digital.',
    body: 'A clear, itemised bill with the business name, bill number, date and total — shared with the customer instantly.',
  },
  {
    id: 'record',
    label: 'Purchase record',
    title: 'Part of an organised record.',
    body: 'Every bill joins the customer’s purchase history, so the business can find any purchase in seconds.',
  },
] as const;

const benefits = [
  { title: 'No more searching', body: 'No more digging through drawers of old paper bills.' },
  { title: 'Always accessible', body: 'Purchase records that stay readable and easy to find.' },
  { title: 'Shared in a tap', body: 'Digital bills sent straight to the customer.' },
  { title: 'A better experience', body: 'A bill customers can keep, forward or print.' },
  { title: 'Organised records', body: 'Every bill numbered, dated and filed automatically.' },
];

const AUTO_MS = 4200;

/**
 * The emotional core of the page: one purchase, three states. Visitors
 * pick a stage (tabs, arrow keys) or let it play once it scrolls into
 * view. Auto-play stops the moment anyone interacts, and never starts
 * for reduced motion.
 */
export default function PaperToDigital() {
  const [stage, setStage] = useState(0);
  const [auto, setAuto] = useState(true);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const base = useId();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAuto(false);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!auto || !visible) return;
    const t = setTimeout(() => setStage((s) => (s + 1) % stages.length), AUTO_MS);
    return () => clearTimeout(t);
  }, [auto, visible, stage]);

  function choose(index: number) {
    setAuto(false);
    setStage(index);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const next: Record<string, number> = {
      ArrowRight: (stage + 1) % stages.length,
      ArrowLeft: (stage - 1 + stages.length) % stages.length,
      Home: 0,
      End: stages.length - 1,
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    choose(next[event.key]);
    tabRefs.current[next[event.key]]?.focus();
  }

  const current = stages[stage];

  return (
    <section id="paper-to-digital" aria-labelledby="ptd-title" className="wb-section relative overflow-hidden border-y border-line bg-canvas-deep">
      <div className="wb-container">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <div>
            <Eyebrow className="wb-reveal">From paper to digital</Eyebrow>
            <h2 id="ptd-title" className="wb-reveal wb-h2 mt-5 text-ink" style={delay(60)}>
              Paper bills fade. Digital records stay.
            </h2>
            <p className="wb-reveal wb-lead mt-6 max-w-lg" style={delay(120)}>
              A bill is the only proof of a purchase. WBill turns it into something that lasts — for the business
              that issues it and the customer who keeps it.
            </p>

            <div
              role="tablist"
              aria-label="Stages of a purchase record"
              onKeyDown={onKeyDown}
              className="wb-reveal mt-10 inline-flex rounded-full border border-line-strong bg-surface p-1"
              style={delay(180)}
            >
              {stages.map((s, index) => (
                <button
                  key={s.id}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  id={`${base}-tab-${s.id}`}
                  role="tab"
                  type="button"
                  aria-selected={stage === index}
                  aria-controls={`${base}-panel`}
                  tabIndex={stage === index ? 0 : -1}
                  onClick={() => choose(index)}
                  className={`relative rounded-full px-3.5 py-2 text-[0.8rem] font-medium transition-colors duration-300 sm:px-4 sm:text-sm ${
                    stage === index ? 'bg-ink text-canvas' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-tab-${current.id}`} aria-live="polite" className="mt-6 min-h-[7.5rem] max-w-md">
              <div key={current.id} className="wb-panel-in">
                <p className="text-lg font-semibold tracking-[-0.02em] text-ink">{current.title}</p>
                <p className="mt-2 leading-relaxed text-ink-soft">{current.body}</p>
              </div>
            </div>

            <div className="mt-2 flex gap-1.5" aria-hidden="true">
              {stages.map((s, index) => (
                <span key={s.id} className="h-0.5 w-10 overflow-hidden rounded-full bg-line-strong">
                  {index < stage && <span className="block h-full w-full bg-ink" />}
                  {index === stage && (
                    <span
                      key={`${stage}-${auto && visible}`}
                      className="block h-full w-full origin-left bg-ink"
                      style={auto && visible ? { animation: `wb-grow-x ${AUTO_MS}ms linear both` } : undefined}
                    />
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* The visual: three layers of one purchase */}
          <div ref={ref} className="relative mx-auto h-[34rem] w-full max-w-[34rem] sm:h-[34rem]" aria-hidden="true">
            <div
              className="absolute left-1/2 top-6 w-[13rem] transition-all duration-[900ms] ease-[cubic-bezier(0.22,0.8,0.3,1)] sm:w-[17rem]"
              style={{
                transform:
                  stage === 0
                    ? 'translateX(-50%) rotate(-2deg)'
                    : stage === 1
                      ? 'translateX(-108%) translateY(36px) rotate(-9deg) scale(0.88)'
                      : 'translateX(-118%) translateY(70px) rotate(-12deg) scale(0.78)',
                opacity: stage === 2 ? 0.35 : 1,
              }}
            >
              <PaperReceipt faded={stage > 0} />
            </div>

            <div
              className="absolute left-1/2 top-10 w-[17rem] transition-all duration-[900ms] ease-[cubic-bezier(0.22,0.8,0.3,1)] sm:w-[21rem]"
              style={{
                transform:
                  stage === 0
                    ? 'translateX(-30%) translateY(60px) scale(0.92)'
                    : stage === 1
                      ? 'translateX(-38%) translateY(0) scale(1)'
                      : 'translateX(-30%) translateY(-18px) scale(0.86)',
                opacity: stage === 0 ? 0 : stage === 1 ? 1 : 0.55,
                filter: stage === 2 ? 'blur(0.5px)' : 'none',
              }}
            >
              <InvoiceSheet className="wb-shadow-lg" />
            </div>

            <div
              className="absolute left-1/2 top-20 w-[17rem] transition-all duration-[900ms] ease-[cubic-bezier(0.22,0.8,0.3,1)] sm:w-[20rem]"
              style={{
                transform: stage === 2 ? 'translateX(-46%) translateY(0)' : 'translateX(-40%) translateY(70px)',
                opacity: stage === 2 ? 1 : 0,
              }}
            >
              <CustomerHistory className="wb-shadow-lg" />
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-line-strong pt-10">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {benefits.map((benefit, index) => (
              <li key={benefit.title} className="wb-reveal" style={delay(index * 60)}>
                <p className="font-mono text-xs text-ink-faint">0{index + 1}</p>
                <p className="mt-3 font-semibold tracking-[-0.01em] text-ink">{benefit.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{benefit.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
