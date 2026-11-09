import type { Metadata } from 'next';
import Link from 'next/link';
import LegalContact from '@/components/LegalContact';
import LegalPage from '@/components/LegalPage';
import { consentNotice } from '@/content/consentNotice';
import { brand } from '@/lib/brand';
import { INACTIVE_YEARS, POLICY_DATE, RESPONSE_DAYS, legal } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How WBill collects, uses, protects and erases personal data under India’s Digital Personal Data Protection Act, 2023.',
  alternates: { canonical: `${brand.url}/privacy/` },
};

export default function PrivacyPage() {
  const hi = consentNotice.hi;
  return (
    <LegalPage title="Privacy Policy" updated={POLICY_DATE}>
      <section>
        <h2>Overview</h2>
        <p>
          WBill is a digital billing and purchase-record platform for businesses in India. This policy explains what personal data
          is used, why, for how long, and the rights you have under the Digital Personal Data Protection Act, 2023 and the Digital
          Personal Data Protection Rules, 2025. A summary in Hindi is at the end.
        </p>
      </section>

      <section>
        <h2>Who is responsible for your data</h2>
        <ul>
          <li>
            <strong>Shop owners and employees with a WBill login:</strong> WBill is the Data Fiduciary for your account data.
          </li>
          <li>
            <strong>Customers named on a bill:</strong> the shop that made the bill decides why your details are recorded and is the
            Data Fiduciary. WBill processes those details for the shop as its Data Processor. If you contact us instead, we will pass
            your request to the shop and help it respond.
          </li>
        </ul>
      </section>

      <section>
        <h2>Personal data we use</h2>
        <ul>
          <li>Sign-in: your mobile number; if you sign in with Google, the name, email address and profile photo Google shares.</li>
          <li>Shop profile: business name, address, phone number, logo and GSTIN if you add one.</li>
          <li>Bills: items, prices, GST, totals, dates, the bill number, and the name of the person who made the bill.</li>
          <li>Customers: the name and mobile number a shop chooses to add to a bill. Both are optional.</li>
          <li>Employees: the name, mobile number or email an owner adds, and when the employee first and last signed in.</li>
          <li>Usage: the days an owner opens the WBill website.</li>
          <li>App crash reports: error details, device type and system version, and an app installation identifier.</li>
          <li>Sign-in protection on the website: Google reCAPTCHA checks the browser to stop automated abuse.</li>
          <li>Consent records: what you agreed to, the policy version, language and time.</li>
          <li>Privacy requests and grievances: your name, contact details and what you send us on the Your data rights page.</li>
        </ul>
        <p>Bill PDFs are created on your device when you need them. We do not store them.</p>
      </section>

      <section>
        <h2>Why we use it, and on what basis</h2>
        <ul>
          <li>To sign you in, secure your account, create and store bills, calculate tax, show your dashboard and let you share a bill. Basis: your consent.</li>
          <li>To fix faults and understand overall use of WBill, such as counts of accounts and bills. Basis: your consent.</li>
          <li>To prevent misuse, investigate security incidents and meet legal duties. Basis: legal obligation and other legitimate uses under Section 7 of the Act.</li>
          <li>Customer details: to issue a bill to the customer and keep the shop&rsquo;s purchase record. The shop is responsible for the basis it relies on.</li>
        </ul>
        <p>We do not sell personal data, use it for advertising, or use it to train third-party AI models.</p>
      </section>

      <section>
        <h2>Consent and how to withdraw it</h2>
        <p>
          We ask for your consent on a separate screen after you sign in, in English or Hindi, and keep a record of it. You can withdraw
          consent at any time from Profile on the website or Settings in the app. Withdrawing is as easy as consenting. We then stop using
          your data for the purposes above and you will not be able to use WBill until you consent again. Withdrawal does not affect what
          was done before it, and does not end retention the law requires.
        </p>
      </section>

      <section>
        <h2>Who handles your data</h2>
        <ul>
          <li>Google Firebase and Google Cloud: sign-in and SMS codes, database storage, crash reports (Crashlytics) and reCAPTCHA.</li>
          <li>Our website hosting provider, which serves the website itself.</li>
          <li>Apps you choose, such as WhatsApp, when you share a bill. Their own privacy terms apply to what you send.</li>
        </ul>
        <p>
          WBill&rsquo;s administrator can reach account and billing records to give support, keep the service secure and act on legal
          requests. Customer details are hidden in the administrator&rsquo;s screens by default. Revealing them requires a recorded reason,
          and those events and all administrator data exports are logged.
        </p>
        <p>
          Your data may be processed outside India by these providers, as Section 16 of the Act allows, and subject to any restrictions
          the Central Government sets.
        </p>
      </section>

      <section>
        <h2>How long we keep data</h2>
        <ul>
          <li>While your account is open, we keep your data so your records stay available.</li>
          <li>
            When you delete your account, you lose access at once and your team&rsquo;s access ends. Rule 8(3) of the DPDP Rules requires
            us to keep personal data and logs for at least one year from processing. During that year the data is held in restricted
            storage that only the administrator can reach, and used only for that legal purpose. We then erase it, unless another law
            requires us to keep it longer.
          </li>
          <li>Login-day records are erased after one year.</li>
          <li>Privacy requests and grievances are kept for one year after we finish handling them, then erased.</li>
          <li>
            If an account shows no activity for {INACTIVE_YEARS} years, we will warn the owner at the registered mobile number at least 48
            hours ahead and then erase it, unless the owner returns.
          </li>
          <li>
            Shop owners may have their own duty to keep tax records for longer. Download your bills before closing your account, because
            WBill does not keep them for that purpose.
          </li>
        </ul>
      </section>

      <section>
        <h2>Your rights</h2>
        <ul>
          <li>To get a summary of your data, how it is processed and who it has been shared with.</li>
          <li>To correct, complete, update or erase your data.</li>
          <li>To have your grievances addressed. We respond within {RESPONSE_DAYS} days.</li>
          <li>To nominate another person to exercise your rights if you die or become unable to do so.</li>
          <li>To complain to the Data Protection Board of India, after using our grievance process.</li>
        </ul>
        <p>
          See <Link href="/your-data/">Your data rights</Link> for how to do each of these.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          WBill is for people aged 18 or over, and we ask every user to confirm this. We do not knowingly process a child&rsquo;s data for an
          account. Tell us if you believe a child has an account and we will close it. We do not track, monitor behaviour, or target
          advertising at children.
        </p>
      </section>

      <section>
        <h2>Security and data breaches</h2>
        <p>
          Data is encrypted in transit and at rest by our infrastructure provider. Access is limited by server-side security rules for each
          shop. If a personal data breach occurs, we will inform affected people without delay through their account or registered contact
          details, explaining what happened, the likely consequences, what we are doing and what you can do. We will also report it to the
          Data Protection Board of India as the Rules require.
        </p>
      </section>

      <section>
        <h2>Cookies and tracking</h2>
        <p>
          This website does not use advertising cookies or third-party analytics. It keeps small items on your device to keep you signed
          in, and Google reCAPTCHA may set its own data during sign-in. The WBill app does not track you across other apps or websites.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>If we change what we collect or why, we will update the date above and ask for your consent again before continuing.</p>
      </section>

      <section>
        <h2>Contact and grievances</h2>
        <LegalContact />
      </section>

      <section lang="hi">
        <h2>हिन्दी में सारांश</h2>
        <p>{hi.intro}</p>
        <h3>{hi.dataHeading}</h3>
        <ul>{hi.data.map((x) => <li key={x}>{x}</li>)}</ul>
        <h3>{hi.purposesHeading}</h3>
        <ul>{hi.purposes.map((x) => <li key={x}>{x}</li>)}</ul>
        <h3>{hi.sharingHeading}</h3>
        <p>{hi.sharing}</p>
        <h3>{hi.retentionHeading}</h3>
        <p>{hi.retention}</p>
        <h3>{hi.rightsHeading}</h3>
        <p>{hi.rights}</p>
        <p>
          ईमेल: <a href={`mailto:${legal.email}`}>{legal.email}</a>
        </p>
      </section>
    </LegalPage>
  );
}
