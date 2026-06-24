import { AppState } from './state.js';
import { $, $$ } from './utils.js';

const pageModules = {};

export function register(pageName, module) {
  pageModules[pageName] = module;
}

const titles = {
  dashboard: 'Панель управления',
  statements: 'Банковские выписки',
  payments: 'Платёжные операции',
  directories: 'Справочники',
  reports: 'Отчёты',
  errors: 'Журнал ошибок',
  logs: 'Журнал действий',
  admin: 'Администрирование'
};

export function navigateTo(page) {
  AppState.set('currentPage', page);

  $$('#mainNav .nav-item').forEach(a => a.classList.remove('active'));
  const navItem = $(`#mainNav [data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');

  $$('.content-page').forEach(p => p.classList.remove('active'));
  const contentPage = $('#page' + page.charAt(0).toUpperCase() + page.slice(1));
  if (contentPage) contentPage.classList.add('active');

  $('#pageTitle').textContent = titles[page] || page;

  const mod = pageModules[page];
  if (mod && typeof mod.load === 'function') {
    mod.load();
  }
}

export function navigateIfAuth(page) {
  if (!AppState.user) return;
  navigateTo(page);
}
