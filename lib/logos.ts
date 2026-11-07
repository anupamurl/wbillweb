/**
 * Shop logos. `shops/{uid}.logo` is either:
 *   - `preset:<id>`  — one of PRESET_LOGOS below, or
 *   - `data:image/png|jpeg;base64,…` — an uploaded image, resized in the
 *     browser to at most LOGO_MAX_PX so the shop doc stays small.
 * Missing / empty means "no logo".
 *
 * Keep PRESET_LOGOS in sync with wbillmobile/lib/core/logos.dart — the app
 * draws the same SVGs on the bill PDF it shares on WhatsApp.
 * Keep the size limit in sync with firestore.rules (validShopFields).
 */

export type PresetLogo = { id: string; label: string; bg: string; paths: string };

export const PRESET_LOGOS: PresetLogo[] = [
  { id: 'store', label: 'Store', bg: '#0F62FE', paths: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9h18"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/>' },
  { id: 'bag', label: 'Shopping bag', bg: '#8A3FFC', paths: '<path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/>' },
  { id: 'cart', label: 'Grocery cart', bg: '#198038', paths: '<path d="M3 4h2l2.5 11h11L21 7H6.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>' },
  { id: 'mobile', label: 'Mobiles', bg: '#002D9C', paths: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>' },
  { id: 'medical', label: 'Pharmacy', bg: '#DA1E28', paths: '<path d="M12 5v14"/><path d="M5 12h14"/>' },
  { id: 'cafe', label: 'Food & café', bg: '#B45309', paths: '<path d="M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9z"/><path d="M16 11h2a2 2 0 0 1 0 4h-2"/><path d="M8 3v3"/><path d="M12 3v3"/>' },
  { id: 'shirt', label: 'Clothing', bg: '#D02670', paths: '<path d="M8 4L3 7l2 4 2-1v10h10V10l2 1 2-4-5-3a4 4 0 0 1-8 0z"/>' },
  { id: 'scissors', label: 'Salon', bg: '#6929C4', paths: '<circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><path d="M8.5 8.5L20 18"/><path d="M8.5 15.5L20 6"/>' },
  { id: 'bolt', label: 'Electricals', bg: '#F1C21B', paths: '<path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z"/>' },
  { id: 'gem', label: 'Jewellery', bg: '#007D79', paths: '<path d="M6 4h12l3 5-9 11L3 9l3-5z"/><path d="M3 9h18"/><path d="M12 20L8 9l2-5"/><path d="M12 20l4-11-2-5"/>' },
  { id: 'leaf', label: 'Fresh & organic', bg: '#24A148', paths: '<path d="M5 19C5 10 11 5 19 5c0 8-5 14-14 14z"/><path d="M5 19l8-8"/>' },
  { id: 'book', label: 'Stationery', bg: '#393939', paths: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>' },
];

/** Full standalone SVG for a preset: coloured rounded square, white line icon. */
export function presetSvg(p: PresetLogo): string {
  const stroke = p.id === 'bolt' ? '#161616' : '#FFFFFF';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">` +
    `<rect width="64" height="64" rx="14" fill="${p.bg}"/>` +
    `<g transform="translate(14 14) scale(1.5)" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p.paths}</g>` +
    `</svg>`
  );
}

export function findPreset(logo: string | undefined | null): PresetLogo | undefined {
  if (!logo?.startsWith('preset:')) return undefined;
  const id = logo.slice('preset:'.length);
  return PRESET_LOGOS.find((p) => p.id === id);
}

/** A URL an <img> can show for a stored logo value, or null for "no logo". */
export function logoSrc(logo: string | undefined | null): string | null {
  if (!logo) return null;
  const preset = findPreset(logo);
  if (preset) return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(presetSvg(preset))}`;
  if (/^data:image\/(png|jpeg);base64,/.test(logo)) return logo;
  return null;
}

export const LOGO_MAX_PX = 256;
/** Characters, matches the Firestore rule. ~150 KB of image. */
export const LOGO_MAX_CHARS = 200_000;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * Reads an image file, scales it to fit LOGO_MAX_PX, and returns a data URL.
 * PNG keeps transparency; if that's too big it falls back to JPEG on white.
 * Output is PNG/JPEG only because the app's PDF library can't embed WebP.
 */
export async function imageFileToLogo(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file (PNG, JPG or WebP).');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('That image is over 10 MB. Choose a smaller one.');

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not read that image. Try a PNG or JPG.'));
      el.src = url;
    });
    const scale = Math.min(1, LOGO_MAX_PX / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Your browser could not process the image.');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);

    let out = canvas.toDataURL('image/png');
    if (out.length > LOGO_MAX_CHARS) {
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);
      for (const q of [0.9, 0.8, 0.65, 0.5]) {
        out = canvas.toDataURL('image/jpeg', q);
        if (out.length <= LOGO_MAX_CHARS) break;
      }
    }
    if (out.length > LOGO_MAX_CHARS) throw new Error('That image is too detailed to use as a logo. Try a simpler one.');
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}
