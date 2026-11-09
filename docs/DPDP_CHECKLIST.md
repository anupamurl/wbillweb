# WBill DPDP launch checklist

The code changes are in place. These steps need a person, the Firebase or Google Cloud console, or a lawyer.
Main DPDP duties start around 13-14 May 2027 (18 months after the November 2025 Gazette).

## 1. Release in this order

1. Run the rules tests on a machine with Java 11+: `cd mobile/firebase/rules-test && npm install && npm test`.
2. Publish `mobile/firestore.rules` (Firebase console, Firestore, Rules, or `firebase deploy --only firestore:rules`).
3. Deploy the website, then release the app.

If the website goes out before the rules, every user sees "We couldn't load your account", because consent can't be read.
Existing users are asked for consent the next time they open WBill.

## 2. Fill in who answers for WBill

In `web/lib/legal.ts`, set `entityName`, `grievanceOfficerName` and `postalAddress`. Blank values are left off the legal pages.
Confirm that support@wbill.app is monitored, because it is now the published privacy and grievance address.

## 3. Console settings

- [ ] Turn on Firestore Data Access audit logs (Google Cloud, IAM & Admin, Audit Logs, Cloud Firestore API).
- [ ] Route those logs to a log bucket kept for at least 365 days. The default bucket keeps logs for about 30 days. (Rules 6(1)(c),(e), 8(3))
- [ ] Turn on Firestore backups or point-in-time recovery, and keep backup life within the retention periods in the policy. (Rule 6(1)(d))
- [ ] Turn on 2-step verification for wbillapp@gmail.com, and don't share the account. (Rule 6(1)(b))
- [ ] Register and enforce Firebase App Check for web, iOS and Android. (Rule 6(1)(g)) This also limits spam to the public privacy-request form.
- [ ] Accept the Google Cloud/Firebase data processing terms, and get equivalent terms from your website host. (Rule 6(1)(f))
- [ ] Confirm the Firestore region. If it is `asia-south1`, you can say so in the policy.

## 4. Ask a privacy lawyer to confirm

- That the shop is the Data Fiduciary and WBill the Data Processor for customer data, given that the admin can read it.
- The privacy policy, terms and Hindi text.
- How to reconcile Rule 8(3) one-year retention with erasure requests.
- The 3-year inactivity period, given shops' GST record-keeping duties.
- Whether any startup exemption under Section 17(3) applies.
- Whether notice is needed in languages beyond English and Hindi.

## 5. Recurring work

- Monthly: open Administrator, Retention. Erase accounts that are due and warn inactive owners.
- Weekly: open Administrator, Privacy requests. Answer each person directly, then record the outcome. Replies aren't sent automatically.
- After erasing an account closed by the admin, delete its login in Firebase Authentication.
- When the consent notice changes, bump `POLICY_VERSION` in `web/lib/legal.ts` and `policyVersion` in `mobile/lib/core/legal.dart`.
- Answer rights requests and grievances within 30 days, and include the contact details in every reply (Rule 9).

## 6. Known limits

These need a backend (Cloud Functions) to close fully:

- Customer masking in the admin panel happens in the browser. The full data still reaches the admin's browser, and the rules still allow the admin to read it.
- Consent is enforced by the apps, not by the security rules.
- Erasure and inactivity warnings are started by hand from the Retention page.
- Breach notices are sent by hand (see BREACH_RUNBOOK.md).
- The mobile app sends users to the website to download their data.
