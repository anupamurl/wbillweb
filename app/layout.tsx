import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { brand } from '@/lib/brand';
import { site } from '@/lib/site';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrganizationJsonLd from '@/components/OrganizationJsonLd';
import RevealObserver from '@/components/site/RevealObserver';
import SiteChrome from '@/components/site/SiteChrome';
import './globals.css';

const geist = Geist({ subsets: ['latin'], display: 'swap', variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-geist-mono', weight: ['400', '500'] });

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: { default: site.defaultTitle, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
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
    siteName: site.name,
    locale: 'en_IN',
    title: site.defaultTitle,
    description: site.description,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'WBill — digital bills and purchase records' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.defaultTitle,
    description: site.description,
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF7' },
    { media: '(prefers-color-scheme: dark)', color: '#0C0D10' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} scroll-pt-20`}>
      <body className="bg-canvas font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-canvas"
        >
          Skip to content
        </a>
        <OrganizationJsonLd />
        <RevealObserver />
        <Header />
        <div id="main">{children}</div>
        <SiteChrome>
          <Footer />
        </SiteChrome>
      </body>
    </html>
  );
}
