/**
 * @file Набор типизированных функций-эндпоинтов для взаимодействия с REST API.
 * Каждая функция инкапсулирует вызов соответствующего маршрута сервера
 * и возвращает Promise с ожидаемым типом данных.
 */

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
  OneCOrganization,
  OneCContract,
  OneCExportDocument,
  OneCExportResult,
  OneCExchangeLogEntry,
} from '@/types';

/**
 * Аутентификация пользователя.
 * @param login Логин
 * @param password Пароль
 * @returns Объект пользователя (User) при успешном входе
 */
export function login(login: string, password: string) {
  return api.post<User>('/login', { login, password });
}

/**
 * Получение данных для главной панели (dashboard).
 * @returns Агрегированные данные: счётчики, последние выписки, ошибки
 */
export function fetchDashboard() {
  return api.get<DashboardData>('/dashboard');
}

/**
 * Получение списка ролей.
 * @returns Массив ролей (Role[])
 */
export function fetchRoles() {
  return api.get<Role[]>('/roles');
}

/**
 * Получение списка пользователей.
 * @returns Массив пользователей (User[])
 */
export function fetchUsers() {
  return api.get<User[]>('/users');
}

/**
 * Создание нового пользователя.
 * @param data Данные пользователя: логин, пароль, ФИО, ID роли
 * @returns Объект с ID созданного пользователя
 */
export function createUser(data: { login: string; password: string; fullName: string; roleId: number }) {
  return api.post<{ id: number }>('/users', data);
}

/**
 * Обновление данных пользователя.
 * @param id ID пользователя
 * @param data Новые данные (пароль опционален, остальные обязательны)
 * @returns Подтверждение успешной операции
 */
export function updateUser(id: number, data: { login: string; password?: string; fullName: string; roleId: number; active: boolean }) {
  return api.put<{ ok: true }>('/users/' + id, data);
}

/**
 * Удаление пользователя.
 * @param id ID пользователя
 * @returns Подтверждение успешной операции
 */
export function deleteUser(id: number) {
  return api.del<{ ok: true }>('/users/' + id);
}

/**
 * Получение списка банков.
 * @returns Массив банков (Bank[])
 */
export function fetchBanks() {
  return api.get<Bank[]>('/banks');
}

/**
 * Создание нового банка.
 * @param data Данные банка: название, БИК, корр. счёт
 * @returns Объект с ID созданного банка
 */
export function createBank(data: { name: string; bik: string; corrAccount: string }) {
  return api.post<{ id: number }>('/banks', data);
}

/**
 * Обновление данных банка.
 * @param id ID банка
 * @param data Новые данные банка
 * @returns Подтверждение успешной операции
 */
export function updateBank(id: number, data: { name: string; bik: string; corrAccount: string }) {
  return api.put<{ ok: true }>('/banks/' + id, data);
}

/**
 * Удаление банка.
 * @param id ID банка
 * @returns Подтверждение успешной операции
 */
export function deleteBank(id: number) {
  return api.del<{ ok: true }>('/banks/' + id);
}

/**
 * Получение списка клиентов с опциональным поиском.
 * @param search Строка поиска (опционально, будет закодирована в URL)
 * @returns Массив клиентов (Client[])
 */
export function fetchClients(search?: string) {
  const query = search ? '?search=' + encodeURIComponent(search) : '';
  return api.get<Client[]>('/clients' + query);
}

/**
 * Создание нового клиента.
 * @param data Данные клиента (КПП, счёт и БИК опциональны)
 * @returns Объект с ID созданного клиента
 */
export function createClient(data: { name: string; inn: string; kpp?: string; account?: string; bik?: string }) {
  return api.post<{ id: number }>('/clients', data);
}

/**
 * Обновление данных клиента.
 * @param id ID клиента
 * @param data Новые данные клиента
 * @returns Подтверждение успешной операции
 */
export function updateClient(id: number, data: { name: string; inn: string; kpp?: string; account?: string; bik?: string }) {
  return api.put<{ ok: true }>('/clients/' + id, data);
}

/**
 * Удаление клиента.
 * @param id ID клиента
 * @returns Подтверждение успешной операции
 */
export function deleteClient(id: number) {
  return api.del<{ ok: true }>('/clients/' + id);
}

/**
 * Получение списка типов платежей.
 * @returns Массив типов платежей (PaymentType[])
 */
export function fetchPaymentTypes() {
  return api.get<PaymentType[]>('/payment-types');
}

/**
 * Создание нового типа платежа.
 * @param data Код и название типа платежа
 * @returns Объект с ID созданного типа
 */
export function createPaymentType(data: { code: string; name: string }) {
  return api.post<{ id: number }>('/payment-types', data);
}

/**
 * Обновление типа платежа.
 * @param id ID типа платежа
 * @param data Новые код и название
 * @returns Подтверждение успешной операции
 */
export function updatePaymentType(id: number, data: { code: string; name: string }) {
  return api.put<{ ok: true }>('/payment-types/' + id, data);
}

/**
 * Удаление типа платежа.
 * @param id ID типа платежа
 * @returns Подтверждение успешной операции
 */
export function deletePaymentType(id: number) {
  return api.del<{ ok: true }>('/payment-types/' + id);
}

/**
 * Получение списка статей доходов/расходов.
 * @returns Массив статей (Article[])
 */
export function fetchArticles() {
  return api.get<Article[]>('/articles');
}

/**
 * Создание новой статьи.
 * @param data Код, название и тип статьи ('income' — доход, 'expense' — расход)
 * @returns Объект с ID созданной статьи
 */
export function createArticle(data: { code: string; name: string; type: 'income' | 'expense' }) {
  return api.post<{ id: number }>('/articles', data);
}

/**
 * Обновление статьи.
 * @param id ID статьи
 * @param data Новые код, название и тип
 * @returns Подтверждение успешной операции
 */
export function updateArticle(id: number, data: { code: string; name: string; type: 'income' | 'expense' }) {
  return api.put<{ ok: true }>('/articles/' + id, data);
}

/**
 * Удаление статьи.
 * @param id ID статьи
 * @returns Подтверждение успешной операции
 */
export function deleteArticle(id: number) {
  return api.del<{ ok: true }>('/articles/' + id);
}

/**
 * Получение списка выписок (загруженных файлов).
 * @returns Массив выписок (Statement[])
 */
export function fetchStatements() {
  return api.get<Statement[]>('/statements');
}

/**
 * Загрузка новой выписки (парсинг документов на клиенте, отправка на сервер).
 * @param data Имя файла, массив документов и ID пользователя
 * @returns Результат загрузки: ID выписки, число автообработанных и ошибочных платежей
 */
export function uploadStatement(data: { fileName: string; documents: StatementDocument[]; userId: number | null }) {
  return api.post<{ statementId: number; autoProcessed: number; errorCount: number; total: number }>('/statements', data);
}

/**
 * Удаление выписки и всех связанных с ней платежей.
 * @param id ID выписки
 * @returns Подтверждение успешной операции
 */
export function deleteStatement(id: number) {
  return api.del<{ ok: true }>('/statements/' + id);
}

/**
 * Получение списка платежей с опциональной фильтрацией.
 * @param params Параметры фильтрации: ID выписки, статус, строка поиска
 * @returns Массив платежей (Payment[])
 */
export function fetchPayments(params?: { statementId?: number; status?: string; search?: string }) {
  // Формируем строку запроса из переданных параметров
  const query: string[] = [];
  if (params?.statementId) query.push('statementId=' + params.statementId);
  // Исключаем 'all' — это значение по умолчанию на клиенте, не требующее фильтра на сервере
  if (params?.status && params.status !== 'all') query.push('status=' + params.status);
  // Кодируем строку поиска для безопасной передачи в URL
  if (params?.search) query.push('search=' + encodeURIComponent(params.search));
  const url = '/payments' + (query.length ? '?' + query.join('&') : '');
  return api.get<Payment[]>(url);
}

/**
 * Получение одного платежа по ID (детальный просмотр).
 * @param id ID платежа
 * @returns Объект платежа (Payment)
 */
export function fetchPayment(id: number) {
  return api.get<Payment>('/payments/' + id);
}

/**
 * Обновление платежа (ручная корректировка).
 * @param id ID платежа
 * @param data Новые значения: ID клиента, типа платежа, статьи, статус
 * @returns Подтверждение успешной операции
 */
export function updatePayment(id: number, data: { clientId: number | null; paymentTypeId: number; articleId: number | null; status: string }) {
  return api.put<{ ok: true }>('/payments/' + id, data);
}

/**
 * Создание нового платежа (ручной ввод пользователем).
 * @param data Данные платежа: номер, дата, сумма, плательщик, получатель, назначение, справочники
 * @returns Созданный объект платежа
 */
export function createPayment(data: {
  docNumber: string;
  docDate: string;
  amount: number;
  payerName: string;
  payerInn: string;
  payerAccount: string;
  payeeName: string;
  payeeInn: string;
  payeeAccount: string;
  purpose: string;
  paymentTypeId: number;
  articleId: number | null;
  clientId: number | null;
  contractId: number | null;
  contractNumber: string;
  status?: string;
}) {
  return api.post<Payment>('/payments', data);
}

/**
 * Получение списка ошибок обработки с опциональной фильтрацией по статусу.
 * @param params Параметры фильтрации: статус ошибки
 * @returns Массив ошибок (ErrorItem[])
 */
export function fetchErrors(params?: { status?: string }) {
  // Формируем строку запроса (аналогично fetchPayments)
  const query: string[] = [];
  if (params?.status && params.status !== 'all') query.push('status=' + params.status);
  const url = '/errors' + (query.length ? '?' + query.join('&') : '');
  return api.get<ErrorItem[]>(url);
}

/**
 * Обновление статуса ошибки или назначение ответственного.
 * @param id ID ошибки
 * @param data Новый статус и/или ID назначенного пользователя
 * @returns Подтверждение успешной операции
 */
export function updateError(id: number, data: { status?: string; assignedTo?: number }) {
  return api.put<{ ok: true }>('/errors/' + id, data);
}

/**
 * Получение журнала действий пользователей.
 * @returns Массив записей журнала (LogEntry[])
 */
export function fetchLogs() {
  return api.get<LogEntry[]>('/logs');
}

/**
 * Получение отчёта о движении денежных средств (ДДС) за период.
 * @param params Начальная и конечная даты периода (формат YYYY-MM-DD)
 * @returns Данные отчёта (ReportData)
 */
export function fetchReport(params: { from: string; to: string }) {
  return api.get<ReportData>(`/reports/dds?from=${params.from}&to=${params.to}`);
}

/**
 * Создание резервной копии базы данных.
 * @param userId ID пользователя, выполняющего операцию (опционально)
 * @returns Подтверждение и путь к созданному файлу
 */
export function doBackup(userId?: number) {
  return api.post<{ ok: true; path: string }>('/admin/backup', { userId: userId ?? null });
}

/**
 * Восстановление базы данных из резервной копии.
 * @param path Путь к файлу резервной копии
 * @param userId ID пользователя, выполняющего операцию (опционально)
 * @returns Подтверждение и сообщение о результате
 */
export function doRestore(path: string, userId?: number) {
  return api.post<{ ok: true; message: string }>('/admin/restore', { path, userId: userId ?? null });
}

/**
 * Полный сброс базы данных (удаление всех данных).
 * @returns Подтверждение и сообщение о результате
 */
export function doReset() {
  return api.post<{ ok: true; message: string }>('/admin/reset', {});
}

// ==================== 1С: Интеграция ====================

export function fetchOneCOrganizations() {
  return api.get<OneCOrganization[]>('/1c/organizations');
}

export function fetchOneCContracts() {
  return api.get<OneCContract[]>('/1c/contracts');
}

export function importOneCContracts(contractIds: number[]) {
  return api.post<{ imported: number; clientsCreated: number }>('/1c/import-contracts', { contractIds });
}

export function fetchOneCExportReady() {
  return api.get<OneCExportDocument[]>('/1c/export-ready');
}

export function exportToOneC(paymentIds: number[]) {
  return api.post<OneCExportResult>('/1c/export', { paymentIds });
}

export function fetchOneCExchangeLog() {
  return api.get<OneCExchangeLogEntry[]>('/1c/exchange-log');
}
