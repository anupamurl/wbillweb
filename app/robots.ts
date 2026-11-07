import type { MetadataRoute } from 'next';
import { brand } from '@/lib/brand';

export const dynamic = 'force-static';

/** AI search and assistant crawlers, allowed explicitly so WBill can be found and cited. */
const aiCrawlers = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard', '/login'] },
      { userAgent: aiCrawlers, allow: '/', disallow: ['/dashboard', '/login'] },
    ],
    sitemap: `${brand.url}/sitemap.xml`,
    host: brand.url,
  };
}
