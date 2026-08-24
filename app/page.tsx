import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import FeatureGrid from '@/components/FeatureGrid';
import WhoItsFor from '@/components/WhoItsFor';
import BuiltForPhone from '@/components/BuiltForPhone';
import FaqSection from '@/components/FaqSection';
import SoftwareApplicationJsonLd from '@/components/SoftwareApplicationJsonLd';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  alternates: { canonical: `${brand.url}/` },
};

export default function Home() {
  return (
    <main>
      <SoftwareApplicationJsonLd />
      <Hero />
      <HowItWorks />
      <FeatureGrid />
      <WhoItsFor />
      <BuiltForPhone />
      <FaqSection />
    </main>
  );
}
