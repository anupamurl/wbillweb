import type { FaqItem } from '@/components/Faq';

export const landingFaq: FaqItem[] = [
  {
    question: 'Do my customers need the wbill app?',
    answer:
      "No. You create the bill in wbill and send it as a PDF over WhatsApp — your customer just opens it, the same as any file you'd send them.",
  },
  {
    question: 'Does it handle GST?',
    answer:
      'Your business profile can carry your GSTIN, and every item on a bill has its own tax rate. wbill shows GST correctly on the bill — for filing and compliance advice, talk to your tax professional.',
  },
  {
    question: 'Who owns my data?',
    answer:
      'You do. Your customers, your bills, your business details — all of it is yours, and you can ask us to delete it at any time. See our privacy policy for the details.',
  },
  {
    question: 'Does it work without an internet connection?',
    answer:
      'wbill needs an internet connection to create and send a bill, since everything you save is backed up online the moment you save it.',
  },
  {
    question: 'What does it cost?',
    answer: "It's free while wbill is in early access. We'll announce pricing before anything changes.",
  },
  {
    question: 'When can I get it?',
    answer: "wbill isn't on the App Store or Play Store yet. Join the list and we'll email you the moment it is.",
  },
];
