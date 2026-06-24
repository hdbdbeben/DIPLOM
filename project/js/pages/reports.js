import { api } from '../core/api.js';
import { $, escapeHTML, formatMoney } from '../core/utils.js';
import { showAlert } from '../core/ui.js';

export function load() {
  const now = new Date();
  $('#reportFrom').value = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
  $('#reportTo').value = now.toISOString().split('T')[0];
}

export function generateReport() {
  const from = $('#reportFrom').value;
  const to = $('#reportTo').value;

  api.get(`/reports/dds?from=${from}&to=${to}`).then(data => {
    const items = data.articles.map(a =>
      `<tr>
        <td>${escapeHTML(a.name)}</td>
        <td>${a.type === 'income' ? 'Доход' : 'Расход'}</td>
        <td>${a.count}</td>
        <td class="amount">${formatMoney(a.income)}</td>
        <td class="amount">${formatMoney(a.expense)}</td>
      </tr>`
    ).join('');

    const netColor = data.netFlow >= 0 ? 'var(--success)' : 'var(--danger)';
    $('#reportContent').innerHTML = `
      <div class="report-summary">
        <div class="report-summary-item"><div class="rs-label">Поступления</div><div class="rs-value" style="color:var(--success)">${formatMoney(data.totalIncome)}</div></div>
        <div class="report-summary-item"><div class="rs-label">Списания</div><div class="rs-value" style="color:var(--danger)">${formatMoney(data.totalExpense)}</div></div>
        <div class="report-summary-item"><div class="rs-label">Чистый поток</div><div class="rs-value" style="color:${netColor}">${formatMoney(data.netFlow)}</div></div>
      </div>
      <table class="report-table">
        <thead><tr><th>Статья ДДС</th><th>Тип</th><th>Кол-во</th><th>Поступления</th><th>Списания</th></tr></thead>
        <tbody>
          ${items}
          <tr class="total-row"><td><strong>ИТОГО</strong></td><td></td><td>${data.paymentCount}</td><td class="amount"><strong>${formatMoney(data.totalIncome)}</strong></td><td class="amount"><strong>${formatMoney(data.totalExpense)}</strong></td></tr>
        </tbody>
      </table>`;
  }).catch(err => {
    $('#reportContent').innerHTML = `<p class="error-msg">Ошибка: ${escapeHTML(err.message)}</p>`;
  });
}

export function exportToExcel() {
  const table = $('#reportContent').querySelector('.report-table');
  if (!table) return showAlert('Сформируйте отчёт сначала.');
  const csv = '\uFEFF' + Array.from(table.querySelectorAll('tr')).map(row =>
    Array.from(row.querySelectorAll('th, td')).map(cell =>
      '"' + (cell.textContent || '').replace(/"/g, '""') + '"'
    ).join(';')
  ).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'DDS_report_' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
}
