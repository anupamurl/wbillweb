import { brand } from '@/lib/brand';
import { social } from '@/lib/social';
import { site } from '@/lib/site';

export default function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: brand.url,
    email: brand.email,
    logo: `${brand.url}/icon-512.png`,
    slogan: site.tagline,
    sameAs: social.map((account) => account.href),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
