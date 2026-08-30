import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import FeatureGrid from '@/components/FeatureGrid';
import Comparison from '@/components/Comparison';
import BuiltForPhone from '@/components/BuiltForPhone';
import WhoItsFor from '@/components/WhoItsFor';
import FaqSection from '@/components/FaqSection';
import ClosingCta from '@/components/ClosingCta';
import SoftwareApplicationJsonLd from '@/components/SoftwareApplicationJsonLd';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  alternates: { canonical: `${brand.url}/` },
};

/**
 * Section order is claim → proof → mechanism → honest comparison →
 * positioning → audience → objections → ask.
 */
export default function Home() {
  return (
    <main>
      <SoftwareApplicationJsonLd />
      <Hero />
      <HowItWorks />
      <FeatureGrid />
      <Comparison />
      <BuiltForPhone />
      <WhoItsFor />
      <FaqSection />
      <ClosingCta />
    </main>
  );
}
