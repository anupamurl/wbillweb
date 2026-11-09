# WBill personal data breach runbook

DPDP Act Section 8(6) and Rule 7. Every personal data breach is reportable, whatever its size.

**Breach lead:** ____________ (name, mobile)  **Backup:** ____________

## The clock

| When | What |
|---|---|
| On becoming aware | Start the log below. Contain the problem. |
| Without delay | First report to the Data Protection Board: nature, extent, timing, location, likely impact. |
| Without delay | Tell each affected person through their account or registered contact. |
| Within 72 hours of becoming aware | Detailed report to the Board. Ask in writing first if you need longer. |

## Steps

1. **Record** the time you became aware, who found it, and what is known. Keep the log and don't delete evidence.
2. **Contain.** Rotate credentials, sign out the admin account, block affected logins, and tighten Firestore rules if needed.
3. **Work out who is affected** from the Firestore audit logs: owners, employees and customers.
4. **Report to the Board** using the channel it publishes. Check for the current one before you need it.
5. **Tell affected people.** Owners and employees: by their registered mobile or email. Customers: tell the shop without delay, as WBill is its processor, and help it notify them.
6. **Send the detailed report** within 72 hours (contents below).
7. **Review.** Fix the cause, and keep the record for at least one year.

## Detailed report to the Board (Rule 7(2)(b))

- Updated and detailed description of the breach
- Events, circumstances and reasons that led to it
- Measures taken or proposed to reduce risk
- Findings about who caused it
- Remedial steps to prevent it happening again
- Report on the notices given to affected people

## Message to affected people (Rule 7(1))

> **Important notice from WBill about your data**
>
> **What happened:** On [date], [describe the breach, what data, how much].
> **What this may mean for you:** [likely consequences, such as unwanted calls or messages].
> **What we have done:** [steps taken and under way].
> **What you can do:** [be careful of messages claiming to be from WBill, don't share codes, review your account].
> **Questions:** [name], support@wbill.app, [phone].
