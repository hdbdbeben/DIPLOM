import { api } from '../core/api.js';
import { $, escapeHTML, escapeAttr, statusBadge } from '../core/utils.js';
import { renderTable, showModal, hideModal, showAlert } from '../core/ui.js';

let activeTab = 'clients';

export function load() {
  loadClients();
  loadBanks();
  loadPaymentTypes();
  loadArticles();
}

export function switchTab(targetId) {
  activeTab = targetId;
  document.querySelectorAll('.dir-panel').forEach(p => p.classList.remove('active'));
  const dp = $('#dir' + targetId.charAt(0).toUpperCase() + targetId.slice(1));
  if (dp) dp.classList.add('active');
  if (targetId === 'clients') loadClients();
  else if (targetId === 'banks') loadBanks();
  else if (targetId === 'paymentTypes') loadPaymentTypes();
  else if (targetId === 'articles') loadArticles();
}

const makeRow = (cols, id, editClass, delClass) =>
  [...cols, `<button class="btn btn-sm btn-outline ${editClass}" data-id="${id}">Ред.</button>
            <button class="btn btn-sm btn-danger ${delClass}" data-id="${id}">Уд.</button>`];

// ---- Clients ----
export function loadClients(search = '') {
  const url = '/clients' + (search ? '?search=' + encodeURIComponent(search) : '');
  api.get(url).then(data => {
    renderTable($('#tblClients').querySelector('tbody'), data, [
      r => r.id,
      r => escapeHTML(r.name),
      r => r.inn,
      r => r.kpp || '-',
      r => r.account || '-',
      r => r.bik || '-',
      r => `<button class="btn btn-sm btn-outline edit-client" data-id="${r.id}">Ред.</button>
            <button class="btn btn-sm btn-danger del-client" data-id="${r.id}">Уд.</button>`
    ]);
  });
}

function formClient(prefix, data = {}) {
  return `
    <div class="form-group"><label>Название</label><input id="${prefix}Name" value="${escapeAttr(data.name || '')}"></div>
    <div class="form-row">
      <div class="form-group"><label>ИНН</label><input id="${prefix}Inn" value="${escapeAttr(data.inn || '')}"></div>
      <div class="form-group"><label>КПП</label><input id="${prefix}Kpp" value="${escapeAttr(data.kpp || '')}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Расчётный счёт</label><input id="${prefix}Account" value="${escapeAttr(data.account || '')}"></div>
      <div class="form-group"><label>БИК</label><input id="${prefix}Bik" value="${escapeAttr(data.bik || '')}"></div>
    </div>`;
}

export function showAddClientForm() {
  showModal('Добавить контрагента', formClient('mf'),
    '<button class="btn btn-primary save-client">Сохранить</button><button class="btn btn-outline close-modal">Отмена</button>');
}

export function showEditClientForm(id) {
  api.get('/clients').then(data => {
    const c = data.find(x => x.id == id);
    if (!c) return showAlert('Контрагент не найден');
    showModal('Редактировать контрагента', formClient('mf', c),
      `<button class="btn btn-primary save-client" data-edit-id="${c.id}">Сохранить</button><button class="btn btn-outline close-modal">Отмена</button>`);
  });
}

export function saveClient(btn) {
  const data = {
    name: $('#mfName').value.trim(), inn: $('#mfInn').value.trim(),
    kpp: $('#mfKpp').value.trim(), account: $('#mfAccount').value.trim(), bik: $('#mfBik').value.trim()
  };
  if (!data.name || !data.inn) return showAlert('Название и ИНН обязательны');
  const editId = btn.dataset.editId;
  (editId ? api.put('/clients/' + editId, data) : api.post('/clients', data))
    .then(() => { hideModal(); loadClients(); }).catch(err => showAlert(err.message));
}

export function deleteClient(id) {
  api.del('/clients/' + id).then(() => loadClients()).catch(err => showAlert(err.message));
}

// ---- Banks ----
export function loadBanks() {
  api.get('/banks').then(data => {
    renderTable($('#tblBanks').querySelector('tbody'), data, [
      r => r.id, r => escapeHTML(r.name), r => r.bik, r => r.corr_account,
      r => `<button class="btn btn-sm btn-outline edit-bank" data-id="${r.id}">Ред.</button>
            <button class="btn btn-sm btn-danger del-bank" data-id="${r.id}">Уд.</button>`
    ]);
  });
}

function formBank(prefix, data = {}) {
  return `
    <div class="form-group"><label>Название</label><input id="${prefix}Name" value="${escapeAttr(data.name || '')}"></div>
    <div class="form-row">
      <div class="form-group"><label>БИК</label><input id="${prefix}Bik" value="${escapeAttr(data.bik || '')}"></div>
      <div class="form-group"><label>Корр. счёт</label><input id="${prefix}Corr" value="${escapeAttr(data.corr_account || '')}"></div>
    </div>`;
}

export function showAddBankForm() {
  showModal('Добавить банк', formBank('mf'),
    '<button class="btn btn-primary save-bank">Сохранить</button><button class="btn btn-outline close-modal">Отмена</button>');
}

export function showEditBankForm(id) {
  api.get('/banks').then(data => {
    const b = data.find(x => x.id == id);
    if (!b) return showAlert('Банк не найден');
    showModal('Редактировать банк', formBank('mf', b),
      `<button class="btn btn-primary save-bank" data-edit-id="${b.id}">Сохранить</button><button class="btn btn-outline close-modal">Отмена</button>`);
  });
}

export function saveBank(btn) {
  const data = { name: $('#mfName').value.trim(), bik: $('#mfBik').value.trim(), corrAccount: $('#mfCorr').value.trim() };
  if (!data.name || !data.bik) return showAlert('Название и БИК обязательны');
  const editId = btn.dataset.editId;
  (editId ? api.put('/banks/' + editId, data) : api.post('/banks', data))
    .then(() => { hideModal(); loadBanks(); }).catch(err => showAlert(err.message));
}

export function deleteBank(id) {
  api.del('/banks/' + id).then(() => loadBanks()).catch(err => showAlert(err.message));
}

// ---- Payment Types ----
export function loadPaymentTypes() {
  api.get('/payment-types').then(data => {
    renderTable($('#tblPaymentTypes').querySelector('tbody'), data, [
      r => r.id, r => escapeHTML(r.code), r => escapeHTML(r.name),
      r => `<button class="btn btn-sm btn-outline edit-pt" data-id="${r.id}">Ред.</button>
            <button class="btn btn-sm btn-danger del-pt" data-id="${r.id}">Уд.</button>`
    ]);
  });
}

function formPT(prefix, data = {}) {
  return `
    <div class="form-group"><label>Код</label><input id="${prefix}Code" value="${escapeAttr(data.code || '')}"></div>
    <div class="form-group"><label>Название</label><input id="${prefix}Name" value="${escapeAttr(data.name || '')}"></div>`;
}

export function showAddPaymentTypeForm() {
  showModal('Добавить тип платежа', formPT('mf'),
    '<button class="btn btn-primary save-pt">Сохранить</button><button class="btn btn-outline close-modal">Отмена</button>');
}

export function showEditPaymentTypeForm(id) {
  api.get('/payment-types').then(data => {
    const pt = data.find(x => x.id == id);
    if (!pt) return showAlert('Тип платежа не найден');
    showModal('Редактировать тип платежа', formPT('mf', pt),
      `<button class="btn btn-primary save-pt" data-edit-id="${pt.id}">Сохранить</button><button class="btn btn-outline close-modal">Отмена</button>`);
  });
}

export function savePaymentType(btn) {
  const data = { code: $('#mfCode').value.trim(), name: $('#mfName').value.trim() };
  if (!data.code || !data.name) return showAlert('Заполните все поля');
  const editId = btn.dataset.editId;
  (editId ? api.put('/payment-types/' + editId, data) : api.post('/payment-types', data))
    .then(() => { hideModal(); loadPaymentTypes(); }).catch(err => showAlert(err.message));
}

export function deletePaymentType(id) {
  api.del('/payment-types/' + id).then(() => loadPaymentTypes()).catch(err => showAlert(err.message));
}

// ---- Articles ----
export function loadArticles() {
  api.get('/articles').then(data => {
    renderTable($('#tblArticles').querySelector('tbody'), data, [
      r => r.id, r => escapeHTML(r.code), r => escapeHTML(r.name),
      r => r.type === 'income' ? '<span class="badge badge-success">Доход</span>' : '<span class="badge badge-warning">Расход</span>',
      r => `<button class="btn btn-sm btn-outline edit-article" data-id="${r.id}">Ред.</button>
            <button class="btn btn-sm btn-danger del-article" data-id="${r.id}">Уд.</button>`
    ]);
  });
}

function formArticle(prefix, data = {}) {
  return `
    <div class="form-group"><label>Код</label><input id="${prefix}Code" value="${escapeAttr(data.code || '')}"></div>
    <div class="form-group"><label>Название</label><input id="${prefix}Name" value="${escapeAttr(data.name || '')}"></div>
    <div class="form-group"><label>Тип</label><select id="${prefix}Type">
      <option value="income"${data.type === 'income' ? ' selected' : ''}>Доход</option>
      <option value="expense"${data.type === 'expense' ? ' selected' : ''}>Расход</option>
    </select></div>`;
}

export function showAddArticleForm() {
  showModal('Добавить статью ДДС', formArticle('mf'),
    '<button class="btn btn-primary save-article">Сохранить</button><button class="btn btn-outline close-modal">Отмена</button>');
}

export function showEditArticleForm(id) {
  api.get('/articles').then(data => {
    const a = data.find(x => x.id == id);
    if (!a) return showAlert('Статья не найдена');
    showModal('Редактировать статью ДДС', formArticle('mf', a),
      `<button class="btn btn-primary save-article" data-edit-id="${a.id}">Сохранить</button><button class="btn btn-outline close-modal">Отмена</button>`);
  });
}

export function saveArticle(btn) {
  const data = { code: $('#mfCode').value.trim(), name: $('#mfName').value.trim(), type: $('#mfType').value };
  if (!data.code || !data.name) return showAlert('Заполните все поля');
  const editId = btn.dataset.editId;
  (editId ? api.put('/articles/' + editId, data) : api.post('/articles', data))
    .then(() => { hideModal(); loadArticles(); }).catch(err => showAlert(err.message));
}

export function deleteArticle(id) {
  api.del('/articles/' + id).then(() => loadArticles()).catch(err => showAlert(err.message));
}
