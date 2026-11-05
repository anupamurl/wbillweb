import type { Metadata } from 'next';
import Link from 'next/link';
import HomeHero from '@/components/home/HomeHero';
import PaperToDigital from '@/components/home/PaperToDigital';
import ProductShowcase from '@/components/home/ProductShowcase';
import HowItWorks from '@/components/home/HowItWorks';
import Universal from '@/components/home/Universal';
import CustomerExperience from '@/components/home/CustomerExperience';
import Insights from '@/components/home/Insights';
import FinalCta from '@/components/home/FinalCta';
import Faq from '@/components/Faq';
import FaqJsonLd from '@/components/FaqJsonLd';
import Icon from '@/components/Icon';
import SoftwareApplicationJsonLd from '@/components/SoftwareApplicationJsonLd';
import { SectionIntro } from '@/components/landing/primitives';
import { PlanCards, PricingNote } from '@/components/pricing/PricingPlans';
import { landingFaq } from '@/content/landingFaq';
import { brand } from '@/lib/brand';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: { absolute: site.defaultTitle },
  alternates: { canonical: `${brand.url}/` },
};

/**
 * The story: the promise and the product → why paper fails → what WBill
 * does → how a bill travels → who it is for → what customers get → what
 * the business learns → price → questions → the ask.
 */
export default function Home() {
  return (
    <main>
      <SoftwareApplicationJsonLd />
      <HomeHero />
      <PaperToDigital />
      <ProductShowcase />
      <HowItWorks />
      <Universal />
      <CustomerExperience />
      <Insights />

      <section id="pricing" aria-labelledby="pricing-title" className="wb-section scroll-mt-16">
        <div className="wb-container">
          <SectionIntro
            id="pricing-title"
            align="center"
            eyebrow="Pricing"
            title="Start free. Grow when you’re ready."
            lead="The Free plan covers everything you need to move off paper. Paid plans add insight and, as they arrive, records beyond the bill."
          />
          <div className="mt-16">
            <PlanCards />
          </div>
          <PricingNote />
          <p className="mt-4 text-center">
            <Link href="/pricing/" className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink">
              <span className="wb-link">Compare every feature</span>
              <Icon name="arrow" className="wb-arrow h-4 w-4" />
            </Link>
          </p>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="wb-section scroll-mt-16 border-t border-line">
        <div className="wb-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionIntro
            id="faq-title"
            eyebrow="FAQ"
            title="Questions, answered."
            lead={
              <>
                Something else on your mind? Write to{' '}
                <a href={`mailto:${site.email}`} className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                  {site.email}
                </a>{' '}
                and a person will reply.
              </>
            }
          />
          <Faq items={landingFaq} />
        </div>
        <FaqJsonLd items={landingFaq} />
      </section>

      <FinalCta />
    </main>
  );
}
