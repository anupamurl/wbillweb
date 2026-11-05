import Icon from './Icon';
import MagneticLink from './landing/MagneticLink';
import ProductDemo from './landing/ProductDemo';
import { delay } from '@/lib/motion';

export default function Hero() {
  return (
    <section className="relative isolate -mt-16 overflow-hidden pt-16">
      <div className="wb-glow" aria-hidden="true" />
      <div className="wb-grid" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <p
            className="wb-in inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 text-xs font-medium text-ink-soft shadow-sm backdrop-blur"
            style={delay(0)}
          >
            <span className="wb-halo relative inline-block h-1.5 w-1.5 rounded-full bg-success text-success" />
            wbill - Digital Billing App<span className="hidden sm:inline"> · For every small business in India</span>
          </p>

          <h1
            className="wb-in wb-display mt-7 text-[2.9rem] text-ink sm:text-7xl lg:text-[5.25rem]"
            style={delay(80)}
          >
            Make a bill on your phone. Send it on WhatsApp.
          </h1>

          <p
            className="wb-in mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl"
            style={delay(160)}
          >
            For every small shop and every trade — kirana, hardware, mobile shop, salon, tailor,
            mechanic, plumber and more. No paper bill book. With or without GST.
          </p>
          <p
            className="wb-in mx-auto mt-3 max-w-2xl text-base font-medium text-ink sm:text-lg"
            style={delay(200)}
            lang="hi-Latn"
          >
            Phone se bill banao, WhatsApp pe bhejo.
          </p>

          <div
            className="wb-in mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={delay(240)}
          >
            <MagneticLink
              href="/login"
              className="wb-cta wb-btn wb-btn-lg group w-full bg-primary text-white sm:w-auto"
            >
              Get started free
              <Icon name="arrow" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </MagneticLink>
            <a
              href="#industries"
              className="wb-btn wb-btn-lg w-full border border-border bg-surface/80 text-ink backdrop-blur transition-all duration-300 hover:-translate-y-px hover:border-ink/20 hover:bg-surface sm:w-auto"
            >
              Choose your business
            </a>
          </div>
          <p className="wb-in mt-4 text-xs text-ink-soft" style={delay(300)}>
            Free to get started. The app is on Android and iOS soon.
          </p>
        </div>

        <div id="product" className="wb-in-rise mt-20 scroll-mt-24" style={delay(380)}>
          <ProductDemo />
        </div>
      </div>
    </section>
  );
}
