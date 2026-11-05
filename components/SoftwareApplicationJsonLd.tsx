import { brand } from '@/lib/brand';

export default function SoftwareApplicationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'wbill - Digital Billing App',
    alternateName: 'wbill',
    url: brand.url,
    applicationCategory: 'BusinessApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    description:
      'Digital billing app for small businesses in India: make bills with items, labour charges and optional GST on your phone and share them as PDF on WhatsApp. For shops, retailers and service businesses.',
    operatingSystem: 'Android, iOS',
    inLanguage: 'en-IN',
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
