import type { Metadata } from 'next';
import Link from 'next/link';
import LegalContact from '@/components/LegalContact';
import LegalPage from '@/components/LegalPage';
import RightsRequestForm from '@/components/RightsRequestForm';
import { brand } from '@/lib/brand';
import { POLICY_DATE, RESPONSE_DAYS } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Your data rights',
  description: 'How to access, correct or erase your personal data in WBill, nominate someone, or raise a grievance.',
  alternates: { canonical: `${brand.url}/your-data/` },
};

export default function YourDataPage() {
  return (
    <LegalPage title="Your data rights" updated={POLICY_DATE}>
      <section>
        <h2>If you have a WBill login</h2>
        <ul>
          <li><strong>See or copy your data:</strong> use Download my data in Profile on the website.</li>
          <li><strong>Correct your shop details:</strong> edit them in Profile.</li>
          <li><strong>Withdraw consent:</strong> use Withdraw consent in Profile on the website or Settings in the app.</li>
          <li><strong>Close your account:</strong> use Delete account in Profile or Settings.</li>
        </ul>
        <p>
          The app can&rsquo;t download your data yet, so please use the website for that. You can also make any of these requests with
          the <a href="#request">form below</a>.
        </p>
      </section>

      <section>
        <h2>If your name or number is on a shop&rsquo;s bill</h2>
        <p>
          The shop is responsible for your details, so please ask the shop first. It can correct or remove your name and mobile number
          from its bills in WBill. If you can&rsquo;t reach the shop, <a href="#request">use the form below</a> and we will pass
          your request on and help it respond. You don&rsquo;t need a WBill account.
        </p>
      </section>

      <section id="request">
        <h2>Make a request</h2>
        <p>
          With a login, give your registered mobile number or email. For a shop bill, give your mobile number, the shop&rsquo;s name and,
          if you have it, the bill number. We may ask you to verify your identity, and we will only use these details to handle your request.
        </p>
        <RightsRequestForm />
      </section>

      <section>
        <h2>Nominate someone</h2>
        <p>
          You can name a person to exercise your rights if you die or become unable to act. <a href="#request">Use the form</a> with your
          registered contact, and include their name and mobile number or email.
        </p>
      </section>

      <section>
        <h2>Limits you should know about</h2>
        <p>
          Some data must be kept for a period by law, including for one year after account closure under Rule 8(3) of the DPDP Rules. Billing
          amounts, items and dates can&rsquo;t be changed, because they are a shop&rsquo;s business record. We will tell you if any part of a
          request can&rsquo;t be met, and why.
        </p>
      </section>

      <section>
        <h2>Grievances</h2>
        <p>
          If you are unhappy with how your data was handled or how a request was answered, <a href="#request">raise a grievance</a>.
          We respond within {RESPONSE_DAYS} days. If you are still not satisfied, you may complain to the Data Protection Board of India.
        </p>
        <LegalContact />
        <p>
          Read the full <Link href="/privacy/">Privacy Policy</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
