import { brand } from '@/lib/brand';

export default function SoftwareApplicationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'WBill',
    url: brand.url,
    applicationCategory: 'BusinessApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    description:
      'Digital retail purchase records: GST and non-GST bills shared on WhatsApp, digital receipts and customer purchase history for Indian retailers.',
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
