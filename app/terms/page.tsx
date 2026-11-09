import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/LegalPage';
import LegalContact from '@/components/LegalContact';
import { brand } from '@/lib/brand';
import { POLICY_DATE } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern your use of WBill.',
  alternates: { canonical: `${brand.url}/terms/` },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated={POLICY_DATE}>
      <section>
        <h2>Acceptance of terms</h2>
        <p>
          You accept these terms by ticking the box on the consent screen after you sign in. Your consent to our use of
          personal data is separate and is covered by our <Link href="/privacy/">Privacy Policy</Link>. You must be 18 or older
          to use WBill. If you don&rsquo;t agree, please don&rsquo;t use the app.
        </p>
      </section>

      <section>
        <h2>Description of the service</h2>
        <p>
          WBill is a digital billing and purchase-record platform. It lets you create bills, keep
          customer and purchase records, and — in the WBill mobile app — share bills with your
          customers on WhatsApp. Features described as &ldquo;coming soon&rdquo; or &ldquo;planned&rdquo; on
          our website are not part of the service until they are released.
        </p>
      </section>

      <section>
        <h2>Plans and pricing</h2>
        <p>
          WBill offers a Free plan and paid plans, described on our{' '}
          <Link href="/pricing/">pricing page</Link>. Paid billing is not live yet, so no plan is
          currently charged. Before any charge applies to your account, we&rsquo;ll tell you in advance,
          with the price and what it covers.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <p>
          You&rsquo;re responsible for the accuracy of the business, customer, and invoice information
          you enter, and for keeping access to your phone number or Google account secure, since
          that&rsquo;s how you sign in.
        </p>
      </section>

      <section>
        <h2>Your data</h2>
        <p>
          You own the invoice, customer, and business data you enter into WBill. We store it to
          provide the service; we don&rsquo;t claim ownership of it. You can export it from Profile on the website.
          When you close your account, access ends at once and the data is erased after the retention period in our{' '}
          <Link href="/privacy/">Privacy Policy</Link>. WBill is not your tax record-keeper: download your bills before
          closing your account if you must keep them for longer.
        </p>
      </section>

      <section>
        <h2>Data protection: your customers and employees</h2>
        <p>
          For personal data of your customers and employees, you are the Data Fiduciary under the Digital Personal Data
          Protection Act, 2023, and WBill is your Data Processor. WBill will:
        </p>
        <ul>
          <li>process that data only to provide the service, on your instructions as set out in these terms;</li>
          <li>apply reasonable security safeguards, and tell you without delay about a breach affecting it;</li>
          <li>help you respond to requests from your customers and employees;</li>
          <li>use only counts that identify no customer for its own reporting;</li>
          <li>use the sub-processors named in the Privacy Policy; and</li>
          <li>erase the data as set out in the Privacy Policy.</li>
        </ul>
        <p>You agree to:</p>
        <ul>
          <li>tell customers why you record their details, and add a mobile number only where they have agreed to give it;</li>
          <li>send bills only to the person they are for, and not use WBill details for marketing without valid consent;</li>
          <li>correct or remove a customer&rsquo;s details when you are required to, using the Customers page; and</li>
          <li>not record personal data of a child beyond what a purchase needs, or sensitive details in item names or customer names.</li>
        </ul>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <ul>
          <li>Don&rsquo;t use WBill to send bills for goods or services you didn&rsquo;t actually provide.</li>
          <li>Don&rsquo;t attempt to disrupt, reverse-engineer, or gain unauthorised access to the service.</li>
          <li>Don&rsquo;t use the service to store or send unlawful content.</li>
        </ul>
      </section>

      <section>
        <h2>Service availability</h2>
        <p>
          WBill is provided on an &ldquo;as is&rdquo; basis. We work to keep it available and reliable, but we
          don&rsquo;t guarantee uninterrupted access, and we may change or discontinue features as the
          product evolves.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the extent permitted by law, WBill is not liable for indirect, incidental, or
          consequential damages arising from your use of the service, including disputes with your
          own customers over billed amounts.
        </p>
      </section>

      <section>
        <h2>Termination</h2>
        <p>
          You can stop using WBill and close your account at any time. We may suspend or
          terminate accounts that violate these terms. Data in a closed account is handled as described in
          our <Link href="/privacy/">Privacy Policy</Link>.
        </p>
      </section>

      <section>
        <h2>Governing law</h2>
        <p>These terms are governed by the laws of India.</p>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>
          If these terms change materially, we&rsquo;ll update the date at the top of this page and
          ask you to accept them again in the app.
        </p>
      </section>

      <section>
        <h2>Contact us</h2>
        <LegalContact />
      </section>
    </LegalPage>
  );
}
