import type { MetadataRoute } from 'next';
import { brand } from '@/lib/brand';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'wbill - Digital Billing App',
    short_name: 'wbill',
    description: 'Make bills on your phone and send them on WhatsApp. For every small shop and service business in India.',
    start_url: '/',
    display: 'standalone',
    background_color: brand.colors.light.background,
    theme_color: brand.colors.light.primary,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
