import { brand } from '@/lib/brand';

export default function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'wbill',
    url: brand.url,
    email: brand.email,
    logo: `${brand.url}/icon-512.png`,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
