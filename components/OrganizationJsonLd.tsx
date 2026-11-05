import { brand } from '@/lib/brand';
import { social } from '@/lib/social';

export default function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'wbill',
    alternateName: 'wbill - Digital Billing App',
    url: brand.url,
    email: brand.email,
    logo: `${brand.url}/icon-512.png`,
    sameAs: social.map((account) => account.href),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
