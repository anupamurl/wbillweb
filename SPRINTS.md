# WBill Mobile App: Sprint Plan

> Goal: get a working WBill app onto **Google Play** and the **Apple App Store** as fast as possible, then grow it sprint by sprint.

| | |
|---|---|
| **Based on** | [BUSINESS.md](BUSINESS.md) (MVP product spec) |
| **Sprint length** | 2 weeks |
| **Team assumption** | 1 Flutter developer (+ owner for testing, store listing and content) |
| **Last updated** | 2026-11-03 |

---

## Sprint overview

| Sprint | Theme | Outcome |
|---|---|---|
| **Sprint 1** | **Minimum store release** | Login, create bill, share on WhatsApp. Submitted to both stores |
| Sprint 2 | Better bills | GST, discount, search, bill cancel |
| Sprint 3 | Faster billing | Saved items, serial/IMEI and warranty, public bill link |
| Sprint 4 | Grow and polish | Hindi, analytics, home dashboard, pricing plans |

Only **Sprint 1** is planned in detail. Later sprints are re-planned using feedback from real shops.

---

## Sprint 1: Minimum store release

**Sprint goal:** a shop owner can install WBill from the store, log in with their phone number, create a simple bill, and send it to a customer on WhatsApp.

### In scope (must have)

| # | Feature | What "done" means |
|---|---|---|
| 1 | **Phone login (OTP)** | Enter +91 number → receive 6-digit OTP → logged in. Stays logged in. Resend after 30 s |
| 2 | **Shop setup** | One-time screen: shop name (required), address and phone (optional). Editable in Settings |
| 3 | **Create bill** | Customer name (optional) + mobile (required). Add items: name, qty, price. Auto line totals and grand total. Auto bill number `WB-0001` and today's date |
| 4 | **Bill preview and save** | Review the bill, then save it to the cloud |
| 5 | **Share on WhatsApp** | Generate PDF → open WhatsApp/share sheet with the PDF and a short message (shop name, bill no., total) |
| 6 | **Bills list** | Past bills, newest first. Tap to view and re-share |
| 7 | **Settings** | Edit shop, privacy policy, terms, support contact, **log out**, **delete account** |

### Out of scope for Sprint 1

GST and tax split · discounts · search · editing or cancelling bills · logo upload · public bill link · saved items · serial/IMEI · warranty · Hindi · payments · pricing plans.

> Why so little? Store review needs a **working, stable** app, not a big one. Shipping small gets real shops using it sooner, and their feedback picks Sprint 2.

### Screens (8)

1. Splash
2. Phone number
3. OTP verify
4. Shop setup
5. Home (New bill button + recent bills)
6. New bill (customer + items + total)
7. Bill detail / preview (Save, Share, Download PDF)
8. Settings

### Tech setup

- Flutter 3.x, Riverpod
- Firebase: Authentication (phone), Cloud Firestore, Crashlytics
- Packages: `pdf`, `printing`, `share_plus`, `url_launcher`
- Firestore security rules: each user can only read/write their own shop's data
- Amounts stored in paise (integers)

### Task breakdown

**Week 1: Build the core**

| Day | Tasks |
|---|---|
| 1 | Create Flutter project, app ID `app.wbill`, folder structure, theme/colours to match the website, Firebase project (Android + iOS) |
| 2 | Phone OTP login (Android SMS auto-read; iOS APNs + reCAPTCHA setup) |
| 3 | Shop setup screen + Firestore `shops` collection + security rules |
| 4 | New bill screen: customer, add/remove items, totals |
| 5 | Save bill, bill number counter, Home + Bills list |

**Week 2: Share, polish and submit**

| Day | Tasks |
|---|---|
| 6 | PDF bill design + generation; WhatsApp / share sheet |
| 7 | Settings: edit shop, links, log out, delete account (deletes Firestore data + auth user) |
| 8 | Empty states, loading, error messages, no-internet message, Crashlytics |
| 9 | App icon, splash, store screenshots, test on real Android + iPhone, fix bugs |
| 10 | Release builds, store listings, submit for review |

### Store submission checklist

**Both stores**
- [ ] Privacy policy URL live: `https://wbill.app/privacy`
- [ ] Terms URL live: `https://wbill.app/terms`
- [ ] Support URL / email: `https://wbill.app/support`
- [ ] In-app **account deletion** works (required by both stores)
- [ ] App icon (1024×1024), feature graphic, 4–6 screenshots per platform
- [ ] Short description, full description, keywords
- [ ] **Test login for reviewers:** add a Firebase test phone number with a fixed OTP (e.g. `+91 99999 00000` / `123456`) and put it in the review notes

**Google Play**
- [ ] Play Console developer account (one-time US$25)
- [ ] Signed release `.aab`, upload key stored safely
- [ ] Data safety form (phone number, customer name/phone collected; encrypted in transit; deletion available)
- [ ] Content rating questionnaire, target audience (18+), app category: Business
- [ ] ⚠️ **New personal developer accounts must run a closed test with at least 12 testers for 14 days** before going to production. Start this **on day 10** (or earlier with an internal build). Use an organisation account to skip this if the business is registered

**Apple App Store**
- [ ] Apple Developer Program (US$99/year); an organisation account needs a D-U-N-S number
- [ ] Bundle ID, signing certificates, APNs key uploaded to Firebase (needed for phone auth)
- [ ] App Privacy ("nutrition label") answers
- [ ] TestFlight build tested on a real iPhone
- [ ] Review notes: explain the app, give the test phone number and OTP

### Definition of done (Sprint 1)

- [ ] All 7 in-scope features work on a real Android phone and a real iPhone
- [ ] A bill can be created and sent on WhatsApp in under 60 seconds
- [ ] No crash in a 30-minute test session; Crashlytics connected
- [ ] Firestore rules block access to other shops' data (tested)
- [ ] Builds submitted to Play (closed testing) and App Store (review)

### Risks

| Risk | Mitigation |
|---|---|
| Play's 12-tester / 14-day rule delays the public launch | Recruit 12+ testers (friends, pilot shops) before the sprint ends; or use an organisation account |
| Apple rejects the app because the reviewer can't log in | Firebase test number + fixed OTP in the review notes |
| iOS phone auth fails without APNs | Set up APNs key on day 2, test on a real iPhone (not the simulator) |
| SMS OTP cost / delivery in India | Watch Firebase usage; switch to MSG91 later if needed |
| WhatsApp share differs across phones | Always offer the system share sheet as a fallback |

---

## Sprint 2: Better bills (outline)

- GST toggle with rate (0/5/12/18/28%) and CGST + SGST split; shop GSTIN
- Discount (flat ₹ or %)
- Payment mode (Cash / UPI / Card)
- Search bills by name, phone or bill number
- Cancel a bill (marked "Cancelled")
- Shop logo on the PDF
- Fixes from Sprint 1 feedback

## Sprint 3: Faster billing (outline)

- Remember items for quick re-use
- HSN, serial/IMEI and warranty period per item
- Public bill link `wbill.app/b/<id>` in the WhatsApp message
- "Shared / not shared" status

## Sprint 4: Grow and polish (outline)

- Hindi language
- Home dashboard: today's and this month's sales
- Firebase Analytics events for the success metrics in BUSINESS.md
- Pricing plans (Free / Starter / Business / Pro) and plan limits
