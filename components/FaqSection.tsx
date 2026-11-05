import Faq from './Faq';
import FaqJsonLd from './FaqJsonLd';
import { SectionIntro } from './landing/primitives';
import { landingFaq } from '@/content/landingFaq';

export default function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 border-b border-border">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionIntro
          kicker="FAQ"
          title="Questions shop owners and tradespeople ask us."
          lead="Something else on your mind? Write to support@wbill.app and a person will reply."
        />
        <Faq items={landingFaq} />
      </div>
      <FaqJsonLd items={landingFaq} />
    </section>
  );
}
