'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SectionIntro } from '@/components/landing/primitives';
import { AppBillScreen, ChatScreen, CustomerHistory, NewBillScreen, PhoneFrame } from '@/components/landing/mocks';

type Step = { title: string; body: string; detail: string; visual: ReactNode };

const steps: Step[] = [
  {
    title: 'Create a bill',
    body: 'Enter the customer’s mobile number, add what they bought with quantity and price. The total is worked out as you type.',
    detail: 'On the web dashboard today, and in the mobile app.',
    visual: (
      <PhoneFrame label="Creating a bill" className="w-full">
        <NewBillScreen />
      </PhoneFrame>
    ),
  },
  {
    title: 'Share it digitally',
    body: 'Save the bill and send it as a PDF on WhatsApp in one tap — or message the customer directly.',
    detail: 'Sharing is part of the WBill mobile app.',
    visual: (
      <PhoneFrame label="Sharing a saved bill" className="w-full">
        <AppBillScreen />
      </PhoneFrame>
    ),
  },
  {
    title: 'Customer receives the bill',
    body: 'The bill lands in their chat as a clean PDF they can open, keep, forward or print. No download, no sign-up.',
    detail: 'Receiving a bill is always free for customers.',
    visual: (
      <PhoneFrame label="The customer receives the bill" className="w-full">
        <ChatScreen animate />
      </PhoneFrame>
    ),
  },
  {
    title: 'The record stays organised',
    body: 'The bill is filed under the customer automatically — numbered, dated and searchable whenever you need it.',
    detail: 'Customer records are available now.',
    visual: <CustomerHistory className="wb-shadow-lg" />,
  },
];

/**
 * Desktop: the steps scroll past a pinned visual that follows the step in
 * the middle of the viewport. Mobile: each step carries its own visual.
 */
export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="how-it-works" aria-labelledby="how-title" className="wb-section scroll-mt-16 border-t border-line">
      <div className="wb-container">
        <SectionIntro
          id="how-title"
          eyebrow="How it works"
          title="Four steps. One lasting record."
          lead="From the counter to the customer’s phone, and into your records — without paper at any point."
        />

        <div className="mt-16 grid gap-16 lg:mt-24 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <ol className="relative">
            <span className="absolute bottom-0 left-[0.95rem] top-2 hidden w-px bg-line lg:block" aria-hidden="true" />
            <span
              className="absolute left-[0.95rem] top-2 hidden w-px origin-top bg-ink transition-[height] duration-700 ease-[cubic-bezier(0.22,0.8,0.3,1)] lg:block"
              style={{ height: `${(active / (steps.length - 1)) * 92}%` }}
              aria-hidden="true"
            />
            {steps.map((step, index) => (
              <li
                key={step.title}
                ref={(el) => {
                  refs.current[index] = el;
                }}
                data-index={index}
                aria-current={active === index ? 'step' : undefined}
                className="relative pb-16 last:pb-0 lg:min-h-[52vh] lg:pb-0 lg:pl-16"
              >
                <span
                  className={`hidden h-8 w-8 items-center justify-center rounded-full border font-mono text-xs transition-colors duration-500 lg:absolute lg:left-0 lg:top-0 lg:flex ${
                    active >= index ? 'border-ink bg-ink text-canvas' : 'border-line-strong bg-canvas text-ink-faint'
                  }`}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <p className="font-mono text-xs text-ink-faint lg:hidden">Step {index + 1}</p>
                <h3
                  className={`wb-h3 mt-3 transition-colors duration-500 lg:mt-0 ${active === index ? 'text-ink' : 'text-ink lg:text-ink-faint'}`}
                >
                  {step.title}
                </h3>
                <p className="mt-4 max-w-md leading-relaxed text-ink-soft">{step.body}</p>
                <p className="mt-3 text-sm text-ink-faint">{step.detail}</p>

                <div className="mx-auto mt-10 max-w-[16rem] lg:hidden">{step.visual}</div>
              </li>
            ))}
          </ol>

          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="sticky top-[calc(50vh-17rem)] flex h-[34rem] items-center justify-center">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="absolute w-[16rem] transition-all duration-700 ease-[cubic-bezier(0.22,0.8,0.3,1)] xl:w-[17rem]"
                  style={{
                    opacity: active === index ? 1 : 0,
                    transform: `translateY(${(index - active) * 28}px) scale(${active === index ? 1 : 0.96})`,
                    width: index === 3 ? '22rem' : undefined,
                  }}
                >
                  {step.visual}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
