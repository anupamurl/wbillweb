import { brand } from './brand';

/**
 * Site-wide copy and navigation, so the header, footer, metadata and
 * structured data never drift apart. `brand` (generated from the shared
 * tokens) stays the source for the URL and support email.
 */
export const site = {
  name: 'WBill',
  defaultTitle: 'WBill — Every purchase deserves a digital record',
  description:
    'Create bills, share them instantly and keep every purchase organised. WBill brings business and customer purchase records into one simple digital experience. Free to get started.',
  tagline: 'Every purchase deserves a digital record.',
  email: brand.email,
  url: brand.url,
};

export const primaryNav = [
  { href: '/#product', label: 'Product' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/pricing/', label: 'Pricing' },
  { href: '/about/', label: 'About' },
  { href: '/support/', label: 'Support' },
] as const;

export const footerNav = [
  {
    heading: 'Product',
    links: [
      { href: '/#product', label: 'Overview' },
      { href: '/#how-it-works', label: 'How it works' },
      { href: '/#insights', label: 'Business insights' },
      { href: '/pricing/', label: 'Pricing' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/about/', label: 'About' },
      { href: '/support/', label: 'Support' },
      { href: `mailto:${brand.email}`, label: 'Contact' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { href: '/invoice-format/', label: 'Bill format guides' },
      { href: '/invoice-format/simple-bill-format/', label: 'Simple bill format' },
      { href: '/#faq', label: 'FAQ' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { href: '/privacy/', label: 'Privacy policy' },
      { href: '/terms/', label: 'Terms of service' },
    ],
  },
] as const;
