'use client';

import Link from 'next/link';
import { useState } from 'react';
import Icon from '@/components/Icon';
import { updateShopBilling } from '@/lib/data';
import type { Shop } from '@/lib/models';
import { useSegments } from '@/lib/segments';
import { GstModePicker, SegmentPicker } from './BillingSetupFields';

/** Profile section: business types (for item suggestions) and GST mode. Owners only. */
export default function BillingSettings({ shop }: { shop: Shop }) {
  const segments = useSegments();
  // Only ids that still exist: a segment the admin deleted drops off on save.
  const [picked, setPicked] = useState<string[]>(shop.segments);
  const [gstMode, setGstMode] = useState(shop.gstMode);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const [error, setError] = useState('');

  const live = segments ? picked.filter((id) => segments.some((s) => s.id === id)) : picked;
  const dirty = gstMode !== shop.gstMode || [...live].sort().join() !== [...shop.segments].sort().join();

  async function save() {
    setSaving(true);
    setError('');
    try {
      await updateShopBilling(shop.id, { segments: live, gstMode });
      setSavedAt(Date.now());
    } catch {
      setError('Could not save. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <h2 className="text-base font-semibold text-ink">Products &amp; GST</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Choose what you sell to get product suggestions on new bills. Items you bill are remembered under{' '}
        <Link href="/dashboard/items" className="font-medium text-primary hover:underline">
          My items
        </Link>
        .
      </p>
      <div className="mt-5 flex flex-col gap-5">
        <SegmentPicker segments={segments} value={picked} onChange={setPicked} disabled={saving} />
        <GstModePicker value={gstMode} onChange={setGstMode} disabled={saving} />
        {error && <p className="text-sm text-error">{error}</p>}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="wb-btn wb-btn-md bg-primary text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-primary/25 disabled:translate-y-0 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {savedAt > 0 && !saving && !dirty && (
            <span className="flex items-center gap-1.5 text-sm text-success">
              <Icon name="check" className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
