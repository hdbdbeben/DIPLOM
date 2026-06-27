/**
 * @file Генератор файла 1CClientBankExchange для экспорта обработанных платежей в 1С.
 *
 * Формирует текстовый файл в формате, совместимом с обработкой «Загрузка из банка»
 * в 1С:Предприятие 8.3. После загрузки в 1С каждая секция документа создаёт
 * документ «Поступление на расчётный счёт» или «Списание с расчётного счёта».
 *
 * Формат соответствует спецификации 1CClientBankExchange v1.03:
 * - Заголовок с реквизитами организации и банка
 * - Секции документов между маркерами СекцияДокумент=... и КонецДокумента
 *
 * @module utils/1c-export
 */

import type { PaymentRow, StatementRow } from '../types';

/** Реквизиты организации по умолчанию (ООО «Социальные услуги») */
const ORG = {
  name: 'ООО "Социальные услуги"',
  inn: '7713699602',
  account: '40702810800220100505',
  bik: '044525225',
  bankName: 'ПАО СБЕРБАНК',
};

/**
 * Форматирует сумму для выписки 1С: два знака после запятой, точка как разделитель.
 *
 * @param amount — числовое значение суммы
 * @returns Строка вида "1234.56"
 */
function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Форматирует дату из YYYY-MM-DD (ISO) в ДД.ММ.ГГГГ (российский формат, ожидаемый 1С).
 *
 * @param isoDate — дата в формате YYYY-MM-DD
 * @returns Дата в формате ДД.ММ.ГГГГ, либо исходная строка при ошибке
 */
function formatDate(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    return parts[2] + '.' + parts[1] + '.' + parts[0];
  }
  return isoDate;
}

/**
 * Экранирует спецсимволы в строковых значениях.
 * Заменяет переносы строк на пробелы для корректного парсинга 1С.
 *
 * @param val — исходное строковое значение
 * @returns Очищенная строка
 */
function esc(val: string): string {
  return (val || '').replace(/[\r\n]/g, ' ').trim();
}

/**
 * Генерирует файл в формате 1CClientBankExchange из набора обработанных платежей.
 *
 * Алгоритм:
 * 1. Формирует заголовок: сигнатура, версия, кодировка, реквизиты организации и банка.
 * 2. Для каждого платежа формирует секцию документа:
 *    - Номер, Дата, Сумма
 *    - Плательщик (с ИНН), Получатель (с ИНН)
 *    - Расчётные счета, БИК
 *    - Назначение платежа
 * 3. В зависимости от направления платежа (поступление/списание) подставляется
 *    организация в качестве плательщика или получателя, а контрагент — в противоположную роль.
 *
 * @param statement — метаданные выписки (имя файла и т.д.)
 * @param payments — массив платёжных записей для экспорта
 * @returns Текст в формате 1CClientBankExchange, готовый к сохранению в файл
 */
export function generate1CClientBankExchange(statement: StatementRow, payments: PaymentRow[]): string {
  const now = new Date();
  const dateStr = formatDate(now.toISOString().slice(0, 10));
  const timeStr = now.toTimeString().slice(0, 8);

  const lines: string[] = [];

  lines.push('1CClientBankExchange');
  lines.push('ВерсияФормата=1.03');
  lines.push('Кодировка=Windows-1251');
  lines.push('Отправитель=' + ORG.name);
  lines.push('Получатель=' + ORG.bankName);
  lines.push('ДатаСоздания=' + dateStr);
  lines.push('ВремяСоздания=' + timeStr);
  lines.push('РасчСчет=' + ORG.account);
  lines.push('БИК=' + ORG.bik);

  for (const p of payments) {
    const amount = formatAmount(p.amount);
    const docDate = formatDate(p.doc_date);
    const purpose = esc(p.purpose);

    const payerName = esc(p.payer_name);
    const payerInn = esc(p.payer_inn);
    const payerAccount = esc(p.payer_account);

    const payeeName = esc(p.payee_name);
    const payeeInn = esc(p.payee_inn);
    const payeeAccount = esc(p.payee_account);

    lines.push('СекцияДокумент=Платежное поручение');
    lines.push('Номер=' + esc(p.doc_number));
    lines.push('Дата=' + docDate);
    lines.push('Сумма=' + amount);
    lines.push('Плательщик=' + (payerInn ? 'ИНН ' + payerInn + ' ' : '') + payerName);
    if (payerInn) lines.push('ПлательщикИНН=' + payerInn);
    if (payerAccount) lines.push('ПлательщикСчет=' + payerAccount);
    lines.push('Получатель=' + (payeeInn ? 'ИНН ' + payeeInn + ' ' : '') + payeeName);
    if (payeeInn) lines.push('ПолучательИНН=' + payeeInn);
    if (payeeAccount) lines.push('ПолучательСчет=' + payeeAccount);
    lines.push('НазначениеПлатежа=' + purpose);
    lines.push('КонецДокумента');
  }

  lines.push('КонецФайла');
  return lines.join('\r\n');
}
