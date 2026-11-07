import type { DocumentSnapshot, Timestamp } from 'firebase/firestore';
import { asGstMode, type GstMode } from './gst';

/** Mirrors wbillmobile/lib/models/shop.dart. `shops/{uid}`. */
export type Shop = {
  id: string;
  name: string;
  address: string;
  phone: string;
  ownerPhone: string;
  nextBillNumber: number;
  /** `preset:<id>` or a PNG/JPEG data URL; '' = no logo. See lib/logos.ts. */
  logo: string;
  /** Segment ids (business types) the owner picked; drive item suggestions. */
  segments: string[];
  /** How prices and GST work on this shop's bills. See lib/gst.ts. */
  gstMode: GstMode;
  /** Optional GST number, printed on bills; '' when not set. See lib/gstin.ts. */
  gstin: string;
};

export function shopFromDoc(doc: DocumentSnapshot): Shop | null {
  if (!doc.exists()) return null;
  const d = doc.data() as Record<string, unknown>;
  return {
    id: doc.id,
    name: (d.name as string) ?? '',
    address: (d.address as string) ?? '',
    phone: (d.phone as string) ?? '',
    ownerPhone: (d.ownerPhone as string) ?? '',
    nextBillNumber: typeof d.nextBillNumber === 'number' ? d.nextBillNumber : 1,
    logo: typeof d.logo === 'string' ? d.logo : '',
    segments: Array.isArray(d.segments) ? (d.segments as unknown[]).filter((x): x is string => typeof x === 'string') : [],
    gstMode: asGstMode(d.gstMode),
    gstin: typeof d.gstin === 'string' ? d.gstin : '',
  };
}

export type BillItem = {
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  /** GST % on this line; 0 on bills from before GST. */
  gstRate: number;
  /** GST in paise on this line (inside lineTotal when inclusive, on top when exclusive). */
  gstAmount: number;
};

/** Mirrors wbillmobile/lib/models/bill.dart. `shops/{uid}/bills/{id}`. */
export type Bill = {
  id: string;
  billNumber: number;
  date: Date;
  customerName: string;
  customerPhone: string;
  items: BillItem[];
  subtotal: number;
  /** Sum of the lines' GST; 0 on bills without GST. */
  gstTotal: number;
  /** The shop's GST mode when the bill was made; '' on bills from before GST. */
  gstMode: GstMode | '';
  grandTotal: number;
  status: 'active';
  /** Auth uid of whoever made it; '' on bills from before employees existed (the owner). */
  createdBy: string;
  /** 'Owner' or the employee's name at the time. */
  createdByName: string;
};

export function billFromDoc(doc: DocumentSnapshot): Bill {
  const d = doc.data() as Record<string, unknown>;
  const items = ((d.items as Record<string, unknown>[]) ?? []).map((i) => ({
    name: (i.name as string) ?? '',
    qty: Number(i.qty) || 0,
    unitPrice: Number(i.unitPrice) || 0,
    lineTotal: Number(i.lineTotal) || 0,
    gstRate: Number(i.gstRate) || 0,
    gstAmount: Number(i.gstAmount) || 0,
  }));
  return {
    id: doc.id,
    billNumber: Number(d.billNumber) || 0,
    date: toDate(d.date),
    customerName: (d.customerName as string) ?? '',
    customerPhone: (d.customerPhone as string) ?? '',
    items,
    subtotal: Number(d.subtotal) || 0,
    gstTotal: Number(d.gstTotal) || 0,
    gstMode: d.gstMode === 'inclusive' || d.gstMode === 'exclusive' || d.gstMode === 'none' ? d.gstMode : '',
    grandTotal: Number(d.grandTotal) || 0,
    status: 'active',
    createdBy: (d.createdBy as string) ?? '',
    createdByName: (d.createdByName as string) ?? '',
  };
}

function toDate(value: unknown): Date {
  const ts = value as Timestamp | undefined;
  return ts && typeof ts.toDate === 'function' ? ts.toDate() : new Date();
}

export function formatBillNo(n: number): string {
  return `WB-${String(n).padStart(4, '0')}`;
}
