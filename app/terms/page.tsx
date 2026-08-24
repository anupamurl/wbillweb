import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern your use of wbill.',
  alternates: { canonical: `${brand.url}/terms/` },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="23 August 2026">
      <section>
        <h2>Acceptance of terms</h2>
        <p>
          By creating an account or using wbill, you agree to these terms. If you don&rsquo;t agree,
          please don&rsquo;t use the app.
        </p>
      </section>

      <section>
        <h2>Description of the service</h2>
        <p>
          wbill lets you create bills, track their status, and share them with your customers on
          WhatsApp. It is currently free while in early access; we&rsquo;ll announce pricing before
          anything changes.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <p>
          You&rsquo;re responsible for the accuracy of the business, customer, and invoice information
          you enter, and for keeping access to your phone number secure, since it&rsquo;s how you sign
          in.
        </p>
      </section>

      <section>
        <h2>Your data</h2>
        <p>
          You own the invoice, customer, and business data you enter into wbill. We store it to
          provide the service; we don&rsquo;t claim ownership of it, and you can export or delete it as
          described in our privacy policy.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <ul>
          <li>Don&rsquo;t use wbill to send bills for goods or services you didn&rsquo;t actually provide.</li>
          <li>Don&rsquo;t attempt to disrupt, reverse-engineer, or gain unauthorised access to the service.</li>
          <li>Don&rsquo;t use the service to store or send unlawful content.</li>
        </ul>
      </section>

      <section>
        <h2>Service availability</h2>
        <p>
          wbill is provided on an &ldquo;as is&rdquo; basis. We work to keep it available and reliable, but we
          don&rsquo;t guarantee uninterrupted access, and we may change or discontinue features as the
          product evolves.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the extent permitted by law, wbill is not liable for indirect, incidental, or
          consequential damages arising from your use of the service, including disputes with your
          own customers over billed amounts.
        </p>
      </section>

      <section>
        <h2>Termination</h2>
        <p>
          You can stop using wbill and request account deletion at any time. We may suspend or
          terminate accounts that violate these terms.
        </p>
      </section>

      <section>
        <h2>Governing law</h2>
        <p>These terms are governed by the laws of India.</p>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>
          If these terms change materially, we&rsquo;ll update the date at the top of this page and,
          where the change is significant, notify you in the app.
        </p>
      </section>

      <section>
        <h2>Contact us</h2>
        <p>
          Questions about these terms: email{' '}
          <a href={`mailto:${brand.email}`} className="text-primary underline">{brand.email}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
