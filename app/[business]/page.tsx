import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { businessPages } from '@/content/businesses';
import BusinessPageTemplate from '@/components/BusinessPageTemplate';
import FaqJsonLd from '@/components/FaqJsonLd';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import { brand } from '@/lib/brand';

/** Only the business types listed in content/businesses.ts exist; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return businessPages.map((business) => ({ business: business.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ business: string }> }): Promise<Metadata> {
  const { business: slug } = await params;
  const business = businessPages.find((candidate) => candidate.slug === slug);
  if (!business) return {};
  const url = `${brand.url}/${business.slug}/`;
  return {
    title: business.page.title,
    description: business.page.description,
    alternates: { canonical: url },
    openGraph: { title: business.page.title, description: business.page.description, url },
  };
}

export default async function BusinessPage({ params }: { params: Promise<{ business: string }> }) {
  const { business: slug } = await params;
  const business = businessPages.find((candidate) => candidate.slug === slug);
  if (!business) notFound();
  return (
    <>
      <FaqJsonLd items={business.page.faq} />
      <BreadcrumbJsonLd
        trail={[
          { name: 'Home', path: '/' },
          { name: business.page.h1, path: `/${business.slug}/` },
        ]}
      />
      <BusinessPageTemplate business={business} />
    </>
  );
}
