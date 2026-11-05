import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import Story from '@/components/landing/Story';
import FeatureGrid from '@/components/FeatureGrid';
import Journey from '@/components/landing/Journey';
import Industries from '@/components/landing/Industries';
import Pricing from '@/components/landing/Pricing';
import FaqSection from '@/components/FaqSection';
import ClosingCta from '@/components/ClosingCta';
import SoftwareApplicationJsonLd from '@/components/SoftwareApplicationJsonLd';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  alternates: { canonical: `${brand.url}/` },
};

/**
 * The job (make a bill, send it on WhatsApp) and a live demo → who it's for
 * (every shop and trade) → paper vs phone → capabilities → one bill end to
 * end → price → objections → the ask.
 */
export default function Home() {
  return (
    <main>
      <SoftwareApplicationJsonLd />
      <Hero />
      <Industries />
      <Story />
      <FeatureGrid />
      <Journey />
      <Pricing />
      <FaqSection />
      <ClosingCta />
    </main>
  );
}
