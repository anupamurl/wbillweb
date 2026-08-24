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
  title: { default: 'wbill — your bill, ready to send in seconds', template: '%s — wbill' },
  description:
    'Create a professional bill and send it on WhatsApp in seconds. GST-ready invoicing for small businesses, freelancers and service providers in India.',
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
    siteName: 'wbill',
    title: 'wbill — your bill, ready to send in seconds',
    description:
      'Create a professional bill and send it on WhatsApp in seconds. GST-ready invoicing for small businesses, freelancers and service providers in India.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'wbill — your bill, ready to send in seconds',
    description: 'Create a professional bill and send it on WhatsApp in seconds.',
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
    <html lang="en" className={`${inter.variable} scroll-pt-16`}>
      <body className="bg-background text-text-primary antialiased">
        <OrganizationJsonLd />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
