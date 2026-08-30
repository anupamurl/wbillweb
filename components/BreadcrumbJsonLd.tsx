import { brand } from '@/lib/brand';

/**
 * BreadcrumbList structured data for the guide hub and each guide,
 * per the site plan's SEO section.
 */
export default function BreadcrumbJsonLd({
  trail,
}: {
  trail: Array<{ name: string; path: string }>;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${brand.url}${crumb.path}`,
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
