import { api } from '../core/api.js';
import { AppState } from '../core/state.js';
import { $, formatDate, statusBadge, escapeHTML } from '../core/utils.js';
import { renderTable, showAlert } from '../core/ui.js';
import { navigateIfAuth } from '../core/router.js';

export function load() {
  api.get('/statements').then(data => {
    renderTable($('#tblStatements').querySelector('tbody'), data, [
      r => r.id,
      r => formatDate(r.uploaded_at),
      r => escapeHTML(r.file_name),
      r => r.total_operations,
      r => r.auto_processed,
      r => r.error_count,
      r => statusBadge(r.status),
      r => `<button class="btn btn-sm btn-outline view-stmt" data-id="${r.id}">Операции</button>
            <button class="btn btn-sm btn-danger del-stmt" data-id="${r.id}">Удалить</button>`
    ]);
  }).catch(() => {});
}

export function handleUpload(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const parsed = BankStatementParser.detectAndParse(e.target.result, file.name);
    AppState.set('pendingDocuments', parsed.documents);
    AppState.set('pendingFileName', file.name);

    if (!parsed.documents.length) {
      showAlert('Не удалось распознать документы в файле.');
      return;
    }
    renderPreview(parsed.documents, file.name);
  };
  reader.readAsText(file);
}

function renderPreview(docs, fileName) {
  const rows = docs.map((d, i) =>
    `<tr>
      <td>${i + 1}</td>
      <td>${escapeHTML(d['Дата'] || '')}</td>
      <td>${escapeHTML(d['Номер'] || '')}</td>
      <td>${escapeHTML(d['Плательщик'] || d['Получатель'] || '')}</td>
      <td>${escapeHTML(d['Сумма'] || '')}</td>
      <td>${escapeHTML((d['НазначениеПлатежа'] || '').substring(0, 60))}</td>
    </tr>`
  ).join('');

  $('#uploadPreviewContent').innerHTML = `
    <p>Файл: <strong>${escapeHTML(fileName)}</strong></p>
    <p>Найдено документов: <strong>${docs.length}</strong></p>
    <table class="preview-table">
      <thead><tr><th>№</th><th>Дата</th><th>Номер</th><th>Контрагент</th><th>Сумма</th><th>Назначение</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  $('#uploadPreview').classList.remove('hidden');
}

export function confirmUpload() {
  const docs = AppState.pendingDocuments;
  if (!docs) return;
  $('#uploadPreview').classList.add('hidden');

  api.post('/statements', {
    fileName: AppState.pendingFileName,
    documents: docs,
    userId: AppState.user ? AppState.user.id : null
  }).then(result => {
    showAlert(`Выписка загружена: ${result.total} операций, автоматически обработано: ${result.autoProcessed}, ошибок: ${result.errorCount}`);
    AppState.set('pendingDocuments', null);
    AppState.set('pendingFileName', null);
    load();
  }).catch(err => showAlert('Ошибка загрузки: ' + err.message));
}

export function cancelUpload() {
  AppState.set('pendingDocuments', null);
  $('#uploadPreview').classList.add('hidden');
}

const DEMO_STATEMENT = [
  '1CClientBankExchange',
  'ВерсияФормата=1.03',
  'Кодировка=Windows-1251',
  'Отправитель=ООО "Социальные услуги"',
  'Получатель=ПАО СБЕРБАНК',
  'ДатаСоздания=07.05.2026',
  'ВремяСоздания=10:15:00',
  'ДатаНачала=06.05.2026',
  'ДатаКонца=07.05.2026',
  'РасчСчет=40702810800220100505',
  'СекцияДокумент=Платежное поручение',
  'Номер=1248',
  'Дата=07.05.2026',
  'Сумма=202898.75',
  'Плательщик=ИНН 7734660892 ООО "Мави Джинс"',
  'ПлательщикСчет=40702810500010001234',
  'ПлательщикБИК=044525225',
  'Получатель=ООО "Социальные услуги"',
  'ПолучательИНН=7713699602',
  'ПолучательСчет=40702810800220100505',
  'ПолучательБИК=044525225',
  'НазначениеПлатежа=Оплата по счету № 1595/92 от 01.04.2026 обслуживание за 05.2026 Сумма 202898.75 Без налога (НДС)',
  'КонецДокумента',
  'СекцияДокумент=Платежное поручение',
  'Номер=1356',
  'Дата=06.05.2026',
  'Сумма=157000.00',
  'Плательщик=Департамент труда и соцзащиты г. Москвы',
  'ПлательщикИНН=7710660053',
  'ПлательщикСчет=40102810545370000003',
  'Получатель=ООО "Социальные услуги"',
  'ПолучательИНН=7713699602',
  'ПолучательСчет=40702810800220100505',
  'НазначениеПлатежа=Оплата по госконтракту № 2026-045 от 15.01.2026 за оказание социальных услуг за апрель 2026 г.',
  'КонецДокумента',
  'СекцияДокумент=Платежное поручение',
  'Номер=1401',
  'Дата=06.05.2026',
  'Сумма=45000.00',
  'Плательщик=ООО "Социальные услуги"',
  'ПлательщикИНН=7713699602',
  'ПлательщикСчет=40702810800220100505',
  'Получатель=ООО "Ромашка"',
  'ПолучательИНН=7728300200',
  'ПолучательСчет=40702810600050009876',
  'НазначениеПлатежа=Оплата по договору № 45 от 12.02.2026 за канцелярские товары Сумма 45000.00 В том числе НДС 20% 7500.00',
  'КонецДокумента',
  'СекцияДокумент=Платежное поручение',
  'Номер=1402',
  'Дата=05.05.2026',
  'Сумма=32000.50',
  'Плательщик=ООО "Социальные услуги"',
  'ПлательщикИНН=7713699602',
  'ПлательщикСчет=40702810800220100505',
  'Получатель=АО "Флант"',
  'ПолучательИНН=7702033720',
  'ПолучательСчет=40702810700020004567',
  'НазначениеПлатежа=Оплата по счету № FL-887 от 20.04.2026 за услуги хостинга и техподдержки за май 2026',
  'КонецДокумента',
  'СекцияДокумент=Платежное поручение',
  'Номер=1275',
  'Дата=05.05.2026',
  'Сумма=89000.00',
  'Плательщик=ИП Иванов И.И.',
  'ПлательщикИНН=771501001234',
  'ПлательщикСчет=40802810200030007890',
  'Получатель=ООО "Социальные услуги"',
  'ПолучательИНН=7713699602',
  'ПолучательСчет=40702810800220100505',
  'НазначениеПлатежа=Оплата по договору № 12 от 10.01.2026 за социально-психологические услуги за апрель 2026 г.',
  'КонецДокумента'
].join('\n');

export function loadDemo() {
  const parsed = BankStatementParser.detectAndParse(DEMO_STATEMENT, 'demo_statement.txt');
  AppState.set('pendingDocuments', parsed.documents);
  AppState.set('pendingFileName', 'demo_statement.txt');
  renderPreview(parsed.documents, 'demo_statement.txt (демонстрационная выписка)');
}

export function processAll() {
  api.get('/statements').then(data => {
    const unprocessed = data.filter(s => s.auto_processed < s.total_operations);
    if (unprocessed.length === 0) {
      showAlert('Все выписки уже обработаны.');
      return;
    }
    showAlert(
      `Найдено ${unprocessed.length} выписок с необработанными операциями. ` +
      'Используйте раздел «Платёжные операции» для ручной классификации.'
    );
  }).catch(() => showAlert('Ошибка проверки выписок.'));
}

export function deleteStatement(id) {
  api.del('/statements/' + id).then(() => { load(); }).catch(err => showAlert('Ошибка: ' + err.message));
}

export function viewStatement(id) {
  navigateIfAuth('payments');
  setTimeout(() => {
    import('./payments.js').then(m => m.load({ statementId: id }));
  }, 100);
}
