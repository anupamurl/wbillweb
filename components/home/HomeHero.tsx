import Link from 'next/link';
import Icon from '@/components/Icon';
import { delay } from '@/lib/motion';
import { AppBillScreen, BrowserFrame, ChatScreen, DashboardScreen, PhoneFrame } from '@/components/landing/mocks';

export default function HomeHero() {
  return (
    <section className="relative isolate -mt-16 overflow-hidden pt-16" aria-labelledby="hero-title">
      <div className="wb-dots" aria-hidden="true" />

      <div className="wb-container relative pb-20 pt-16 sm:pt-24 lg:pb-28 lg:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="wb-in wb-eyebrow justify-center" style={delay(0)}>
            Digital billing &amp; purchase records
          </p>

          <h1 id="hero-title" className="wb-in wb-hero-title mt-7 text-ink" style={delay(80)}>
            Every purchase deserves a digital record.
          </h1>

          <p className="wb-in wb-lead mx-auto mt-7 max-w-2xl" style={delay(160)}>
            Create bills, share them instantly and keep every purchase organised. Bring your business and
            customer records into one simple digital experience.
          </p>

          <div className="wb-in mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center" style={delay(240)}>
            <Link href="/signup/" className="wb-btn wb-btn-lg wb-btn-primary group">
              Get Started
              <Icon name="arrow" className="wb-arrow h-4 w-4" />
            </Link>
            <a href="#product" className="wb-btn wb-btn-lg wb-btn-secondary">
              Explore WBill
            </a>
          </div>
          <p className="wb-in mt-5 text-[0.8rem] text-ink-faint" style={delay(300)}>
            Free to start. Sign in with your phone number or Google.
          </p>
        </div>

        {/* Product composition */}
        <div className="wb-in-rise relative mx-auto mt-16 max-w-6xl sm:mt-20" style={delay(380)}>
          <div className="relative lg:px-44 xl:px-52">
            <div className="hidden lg:block">
              <BrowserFrame url="wbill.app/dashboard" className="wb-parallax-slow">
                <DashboardScreen />
              </BrowserFrame>
            </div>

            {/* Phones: overlap the dashboard on larger screens, stand alone on phones */}
            <div className="relative flex items-end justify-center gap-4 sm:gap-8 lg:absolute lg:inset-x-0 lg:-bottom-14 lg:justify-between lg:gap-0">
              <PhoneFrame label="WBill app: a saved bill ready to share" className="wb-parallax-fast w-[46%] max-w-[15rem] sm:w-[14rem] lg:w-[13rem] xl:w-[15rem]">
                <AppBillScreen />
              </PhoneFrame>
              <PhoneFrame label="The customer receives the bill as a PDF in their chat" className="wb-parallax-fast w-[46%] max-w-[15rem] translate-y-6 sm:w-[14rem] lg:w-[13rem] lg:translate-y-0 xl:w-[15rem]">
                <ChatScreen animate />
              </PhoneFrame>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-16 max-w-2xl text-center text-xs leading-relaxed text-ink-faint lg:mt-24">
          Product screens shown with demo data. The web dashboard is available now; PDF bills and WhatsApp
          sharing are part of the WBill mobile app, coming to iOS and Android.
        </p>
      </div>
    </section>
  );
}
