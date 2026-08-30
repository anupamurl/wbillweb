import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { invoiceFormatGuides } from '@/content/invoiceFormatGuides';
import GuideTemplate from '@/components/GuideTemplate';
import FaqJsonLd from '@/components/FaqJsonLd';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import { brand } from '@/lib/brand';

export function generateStaticParams() {
  return invoiceFormatGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = invoiceFormatGuides.find((candidate) => candidate.slug === slug);
  if (!guide) {
    return {};
  }
  const url = `${brand.url}/invoice-format/${guide.slug}/`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: { title: guide.title, description: guide.description, url },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = invoiceFormatGuides.find((candidate) => candidate.slug === slug);
  if (!guide) {
    notFound();
  }
  return (
    <>
      <FaqJsonLd items={guide.faq} />
      <BreadcrumbJsonLd
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Invoice formats', path: '/invoice-format/' },
          { name: guide.title, path: `/invoice-format/${guide.slug}/` },
        ]}
      />
      <GuideTemplate guide={guide} />
    </>
  );
}
