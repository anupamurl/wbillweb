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
  title: { default: 'wbill - Digital Billing App | Make Bills, Send on WhatsApp', template: '%s | wbill - Digital Billing App' },
  description:
    'Make a bill on your phone and send it as a PDF on WhatsApp. For kirana, hardware, mobile shops, salons, mechanics, plumbers and more. Free to get started.',
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
    siteName: 'wbill - Digital Billing App',
    locale: 'en_IN',
    title: 'wbill - Digital Billing App | Make Bills, Send on WhatsApp',
    description:
      'Make a bill on your phone and send it as a PDF on WhatsApp. For kirana, hardware, mobile shops, salons, mechanics, plumbers and more. Free to get started.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'wbill - Digital Billing App | Make Bills, Send on WhatsApp',
    description: 'Phone se bill banao, WhatsApp pe bhejo. Digital billing for every small shop and service business in India.',
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
