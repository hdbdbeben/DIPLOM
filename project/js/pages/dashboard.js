import { api } from '../core/api.js';
import { $, formatDate, statusBadge, escapeHTML } from '../core/utils.js';
import { renderTable } from '../core/ui.js';

export function load() {
  api.get('/dashboard').then(data => {
    $('#statStatements').textContent = data.statementCount;
    $('#statPayments').textContent = data.paymentCount;
    $('#statAuto').textContent = data.autoPercent + '%';
    $('#statErrors').textContent = data.errorCount;

    renderTable($('#dashRecentStatements').querySelector('tbody'), data.recentStatements, [
      r => formatDate(r.uploaded_at),
      r => escapeHTML(r.file_name),
      r => r.total_operations,
      r => statusBadge(r.status)
    ]);

    renderTable($('#dashRecentErrors').querySelector('tbody'), data.recentErrors, [
      r => formatDate(r.created_at),
      r => escapeHTML(r.error_type),
      r => escapeHTML(r.description).substring(0, 60),
      r => statusBadge(r.status)
    ]);
  }).catch(err => {
    console.error('Dashboard load failed:', err);
  });
}
