import Faq from './Faq';
import FaqJsonLd from './FaqJsonLd';
import SectionHeading from './SectionHeading';
import { landingFaq } from '@/content/landingFaq';

export default function FaqSection() {
  return (
    <section id="faq" className="border-b border-border">
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <SectionHeading
          eyebrow="Before you ask"
          title="Frequently asked questions"
          align="center"
        />
        <div className="mt-10">
          <Faq items={landingFaq} />
        </div>
      </div>
      <FaqJsonLd items={landingFaq} />
    </section>
  );
}
