import type { FaqItem } from '@/components/Faq';

export const supportFaq: FaqItem[] = [
  {
    question: "I didn't receive my OTP code",
    answer:
      "Check that your number is entered correctly, including the country code, and wait a minute — SMS delivery can lag. If it still hasn't arrived, email us and we'll look into it.",
  },
  {
    question: 'How do I delete my account and data?',
    answer:
      "Email us from the phone number linked to your account and we'll delete your data within the timeframe described in our privacy policy.",
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
