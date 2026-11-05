import type { MetadataRoute } from 'next';
import { brand } from '@/lib/brand';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/login'] },
    sitemap: `${brand.url}/sitemap.xml`,
  };
}
