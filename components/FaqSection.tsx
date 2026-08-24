import Faq from './Faq';
import FaqJsonLd from './FaqJsonLd';
import { landingFaq } from '@/content/landingFaq';

export default function FaqSection() {
  return (
    <section id="faq" className="border-t border-border">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mt-8">
          <Faq items={landingFaq} />
        </div>
      </div>
      <FaqJsonLd items={landingFaq} />
    </section>
  );
}
