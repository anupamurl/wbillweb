'use client';

import { buildBillPdf } from './billPdf';
export { preloadBillPdf } from './billPdf';
import { formatPaise } from './currency';
import { formatBillNo, type Bill, type Shop } from './models';

/** Same message as the app (S.shareMessage in wbillmobile/lib/core/strings.dart). */
export function shareText(shop: Shop, bill: Bill): string {
  return `Thank you for shopping at ${shop.name}.\nBill ${formatBillNo(bill.billNumber)} · Total ${formatPaise(bill.grandTotal)}`;
}

export function billFileName(bill: Bill): string {
  return `${formatBillNo(bill.billNumber)}.pdf`;
}

/** A WhatsApp chat with the customer, message typed in. Works on desktop (WhatsApp Web) and phones. */
export function whatsAppUrl(shop: Shop, bill: Bill): string {
  return `https://wa.me/91${bill.customerPhone}?text=${encodeURIComponent(shareText(shop, bill))}`;
}

export async function downloadBillPdf(shop: Shop, bill: Bill): Promise<void> {
  const blob = await buildBillPdf(shop, bill);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = billFileName(bill);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Opens the device share sheet with the PDF attached (phones, Windows, macOS
 * Safari). Where the browser can't share files it downloads the PDF instead,
 * and the caller offers the WhatsApp chat so the owner can attach it there.
 * Returns 'shared' | 'cancelled' | 'fallback'.
 */
export async function shareBillPdf(shop: Shop, bill: Bill): Promise<'shared' | 'cancelled' | 'fallback'> {
  const blob = await buildBillPdf(shop, bill);
  const file = new File([blob], billFileName(bill), { type: 'application/pdf' });
  const data: ShareData = { files: [file], text: shareText(shop, bill), title: `${shop.name} ${formatBillNo(bill.billNumber)}` };

  if (typeof navigator.canShare === 'function' && navigator.canShare(data)) {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return 'cancelled';
      // Fall through to the download + WhatsApp fallback.
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return 'fallback';
}
