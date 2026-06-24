import { AppState } from './core/state.js';
import { $, $$ } from './core/utils.js';
import { api } from './core/api.js';
import { hideModal } from './core/ui.js';
import { navigateTo, register } from './core/router.js';

import { load as dashboardLoad } from './pages/dashboard.js';
import * as statements from './pages/statements.js';
import * as payments from './pages/payments.js';
import * as directories from './pages/directories.js';
import * as reports from './pages/reports.js';
import * as errors from './pages/errors.js';
import * as admin from './pages/admin.js';

register('dashboard', { load: dashboardLoad });
register('statements', { load: statements.load });
register('payments', { load: payments.load });
register('directories', { load: directories.load });
register('reports', { load: reports.load });
register('errors', { load: errors.load });
register('logs', { load: admin.load });
register('admin', { load() { admin.loadUsers(); admin.loadRoles(); } });

// ===== LOGIN =====
$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const login = $('#loginUser').value.trim();
  const pass = $('#loginPass').value.trim();
  if (!login || !pass) return;

  try {
    const user = await api.post('/login', { login, password: pass });
    AppState.set('user', user);
    $('#loginPage').classList.remove('active');
    $('#appPage').classList.add('active');
    $('#currentUser').textContent = user.fullName;
    $('#topbarUser').textContent = user.login + ' (' + user.roleName + ')';
    if (user.role !== 'admin') {
      $$('.admin-only').forEach(el => el.classList.add('hidden'));
    }
    navigateTo('dashboard');
  } catch (err) {
    $('#loginError').textContent = err.message;
    $('#loginError').classList.remove('hidden');
  }
});

$('#logoutBtn').addEventListener('click', () => {
  AppState.set('user', null);
  $('#appPage').classList.remove('active');
  $('#loginPage').classList.add('active');
  $('#loginForm').reset();
  $('#loginError').classList.add('hidden');
});

// ===== GLOBAL EVENT DELEGATION =====
document.addEventListener('click', e => {
  const target = e.target;

  // Nav links
  const navItem = target.closest('#mainNav .nav-item');
  if (navItem) { e.preventDefault(); navigateTo(navItem.dataset.page); return; }

  // Tabs (directories & admin)
  const tab = target.closest('.tab');
  if (tab) {
    const container = tab.parentElement;
    const targetId = tab.dataset.dir || tab.dataset.admin;
    container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    if (tab.dataset.dir) {
      directories.switchTab(targetId);
    } else if (tab.dataset.admin) {
      $$('.admin-panel').forEach(p => p.classList.remove('active'));
      const ap = $('#admin' + targetId.charAt(0).toUpperCase() + targetId.slice(1));
      if (ap) ap.classList.add('active');
    }
    return;
  }

  // Modal close
  if (target.closest('.modal-close') || target.closest('.close-modal') || (target.id === 'modal' && target.classList.contains('modal'))) {
    hideModal(); return;
  }

  // ===== STATEMENTS =====
  if (target.closest('#btnUploadStatement')) { $('#fileStatement').click(); return; }
  if (target.closest('#btnDemoStatement')) { statements.loadDemo(); return; }
  if (target.closest('#btnConfirmUpload')) { statements.confirmUpload(); return; }
  if (target.closest('#btnCancelUpload')) { statements.cancelUpload(); return; }
  if (target.closest('#btnProcessAll')) { statements.processAll(); return; }

  // ===== REPORTS =====
  if (target.closest('#btnGenerateReport')) { reports.generateReport(); return; }
  if (target.closest('#btnExportExcel')) { reports.exportToExcel(); return; }

  // ===== ADMIN SETTINGS =====
  if (target.closest('#btnBackup')) { admin.doBackup(); return; }
  if (target.closest('#btnRestore')) { admin.doRestore(); return; }
  if (target.closest('#btnClearAll')) { admin.doReset(); return; }

  // ===== BUTTON HANDLERS (by class) =====
  const btn = target.closest('button');
  if (!btn) return;
  const cls = btn.className;

  // Statements
  if (cls.includes('view-stmt')) { statements.viewStatement(parseInt(btn.dataset.id)); }
  if (cls.includes('del-stmt') && confirm('Удалить выписку и все её операции?')) { statements.deleteStatement(parseInt(btn.dataset.id)); }

  // Payments
  if (cls.includes('view-payment')) { payments.showDetail(parseInt(btn.dataset.id)); }
  if (cls.includes('save-payment')) { payments.savePayment(btn); }

  // Directory add buttons (by data-action)
  const action = btn.dataset.action;
  if (action === 'addClient') directories.showAddClientForm();
  if (action === 'addBank') directories.showAddBankForm();
  if (action === 'addPaymentType') directories.showAddPaymentTypeForm();
  if (action === 'addArticle') directories.showAddArticleForm();
  if (action === 'addUser') admin.showAddUserForm();

  // Clients
  if (cls.includes('edit-client')) directories.showEditClientForm(parseInt(btn.dataset.id));
  if (cls.includes('del-client') && confirm('Удалить контрагента?')) directories.deleteClient(parseInt(btn.dataset.id));

  // Banks
  if (cls.includes('edit-bank')) directories.showEditBankForm(parseInt(btn.dataset.id));
  if (cls.includes('del-bank') && confirm('Удалить банк?')) directories.deleteBank(parseInt(btn.dataset.id));

  // Payment Types
  if (cls.includes('edit-pt')) directories.showEditPaymentTypeForm(parseInt(btn.dataset.id));
  if (cls.includes('del-pt') && confirm('Удалить тип платежа?')) directories.deletePaymentType(parseInt(btn.dataset.id));

  // Articles
  if (cls.includes('edit-article')) directories.showEditArticleForm(parseInt(btn.dataset.id));
  if (cls.includes('del-article') && confirm('Удалить статью?')) directories.deleteArticle(parseInt(btn.dataset.id));

  // Users
  if (cls.includes('edit-user')) admin.showEditUserForm(parseInt(btn.dataset.id));
  if (cls.includes('del-user') && confirm('Удалить пользователя?')) admin.deleteUser(parseInt(btn.dataset.id));

  // Errors
  if (cls.includes('resolve-error')) {
    const st = cls.includes('btn-success') ? 'resolved' : 'in_progress';
    errors.resolveError(parseInt(btn.dataset.id), st);
  }
  if (cls.includes('assign-error')) errors.showAssignForm(parseInt(btn.dataset.id));
  if (cls.includes('save-assign')) errors.saveAssign(btn);

  // Save modal forms
  if (cls.includes('save-client')) directories.saveClient(btn);
  if (cls.includes('save-bank')) directories.saveBank(btn);
  if (cls.includes('save-pt')) directories.savePaymentType(btn);
  if (cls.includes('save-article')) directories.saveArticle(btn);
  if (cls.includes('save-user')) admin.saveUser(btn);
});

// ===== FORM CONTROLS =====
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'fileStatement' && t.files[0]) { statements.handleUpload(t.files[0]); t.value = ''; }
  if (t.id === 'payStatusFilter') payments.filterByStatus(t);
  if (t.id === 'errStatusFilter') errors.filterByStatus(t);
});

document.addEventListener('input', e => {
  if (e.target.id === 'paySearch') payments.searchPayments(e.target);
  if (e.target.id === 'clSearch') directories.loadClients(e.target.value.trim());
});
