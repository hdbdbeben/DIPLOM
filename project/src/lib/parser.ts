/**
 * @file Парсеры банковских выписок из различных форматов.
 * Поддерживаются форматы: 1CClientBankExchange, TXT (CSV с разделителем ';'),
 * XML. Все парсеры возвращают унифицированную структуру ParsedStatement.
 *
 * Принцип работы:
 * - parse1CClientBankExchange — построчный парсер секций файла 1С
 * - parseTXT — разбор строк с разделителем ';' (CSV-like)
 * - parseXML — парсинг XML через DOMParser
 * - detectAndParse — автоматическое определение формата по содержимому/расширению
 */

import type { ParsedStatement, StatementDocument } from '@/types';

/**
 * Парсинг файла в формате 1CClientBankExchange.
 * Формат представляет собой текстовый файл с секциями: заголовок (ключ=значение)
 * и документы между маркерами "СекцияДокумент=..." и "КонецДокумента".
 *
 * Алгоритм:
 * 1. Разбиваем текст на строки (поддержка \r\n и \n)
 * 2. До первой секции "СекцияДокумент=..." — читаем заголовок
 * 3. Внутри секции документа — накапливаем поля до "КонецДокумента"
 * 4. Каждый документ добавляется в массив documents
 *
 * @param text Содержимое файла выписки в кодировке UTF-8
 * @returns Структура ParsedStatement с заголовком и массивом документов
 */
export function parse1CClientBankExchange(text: string): ParsedStatement {
  // Разбиваем на строки, поддерживая оба варианта переноса строк (Windows/Unix)
  const lines = text.split(/\r?\n/);
  const result: ParsedStatement = { header: {}, documents: [] };
  /** Текущий накапливаемый документ (словарь полей) */
  let currentDoc: Record<string, string> | null = null;
  /** Флаг: находимся ли мы внутри секции документа */
  let inDocument = false;

  for (const line of lines) {
    const trimmed = line.trim();
    // Пропускаем пустые строки
    if (!trimmed) continue;

    if (!inDocument) {
      // Сигнатура формата — пропускаем, это идентификатор версии
      if (trimmed === '1CClientBankExchange') continue;
      // Маркеры начала секции документа — Платёжное поручение или Платёжный ордер
      if (trimmed === 'СекцияДокумент=Платежное поручение' || trimmed === 'СекцияДокумент=Платежный ордер') {
        inDocument = true;
        currentDoc = {};
        continue;
      }
      // Строки заголовка: ключ=значение
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        // Подстрока до первого '=' — ключ, после — значение
        result.header[trimmed.substring(0, eqIdx).trim()] = trimmed.substring(eqIdx + 1).trim();
      }
    } else {
      // Маркер конца текущего документа
      if (trimmed === 'КонецДокумента') {
        if (currentDoc) result.documents.push(currentDoc as unknown as StatementDocument);
        currentDoc = null;
        inDocument = false;
        continue;
      }
      // Строки внутри документа: ключ=значение
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0 && currentDoc) {
        currentDoc[trimmed.substring(0, eqIdx).trim()] = trimmed.substring(eqIdx + 1).trim();
      }
    }
  }
  return result;
}

/**
 * Парсинг TXT-файла с разделителем ';' (формат CSV-like).
 * Каждая строка — один документ. Поддерживаются комментарии (строки,
 * начинающиеся с # или //).
 *
 * Поля (порядок):
 * 0 - Номер, 1 - Дата, 2 - Сумма, 3 - Плательщик, 4 - Получатель,
 * 5 - НазначениеПлатежа, 6 - ПлательщикИНН, 7 - ПолучательИНН,
 * 8 - ПлательщикСчет, 9 - ПолучательСчет
 *
 * @param text Содержимое файла
 * @returns Структура ParsedStatement с пустым заголовком и массивом документов
 */
export function parseTXT(text: string): ParsedStatement {
  const lines = text.split(/\r?\n/);
  const documents: StatementDocument[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Пропускаем пустые строки и комментарии
    if (!trimmed) continue;
    if (trimmed.startsWith('#') || trimmed.startsWith('//')) continue;

    const parts = trimmed.split(';');
    // Минимум 5 полей для валидной записи (Номер, Дата, Сумма, Плательщик, Получатель)
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

/**
 * Парсинг XML-файла банковской выписки.
 * Ожидается структура с элементами <Документ>, каждый из которых содержит
 * дочерние элементы с полями платёжного документа.
 *
 * @param xmlText Строка XML
 * @returns Структура ParsedStatement с пустым заголовком и массивом документов
 */
export function parseXML(xmlText: string): ParsedStatement {
  // Используем встроенный DOMParser браузера для разбора XML
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const documents: StatementDocument[] = [];
  // Получаем все элементы <Документ>
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

/**
 * Вспомогательная функция: получение текстового содержимого дочернего тега.
 *
 * @param parent Родительский XML-элемент
 * @param tagName Имя искомого дочернего тега
 * @returns Текстовое содержимое тега или пустая строка, если тег не найден
 */
function getTagValue(parent: Element, tagName: string): string {
  // getElementsByTagName ищет среди всех потомков, берём первый найденный
  const el = parent.getElementsByTagName(tagName)[0];
  // textContent может быть null, приводим к строке и обрезаем пробелы
  return el ? el.textContent?.trim() || '' : '';
}

/**
 * Автоматическое определение формата и парсинг файла выписки.
 * Использует эвристики на основе содержимого и расширения файла:
 *
 * 1. Если текст начинается с "1CClientBankExchange" или расширение ".1c" — формат 1С
 * 2. Если расширение ".txt" или текст содержит ';' — CSV/TXT формат
 * 3. Если расширение ".xml" или текст начинается с "<?xml"/"<" — XML формат
 * 4. По умолчанию — TXT формат
 *
 * @param text Содержимое файла
 * @param filename Имя файла (используется для определения расширения)
 * @returns Структура ParsedStatement, полученная соответствующим парсером
 */
export function detectAndParse(text: string, filename: string): ParsedStatement {
  const trimmed = text.trim();
  // Извлекаем расширение: берём часть после последней точки и приводим к нижнему регистру
  const ext = (filename || '').split('.').pop()?.toLowerCase();

  // Проверка 1: сигнатура 1С или расширение .1c
  if (trimmed.startsWith('1CClientBankExchange') || ext === '1c') {
    return parse1CClientBankExchange(trimmed);
  }
  // Проверка 2: расширение .txt или наличие разделителя ';'
  if (ext === 'txt' || trimmed.indexOf(';') > 0) {
    return parseTXT(trimmed);
  }
  // Проверка 3: расширение .xml или XML-пролог / теги
  if (ext === 'xml' || trimmed.startsWith('<?xml') || trimmed.startsWith('<')) {
    return parseXML(trimmed);
  }
  // Fallback: пробуем TXT
  return parseTXT(trimmed);
}
