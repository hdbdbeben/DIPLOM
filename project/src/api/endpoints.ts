import { api } from './client';
import type {
  User,
  Role,
  Bank,
  Client,
  PaymentType,
  Article,
  Statement,
  Payment,
  ErrorItem,
  LogEntry,
  DashboardData,
  ReportData,
  StatementDocument,
} from '@/types';

export function login(login: string, password: string) {
  return api.post<User>('/login', { login, password });
}

export function fetchDashboard() {
  return api.get<DashboardData>('/dashboard');
}

export function fetchRoles() {
  return api.get<Role[]>('/roles');
}

export function fetchUsers() {
  return api.get<User[]>('/users');
}

export function createUser(data: { login: string; password: string; fullName: string; roleId: number }) {
  return api.post<{ id: number }>('/users', data);
}

export function updateUser(id: number, data: { login: string; password?: string; fullName: string; roleId: number; active: boolean }) {
  return api.put<{ ok: true }>('/users/' + id, data);
}

export function deleteUser(id: number) {
  return api.del<{ ok: true }>('/users/' + id);
}

export function fetchBanks() {
  return api.get<Bank[]>('/banks');
}

export function createBank(data: { name: string; bik: string; corrAccount: string }) {
  return api.post<{ id: number }>('/banks', data);
}

export function updateBank(id: number, data: { name: string; bik: string; corrAccount: string }) {
  return api.put<{ ok: true }>('/banks/' + id, data);
}

export function deleteBank(id: number) {
  return api.del<{ ok: true }>('/banks/' + id);
}

export function fetchClients(search?: string) {
  const query = search ? '?search=' + encodeURIComponent(search) : '';
  return api.get<Client[]>('/clients' + query);
}

export function createClient(data: { name: string; inn: string; kpp?: string; account?: string; bik?: string }) {
  return api.post<{ id: number }>('/clients', data);
}

export function updateClient(id: number, data: { name: string; inn: string; kpp?: string; account?: string; bik?: string }) {
  return api.put<{ ok: true }>('/clients/' + id, data);
}

export function deleteClient(id: number) {
  return api.del<{ ok: true }>('/clients/' + id);
}

export function fetchPaymentTypes() {
  return api.get<PaymentType[]>('/payment-types');
}

export function createPaymentType(data: { code: string; name: string }) {
  return api.post<{ id: number }>('/payment-types', data);
}

export function updatePaymentType(id: number, data: { code: string; name: string }) {
  return api.put<{ ok: true }>('/payment-types/' + id, data);
}

export function deletePaymentType(id: number) {
  return api.del<{ ok: true }>('/payment-types/' + id);
}

export function fetchArticles() {
  return api.get<Article[]>('/articles');
}

export function createArticle(data: { code: string; name: string; type: 'income' | 'expense' }) {
  return api.post<{ id: number }>('/articles', data);
}

export function updateArticle(id: number, data: { code: string; name: string; type: 'income' | 'expense' }) {
  return api.put<{ ok: true }>('/articles/' + id, data);
}

export function deleteArticle(id: number) {
  return api.del<{ ok: true }>('/articles/' + id);
}

export function fetchStatements() {
  return api.get<Statement[]>('/statements');
}

export function uploadStatement(data: { fileName: string; documents: StatementDocument[]; userId: number | null }) {
  return api.post<{ statementId: number; autoProcessed: number; errorCount: number; total: number }>('/statements', data);
}

export function deleteStatement(id: number) {
  return api.del<{ ok: true }>('/statements/' + id);
}

export function fetchPayments(params?: { statementId?: number; status?: string; search?: string }) {
  const query: string[] = [];
  if (params?.statementId) query.push('statementId=' + params.statementId);
  if (params?.status && params.status !== 'all') query.push('status=' + params.status);
  if (params?.search) query.push('search=' + encodeURIComponent(params.search));
  const url = '/payments' + (query.length ? '?' + query.join('&') : '');
  return api.get<Payment[]>(url);
}

export function fetchPayment(id: number) {
  return api.get<Payment>('/payments/' + id);
}

export function updatePayment(id: number, data: { clientId: number | null; paymentTypeId: number; articleId: number | null; status: string }) {
  return api.put<{ ok: true }>('/payments/' + id, data);
}

export function fetchErrors(params?: { status?: string }) {
  const query: string[] = [];
  if (params?.status && params.status !== 'all') query.push('status=' + params.status);
  const url = '/errors' + (query.length ? '?' + query.join('&') : '');
  return api.get<ErrorItem[]>(url);
}

export function updateError(id: number, data: { status?: string; assignedTo?: number }) {
  return api.put<{ ok: true }>('/errors/' + id, data);
}

export function fetchLogs() {
  return api.get<LogEntry[]>('/logs');
}

export function fetchReport(params: { from: string; to: string }) {
  return api.get<ReportData>(`/reports/dds?from=${params.from}&to=${params.to}`);
}

export function doBackup(userId?: number) {
  return api.post<{ ok: true; path: string }>('/admin/backup', { userId: userId ?? null });
}

export function doRestore(path: string, userId?: number) {
  return api.post<{ ok: true; message: string }>('/admin/restore', { path, userId: userId ?? null });
}

export function doReset() {
  return api.post<{ ok: true; message: string }>('/admin/reset', {});
}
