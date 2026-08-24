import { brand } from '@/lib/brand';

export default function SoftwareApplicationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'wbill',
    url: brand.url,
    applicationCategory: 'BusinessApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    description:
      'Create a professional bill and send it on WhatsApp in seconds. GST-ready invoicing for small businesses, freelancers, and service providers in India.',
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
