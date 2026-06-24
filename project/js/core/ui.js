import { $, escapeHTML } from './utils.js';
import { api } from './api.js';

const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

export function showToast(message, type = 'info', duration = 3500) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function showModal(title, bodyHtml, footerHtml = '') {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = bodyHtml;
  $('#modalFooter').innerHTML = footerHtml;
  $('#modal').classList.remove('hidden');
}

export function hideModal() {
  $('#modal').classList.add('hidden');
}

export function renderTable(tbody, data, columns) {
  tbody.innerHTML = data.map(row =>
    `<tr>${columns.map(fn => `<td>${fn(row)}</td>`).join('')}</tr>`
  ).join('');
}

export function setPageLoading(container, isLoading) {
  if (isLoading) {
    container.classList.add('page-loading');
    if (!container.querySelector('.loading-spinner')) {
      const spinner = document.createElement('div');
      spinner.className = 'loading-spinner';
      spinner.innerHTML = '<div class="spinner"></div><span>Загрузка...</span>';
      container.appendChild(spinner);
    }
  } else {
    container.classList.remove('page-loading');
    const spinner = container.querySelector('.loading-spinner');
    if (spinner) spinner.remove();
  }
}

export function showAlert(message, type = 'info') {
  return new Promise(resolve => {
    showModal('Уведомление',
      `<div class="alert-message alert-${type}">${escapeHTML(message)}</div>`,
      `<button class="btn btn-primary close-modal">OK</button>`
    );
    const handler = () => { resolve(); };
    $('#modal').querySelector('.close-modal').addEventListener('click', handler, { once: true });
  });
}

export function showConfirm(message) {
  return new Promise(resolve => {
    showModal('Подтверждение',
      `<div class="alert-message">${escapeHTML(message)}</div>`,
      `<button class="btn btn-primary confirm-yes">Да</button>
       <button class="btn btn-outline confirm-no">Нет</button>`
    );
    $('#modal').querySelector('.confirm-yes').addEventListener('click', () => { hideModal(); resolve(true); }, { once: true });
    $('#modal').querySelector('.confirm-no').addEventListener('click', () => { hideModal(); resolve(false); }, { once: true });
  });
}
