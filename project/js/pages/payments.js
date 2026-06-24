import { api } from '../core/api.js';
import { $, formatDate, formatMoney, statusBadge, escapeHTML } from '../core/utils.js';
import { renderTable, showModal, hideModal, showAlert } from '../core/ui.js';

export function load(filter = {}) {
  const query = [];
  if (filter.statementId) query.push('statementId=' + filter.statementId);
  if (filter.status && filter.status !== 'all') query.push('status=' + filter.status);
  if (filter.search) query.push('search=' + encodeURIComponent(filter.search));
  const url = '/payments' + (query.length ? '?' + query.join('&') : '');

  api.get(url).then(data => {
    renderTable($('#tblPayments').querySelector('tbody'), data, [
      r => r.id,
      r => formatDate(r.doc_date),
      r => escapeHTML(r.doc_number),
      r => escapeHTML(r.client_name || r.payer_name || r.payee_name),
      r => formatMoney(r.amount),
      r => escapeHTML((r.purpose || '').substring(0, 50)),
      r => statusBadge(r.status),
      r => `<button class="btn btn-sm btn-outline view-payment" data-id="${r.id}">Детали</button>`
    ]);
  }).catch(() => {});
}

export function showDetail(id) {
  api.get('/payments/' + id).then(p => {
    Promise.all([api.get('/clients'), api.get('/payment-types'), api.get('/articles')]).then(([clients, types, articles]) => {
      const sel = (list, idField, nameField, currentId) =>
        '<option value="">— выберите —</option>' +
        list.map(item => `<option value="${item[idField]}"${item[idField] === currentId ? ' selected' : ''}>${escapeHTML(item[nameField])}</option>`).join('');

      const opt = (val, label, current) =>
        `<option value="${val}"${val === current ? ' selected' : ''}>${label}</option>`;

      const body = `
        <div class="payment-detail-grid">
          <div class="form-group"><label>Номер документа</label><div class="field-value">${escapeHTML(p.doc_number || '-')}</div></div>
          <div class="form-group"><label>Дата</label><div class="field-value">${escapeHTML(p.doc_date || '-')}</div></div>
          <div class="form-group"><label>Сумма</label><div class="field-value">${formatMoney(p.amount)}</div></div>
          <div class="form-group"><label>Плательщик</label><div class="field-value">${escapeHTML(p.payer_name || '-')}</div></div>
          <div class="form-group"><label>ИНН плательщика</label><div class="field-value">${escapeHTML(p.payer_inn || '-')}</div></div>
          <div class="form-group"><label>Получатель</label><div class="field-value">${escapeHTML(p.payee_name || '-')}</div></div>
          <div class="form-group"><label>ИНН получателя</label><div class="field-value">${escapeHTML(p.payee_inn || '-')}</div></div>
          <div class="form-group"><label>Назначение платежа</label><div class="field-value">${escapeHTML(p.purpose || '-')}</div></div>
          <div class="form-group"><label>Выписка</label><div class="field-value">${escapeHTML(p.statement_file || '-')}</div></div>
        </div>
        <hr>
        <h5>Классификация операции</h5>
        <div class="form-row">
          <div class="form-group"><label>Контрагент</label><select id="pdClient">${sel(clients, 'id', 'name', p.client_id)}</select></div>
          <div class="form-group"><label>Тип платежа</label><select id="pdType">${sel(types, 'id', 'name', p.payment_type_id)}</select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Статья ДДС</label><select id="pdArticle">${sel(articles, 'id', 'name', p.article_id)}</select></div>
          <div class="form-group"><label>Статус</label><select id="pdStatus">
            ${opt('processed', 'Обработано', p.status)}
            ${opt('manual', 'Требует ручной проверки', p.status)}
            ${opt('error', 'Ошибка', p.status)}
          </select></div>
        </div>`;

      showModal('Детали операции №' + p.id, body,
        `<button class="btn btn-primary save-payment" data-id="${p.id}">Сохранить</button>
         <button class="btn btn-outline close-modal">Закрыть</button>`
      );
    });
  }).catch(err => showAlert('Ошибка: ' + err.message));
}

export function savePayment(btn) {
  const id = parseInt(btn.dataset.id);
  const data = {
    clientId: $('#pdClient').value ? parseInt($('#pdClient').value) : null,
    paymentTypeId: parseInt($('#pdType').value),
    articleId: $('#pdArticle').value ? parseInt($('#pdArticle').value) : null,
    status: $('#pdStatus').value
  };
  api.put('/payments/' + id, data).then(() => {
    hideModal();
    load();
  }).catch(err => showAlert('Ошибка: ' + err.message));
}

export function filterByStatus(status) {
  load({ status: status.value });
}

export function searchPayments(input) {
  const statusEl = $('#payStatusFilter');
  load({ search: input.value.trim(), status: statusEl ? statusEl.value : 'all' });
}
