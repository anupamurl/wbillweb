import Icon from '@/components/Icon';
import { delay } from '@/lib/motion';
import { SectionIntro, StatusTag, type Availability } from '@/components/landing/primitives';
import { AppBillScreen, ChatScreen, CustomerHistory, InsightsScreen, NewBillScreen, PhoneFrame } from '@/components/landing/mocks';

function Copy({ index, title, body, status, points }: { index: string; title: string; body: string; status: Availability[]; points?: string[] }) {
  return (
    <div className="max-w-md">
      <div className="wb-reveal flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs text-ink-faint">{index}</span>
        {status.map((s) => (
          <StatusTag key={s} status={s} />
        ))}
      </div>
      <h3 className="wb-reveal wb-h3 mt-5 text-ink" style={delay(60)}>
        {title}
      </h3>
      <p className="wb-reveal mt-4 leading-relaxed text-ink-soft" style={delay(100)}>
        {body}
      </p>
      {points && (
        <ul className="wb-reveal mt-6 space-y-2.5 text-[0.95rem] text-ink" style={delay(140)}>
          {points.map((point) => (
            <li key={point} className="flex gap-3">
              <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-primary" />
              {point}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ProductShowcase() {
  return (
    <section id="product" aria-labelledby="product-title" className="wb-section scroll-mt-16">
      <div className="wb-container">
        <SectionIntro
          id="product-title"
          eyebrow="The product"
          title="Everything a purchase needs, in one place."
          lead="WBill covers the whole life of a bill — from the moment it is created to the day someone needs to find it again."
        />

        {/* 01 + 02: billing and sharing, side by side on one stage */}
        <div className="mt-20 grid gap-6 lg:grid-cols-2">
          <article className="wb-panel relative overflow-hidden p-7 sm:p-10">
            <Copy
              index="01"
              status={['live', 'app']}
              title="Digital billing"
              body="Create a professional bill in seconds. Add the customer, list what they bought, and WBill numbers, dates and totals it for you."
            />
            <div className="wb-reveal relative mt-10 flex justify-center gap-4" style={delay(120)}>
              <PhoneFrame label="The New bill screen in WBill" className="w-[46%] max-w-[14rem]">
                <NewBillScreen />
              </PhoneFrame>
              <PhoneFrame label="A saved bill in WBill" className="w-[46%] max-w-[14rem] translate-y-8">
                <AppBillScreen />
              </PhoneFrame>
            </div>
          </article>

          <article className="wb-panel relative overflow-hidden bg-canvas-deep p-7 sm:p-10">
            <Copy
              index="02"
              status={['app']}
              title="Instant sharing"
              body="Send the bill as a PDF on WhatsApp. Your customer gets a clean, itemised bill with your business name and a thank-you note — no app or account needed."
            />
            <div className="wb-reveal relative mt-10 flex justify-center" style={delay(120)}>
              <PhoneFrame label="A bill received as a PDF on WhatsApp" className="w-[58%] max-w-[16rem]">
                <ChatScreen />
              </PhoneFrame>
            </div>
          </article>
        </div>

        {/* 03 + 04: records */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="wb-panel grid gap-10 p-7 sm:p-10 md:grid-cols-2 md:items-center">
            <Copy
              index="03"
              status={['live']}
              title="Customer records & purchase history"
              body="Every customer, every bill, kept in order automatically. Open a customer to see what they bought, when, and how much they’ve spent."
              points={['Matched by phone number', 'Bill count and total spent', 'Newest purchases first']}
            />
            <div className="wb-reveal" style={delay(140)}>
              <CustomerHistory className="wb-shadow" />
            </div>
          </article>

          <article className="wb-panel flex flex-col overflow-hidden p-7 sm:p-10">
            <Copy
              index="04"
              status={['live']}
              title="Business insights"
              body="See revenue by month, your busiest days and your top customers — built from the bills you already make."
            />
            <a href="#insights" className="wb-reveal group mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink" style={delay(160)}>
              <span className="wb-link">See the dashboard</span>
              <Icon name="arrow" className="wb-arrow h-4 w-4" />
            </a>
            <div className="wb-reveal relative -mx-7 -mb-7 mt-10 flex-1 overflow-hidden border-t border-line sm:-mx-10 sm:-mb-10" style={delay(200)}>
              <InsightsScreen compact />
            </div>
          </article>
        </div>

        {/* 05: roadmap — stated plainly, no operational mockups */}
        <article className="mt-6 rounded-3xl border border-dashed border-line-strong p-7 sm:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-start">
            <div className="max-w-md">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs text-ink-faint">05</span>
                <StatusTag status="planned" />
              </div>
              <h3 className="wb-h3 mt-5 text-ink">Warranty & order records</h3>
              <p className="mt-4 leading-relaxed text-ink-soft">
                Next on the roadmap: records that keep going after the sale. These aren’t available yet — we’ll
                announce them when they are.
              </p>
            </div>
            <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
              {[
                { title: 'Warranty records', body: 'Purchase date and warranty period kept with the bill.' },
                { title: 'Order tracking', body: 'Follow an order from placed to delivered.' },
                { title: 'Tax & discounts', body: 'Tax and discount lines on the bill itself.' },
              ].map((item) => (
                <li key={item.title} className="bg-canvas p-5">
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </section>
  );
}
