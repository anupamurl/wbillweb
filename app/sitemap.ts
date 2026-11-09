import type { MetadataRoute } from 'next';
import { brand } from '@/lib/brand';
import { invoiceFormatGuides } from '@/content/invoiceFormatGuides';
import { businessPages } from '@/content/businesses';

export const dynamic = 'force-static';

const staticRoutes: Array<{ path: string; changeFrequency: 'weekly' | 'monthly' | 'yearly'; priority: number }> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/pricing/', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/about/', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/signup/', changeFrequency: 'yearly', priority: 0.6 },
  { path: '/invoice-format/', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/privacy/', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms/', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/your-data/', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/support/', changeFrequency: 'monthly', priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const guideRoutes = invoiceFormatGuides.map((guide: { slug: string }) => ({
    path: `/invoice-format/${guide.slug}/`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const businessRoutes = businessPages.map((business) => ({
    path: `/${business.slug}/`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...businessRoutes, ...guideRoutes].map((route) => ({
    url: `${brand.url}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
