import type { InvoiceFormatGuide } from './types';

export const invoiceFormatGuides: InvoiceFormatGuide[] = [
  {
    slug: 'gst-invoice-format',
    title: 'GST Invoice Format: What Every GST Bill Must Include',
    description: 'The mandatory fields a GST invoice needs in India, explained simply, with a worked example.',
    audience: 'Any GST-registered business',
    intro:
      "If you're registered for GST, every bill you issue has to carry a specific set of details — miss one and the invoice isn't valid for your customer's input tax credit. Here's what has to be on it, and what a correctly formatted one looks like.",
    mustInclude: [
      'Your business name, address, and GSTIN',
      'A unique, sequential invoice number, issued in order',
      'The invoice date',
      "Your customer's name and address, and their GSTIN if they're registered",
      'A clear description of each item or service',
      'The quantity and unit price of each item',
      'The GST rate applied to each item, shown separately',
      'The taxable value and the tax amount for each item',
      'The total invoice value, in figures',
    ],
    example: {
      businessName: 'Sharma Electricals',
      customerName: 'Verma Traders',
      items: [
        { name: 'AC gas top-up', quantity: 1, unitPrice: 800, taxRatePercent: 18 },
        { name: 'Service call — 2 units', quantity: 2, unitPrice: 600, taxRatePercent: 18 },
      ],
      notes: 'Payment due within 7 days.',
    },
    taxNote:
      "GST is calculated per line item, not on the invoice total — that's what lets a single bill mix items taxed at different rates (5%, 12%, 18%, 28%) without the maths going wrong. wbill calculates each line's tax automatically from the rate on the item and totals it for you.",
    commonMistakes: [
      'Reusing an invoice number, or skipping one in the sequence',
      "Leaving the customer's GSTIN off a B2B sale, so they can't claim input tax credit",
      'Charging GST on the whole invoice instead of per item, which breaks once items have different rates',
      'A mistyped GSTIN — one wrong digit is enough to invalidate it',
    ],
    faq: [
      {
        question: 'Do I need a GSTIN to use wbill?',
        answer:
          'No — wbill works for GST and non-GST businesses. Add a GSTIN to your business profile and it appears on every bill automatically.',
      },
      {
        question: "What if my customer isn't GST-registered?",
        answer: "The bill is still valid — you just won't include their GSTIN, since they don't have one.",
      },
      {
        question: 'Can one invoice have items at different GST rates?',
        answer: 'Yes — set the rate per item, and wbill totals each rate correctly on the same bill.',
      },
      {
        question: 'Does wbill file my GST returns?',
        answer:
          'No. wbill generates a correctly formatted bill; filing returns is a separate step you’d handle with your accountant or GST software.',
      },
    ],
  },
  {
    slug: 'electrician',
    title: 'Bill Format for Electricians',
    description: 'What to put on a bill for wiring, repairs, and installations — with a worked example and the mistakes that come up most.',
    audience: 'Electricians & electrical contractors',
    intro:
      "Most electricians either write bills by hand or skip them and just ask for cash. Neither gives you a record you can search when a customer asks what they were charged last time — and a handwritten slip doesn't look like it came from someone who does this for a living.",
    mustInclude: [
      'Your name or business name and phone number',
      "The customer's name, address, and phone number",
      'The date of the job',
      'What you did, item by item — for example, MCB replacement, not just electrical work',
      'Material cost kept separate from your labour or visit charge',
      "GST, if you're registered",
      "The total amount and how it's to be paid",
    ],
    example: {
      businessName: 'Rahul Electricals',
      customerName: 'Amit Verma',
      items: [
        { name: 'MCB replacement (2-pole)', quantity: 1, unitPrice: 450, taxRatePercent: 18 },
        { name: 'Wiring inspection', quantity: 1, unitPrice: 600, taxRatePercent: 18 },
        { name: 'Service visit charge', quantity: 1, unitPrice: 200, taxRatePercent: 0 },
      ],
      notes: 'Warranty on parts: 6 months.',
    },
    taxNote:
      "Keep your visit or service charge on its own line, taxed or not as applies to you — it lets a repeat customer see exactly what they're paying for material versus your time, and keeps the maths honest when only part of what you sold is taxable.",
    commonMistakes: [
      "Not separating parts from labour, so a repeat customer can't tell what a callout actually costs",
      'No record at all for cash jobs, with nothing to point to if a dispute comes up later',
      'Inconsistent numbering across a notebook and loose paper slips',
      'Leaving off warranty terms on parts, which is usually the first thing a customer asks about later',
    ],
    faq: [
      {
        question: 'How fast can I actually create one of these on wbill?',
        answer:
          'Add the customer, add each item, and the bill is ready to send — most items only need to be set up once, so a repeat bill takes under a minute after that.',
      },
      {
        question: 'Can I send the bill from the job site?',
        answer:
          "Yes — the whole flow is built for your phone. Create it, generate the PDF, and send it on WhatsApp before you've left the customer's door.",
      },
      {
        question: 'What if I charge different rates for parts and labour?',
        answer:
          'Set the tax rate per item, so parts and labour can be taxed differently on the same bill and the totals still come out right.',
      },
      {
        question: 'Can I reuse the same job details next time?',
        answer: 'Save your common items and prices once, and pick them for every future bill instead of retyping them.',
      },
    ],
  },
  {
    slug: 'plumber',
    title: 'Bill Format for Plumbers',
    description: 'What a plumbing bill needs — repairs, installations, and call-outs — with a worked example.',
    audience: 'Plumbers & plumbing contractors',
    intro:
      "A plumbing job is often urgent and often cash — which is exactly when a bill is easiest to skip. But a customer who paid for a leak repair without a record has no way to call you back if it leaks again next week, and neither do you.",
    mustInclude: [
      'Your business name and a phone number the customer can call back for a follow-up leak or blockage',
      "The customer's full address — plumbing work is site-specific, so the property matters as much as the customer's name",
      'The date and, for an emergency or after-hours call-out, the time you attended',
      'Each fitting or repair on its own line — say cistern replacement or drain-blockage clearing, not a single plumbing work entry',
      'Fittings and pipe or sealant materials priced separately from your labour or call-out charge',
      'Whether the job is a repair or a full new installation, since customers often ask for this distinction later for warranty or resale purposes',
      "GST, if you're registered",
      "The total due, the payment method, and any callback window you're covering if the same issue recurs",
    ],
    example: {
      businessName: 'Kumar Plumbing Services',
      customerName: 'Priya Nair',
      items: [
        { name: 'Tap replacement', quantity: 2, unitPrice: 350, taxRatePercent: 18 },
        { name: 'Pipe leak repair', quantity: 1, unitPrice: 900, taxRatePercent: 18 },
        { name: 'Visit charge', quantity: 1, unitPrice: 150, taxRatePercent: 0 },
      ],
      notes: 'Please inform us within 48 hours if the issue recurs.',
    },
    taxNote:
      'List materials (fittings, pipe, sealant) separately from your labour charge — it makes a repeat callout easy to compare against the last one, for you and for the customer.',
    commonMistakes: [
      'No written record for an emergency or after-hours job, when a bill is easiest to skip entirely',
      'Bundling materials and labour into one number, so neither of you can tell what changed next time',
      'Verbally quoting one price and billing another, with nothing in writing to settle the difference',
      'No visit or call-out charge listed separately, so it looks like it was free when it wasn’t',
    ],
    faq: [
      {
        question: 'Can I bill for an emergency call-out on the spot?',
        answer: 'Yes — create and send the bill from your phone at the customer’s address, before you leave.',
      },
      {
        question: 'How do I handle a job that needs a follow-up visit?',
        answer: 'Bill each visit separately as it happens — wbill keeps a full, searchable history per customer.',
      },
      {
        question: 'Can I track which customers still owe me money?',
        answer: 'Yes — your dashboard shows total outstanding and overdue amounts across every customer.',
      },
      {
        question: 'Do I need a GSTIN to bill for plumbing work?',
        answer: 'No — wbill works for GST and non-GST businesses alike.',
      },
    ],
  },
  {
    slug: 'ac-service',
    title: 'Bill Format for AC & Appliance Service',
    description: 'What to put on a bill for AC service, repair, and installation — with a worked example.',
    audience: 'AC & appliance service providers',
    intro:
      "AC service work is seasonal and repeat-heavy — the same customer calls you every summer. A proper bill each time is what lets you, and them, look back and see exactly what was done and when, instead of relying on memory.",
    mustInclude: [
      'Your business name and phone number, so a customer calling next summer can find you again',
      "The customer's address and the AC unit's location within it — for example, bedroom split unit — since one visit often covers more than one unit",
      'The service date, and the make or tonnage of the unit if it affects the parts or gas used',
      'Each unit serviced as its own line — for example, gas top-up (1.5T split) rather than one combined AC service entry',
      'The refrigerant gas type and quantity, if a top-up was done, since that determines the warranty period',
      'The warranty period on any gas top-up or part replaced, stated in months',
      "GST, if you're registered",
      "The total amount and how it's to be paid",
    ],
    example: {
      businessName: 'CoolCare Services',
      customerName: 'Deepak Rao',
      items: [
        { name: 'AC gas top-up', quantity: 1, unitPrice: 800, taxRatePercent: 18 },
        { name: 'Filter cleaning', quantity: 2, unitPrice: 250, taxRatePercent: 18 },
        { name: 'Visit charge', quantity: 1, unitPrice: 200, taxRatePercent: 0 },
      ],
      notes: 'Gas top-up warranty: 3 months.',
    },
    taxNote:
      'Itemise each unit serviced separately when a customer has more than one AC — it keeps the bill honest and makes it obvious at a glance what was done to which unit.',
    commonMistakes: [
      'One lump line ("AC service") when multiple units were serviced differently',
      'No warranty period stated on a gas top-up, which is usually the first thing asked about if it fails again',
      "Losing track of a customer's service history between seasons, with nothing to look back on",
      'Charging a visit fee inconsistently between customers, with no record of what was agreed',
    ],
    faq: [
      {
        question: 'Can I bill for multiple AC units on one visit?',
        answer: 'Yes — add each unit’s work as its own line item, so the bill shows exactly what was done to each one.',
      },
      {
        question: "Can I see a customer's past service history?",
        answer: 'Yes — every bill you’ve created for a customer is saved and searchable.',
      },
      {
        question: 'Does wbill remind customers when their next service is due?',
        answer: 'Not yet — automated reminders are on our roadmap, not in the app today.',
      },
      {
        question: 'Can I send the bill before I leave the customer’s home?',
        answer: 'Yes — create it, generate the PDF, and send it on WhatsApp on the spot.',
      },
    ],
  },
  {
    slug: 'freelancer',
    title: 'Invoice Format for Freelancers & Consultants',
    description: "What a freelance or consulting invoice needs to look professional and get paid on time — with a worked example.",
    audience: 'Freelancers, consultants & designers',
    intro:
      "Clients pay freelancers slower than almost anyone else, and an unclear invoice is a big reason why. A bill that spells out exactly what was delivered, when it's due, and how to pay gets settled faster than one that just says design work.",
    mustInclude: [
      'Your name or business name, and contact details',
      "The client's name and billing details",
      'A unique invoice number and the invoice date',
      'What was delivered, item by item — for example, logo design or one revision round, not just design work',
      'The payment due date, stated clearly',
      "GST, if you're registered",
      'The total amount and your payment details',
    ],
    example: {
      businessName: 'Ananya Studio',
      customerName: 'Bright Retail Pvt Ltd',
      items: [
        { name: 'Logo design — final delivery', quantity: 1, unitPrice: 12000, taxRatePercent: 18 },
        { name: 'Revision round', quantity: 2, unitPrice: 1500, taxRatePercent: 18 },
      ],
      notes: 'Payment due within 15 days of invoice date.',
    },
    taxNote:
      "If you're GST-registered, your GSTIN and the tax rate go on every line the same as any other business — freelance work isn't exempt just because it's a service.",
    commonMistakes: [
      "Billing for “services rendered” instead of naming each deliverable — clients query vague line items, and every query delays payment",
      "No due date, which quietly becomes “whenever they get to it”",
      'Sending the invoice as a photo or a chat message instead of a proper PDF',
      'Losing track of which invoices are still unpaid across a dozen clients',
    ],
    faq: [
      {
        question: 'Can I invoice for milestones instead of one lump sum?',
        answer: 'Yes — add each milestone or deliverable as its own line item, so the client sees exactly what each payment covers.',
      },
      {
        question: 'Does wbill support recurring monthly retainers?',
        answer: "Not yet — today's wbill is built for one-off bills. Recurring invoicing is on our roadmap.",
      },
      {
        question: 'Can I set my own due date?',
        answer: 'Yes — set the due date per invoice, and wbill marks it overdue automatically if it passes unpaid.',
      },
      {
        question: 'Will my client need to install anything to view or pay the invoice?',
        answer: 'No — they receive a PDF over WhatsApp and open it like any other file.',
      },
    ],
  },
];
