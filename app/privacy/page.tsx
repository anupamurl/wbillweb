import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How wbill collects, uses, and protects your data.',
  alternates: { canonical: `${brand.url}/privacy/` },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="23 August 2026">
      <section>
        <h2>Overview</h2>
        <p>
          wbill is a billing app for small businesses. This policy explains what we collect when
          you use it, why we collect it, and how you can control it. We collect only what the app
          needs to work — nothing is sold, and nothing is collected for advertising.
        </p>
      </section>

      <section>
        <h2>Information we collect</h2>
        <ul>
          <li>Your phone number, used to sign you in with a one-time code — we don&rsquo;t use passwords.</li>
          <li>Your business profile: business name, address, and GSTIN if you provide one.</li>
          <li>Customer records you enter: name, phone number, address, and GSTIN where applicable.</li>
          <li>Invoice and line-item data: what you billed, to whom, and for how much.</li>
          <li>The PDF bills generated from that data, stored so you can retrieve them later.</li>
          <li>If you join our early-access waitlist, your email address and a hashed version of your IP address — the hash is used only to prevent abuse, and we never store or use your raw IP address.</li>
        </ul>
      </section>

      <section>
        <h2>How we use your information</h2>
        <p>
          To run the app: authenticate you, generate your bills, calculate tax and totals, show
          your dashboard, and let you share a PDF on WhatsApp. We do not use your data to train any
          third-party AI model, and we do not sell or rent it to anyone.
        </p>
      </section>

      <section>
        <h2>Where your data is stored</h2>
        <p>
          Your data is stored in a managed database and file storage operated by our
          infrastructure providers, secured with access controls. Generated PDFs may be served
          through time-limited download links rather than public URLs.
        </p>
      </section>

      <section>
        <h2>Data retention</h2>
        <p>
          We keep your data for as long as your account is active, so your invoice history stays
          available to you. If you ask us to delete your account, we delete your data within 30
          days, except where we&rsquo;re required to retain records by law.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          You can ask us at any time to export your data, correct it, or delete it. Email{' '}
          <a href={`mailto:${brand.email}`} className="text-primary underline">{brand.email}</a>{' '}
          from the address or phone number linked to your account and we&rsquo;ll act on it.
        </p>
      </section>

      <section>
        <h2>Third-party processors</h2>
        <p>
          We use third-party infrastructure providers for hosting, database storage, and SMS
          delivery of one-time codes. Each processes data only on our instructions and only to the
          extent needed to provide that service.
        </p>
      </section>

      <section>
        <h2>Cookies and tracking</h2>
        <p>
          This website does not use tracking cookies or third-party analytics. The wbill app does
          not track you across other apps or websites.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          If this policy changes materially, we&rsquo;ll update the date at the top of this page and,
          where the change is significant, notify you in the app.
        </p>
      </section>

      <section>
        <h2>Contact us</h2>
        <p>
          Questions about this policy or your data: email{' '}
          <a href={`mailto:${brand.email}`} className="text-primary underline">{brand.email}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
