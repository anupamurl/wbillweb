import type { DocumentSnapshot, Timestamp } from 'firebase/firestore';

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
  };
}

export type BillItem = { name: string; qty: number; unitPrice: number; lineTotal: number };

/** Mirrors wbillmobile/lib/models/bill.dart. `shops/{uid}/bills/{id}`. */
export type Bill = {
  id: string;
  billNumber: number;
  date: Date;
  customerName: string;
  customerPhone: string;
  items: BillItem[];
  subtotal: number;
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
  }));
  return {
    id: doc.id,
    billNumber: Number(d.billNumber) || 0,
    date: toDate(d.date),
    customerName: (d.customerName as string) ?? '',
    customerPhone: (d.customerPhone as string) ?? '',
    items,
    subtotal: Number(d.subtotal) || 0,
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
