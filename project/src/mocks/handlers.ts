import { http, HttpResponse } from 'msw';
import type { DefaultBodyType, StrictRequest } from 'msw';
import {
  mockRoles,
  mockUsers,
  mockBanks,
  mockClients,
  mockPaymentTypes,
  mockArticles,
  mockStatements,
  mockPayments,
  mockErrors,
  mockLogs,
  mockDashboard,
  mockReport,
} from './data';

let nextUserId = 5;
let nextBankId = 9;
let nextClientId = 21;
let nextPtId = 4;
let nextArticleId = 9;
let nextStmtId = 4;
let nextPayId = 20;
let nextErrId = 6;

const users = [...mockUsers];
const banks = [...mockBanks];
const clients = [...mockClients];
const paymentTypes = [...mockPaymentTypes];
const articles = [...mockArticles];
const statements = [...mockStatements];
const payments = [...mockPayments];
const errors = [...mockErrors];
const logs = [...mockLogs];

function parseId(req: StrictRequest<DefaultBodyType>, paramName: string): number {
  const url = new URL(req.url);
  const pattern = url.pathname.split('/').pop() || '0';
  return parseInt(pattern, 10);
}

export const handlers = [
  http.post('/api/login', async ({ request }) => {
    const body = await request.json() as { login: string; password: string };
    const pwMap: Record<string, string> = { admin: 'admin', buh: 'buh123', buh2: 'buh123', dir: 'dir123' };
    const user = users.find((u) => u.login === body.login && pwMap[u.login] === body.password && u.active === 1);
    if (!user) return HttpResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 });
    return HttpResponse.json(user);
  }),

  http.get('/api/dashboard', () => HttpResponse.json(mockDashboard)),

  http.get('/api/roles', () => HttpResponse.json(users.map(u => mockRoles.find(r => r.id === u.roleId)!).filter(Boolean))),

  http.get('/api/users', () => HttpResponse.json(users)),
  http.post('/api/users', async ({ request }) => {
    const body = await request.json() as { login: string; password: string; fullName: string; roleId: number };
    const role = mockRoles.find((r) => r.id === body.roleId)!;
    const newUser = { id: nextUserId++, login: body.login, fullName: body.fullName, roleId: body.roleId, role: role.code as 'admin' | 'accountant' | 'manager', roleName: role.name, active: 1 };
    users.push(newUser);
    return HttpResponse.json({ id: newUser.id });
  }),
  http.put('/api/users/:id', async ({ request, params }) => {
    const id = parseInt(params.id as string);
    const body = await request.json() as { login: string; fullName: string; roleId: number; active: number };
    const user = users.find((u) => u.id === id);
    if (user) {
      user.login = body.login;
      user.fullName = body.fullName;
      user.roleId = body.roleId;
      user.active = body.active;
    }
    return HttpResponse.json({ ok: true });
  }),
  http.delete('/api/users/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const idx = users.findIndex((u) => u.id === id);
    if (idx >= 0) users.splice(idx, 1);
    return HttpResponse.json({ ok: true });
  }),

  http.get('/api/banks', () => HttpResponse.json(banks)),
  http.post('/api/banks', async ({ request }) => {
    const body = await request.json() as { name: string; bik: string; corrAccount: string };
    const newBank = { id: nextBankId++, name: body.name, bik: body.bik, corr_account: body.corrAccount };
    banks.push(newBank);
    return HttpResponse.json({ id: newBank.id });
  }),
  http.put('/api/banks/:id', async ({ request, params }) => {
    const id = parseInt(params.id as string);
    const body = await request.json() as { name: string; bik: string; corrAccount: string };
    const bank = banks.find((b) => b.id === id);
    if (bank) { bank.name = body.name; bank.bik = body.bik; bank.corr_account = body.corrAccount; }
    return HttpResponse.json({ ok: true });
  }),
  http.delete('/api/banks/:id', ({ params }) => {
    const idx = banks.findIndex((b) => b.id === parseInt(params.id as string));
    if (idx >= 0) banks.splice(idx, 1);
    return HttpResponse.json({ ok: true });
  }),

  http.get('/api/clients', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    if (search) {
      const q = search.toLowerCase();
      return HttpResponse.json(clients.filter((c) => c.name.toLowerCase().includes(q) || c.inn.includes(q)));
    }
    return HttpResponse.json(clients);
  }),
  http.post('/api/clients', async ({ request }) => {
    const body = await request.json() as { name: string; inn: string; kpp: string; account: string; bik: string };
    const newClient = { id: nextClientId++, name: body.name, inn: body.inn, kpp: body.kpp || '', account: body.account || '', bik: body.bik || '', status: 'active' };
    clients.push(newClient);
    return HttpResponse.json({ id: newClient.id });
  }),
  http.put('/api/clients/:id', async ({ request, params }) => {
    const id = parseInt(params.id as string);
    const body = await request.json() as { name: string; inn: string; kpp: string; account: string; bik: string };
    const client = clients.find((c) => c.id === id);
    if (client) { client.name = body.name; client.inn = body.inn; client.kpp = body.kpp || ''; client.account = body.account || ''; client.bik = body.bik || ''; }
    return HttpResponse.json({ ok: true });
  }),
  http.delete('/api/clients/:id', ({ params }) => {
    const idx = clients.findIndex((c) => c.id === parseInt(params.id as string));
    if (idx >= 0) clients.splice(idx, 1);
    return HttpResponse.json({ ok: true });
  }),

  http.get('/api/payment-types', () => HttpResponse.json(paymentTypes)),
  http.post('/api/payment-types', async ({ request }) => {
    const body = await request.json() as { code: string; name: string };
    const newPt = { id: nextPtId++, code: body.code, name: body.name };
    paymentTypes.push(newPt);
    return HttpResponse.json({ id: newPt.id });
  }),
  http.put('/api/payment-types/:id', async ({ request, params }) => {
    const id = parseInt(params.id as string);
    const body = await request.json() as { code: string; name: string };
    const pt = paymentTypes.find((p) => p.id === id);
    if (pt) { pt.code = body.code; pt.name = body.name; }
    return HttpResponse.json({ ok: true });
  }),
  http.delete('/api/payment-types/:id', ({ params }) => {
    const idx = paymentTypes.findIndex((p) => p.id === parseInt(params.id as string));
    if (idx >= 0) paymentTypes.splice(idx, 1);
    return HttpResponse.json({ ok: true });
  }),

  http.get('/api/articles', () => HttpResponse.json(articles)),
  http.post('/api/articles', async ({ request }) => {
    const body = await request.json() as { code: string; name: string; type: 'income' | 'expense' };
    const newArticle = { id: nextArticleId++, code: body.code, name: body.name, type: body.type };
    articles.push(newArticle);
    return HttpResponse.json({ id: newArticle.id });
  }),
  http.put('/api/articles/:id', async ({ request, params }) => {
    const id = parseInt(params.id as string);
    const body = await request.json() as { code: string; name: string; type: 'income' | 'expense' };
    const a = articles.find((x) => x.id === id);
    if (a) { a.code = body.code; a.name = body.name; a.type = body.type; }
    return HttpResponse.json({ ok: true });
  }),
  http.delete('/api/articles/:id', ({ params }) => {
    const idx = articles.findIndex((a) => a.id === parseInt(params.id as string));
    if (idx >= 0) articles.splice(idx, 1);
    return HttpResponse.json({ ok: true });
  }),

  http.get('/api/statements', () => HttpResponse.json(statements)),
  http.post('/api/statements', async ({ request }) => {
    const body = await request.json() as { fileName: string; documents: unknown[] };
    const newStmt = { id: nextStmtId++, file_name: body.fileName, uploaded_at: new Date().toISOString(), total_operations: (body.documents as []).length, auto_processed: 0, error_count: 0, status: 'processed', user_id: 1, uploaded_by: 'Чистякова М.В.' };
    statements.unshift(newStmt);
    return HttpResponse.json({ statementId: newStmt.id, autoProcessed: 0, errorCount: 0, total: (body.documents as []).length });
  }),
  http.delete('/api/statements/:id', ({ params }) => {
    const idx = statements.findIndex((s) => s.id === parseInt(params.id as string));
    if (idx >= 0) statements.splice(idx, 1);
    return HttpResponse.json({ ok: true });
  }),

  http.get('/api/payments', ({ request }) => {
    const url = new URL(request.url);
    const stmtId = url.searchParams.get('statementId');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    let result = [...payments];
    if (stmtId) result = result.filter((p) => p.statement_id === parseInt(stmtId));
    if (status && status !== 'all') result = result.filter((p) => p.status === status);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        (p.payer_name || '').toLowerCase().includes(q) ||
        (p.payee_name || '').toLowerCase().includes(q) ||
        (p.payer_inn || '').includes(q) ||
        (p.payee_inn || '').includes(q) ||
        (p.purpose || '').toLowerCase().includes(q)
      );
    }
    return HttpResponse.json(result);
  }),
  http.get('/api/payments/:id', ({ params }) => {
    const p = payments.find((x) => x.id === parseInt(params.id as string));
    if (!p) return HttpResponse.json({ error: 'Платёж не найден' }, { status: 404 });
    return HttpResponse.json(p);
  }),
  http.put('/api/payments/:id', async ({ request, params }) => {
    const id = parseInt(params.id as string);
    const body = await request.json() as { clientId: number | null; paymentTypeId: number; articleId: number | null; status: string };
    const p = payments.find((x) => x.id === id);
    if (p) { p.client_id = body.clientId; p.payment_type_id = body.paymentTypeId; p.article_id = body.articleId; p.status = body.status || 'processed'; }
    return HttpResponse.json({ ok: true });
  }),

  http.get('/api/errors', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    if (status && status !== 'all') return HttpResponse.json(errors.filter(e => e.status === status));
    return HttpResponse.json(errors);
  }),
  http.put('/api/errors/:id', async ({ request, params }) => {
    const id = parseInt(params.id as string);
    const body = await request.json() as { status?: string; assignedTo?: number };
    const e = errors.find((x) => x.id === id);
    if (e) {
      if (body.status) e.status = body.status as 'new' | 'in_progress' | 'resolved';
      if (body.assignedTo) e.assigned_to = body.assignedTo;
    }
    return HttpResponse.json({ ok: true });
  }),

  http.get('/api/logs', ({ request }) => HttpResponse.json(logs)),

  http.get('/api/reports/dds', ({ request }) => HttpResponse.json(mockReport)),

  http.post('/api/admin/backup', () => HttpResponse.json({ ok: true, path: 'asbo_backup_' + new Date().toISOString().slice(0, 10) + '.db' })),
  http.post('/api/admin/restore', () => HttpResponse.json({ ok: true, message: 'База данных восстановлена.' })),
  http.post('/api/admin/reset', () => HttpResponse.json({ ok: true, message: 'Все данные сброшены.' })),
];
