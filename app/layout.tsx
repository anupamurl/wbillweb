import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { brand } from '@/lib/brand';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganizationJsonLd from '@/components/OrganizationJsonLd';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: { default: 'WBill: every purchase deserves a digital record', template: '%s | WBill' },
  description:
    'Replace paper bills with digital receipts. GST and non-GST bills on WhatsApp, customer purchase history and retail records for electronics, mobile and appliance stores in India.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    url: brand.url,
    siteName: 'WBill',
    title: 'WBill: every purchase deserves a digital record',
    description:
      'Replace paper bills with digital receipts. GST and non-GST bills on WhatsApp, customer purchase history and retail records for electronics, mobile and appliance stores in India.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WBill: every purchase deserves a digital record',
    description: 'Replace paper bills with digital receipts your customers keep.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: brand.colors.light.primary },
    { media: '(prefers-color-scheme: dark)', color: brand.colors.dark.background },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} scroll-pt-20`}>
      <body className="bg-background font-sans text-ink antialiased">
        <OrganizationJsonLd />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
