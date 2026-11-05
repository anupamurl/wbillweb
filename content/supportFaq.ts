import type { FaqItem } from '@/components/Faq';

export const supportFaq: FaqItem[] = [
  {
    question: "I didn't receive my OTP code",
    answer:
      "Check that your number is entered correctly, including the country code, and wait a minute — SMS delivery can lag. You can also continue with Google instead. If the code still hasn't arrived, email us and we'll look into it.",
  },
  {
    question: 'Can I use both my phone number and Google to sign in?',
    answer:
      'Yes. Once you are signed in, open Profile in your dashboard to link the other sign-in method to the same account.',
  },
  {
    question: 'Where do I find my bills?',
    answer:
      'Sign in and open Bills in your dashboard. Every bill is listed newest first, and Customers shows each customer with their purchase history.',
  },
  {
    question: 'How do I delete my account and data?',
    answer:
      "You can delete your account from Profile in your dashboard, or email us from the phone number linked to your account and we'll delete your data within the timeframe described in our privacy policy.",
  },
  {
    question: 'I found a bug',
    answer:
      'Email us with what you were doing, what you expected, and what happened instead — screenshots help. We read every report.',
  },
  {
    question: 'How do I request a feature?',
    answer: 'Email us — we read every suggestion, and it genuinely shapes what we build next.',
  },
];
