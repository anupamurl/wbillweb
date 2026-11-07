import { writeXlsx, type Rows } from './sheet';
import { SAMPLE_ROWS, type CatalogItem } from './catalog';

/** Saves a Blob as a file from the browser. */
export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export function downloadXlsx(filename: string, rows: Rows, widths?: number[]) {
  downloadBlob(filename, new Blob([writeXlsx(rows, { sheetName: 'Products', widths }) as BlobPart], { type: XLSX_TYPE }));
}

/** The sample sheet shown on the admin Segments page. */
export function downloadSampleSheet() {
  downloadXlsx('wbill-products-sample.xlsx', SAMPLE_ROWS, [36, 12, 8]);
}

/** A segment's products in the same format, ready to edit and upload again. */
export function downloadCatalog(filename: string, items: CatalogItem[]) {
  downloadXlsx(filename, [SAMPLE_ROWS[0], ...items.map((i) => [i.name, i.price / 100, i.gst])], [36, 12, 8]);
}
