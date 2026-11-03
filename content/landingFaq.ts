import type { FaqItem } from '@/components/Faq';

export const landingFaq: FaqItem[] = [
  {
    question: 'Do my customers need the WBill app?',
    answer:
      'No. Your customer receives the bill as a PDF on WhatsApp and opens it like any other file. Access to their digital receipts is always free.',
  },
  {
    question: 'Can I make both GST and non-GST bills?',
    answer:
      'Yes. Add your GSTIN to your business profile and set a tax rate on each item, or leave tax off for a non-GST bill. WBill shows GST on the bill. For returns and compliance advice, talk to your tax professional.',
  },
  {
    question: 'Can I record serial numbers, IMEI and warranties?',
    answer:
      'At launch you can write a serial number or IMEI in the item description, and it appears on the bill. Dedicated warranty tracking, with expiry reminders, is coming later.',
  },
  {
    question: 'What does it cost?',
    answer:
      'WBill is free during early access. At launch the plans are Free at ₹0, Starter at ₹99, Business at ₹249 and Pro at ₹499 a month. We will tell you before anything is charged.',
  },
  {
    question: 'Who owns my data?',
    answer:
      'You do. Your customers, your bills and your business details are yours, and you can ask us to delete them at any time. Our privacy policy has the details.',
  },
  {
    question: 'Does it work without an internet connection?',
    answer:
      'WBill needs an internet connection to create and send a bill, because everything you save is backed up online the moment you save it.',
  },
  {
    question: 'When can I start?',
    answer:
      'The WBill app is not on the App Store or Play Store yet. Join early access and we will email you the day it is.',
  },
];
