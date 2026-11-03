import type { MetadataRoute } from 'next';
import { brand } from '@/lib/brand';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WBill: digital bills and receipts',
    short_name: 'WBill',
    description: 'Digital bills and receipts for Indian retailers, shared on WhatsApp.',
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
