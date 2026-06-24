export function parseNumber(val: string | number | undefined): number {
  if (!val && val !== 0) return 0;
  return parseFloat(String(val).replace(/[^-0-9.,]/g, '').replace(',', '.')) || 0;
}

export function extractInn(text: string | undefined): string {
  if (!text) return '';
  const m = text.match(/\b(\d{10}|\d{12})\b/);
  return m ? m[1] : '';
}

export function extractName(text: string | undefined): string {
  if (!text) return '';
  return text.replace(/ИНН\s*/i, '').replace(/["«»]/g, '"').replace(/\s+/g, ' ').trim();
}

export function normalizeDate(val: string | undefined): string {
  if (!val) return '';
  const cleaned = val.replace(/[^\d.]/g, '').trim();
  const parts = cleaned.split('.');
  if (parts.length === 3) {
    if (parts[0].length === 4) return cleaned;
    return parts[2] + '-' + parts[1].padStart(2, '0') + '-' + parts[0].padStart(2, '0');
  }
  return cleaned;
}
