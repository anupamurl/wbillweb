export interface GuideFaqItem {
  question: string;
  answer: string;
}

export interface GuideExampleItem {
  name: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent: number;
}

export interface GuideExample {
  businessName: string;
  customerName: string;
  items: GuideExampleItem[];
  notes?: string;
}

export interface InvoiceFormatGuide {
  slug: string;
  title: string;
  description: string;
  audience: string;
  intro: string;
  mustInclude: string[];
  example: GuideExample;
  taxNote: string;
  commonMistakes: string[];
  faq: GuideFaqItem[];
}
