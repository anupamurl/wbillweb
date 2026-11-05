import { brand } from '@/lib/brand';
import { site } from '@/lib/site';

export default function SoftwareApplicationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: site.name,
    url: brand.url,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    description:
      'WBill is a digital billing and purchase-record platform. Create bills, share them with customers and keep every purchase organised.',
    inLanguage: 'en-IN',
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
