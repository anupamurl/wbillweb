import type { IconName } from '@/components/Icon';
import type { GuideFaqItem } from './types';

/**
 * Business types wbill is for. Every entry appears in the homepage
 * "Who it's for" grid. Entries with `page` also get their own landing page
 * at /<slug>/ — each one has its own sample bill and FAQs, because the
 * shape of the bill is what differs between businesses (avoid near-copies:
 * thin, mass-produced pages are against Google's scaled-content policy).
 * Entries without a page link to the matching free bill-format guide.
 */

export interface BusinessBillLine {
  name: string;
  /** Shown under the item name, e.g. size, IMEI, vehicle number. */
  detail?: string;
  qty: number;
  rate: number;
  /** Labour / service lines are tagged so the bill shows items and work side by side. */
  kind?: 'item' | 'service';
}

export interface BusinessPage {
  /** SEO title (the layout appends "| wbill - Digital Billing App"). */
  title: string;
  description: string;
  h1: string;
  /** One Hinglish line under the H1, written the way owners talk. */
  hinglish: string;
  intro: string;
  sampleBill: {
    businessName: string;
    place: string;
    customerName: string;
    lines: BusinessBillLine[];
    discount?: number;
    status: 'Paid' | 'Pending';
    note?: string;
  };
  /** What a bill for this business needs, in plain words. */
  billNeeds: Array<{ title: string; body: string }>;
  faq: GuideFaqItem[];
}

export interface Business {
  slug: string;
  label: string;
  /** Short line under the label in the grid. */
  examples: string;
  icon: IconName;
  group: 'shop' | 'service';
  /** Matching free bill-format guide, if one exists. */
  guideSlug?: string;
  page?: BusinessPage;
}

export const businesses: Business[] = [
  {
    slug: 'kirana-billing-app',
    label: 'Kirana & general store',
    examples: 'Grocery, provision, dairy',
    icon: 'store',
    group: 'shop',
    guideSlug: 'kirana-shop',
    page: {
      title: 'Kirana Billing App — Make Grocery Bills on Your Phone',
      description:
        'Free kirana billing app for Indian grocery and general stores. Add items by kg, litre or piece, make a bill in seconds and send it on WhatsApp. No GST number needed.',
      h1: 'Billing app for kirana and general stores',
      hinglish: 'Dukaan ka bill phone se banao, grahak ko WhatsApp pe bhejo.',
      intro:
        'A kirana bill is many small items, each with its own quantity and rate — 5 kg atta, 1 litre oil, 2 packets of biscuits. wbill keeps your regular items saved, so a bill is a few taps, and the customer gets a clean PDF on WhatsApp instead of a slip that gets lost.',
      sampleBill: {
        businessName: 'Gupta General Store',
        place: 'Rajajipuram, Lucknow',
        customerName: 'Sunita Verma',
        lines: [
          { name: 'Atta', detail: 'kg', qty: 10, rate: 38 },
          { name: 'Mustard oil', detail: '1 litre bottle', qty: 2, rate: 165 },
          { name: 'Toor dal', detail: 'kg', qty: 2, rate: 140 },
          { name: 'Sugar', detail: 'kg', qty: 3, rate: 44 },
          { name: 'Washing powder', detail: '1 kg pack', qty: 1, rate: 110 },
        ],
        status: 'Pending',
        note: 'Monthly ration — pay on the 1st.',
      },
      billNeeds: [
        { title: 'Many items, fast', body: 'Save atta, rice, oil, dal and your other regular items once with their rate (Starter plan and up). After that, a bill is tap, quantity, tap.' },
        { title: 'Quantity in kg, litre or piece', body: 'Write the unit in the item name or description — "Atta (kg)", "Milk (litre)" — and enter the quantity. The total is worked out for you.' },
        { title: 'Paid or pending', body: 'Mark a bill paid, or keep it pending for customers who pay at the end of the month, so you always know who still has to pay.' },
        { title: 'No GST number needed', body: 'Most small kirana stores give a simple bill. If you are GST registered, add your GSTIN and a tax rate on each item.' },
      ],
      faq: [
        { question: 'Can I keep a monthly bill for regular customers?', answer: 'Yes. Make the bill and leave it pending. Every pending bill stays under the customer’s name, so at the end of the month you can see what they owe and send the bills again on WhatsApp.' },
        { question: 'Do I have to type every item each time?', answer: 'No. On paid plans, save your regular items with their rate once. Then pick them from your list and change only the quantity.' },
        { question: 'Can I give a discount or round off the total?', answer: 'Yes. Add a discount to the bill and the total updates.' },
        { question: 'Does it work with barcodes or a thermal printer?', answer: 'Not at launch. wbill is built for quick bills on your phone sent on WhatsApp. Tell us from your dashboard if you need a printer — it helps us plan.' },
      ],
    },
  },
  {
    slug: 'hardware-shop-billing-app',
    label: 'Hardware & paint shop',
    examples: 'Electrical, sanitary, paint',
    icon: 'wrench',
    group: 'shop',
    page: {
      title: 'Hardware Shop Billing App — Items + Fitting Charges on One Bill',
      description:
        'Billing app for hardware, electrical, sanitary and paint shops. Bill items by piece, metre or kg plus a fitting charge on one bill, and send it as PDF on WhatsApp.',
      h1: 'Billing app for hardware and paint shops',
      hinglish: 'Saaman aur fitting charge, ek hi bill mein.',
      intro:
        'Hardware bills mix items sold by the piece, the metre and the kilo — and often a fitting or cutting charge too. wbill puts all of it on one clear bill, with the rate for each line, and sends it to your customer on WhatsApp.',
      sampleBill: {
        businessName: 'Sharma Hardware Store',
        place: 'Malviya Nagar, Jaipur',
        customerName: 'Ramesh Kumar',
        lines: [
          { name: 'MCB switch, 16A', qty: 2, rate: 180 },
          { name: 'Wire, 1.5 mm', detail: 'metre', qty: 10, rate: 25 },
          { name: 'Fitting charge', detail: 'Labour', qty: 1, rate: 300, kind: 'service' },
        ],
        discount: 30,
        status: 'Paid',
      },
      billNeeds: [
        { title: 'Piece, metre, kg or litre', body: 'Write the unit with the item — "Wire (metre)", "Putty (kg)", "Paint (litre)" — and enter the quantity.' },
        { title: 'Items and labour together', body: 'Add a fitting, cutting or delivery charge as its own line, next to the items. The customer sees exactly what they paid for.' },
        { title: 'Contractor bills', body: 'Electricians, plumbers and painters who buy from you on credit can have their bills kept pending under their name.' },
        { title: 'GST when you need it', body: 'Add your GSTIN and a rate on each item for a GST bill, or leave it off for a simple bill.' },
      ],
      faq: [
        { question: 'Can I add a fitting or delivery charge?', answer: 'Yes. Add it as a separate line with its own amount, next to the items, on the same bill.' },
        { question: 'Can different items have different GST rates?', answer: 'Yes. If you make GST bills, set the rate on each item and wbill works out the tax line by line.' },
        { question: 'Can I see what a contractor owes me?', answer: 'Yes. Keep their bills pending. All pending bills stay under their name, so you can see the total and send them again on WhatsApp.' },
        { question: 'Can I save items I sell often?', answer: 'Yes, on paid plans you can save your items and services with their rate, so you pick them instead of typing.' },
      ],
    },
  },
  {
    slug: 'mobile-shop-billing-app',
    label: 'Mobile & electronics shop',
    examples: 'Phones, accessories, appliances',
    icon: 'phone',
    group: 'shop',
    page: {
      title: 'Mobile Shop Billing App — IMEI and Warranty on Every Bill',
      description:
        'Billing app for mobile, electronics and appliance shops. Put IMEI or serial number on the bill, add repair or installation charges, and send the PDF on WhatsApp.',
      h1: 'Billing app for mobile, electronics and appliance shops',
      hinglish: 'IMEI bill pe, sticky note pe nahi.',
      intro:
        'When a customer comes back with a faulty phone or a warranty claim, the first thing you need is the right bill — with the IMEI or serial number and the date. wbill keeps that on the bill itself, saved under the customer’s name, and sends it to them on WhatsApp.',
      sampleBill: {
        businessName: 'Kumar Mobile & Electronics',
        place: 'Lajpat Nagar, New Delhi',
        customerName: 'Riya Mehta',
        lines: [
          { name: 'Smartphone 8 GB / 128 GB, blue', detail: 'IMEI 35 209876 543210 1 · 12 months warranty', qty: 1, rate: 18643 },
          { name: 'Tempered glass + back cover', qty: 1, rate: 399 },
          { name: 'Data transfer and setup', detail: 'Service', qty: 1, rate: 100, kind: 'service' },
        ],
        status: 'Paid',
      },
      billNeeds: [
        { title: 'IMEI and serial number on the bill', body: 'At launch, write the IMEI or serial number in the item description and it is printed on the bill. Dedicated fields are coming later.' },
        { title: 'Repairs and installation', body: 'Add a repair, installation or setup charge as its own line, next to the product.' },
        { title: 'Find any old bill in seconds', body: 'Search by the customer’s name and every bill you have given them is there, with the PDF one tap away.' },
        { title: 'Warranty tracking — coming later', body: 'Warranty periods with expiry reminders are on the roadmap. Until then, the warranty is written on the bill.' },
      ],
      faq: [
        { question: 'Can I put the IMEI number on the bill?', answer: 'Yes. Write it in the item description and it appears on the PDF bill. Separate IMEI and serial fields are planned.' },
        { question: 'Can I make a bill for a phone repair?', answer: 'Yes. Add the parts as items and the repair charge as a service line on the same bill.' },
        { question: 'Can I make GST bills?', answer: 'Yes. Add your GSTIN to your business profile and set the GST rate on each item.' },
        { question: 'Does wbill track warranty expiry?', answer: 'Not at launch. Warranty tracking with reminders is coming later. Today you can write the warranty period on the bill.' },
      ],
    },
  },
  {
    slug: 'clothing-shop-billing-app',
    label: 'Clothing & footwear',
    examples: 'Garments, sarees, shoes',
    icon: 'shirt',
    group: 'shop',
    page: {
      title: 'Clothing Shop Billing App — Sizes, Discounts and WhatsApp Bills',
      description:
        'Billing app for garment, saree and footwear shops. Add size and colour on each line, give a discount, write your exchange rule and send the bill on WhatsApp.',
      h1: 'Billing app for clothing and footwear shops',
      hinglish: 'Size, colour aur discount — sab bill pe, seedha WhatsApp pe.',
      intro:
        'Clothing bills need the size and colour on each line, a discount during sales, and your exchange rule so there is no argument later. wbill puts it all on a clean bill your customer keeps on WhatsApp — handy when they come back to exchange.',
      sampleBill: {
        businessName: 'Lakshmi Garments',
        place: 'T. Nagar, Chennai',
        customerName: 'Priya S.',
        lines: [
          { name: 'Cotton kurti', detail: 'Size M · Blue', qty: 2, rate: 650 },
          { name: 'Leggings', detail: 'Size M · Black', qty: 2, rate: 280 },
          { name: 'Dupatta', detail: 'Printed', qty: 1, rate: 350 },
        ],
        discount: 160,
        status: 'Paid',
        note: 'Exchange within 7 days with this bill. No exchange on sale items.',
      },
      billNeeds: [
        { title: 'Size and colour on each line', body: 'Write the size and colour in the item description, so the bill matches what the customer took home.' },
        { title: 'Sale discounts', body: 'Add a discount on the bill and the total updates. The customer sees what they saved.' },
        { title: 'Exchange rule on the bill', body: 'Write your exchange or return rule in the bill note. It goes with every PDF.' },
        { title: 'Bill always findable', body: 'When the customer comes back to exchange, search their name and the bill is there.' },
      ],
      faq: [
        { question: 'Can I add size and colour?', answer: 'Yes. Write them in the item description and they appear on the bill.' },
        { question: 'Can I write my exchange policy on the bill?', answer: 'Yes. Add it as a note and it is printed on the PDF.' },
        { question: 'Can I give a discount on the whole bill?', answer: 'Yes. Add a discount and the total updates.' },
        { question: 'Do I need GST to use wbill?', answer: 'No. Make a simple bill without GST, or add your GSTIN for GST bills.' },
      ],
    },
  },
  {
    slug: 'salon-billing-app',
    label: 'Salon & beauty parlour',
    examples: 'Hair, beauty, spa',
    icon: 'scissors',
    group: 'service',
    page: {
      title: 'Salon Billing App — Service Bills on WhatsApp',
      description:
        'Billing app for salons and beauty parlours. Save your service menu with rates, make a bill in seconds after each client and send it on WhatsApp. No GST number needed.',
      h1: 'Billing app for salons and beauty parlours',
      hinglish: 'Service ka bill, client ke jaane se pehle WhatsApp pe.',
      intro:
        'A salon bill is a list of services, not products — haircut, facial, threading — sometimes with a product sold on the side. Save your service menu once, and the bill is ready before the client stands up from the chair.',
      sampleBill: {
        businessName: 'Glow Unisex Salon',
        place: 'Kothrud, Pune',
        customerName: 'Neha Joshi',
        lines: [
          { name: 'Haircut and blow-dry', qty: 1, rate: 450, kind: 'service' },
          { name: 'Fruit facial', qty: 1, rate: 800, kind: 'service' },
          { name: 'Eyebrow threading', qty: 1, rate: 60, kind: 'service' },
          { name: 'Hair serum, 100 ml', qty: 1, rate: 299 },
        ],
        discount: 100,
        status: 'Paid',
      },
      billNeeds: [
        { title: 'Your service menu, saved', body: 'Save each service with its rate once. Pick from the list — no typing while the next client waits.' },
        { title: 'Services and products together', body: 'Sell a serum or shampoo? Add it on the same bill as the services.' },
        { title: 'Offers and packages', body: 'Give a discount on the bill, and the client sees what they saved.' },
        { title: 'Client history', body: 'Search a client’s name to see their past bills — useful when they ask "what did I get last time?"' },
      ],
      faq: [
        { question: 'Can I save my service rates?', answer: 'Yes, on paid plans you can save services with their rates and pick them for each bill.' },
        { question: 'Can I see a client’s past visits?', answer: 'Yes. Every bill is saved under the client’s name. Search their name to see them all.' },
        { question: 'Can I add products to a service bill?', answer: 'Yes. Services and products can be on the same bill.' },
        { question: 'Can I book appointments in wbill?', answer: 'No. wbill is for bills. Appointment booking is not part of the app.' },
      ],
    },
  },
  {
    slug: 'tailor-billing-app',
    label: 'Tailor & boutique',
    examples: 'Stitching, alteration',
    icon: 'scissors',
    group: 'service',
    page: {
      title: 'Tailor Billing App — Stitching Bills With Advance and Delivery Date',
      description:
        'Billing app for tailors and boutiques. Bill stitching and alteration charges, note the advance paid and delivery date, and send the bill to your customer on WhatsApp.',
      h1: 'Billing app for tailors and boutiques',
      hinglish: 'Silai ka bill, advance aur delivery date ke saath.',
      intro:
        'A tailoring order is taken today and delivered next week, often with an advance in between. The paper slip with the order number is what customers always lose. With wbill, the bill — with the work, the advance and the delivery date — is on their WhatsApp.',
      sampleBill: {
        businessName: 'New Style Tailors',
        place: 'Sector 15, Chandigarh',
        customerName: 'Harpreet Kaur',
        lines: [
          { name: 'Salwar suit stitching', detail: 'With lining', qty: 2, rate: 650, kind: 'service' },
          { name: 'Blouse stitching', detail: 'Padded', qty: 1, rate: 550, kind: 'service' },
          { name: 'Pant length alteration', qty: 2, rate: 80, kind: 'service' },
        ],
        status: 'Pending',
        note: 'Advance ₹1,000 received. Delivery on 12 Nov. Please bring this bill.',
      },
      billNeeds: [
        { title: 'Stitching and alteration charges', body: 'Each piece of work is a line with its own rate — stitching, lining, alteration.' },
        { title: 'Advance and balance', body: 'Write the advance in the bill note and keep the bill pending until delivery.' },
        { title: 'Delivery date', body: 'Put the delivery date in the note, so the customer has it on WhatsApp.' },
        { title: 'Measurements', body: 'Write key measurements in the item description, so they stay with the order.' },
      ],
      faq: [
        { question: 'How do I show the advance payment?', answer: 'Write the advance in the bill note and keep the bill pending. Mark it paid when the customer collects.' },
        { question: 'Can I add the delivery date?', answer: 'Yes. Write it in the bill note and it is printed on the PDF.' },
        { question: 'Can I keep measurements on the bill?', answer: 'Yes. Write them in the item description for that piece of work.' },
        { question: 'Is wbill only for big boutiques?', answer: 'No. It is made for a single tailor working from a small shop, with just a phone.' },
      ],
    },
  },
  {
    slug: 'mechanic-billing-app',
    label: 'Bike & car mechanic',
    examples: 'Garage, service centre',
    icon: 'wrench',
    group: 'service',
    page: {
      title: 'Mechanic Billing App — Parts + Labour Bills for Garages',
      description:
        'Billing app for bike and car mechanics and garages. Put the vehicle number, parts and labour on one bill and send it on WhatsApp. Works with or without GST.',
      h1: 'Billing app for bike and car mechanics',
      hinglish: 'Parts aur labour, gaadi number ke saath — ek bill mein.',
      intro:
        'A garage bill is parts plus labour, for one vehicle. Customers want to see what was changed and what the work cost. wbill puts the vehicle number, every part and the labour charge on one bill, and keeps it under the customer’s name for the next service.',
      sampleBill: {
        businessName: 'Ravi Auto Works',
        place: 'Gandhinagar, Ahmedabad',
        customerName: 'Vikram Patel',
        lines: [
          { name: 'Engine oil, 1 litre', detail: 'Vehicle GJ 01 AB 1234', qty: 1, rate: 420 },
          { name: 'Brake shoe set', qty: 1, rate: 350 },
          { name: 'Spark plug', qty: 1, rate: 120 },
          { name: 'General service labour', qty: 1, rate: 400, kind: 'service' },
        ],
        status: 'Paid',
        note: 'Next service at 15,000 km.',
      },
      billNeeds: [
        { title: 'Parts and labour, clearly split', body: 'Each part is a line, and the labour is its own line. No more arguing about what was charged for.' },
        { title: 'Vehicle number on the bill', body: 'Write the vehicle number in the description or note so the bill is tied to the vehicle.' },
        { title: 'Service history', body: 'Search the customer’s name to see every past service bill for their vehicle.' },
        { title: 'Next service reminder on the bill', body: 'Write the next service date or km in the note, so the customer has it on WhatsApp.' },
      ],
      faq: [
        { question: 'Can I show parts and labour separately?', answer: 'Yes. Add each part as an item and the labour as a service line on the same bill.' },
        { question: 'Where do I put the vehicle number?', answer: 'In the item description or the bill note. It is printed on the PDF.' },
        { question: 'Can I see a customer’s past services?', answer: 'Yes. All bills are saved under the customer’s name.' },
        { question: 'Can I make GST bills for company vehicles?', answer: 'Yes. Add your GSTIN and the GST rate on each line.' },
      ],
    },
  },
  {
    slug: 'electrician',
    label: 'Electrician',
    examples: 'Wiring, repair, fitting',
    icon: 'bolt',
    group: 'service',
    guideSlug: 'electrician',
  },
  {
    slug: 'plumber',
    label: 'Plumber',
    examples: 'Pipes, taps, leaks',
    icon: 'tap',
    group: 'service',
    guideSlug: 'plumber',
  },
  {
    slug: 'ac-service',
    label: 'AC & appliance repair',
    examples: 'AC, RO, fridge service',
    icon: 'fan',
    group: 'service',
    guideSlug: 'ac-service',
  },
  {
    slug: 'painter-carpenter',
    label: 'Painter & carpenter',
    examples: 'Paint, furniture, polish',
    icon: 'brush',
    group: 'service',
    guideSlug: 'simple-bill-format',
  },
];

export const businessPages = businesses.filter(
  (business): business is Business & { page: BusinessPage } => Boolean(business.page),
);

/** Where a business tile links: its own page, else its bill-format guide. */
export function businessHref(business: Business) {
  if (business.page) return `/${business.slug}/`;
  if (business.guideSlug) return `/invoice-format/${business.guideSlug}/`;
  return '/#start';
}
