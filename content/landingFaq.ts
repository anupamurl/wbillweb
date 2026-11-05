import type { FaqItem } from '@/components/Faq';
import { plans } from './pricing';

const priceList = plans.map((plan) => `${plan.name} at ₹${plan.price}`).join(', ').replace(/, ([^,]*)$/, ' and $1');

export const landingFaq: FaqItem[] = [
  {
    question: 'What is WBill?',
    answer:
      'WBill is a digital billing and purchase-record platform. Businesses use it to create bills, share them with customers digitally and keep every purchase organised — instead of relying on paper bills that fade and get lost.',
  },
  {
    question: 'Who can use WBill?',
    answer:
      'Any business that gives its customers a bill. WBill isn’t built for one industry or one kind of shop — if you sell products, services or both, it works the same way. Customers don’t need an account to receive bills.',
  },
  {
    question: 'How do digital bills work?',
    answer:
      'You enter the customer’s mobile number and what they bought, with quantity and price. WBill totals it, gives it the next bill number and saves it. The bill is then filed under that customer, so you can find it again at any time.',
  },
  {
    question: 'Can bills be shared through WhatsApp?',
    answer:
      'Yes, from the WBill mobile app: share the bill as a PDF on WhatsApp, or open a WhatsApp chat with the customer with the bill details typed in. The mobile app is coming to the App Store and Google Play. On the web dashboard today you can create, view and organise bills.',
  },
  {
    question: 'Can customers access their purchase records?',
    answer:
      'Customers receive each bill as a PDF they can keep, forward or print, and it stays in their chat. A dedicated purchase history for customers is on our roadmap but isn’t available yet — we’ll announce it when it is.',
  },
  {
    question: 'What happens to my business data?',
    answer:
      'Your business, customer and bill data belongs to you. It’s stored securely, never sold and never used for advertising. You can ask us to export or delete it at any time — our privacy policy has the details.',
  },
  {
    question: 'What plans are available?',
    answer: `WBill is free to get started. The plans are ${priceList} a month. Paid plans aren’t billed yet, no card is needed, and we’ll tell you before anything is ever charged.`,
  },
  {
    question: 'How can I get support?',
    answer:
      'Email support@wbill.app and a person will reply, usually within one business day. The support page also answers the most common questions about signing in, bills and your data.',
  },
];
