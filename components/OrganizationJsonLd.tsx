import { brand } from '@/lib/brand';
import { social } from '@/lib/social';
import { site } from '@/lib/site';

/**
 * Site-wide WebSite + Organization graph. WebSite gives Google the site name
 * ("WBill"); alternateName keeps the brand distinct from similarly named
 * products when search engines and AI assistants resolve "wbill".
 */
export default function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${brand.url}/#website`,
        url: `${brand.url}/`,
        name: site.name,
        alternateName: site.alternateNames,
        description: site.description,
        publisher: { '@id': `${brand.url}/#organization` },
        inLanguage: 'en-IN',
      },
      {
        '@type': 'Organization',
        '@id': `${brand.url}/#organization`,
        name: site.name,
        alternateName: site.alternateNames,
        url: brand.url,
        email: brand.email,
        logo: `${brand.url}/icon-512.png`,
        description:
          'WBill is a digital billing and purchase-record platform that helps businesses move from paper bills to digital records.',
        slogan: site.tagline,
        areaServed: 'IN',
        sameAs: social.map((account) => account.href),
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
