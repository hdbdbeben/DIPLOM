import { api } from '../core/api.js';
import { $, formatDate, statusBadge, escapeHTML } from '../core/utils.js';
import { renderTable, showModal, hideModal, showAlert } from '../core/ui.js';

export function load(filter = {}) {
  const query = [];
  if (filter.status && filter.status !== 'all') query.push('status=' + filter.status);
  const url = '/errors' + (query.length ? '?' + query.join('&') : '');

  api.get(url).then(data => {
    renderTable($('#tblErrors').querySelector('tbody'), data, [
      r => r.id,
      r => formatDate(r.created_at),
      r => escapeHTML(r.error_type),
      r => escapeHTML(r.description).substring(0, 60),
      r => escapeHTML(r.doc_number || '-'),
      r => statusBadge(r.status),
      r => escapeHTML(r.assigned_name || '-'),
      r => {
        let btns = '';
        if (r.status === 'new') {
          btns += `<button class="btn btn-sm btn-primary resolve-error" data-id="${r.id}">В работу</button> `;
          btns += `<button class="btn btn-sm btn-outline assign-error" data-id="${r.id}">Назначить</button> `;
        }
        if (r.status === 'in_progress') {
          btns += `<button class="btn btn-sm btn-success resolve-error" data-id="${r.id}">Решить</button> `;
        }
        return btns;
      }
    ]);
  }).catch(() => {});
}

export function resolveError(id, status) {
  api.put('/errors/' + id, { status }).then(() => {
    load();
  }).catch(err => showAlert(err.message));
}

export function showAssignForm(id) {
  api.get('/users').then(users => {
    const accountants = users.filter(u => u.role_id === 2 || u.role_id === 1);
    const opts = '<option value="">— выберите —</option>' +
      accountants.map(u => `<option value="${u.id}">${escapeHTML(u.full_name)} (${u.login})</option>`).join('');

    showModal('Назначить ответственного',
      '<div class="form-group"><label>Ответственный</label><select id="mfAssign">' + opts + '</select></div>',
      `<button class="btn btn-primary save-assign" data-id="${id}">Назначить</button>
       <button class="btn btn-outline close-modal">Отмена</button>`);
  });
}

export function saveAssign(btn) {
  const assignedTo = $('#mfAssign').value;
  if (!assignedTo) return showAlert('Выберите ответственного');
  api.put('/errors/' + btn.dataset.id, { assignedTo: parseInt(assignedTo) }).then(() => {
    hideModal(); load();
  }).catch(err => showAlert(err.message));
}

export function filterByStatus(status) {
  load({ status: status.value });
}
