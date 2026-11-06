# WBill Mobile App: MVP Product Spec

> **Every purchase deserves a digital record.**

| | |
|---|---|
| **Product** | WBill mobile app (Android + iOS) |
| **Stack** | Flutter (single codebase) |
| **Stage** | MVP / early access |
| **Status** | Draft |
| **Owner** | Anupam Singh |
| **Last updated** | 2026-11-03 |

---

## 1. Summary

WBill lets Indian retailers replace paper bills with digital ones. The MVP is a small Flutter app where a shopkeeper signs in with their phone number, creates a bill in under a minute, and sends it to the customer on WhatsApp.

The MVP covers three things:

1. **Phone login.** Sign in with a mobile number and a one-time password (OTP).
2. **Create a bill.** Add the customer, the items and the totals, then save.
3. **Share on WhatsApp.** Send the bill to the customer as a PDF or a link.

## 2. Problem

Small retailers (mobile shops, electronics and home appliance stores) still write bills on paper. Those bills get lost, can't be searched, and are useless when a customer comes back with a warranty claim. Billing software exists, but most of it is desktop-first, complicated, and doesn't fit how these shops already talk to customers, which is on WhatsApp.

## 3. Goals and non-goals

### Goals (MVP)

- A new retailer can sign up and send their first bill in **under 3 minutes**.
- An existing user can create and share a bill in **under 60 seconds**.
- Bills arrive on WhatsApp looking professional and are easy to read on a phone.
- Every saved bill is backed up to the cloud and can be retrieved later.

### Non-goals (later releases)

- GST filing, returns, or tax advice
- Inventory and stock management
- Payments or payment links
- Multiple staff accounts per shop
- Warranty tracking, order tracking and analytics dashboards
- Offline bill creation (MVP needs an internet connection to save)

## 4. Target users

| Persona | Description | Key need |
|---|---|---|
| **Shop owner** (primary) | Runs a small mobile, electronics or appliance store; comfortable with WhatsApp, not with accounting software | Fast, simple billing that looks professional |
| **Customer** (recipient) | Buys from the shop; doesn't install the app | Gets a clear bill on WhatsApp that they can find later |

## 5. User stories

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-1 | Shop owner | sign in with my phone number and OTP | I don't have to remember a password |
| US-2 | Shop owner | set up my shop name, address, phone and GSTIN once | every bill shows my details automatically |
| US-3 | Shop owner | create a bill with customer details and items | I can stop writing paper bills |
| US-4 | Shop owner | see the subtotal, discount, tax and total worked out for me | I don't make arithmetic mistakes |
| US-5 | Shop owner | send the bill to the customer on WhatsApp in one tap | the customer gets it straight away |
| US-6 | Shop owner | see a list of my past bills and search them | I can find a bill when a customer comes back |
| US-7 | Customer | open the bill on my phone without installing anything | I have a record of my purchase |

## 6. Functional requirements

### 6.1 Phone number login

| ID | Requirement | Priority |
|---|---|---|
| AUTH-1 | User enters a 10-digit Indian mobile number (+91 pre-filled) | Must |
| AUTH-2 | App sends a 6-digit OTP by SMS; auto-read on Android where supported | Must |
| AUTH-3 | OTP expires after 5 minutes; "Resend OTP" becomes available after 30 seconds | Must |
| AUTH-4 | Lock out for 15 minutes after 5 wrong OTP attempts | Must |
| AUTH-5 | User stays signed in until they log out or reinstall the app | Must |
| AUTH-6 | First-time users go through a short shop profile setup (shop name required; address, phone, GSTIN, logo optional) | Must |
| AUTH-7 | User can log out and request account deletion from Settings | Must (store policy) |

### 6.2 Create bill

| ID | Requirement | Priority |
|---|---|---|
| BILL-1 | Customer details: name (optional), mobile number (required for WhatsApp sharing) | Must |
| BILL-2 | Add one or more line items: name, quantity, unit price; line total calculated automatically | Must |
| BILL-3 | Optional per-item fields: HSN code, serial/IMEI number, warranty period | Should |
| BILL-4 | Bill-level discount (flat ₹ or %) | Should |
| BILL-5 | GST toggle: when on, apply a GST rate (0/5/12/18/28%) and show CGST + SGST split | Should |
| BILL-6 | Auto-generated, sequential bill number per shop (e.g. `WB-0001`) | Must |
| BILL-7 | Bill date defaults to today and can be edited | Must |
| BILL-8 | Payment mode: Cash / UPI / Card / Other | Should |
| BILL-9 | Preview the bill before saving | Must |
| BILL-10 | Saved bills appear in a "Bills" list, newest first, searchable by customer name, phone or bill number | Must |
| BILL-11 | Saved bills can't be edited (to keep the record trustworthy); they can be cancelled, which marks them "Cancelled" | Should |
| BILL-12 | Remember previously used items so they can be picked quickly next time | Could |

### 6.3 Share on WhatsApp

| ID | Requirement | Priority |
|---|---|---|
| SHARE-1 | Generate a clean, phone-friendly PDF of the bill with the shop's branding | Must |
| SHARE-2 | "Share on WhatsApp" opens WhatsApp with the customer's number and a pre-filled message | Must |
| SHARE-3 | Pre-filled message includes shop name, bill number, total and a link to view the bill online | Must |
| SHARE-4 | Fallback: share the PDF through the system share sheet (works with WhatsApp Business, SMS, email) | Must |
| SHARE-5 | Each bill has a unique, hard-to-guess public link (`wbill.app/b/<id>`) that the customer can open in a browser | Should |
| SHARE-6 | Track whether a bill has been shared (Shared / Not shared) | Could |

**Note on WhatsApp:** for the MVP, sharing goes through the user's own WhatsApp app (`wa.me` deep link plus the share sheet). Sending automatically through the WhatsApp Business API costs money per message and needs Meta approval, so it is a later-phase decision.

## 7. Core user flows

```
First launch
  Splash → Enter phone → Enter OTP → Shop setup → Home (empty state: "Create your first bill")

Create and share
  Home → New bill → Customer → Items → Totals → Preview → Save
       → Share on WhatsApp → WhatsApp opens with message + link → Send

Find an old bill
  Home → Bills → Search → Open bill → Re-share / Download PDF
```

## 8. Screens

| # | Screen | Purpose |
|---|---|---|
| 1 | Splash | Branding, session check |
| 2 | Phone entry | Enter mobile number |
| 3 | OTP verify | Enter / auto-read OTP |
| 4 | Shop setup | One-time shop profile |
| 5 | Home | Quick "New bill" action, today's totals, recent bills |
| 6 | New bill | Customer, items, discount, tax, payment mode |
| 7 | Bill preview | Final review before saving |
| 8 | Bill detail | View, share, download, cancel |
| 9 | Bills list | Search and browse past bills |
| 10 | Settings | Shop profile, logout, delete account, support, privacy, terms |

## 9. Data model (draft)

```
Shop
  id, ownerPhone, name, address, phone, gstin?, logoUrl?, nextBillNumber, createdAt

Bill
  id, shopId, billNumber, publicToken, date,
  customerName?, customerPhone,
  items[]: { name, qty, unitPrice, hsn?, serial?, warrantyMonths?, lineTotal },
  subtotal, discountType?, discountValue?, gstEnabled, gstRate?, cgst?, sgst?,
  grandTotal, paymentMode, status (active | cancelled), sharedAt?,
  createdAt
```

All amounts are stored in **paise (integers)** so rounding never goes wrong.

## 10. Technical approach

| Area | Choice | Notes |
|---|---|---|
| App | Flutter 3.x, Dart | One codebase for Android and iOS |
| State management | Riverpod | Simple, testable |
| Auth | Firebase Authentication (phone OTP) | Handles SMS delivery, reCAPTCHA and auto-read on Android |
| Database | Cloud Firestore | Per-shop security rules; offline cache built in |
| Storage | Firebase Storage | Shop logos and generated PDFs |
| PDF | `pdf` + `printing` packages | Generated on the device |
| Sharing | `share_plus`, `url_launcher` (`wa.me`) | No WhatsApp API cost in the MVP |
| Public bill page | Existing Next.js site (`wbill.app/b/<id>`) | Read-only bill view |
| Crash reports / analytics | Firebase Crashlytics + Analytics | |

**Alternative:** use an Indian SMS provider (e.g. MSG91) with our own backend if Firebase SMS costs or delivery rates become a problem.

## 11. Non-functional requirements

- **Performance:** app opens in under 2 seconds on a mid-range Android phone; PDF is generated in under 2 seconds.
- **Devices:** Android 8.0+ and iOS 14+; works well on small screens (5").
- **Security:** a user can only read and write their own shop's data (enforced by Firestore rules); public bill links use unguessable tokens; no card or payment data is stored.
- **Privacy:** customer phone numbers are used only to send that bill. Must match the published [privacy policy](app/privacy).
- **Reliability:** a bill is saved before the share step, so a failed share never loses it.
- **Localisation:** English first; strings kept separate so Hindi can be added next.
- **Store compliance:** in-app account deletion, privacy policy link, and a demo login for App Store review.

## 12. Success metrics

| Metric | MVP target |
|---|---|
| Sign-up → first bill sent | ≥ 60% |
| Time to first bill | < 3 min (median) |
| Bills shared on WhatsApp / bills created | ≥ 80% |
| Weekly active shops (week 4 retention) | ≥ 40% |
| Crash-free sessions | ≥ 99.5% |

## 13. Milestones

| Phase | Scope | Estimate |
|---|---|---|
| **0. Setup** | Flutter project, Firebase, CI, design tokens matching the website | 1 week |
| **1. Auth** | Phone OTP login, shop setup, settings | 1 week |
| **2. Billing** | New bill, totals and GST, preview, bills list and search | 2 weeks |
| **3. Sharing** | PDF, WhatsApp deep link, share sheet, public bill page | 1 week |
| **4. Beta** | Internal testing, 10–20 pilot shops, fixes | 2 weeks |
| **5. Launch** | Play Store and App Store submission | 1 week |

**Total: about 8 weeks** to store launch.

## 14. Pricing (from the website)

Free during early access. Planned plans at launch: **Free ₹0 · Starter ₹99 · Business ₹249 · Pro ₹499** per month. Plan limits are still to be decided.

## 15. Risks and open questions

| # | Item | Type |
|---|---|---|
| 1 | OTP SMS cost and delivery rates in India (DLT registration may be required) | Risk |
| 2 | WhatsApp can't be sent fully automatically without the paid Business API; the user must tap "Send" | Constraint |
| 3 | Is GST in scope for the MVP, or should we launch non-GST bills first? | Open question |
| 4 | Should saved bills be editable, or only cancellable (current proposal)? | Open question |
| 5 | What are the limits for each pricing plan (bills per month, logo, PDF branding)? | Open question |
| 6 | Do we need Hindi at launch for the target shops? | Open question |
