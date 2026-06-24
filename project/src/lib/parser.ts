import type { ParsedStatement, StatementDocument } from '@/types';

export function parse1CClientBankExchange(text: string): ParsedStatement {
  const lines = text.split(/\r?\n/);
  const result: ParsedStatement = { header: {}, documents: [] };
  let currentDoc: Record<string, string> | null = null;
  let inDocument = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (!inDocument) {
      if (trimmed === '1CClientBankExchange') continue;
      if (trimmed === 'СекцияДокумент=Платежное поручение' || trimmed === 'СекцияДокумент=Платежный ордер') {
        inDocument = true;
        currentDoc = {};
        continue;
      }
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        result.header[trimmed.substring(0, eqIdx).trim()] = trimmed.substring(eqIdx + 1).trim();
      }
    } else {
      if (trimmed === 'КонецДокумента') {
        if (currentDoc) result.documents.push(currentDoc as unknown as StatementDocument);
        currentDoc = null;
        inDocument = false;
        continue;
      }
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0 && currentDoc) {
        currentDoc[trimmed.substring(0, eqIdx).trim()] = trimmed.substring(eqIdx + 1).trim();
      }
    }
  }
  return result;
}

export function parseTXT(text: string): ParsedStatement {
  const lines = text.split(/\r?\n/);
  const documents: StatementDocument[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#') || trimmed.startsWith('//')) continue;

    const parts = trimmed.split(';');
    if (parts.length < 5) continue;

    documents.push({
      Номер: parts[0] || '',
      Дата: parts[1] || '',
      Сумма: parts[2] || '0',
      Плательщик: parts[3] || '',
      Получатель: parts[4] || '',
      НазначениеПлатежа: parts[5] || '',
      ПлательщикИНН: parts[6] || '',
      ПолучательИНН: parts[7] || '',
      ПлательщикСчет: parts[8] || '',
      ПолучательСчет: parts[9] || '',
    });
  }
  return { header: {}, documents };
}

export function parseXML(xmlText: string): ParsedStatement {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const documents: StatementDocument[] = [];
  const docElements = xmlDoc.getElementsByTagName('Документ');

  for (let i = 0; i < docElements.length; i++) {
    const el = docElements[i];
    documents.push({
      Номер: getTagValue(el, 'Номер'),
      Дата: getTagValue(el, 'Дата'),
      Сумма: getTagValue(el, 'Сумма'),
      Плательщик: getTagValue(el, 'Плательщик'),
      Получатель: getTagValue(el, 'Получатель'),
      НазначениеПлатежа: getTagValue(el, 'НазначениеПлатежа'),
      ПлательщикИНН: getTagValue(el, 'ПлательщикИНН'),
      ПолучательИНН: getTagValue(el, 'ПолучательИНН'),
      ПлательщикСчет: getTagValue(el, 'ПлательщикСчет'),
      ПолучательСчет: getTagValue(el, 'ПолучательСчет'),
    });
  }
  return { header: {}, documents };
}

function getTagValue(parent: Element, tagName: string): string {
  const el = parent.getElementsByTagName(tagName)[0];
  return el ? el.textContent?.trim() || '' : '';
}

export function detectAndParse(text: string, filename: string): ParsedStatement {
  const trimmed = text.trim();
  const ext = (filename || '').split('.').pop()?.toLowerCase();

  if (trimmed.startsWith('1CClientBankExchange') || ext === '1c') {
    return parse1CClientBankExchange(trimmed);
  }
  if (ext === 'txt' || trimmed.indexOf(';') > 0) {
    return parseTXT(trimmed);
  }
  if (ext === 'xml' || trimmed.startsWith('<?xml') || trimmed.startsWith('<')) {
    return parseXML(trimmed);
  }
  return parseTXT(trimmed);
}
