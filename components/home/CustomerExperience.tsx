import { delay } from '@/lib/motion';
import { SectionIntro, StatusTag } from '@/components/landing/primitives';
import { ChatScreen, InvoiceSheet, PhoneFrame } from '@/components/landing/mocks';

const today = [
  { title: 'The bill arrives where they already are', body: 'A PDF in their WhatsApp chat, with your business name and the total.' },
  { title: 'Nothing to install', body: 'Customers don’t need the WBill app or an account to receive and open a bill.' },
  { title: 'Clear and complete', body: 'Itemised lines, quantities, prices, bill number and date — easy to keep, forward or print.' },
];

const planned = ['A personal purchase history across businesses', 'Warranty records kept with the bill', 'Order status updates'];

export default function CustomerExperience() {
  return (
    <section aria-labelledby="cx-title" className="wb-section border-t border-line">
      <div className="wb-container grid gap-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-24">
        <div className="relative order-2 mx-auto w-full max-w-md lg:order-1">
          <div className="wb-reveal relative z-[1] w-[62%]">
            <PhoneFrame label="A customer’s chat with the bill attached">
              <ChatScreen />
            </PhoneFrame>
          </div>
          <div className="wb-reveal absolute bottom-10 right-0 w-[64%]" style={delay(160)}>
            <InvoiceSheet className="wb-shadow-lg rotate-[2.5deg]" />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <SectionIntro
            id="cx-title"
            eyebrow="For customers"
            title="A better experience doesn’t end at checkout."
            lead="A digital bill is a small courtesy that lasts. Your customers get a record of what they bought — clear, complete and always to hand."
          />

          <ul className="mt-10 divide-y divide-line border-y border-line">
            {today.map((item, index) => (
              <li key={item.title} className="wb-reveal py-5" style={delay(index * 60)}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold tracking-[-0.01em] text-ink">{item.title}</p>
                  <StatusTag status="app" />
                </div>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-soft">{item.body}</p>
              </li>
            ))}
          </ul>

          <div className="wb-reveal mt-8 rounded-2xl border border-dashed border-line-strong p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">On the roadmap for customers</p>
              <StatusTag status="planned" />
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
              {planned.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
