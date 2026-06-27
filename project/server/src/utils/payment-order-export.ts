import type { PaymentRow } from '../types';

const ORG = {
  name: 'ООО "Социальные услуги"',
  inn: '7713699602',
  kpp: '771301001',
  account: '40702810800220100505',
  bik: '044525225',
  bankName: 'ПАО СБЕРБАНК',
  corrAccount: '30101810400000000225',
};

function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

function formatDate(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length === 3) return parts[2] + '.' + parts[1] + '.' + parts[0];
  return isoDate;
}

function esc(val: string): string {
  return (val || '').replace(/[\r\n]/g, ' ').trim();
}

export function generatePaymentOrders(payments: PaymentRow[]): string {
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

    const payerName = esc(p.payer_name) || ORG.name;
    const payerInn = esc(p.payer_inn) || ORG.inn;
    const payerAccount = esc(p.payer_account) || ORG.account;
    const payerKpp = ORG.kpp;

    const payeeName = esc(p.payee_name);
    const payeeInn = esc(p.payee_inn);
    const payeeAccount = esc(p.payee_account);

    lines.push('СекцияДокумент=Платежное поручение');
    lines.push('Номер=' + esc(p.doc_number));
    lines.push('Дата=' + docDate);
    lines.push('Сумма=' + amount);
    lines.push('Плательщик=' + (payerInn ? 'ИНН ' + payerInn + ' ' : '') + payerName);
    if (payerInn) lines.push('ПлательщикИНН=' + payerInn);
    if (payerKpp) lines.push('ПлательщикКПП=' + payerKpp);
    if (payerAccount) lines.push('ПлательщикСчет=' + payerAccount);
    lines.push('ПлательщикБИК=' + ORG.bik);
    lines.push('Получатель=' + (payeeInn ? 'ИНН ' + payeeInn + ' ' : '') + payeeName);
    if (payeeInn) lines.push('ПолучательИНН=' + payeeInn);
    if (payeeAccount) lines.push('ПолучательСчет=' + payeeAccount);
    lines.push('НазначениеПлатежа=' + purpose);
    lines.push('ВидПлатежа=электронно');
    lines.push('ВидОплаты=01');
    lines.push('Очередность=5');
    lines.push('КонецДокумента');
  }

  lines.push('КонецФайла');
  return lines.join('\r\n');
}
