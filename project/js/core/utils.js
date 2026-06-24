export function $(sel, ctx) { return (ctx || document).querySelector(sel); }
export function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

export function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

export function escapeAttr(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function formatDate(d) {
  if (!d) return '-';
  return String(d).substring(0, 10);
}

export function formatDateTime(d) {
  if (!d) return '-';
  return String(d).replace('T', ' ').substring(0, 19);
}

export function formatMoney(n) {
  return Number(n || 0).toLocaleString('ru-RU', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
}

export function statusBadge(status) {
  const map = {
    'uploaded': 'badge-info', 'processing': 'badge-info', 'processed': 'badge-success',
    'manual': 'badge-warning', 'error': 'badge-danger',
    'new': 'badge-danger', 'in_progress': 'badge-warning', 'resolved': 'badge-success'
  };
  const labels = {
    'uploaded': 'Загружено', 'processing': 'Обработка', 'processed': 'Обработано',
    'manual': 'Ручная проверка', 'error': 'Ошибка',
    'new': 'Новая', 'in_progress': 'В работе', 'resolved': 'Решено'
  };
  return `<span class="badge ${map[status] || 'badge-info'}">${labels[status] || status}</span>`;
}

export function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

export function assertElement(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`[ASBO] Element #${id} not found in DOM`);
  return el;
}
