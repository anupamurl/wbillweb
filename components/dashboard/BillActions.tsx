'use client';

import { useEffect, useState } from 'react';
import Icon, { type IconName } from '@/components/Icon';
import { useDashboard } from '@/lib/DashboardContext';
import { downloadBillPdf, preloadBillPdf, shareBillPdf, whatsAppUrl } from '@/lib/billShare';
import type { Bill } from '@/lib/models';

/**
 * Share (device share sheet with the PDF), WhatsApp (chat with the
 * customer, message typed in) and Download (PDF). `compact` = icon buttons
 * for table rows; otherwise labelled buttons for the bill page.
 */
export default function BillActions({ bill, compact = false }: { bill: Bill; compact?: boolean }) {
  const { shop } = useDashboard();
  const [busy, setBusy] = useState<'' | 'share' | 'download'>('');
  const [note, setNote] = useState('');

  useEffect(() => {
    preloadBillPdf();
  }, []);

  if (!shop) return null;
  const current = shop;

  async function run(kind: 'share' | 'download') {
    setBusy(kind);
    setNote('');
    try {
      if (kind === 'download') {
        await downloadBillPdf(current, bill);
      } else {
        const result = await shareBillPdf(current, bill);
        if (result === 'fallback') setNote('PDF downloaded. Attach it in WhatsApp using the WhatsApp button.');
      }
    } catch {
      setNote('Could not create the PDF. Check your connection and try again.');
    } finally {
      setBusy('');
    }
  }

  const btn = compact
    ? 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50'
    : 'wb-btn wb-btn-md gap-2 border border-border bg-surface text-ink hover:border-primary/50 hover:text-primary disabled:opacity-60';

  const label = (icon: IconName, text: string, spinning: boolean) => (
    <>
      {spinning ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Icon name={icon} className="h-4 w-4" />
      )}
      {!compact && <span>{text}</span>}
    </>
  );

  return (
    <div className={compact ? 'flex flex-col items-end' : 'flex flex-col gap-2'}>
      <div className={compact ? 'flex items-center justify-end gap-0.5' : 'flex flex-wrap gap-2'}>
        <button
          type="button"
          onClick={() => run('share')}
          disabled={busy !== ''}
          className={compact ? btn : `${btn} !border-primary bg-primary !text-white hover:!bg-primary/90`}
          title="Share bill PDF"
          aria-label={`Share ${bill.customerName || 'bill'} PDF`}
        >
          {label('share', 'Share', busy === 'share')}
        </button>
        {bill.customerPhone && (
        <a
          href={whatsAppUrl(current, bill)}
          target="_blank"
          rel="noopener noreferrer"
          className={btn}
          title="Send on WhatsApp"
          aria-label="Send on WhatsApp"
        >
          {label('chat', 'WhatsApp', false)}
        </a>
        )}
        <button
          type="button"
          onClick={() => run('download')}
          disabled={busy !== ''}
          className={btn}
          title="Download PDF"
          aria-label="Download PDF"
        >
          {label('download', 'Download PDF', busy === 'download')}
        </button>
      </div>
      {note && <p className={`text-xs ${note.startsWith('Could') ? 'text-error' : 'text-ink-soft'} ${compact ? 'max-w-[14rem] text-right' : ''}`}>{note}</p>}
    </div>
  );
}
