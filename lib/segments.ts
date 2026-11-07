'use client';

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type DocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { firestore } from './firebase';
import { isGstRate } from './gst';
import { itemDocId, mergeSuggestions, type CatalogItem, type Suggestion } from './catalog';

/**
 * Segments (business types) and their product catalogues, plus each shop's
 * own remembered items. Mirrors wbillmobile/lib/data/catalog_repository.dart.
 *
 *   segments/{id}           name, itemCount, createdAt, updatedAt   — the list shown at signup
 *   segmentCatalogs/{id}    items: [{name, price, gst}], updatedAt  — one read per segment
 *   shops/{uid}/items/{id}  name, price, gst, updatedAt             — the shop's own items
 *
 * Any signed-in user can read segments and catalogues; only the super admin
 * writes them. A shop's owner and employees read and write its own items.
 */

export type Segment = { id: string; name: string; itemCount: number; createdAt: Date | null; updatedAt: Date | null };
export type ShopItem = CatalogItem & { id: string; updatedAt: Date | null };

const db = () => firestore();
const segmentsRef = () => collection(db(), 'segments');
const catalogRef = (id: string) => doc(db(), 'segmentCatalogs', id);
const shopItemsRef = (shopId: string) => collection(db(), 'shops', shopId, 'items');

function toDate(v: unknown): Date | null {
  const ts = v as Timestamp | undefined;
  return ts && typeof ts.toDate === 'function' ? ts.toDate() : null;
}

function segmentFromDoc(snap: DocumentSnapshot): Segment {
  const d = (snap.data() ?? {}) as Record<string, unknown>;
  return {
    id: snap.id,
    name: (d.name as string) ?? '',
    itemCount: Number(d.itemCount) || 0,
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

function itemFrom(raw: unknown): CatalogItem | null {
  const d = raw as Record<string, unknown> | null;
  if (!d || typeof d.name !== 'string' || !d.name) return null;
  const price = Number(d.price);
  const gst = Number(d.gst);
  return { name: d.name, price: Number.isInteger(price) && price >= 0 ? price : 0, gst: isGstRate(gst) ? gst : 0 };
}

/** Every segment, A–Z. */
export function watchSegments(onChange: (s: Segment[]) => void, onError: (e: Error) => void) {
  return onSnapshot(
    segmentsRef(),
    (snap) => onChange(snap.docs.map(segmentFromDoc).sort((a, b) => a.name.localeCompare(b.name))),
    onError,
  );
}

/** Live segment list for pickers; `null` while loading. Errors leave it empty. */
export function useSegments(enabled = true): Segment[] | null {
  const [segments, setSegments] = useState<Segment[] | null>(null);
  useEffect(() => {
    if (!enabled) return;
    return watchSegments(setSegments, () => setSegments([]));
  }, [enabled]);
  return segments;
}

export async function getSegmentCatalog(id: string): Promise<CatalogItem[]> {
  const snap = await getDoc(catalogRef(id));
  const items = (snap.data()?.items as unknown[]) ?? [];
  return items.map(itemFrom).filter((i): i is CatalogItem => i !== null);
}

// ── Super admin ────────────────────────────────────────────

/** Creates a segment with its catalogue (possibly empty). Returns the new id. */
export async function createSegment(name: string, items: CatalogItem[]): Promise<string> {
  const ref = doc(segmentsRef());
  const batch = writeBatch(db());
  batch.set(ref, { name, itemCount: items.length, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  batch.set(catalogRef(ref.id), { items, updatedAt: serverTimestamp() });
  await batch.commit();
  return ref.id;
}

/** Replaces a segment's whole catalogue (the caller has already merged). */
export async function saveSegmentCatalog(id: string, items: CatalogItem[]) {
  const batch = writeBatch(db());
  batch.update(doc(segmentsRef(), id), { itemCount: items.length, updatedAt: serverTimestamp() });
  batch.set(catalogRef(id), { items, updatedAt: serverTimestamp() });
  await batch.commit();
}

export async function renameSegment(id: string, name: string) {
  await updateDoc(doc(segmentsRef(), id), { name, updatedAt: serverTimestamp() });
}

/**
 * Deletes a segment and its catalogue. Shops that picked it keep the id,
 * which simply matches nothing any more (and drops off when they next save).
 */
export async function deleteSegment(id: string) {
  const batch = writeBatch(db());
  batch.delete(doc(segmentsRef(), id));
  batch.delete(catalogRef(id));
  await batch.commit();
}

// ── A shop's own items ─────────────────────────────────────

function shopItemFromDoc(snap: DocumentSnapshot): ShopItem | null {
  const item = itemFrom(snap.data());
  return item ? { ...item, id: snap.id, updatedAt: toDate(snap.data()?.updatedAt) } : null;
}

export function watchShopItems(shopId: string, onChange: (items: ShopItem[]) => void, onError: (e: Error) => void) {
  return onSnapshot(
    shopItemsRef(shopId),
    (snap) =>
      onChange(
        snap.docs
          .map(shopItemFromDoc)
          .filter((i): i is ShopItem => i !== null)
          .sort((a, b) => a.name.localeCompare(b.name)),
      ),
    onError,
  );
}

/** Adds or updates the shop's own items (keyed by name, so re-saving overwrites). */
export async function saveShopItems(shopId: string, items: CatalogItem[]) {
  for (let i = 0; i < items.length; i += 400) {
    const batch = writeBatch(db());
    for (const item of items.slice(i, i + 400)) {
      batch.set(doc(shopItemsRef(shopId), itemDocId(item.name)), { ...item, updatedAt: serverTimestamp() });
    }
    await batch.commit();
  }
}

export async function deleteShopItem(shopId: string, id: string) {
  await deleteDoc(doc(shopItemsRef(shopId), id));
}

/** Deletes every remembered item — for account deletion. */
export async function deleteAllShopItems(shopId: string) {
  const snap = await getDocs(shopItemsRef(shopId));
  for (let i = 0; i < snap.docs.length; i += 450) {
    const batch = writeBatch(db());
    for (const d of snap.docs.slice(i, i + 450)) batch.delete(d.ref);
    await batch.commit();
  }
}

/**
 * What the bill form suggests: the shop's own items plus the catalogues of
 * its segments. Loaded once when the form opens. Failures just mean fewer
 * suggestions — billing must never be blocked by them.
 */
export function useItemSuggestions(shopId: string | null, segmentIds: string[]): { suggestions: Suggestion[]; loading: boolean } {
  const [state, setState] = useState<{ key: string; suggestions: Suggestion[] } | null>(null);
  const key = `${shopId}|${segmentIds.join(',')}`;
  useEffect(() => {
    if (!shopId) return;
    let cancelled = false;
    const ids = key.split('|')[1].split(',').filter(Boolean);
    void (async () => {
      const [mine, segments, catalogs] = await Promise.all([
        getDocs(shopItemsRef(shopId))
          .then((s) => s.docs.map(shopItemFromDoc).filter((i): i is ShopItem => i !== null))
          .catch(() => [] as ShopItem[]),
        Promise.all(ids.map((id) => getDoc(doc(segmentsRef(), id)).then(segmentFromDoc).catch(() => null))),
        Promise.all(ids.map((id) => getSegmentCatalog(id).catch(() => [] as CatalogItem[]))),
      ]);
      if (cancelled) return;
      const suggestions = mergeSuggestions(
        mine,
        ids.map((id, i) => ({ segment: segments[i]?.name ?? '', items: catalogs[i] })),
      );
      setState({ key, suggestions });
    })();
    return () => {
      cancelled = true;
    };
  }, [shopId, key]);
  return state?.key === key ? { suggestions: state.suggestions, loading: false } : { suggestions: [], loading: Boolean(shopId) };
}
