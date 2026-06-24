import { api } from '../core/api.js';
import { $, escapeHTML, escapeAttr, formatDateTime } from '../core/utils.js';
import { renderTable, showModal, hideModal, showAlert } from '../core/ui.js';
import { navigateTo } from '../core/router.js';

// ---- LOGS ----
export function load() {
  api.get('/logs').then(data => {
    renderTable($('#tblLogs').querySelector('tbody'), data, [
      r => r.id,
      r => formatDateTime(r.timestamp),
      r => escapeHTML(r.full_name || r.login || '-'),
      r => escapeHTML(r.action)
    ]);
  }).catch(() => {});
}

// ---- USERS ----
export function loadUsers() {
  api.get('/users').then(data => {
    renderTable($('#tblUsers').querySelector('tbody'), data, [
      r => r.id, r => escapeHTML(r.login), r => escapeHTML(r.full_name), r => escapeHTML(r.role_name),
      r => r.active ? '<span class="badge badge-success">Да</span>' : '<span class="badge badge-danger">Нет</span>',
      r => `<button class="btn btn-sm btn-outline edit-user" data-id="${r.id}">Ред.</button>
            <button class="btn btn-sm btn-danger del-user" data-id="${r.id}">Уд.</button>`
    ]);
  });
}

export function loadRoles() {
  api.get('/roles').then(data => {
    renderTable($('#tblRoles').querySelector('tbody'), data, [
      r => r.id, r => escapeHTML(r.code), r => escapeHTML(r.name), r => escapeHTML(r.description)
    ]);
  });
}

export function showAddUserForm() {
  api.get('/roles').then(roles => {
    const opts = roles.map(r => `<option value="${r.id}">${escapeHTML(r.name)}</option>`).join('');
    showModal('Добавить пользователя',
      `<div class="form-group"><label>Логин</label><input id="mfLogin"></div>
       <div class="form-group"><label>Пароль</label><input type="password" id="mfPass"></div>
       <div class="form-group"><label>ФИО</label><input id="mfFullName"></div>
       <div class="form-group"><label>Роль</label><select id="mfRoleId">${opts}</select></div>`,
      '<button class="btn btn-primary save-user">Сохранить</button><button class="btn btn-outline close-modal">Отмена</button>');
  });
}

export function showEditUserForm(id) {
  Promise.all([api.get('/users'), api.get('/roles')]).then(([users, roles]) => {
    const u = users.find(x => x.id == id);
    if (!u) return showAlert('Пользователь не найден');
    const roleOpts = roles.map(r =>
      `<option value="${r.id}"${u.role_id === r.id ? ' selected' : ''}>${escapeHTML(r.name)}</option>`
    ).join('');
    showModal('Редактировать пользователя',
      `<div class="form-group"><label>Логин</label><input id="mfLogin" value="${escapeAttr(u.login)}"></div>
       <div class="form-group"><label>Новый пароль (оставьте пустым)</label><input type="password" id="mfPass"></div>
       <div class="form-group"><label>ФИО</label><input id="mfFullName" value="${escapeAttr(u.full_name)}"></div>
       <div class="form-group"><label>Роль</label><select id="mfRoleId">${roleOpts}</select></div>
       <div class="form-group"><label><input type="checkbox" id="mfActive"${u.active ? ' checked' : ''}> Активен</label></div>`,
      `<button class="btn btn-primary save-user" data-edit-id="${u.id}">Сохранить</button><button class="btn btn-outline close-modal">Отмена</button>`);
  });
}

export function saveUser(btn) {
  const data = {
    login: $('#mfLogin').value.trim(),
    password: $('#mfPass').value.trim(),
    fullName: $('#mfFullName').value.trim(),
    roleId: parseInt($('#mfRoleId').value),
    active: $('#mfActive') ? $('#mfActive').checked : true
  };
  if (!data.login || !data.fullName) return showAlert('Логин и ФИО обязательны');
  if (!btn.dataset.editId && !data.password) return showAlert('Пароль обязателен для нового пользователя');
  const editId = btn.dataset.editId;
  const promise = editId ? api.put('/users/' + editId, data) : api.post('/users', data);
  promise.then(() => { hideModal(); loadUsers(); }).catch(err => showAlert(err.message));
}

export function deleteUser(id) {
  api.del('/users/' + id).then(() => loadUsers()).catch(err => showAlert(err.message));
}

// ---- SETTINGS ----
export function doBackup() {
  api.post('/admin/backup', {}).then(r => {
    showAlert('Резервная копия создана:\n' + r.path);
  }).catch(err => showAlert('Ошибка: ' + err.message));
}

export function doRestore() {
  const path = prompt('Введите путь к файлу резервной копии (*.db):');
  if (!path) return;
  api.post('/admin/restore', { path }).then(r => {
    showAlert(r.message);
  }).catch(err => showAlert('Ошибка: ' + err.message));
}

export async function doReset() {
  const confirmed = confirm('ВНИМАНИЕ! Все данные будут безвозвратно удалены!\n\nПродолжить?');
  if (!confirmed) return;
  try {
    const result = await api.post('/admin/reset', {});
    showAlert(result.message);
    navigateTo('dashboard');
  } catch (err) {
    showAlert('Ошибка: ' + err.message);
  }
}
