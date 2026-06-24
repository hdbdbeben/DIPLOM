const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
const distPath = path.join(__dirname, '..', 'dist');
const fs = require('fs');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.use(express.static(path.join(__dirname, '..')));
}

const PORT = process.env.PORT || 3000;

// ===== AUTH =====
app.post('/api/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    const user = await db.queryOne(
      'SELECT u.*, r.code as role_code, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.login = ? AND u.password = ? AND u.active = 1',
      [login, password]
    );
    if (!user) return res.status(401).json({ error: 'Неверный логин или пароль' });

    await db.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [user.id, 'Вход в систему']);
    res.json({ id: user.id, login: user.login, fullName: user.full_name, roleId: user.role_id, role: user.role_code, roleName: user.role_name });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== USERS / ROLES =====
app.get('/api/roles', async (req, res) => {
  try { res.json(await db.query('SELECT * FROM roles ORDER BY id')); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await db.query(
      'SELECT u.id, u.login, u.full_name, u.role_id, u.active, r.code as role_code, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id ORDER BY u.id'
    );
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/users', async (req, res) => {
  try {
    const { login, password, fullName, roleId } = req.body;
    const existing = await db.queryOne('SELECT id FROM users WHERE login = ?', [login]);
    if (existing) return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
    const id = await db.insert('users', { login, password, full_name: fullName, role_id: roleId, active: 1 });
    res.json({ id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { login, password, fullName, roleId, active } = req.body;
    const data = { login, full_name: fullName, role_id: roleId, active: active ? 1 : 0 };
    if (password) data.password = password;
    await db.update('users', req.params.id, data);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/users/:id', async (req, res) => {
  try { await db.remove('users', req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== BANKS =====
app.get('/api/banks', async (req, res) => {
  try { res.json(await db.query('SELECT * FROM banks ORDER BY id')); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/banks', async (req, res) => {
  try {
    const { name, bik, corrAccount } = req.body;
    const id = await db.insert('banks', { name, bik, corr_account: corrAccount });
    res.json({ id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/banks/:id', async (req, res) => {
  try {
    const { name, bik, corrAccount } = req.body;
    await db.update('banks', req.params.id, { name, bik, corr_account: corrAccount });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/banks/:id', async (req, res) => {
  try { await db.remove('banks', req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== CLIENTS =====
app.get('/api/clients', async (req, res) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM clients';
    let params = [];
    if (search) {
      sql += ' WHERE name LIKE ? OR inn LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }
    sql += ' ORDER BY id';
    res.json(await db.query(sql, params));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/clients', async (req, res) => {
  try {
    const { name, inn, kpp, account, bik } = req.body;
    const id = await db.insert('clients', { name, inn, kpp: kpp || '', account: account || '', bik: bik || '' });
    res.json({ id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/clients/:id', async (req, res) => {
  try {
    const { name, inn, kpp, account, bik } = req.body;
    await db.update('clients', req.params.id, { name, inn, kpp: kpp || '', account: account || '', bik: bik || '' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/clients/:id', async (req, res) => {
  try { await db.remove('clients', req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== PAYMENT TYPES =====
app.get('/api/payment-types', async (req, res) => {
  try { res.json(await db.query('SELECT * FROM payment_types ORDER BY id')); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/payment-types', async (req, res) => {
  try {
    const { code, name } = req.body;
    const id = await db.insert('payment_types', { code, name });
    res.json({ id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/payment-types/:id', async (req, res) => {
  try {
    const { code, name } = req.body;
    await db.update('payment_types', req.params.id, { code, name });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/payment-types/:id', async (req, res) => {
  try { await db.remove('payment_types', req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== ARTICLES =====
app.get('/api/articles', async (req, res) => {
  try { res.json(await db.query('SELECT * FROM articles ORDER BY id')); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/articles', async (req, res) => {
  try {
    const { code, name, type } = req.body;
    const id = await db.insert('articles', { code, name, type });
    res.json({ id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/articles/:id', async (req, res) => {
  try {
    const { code, name, type } = req.body;
    await db.update('articles', req.params.id, { code, name, type });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/articles/:id', async (req, res) => {
  try { await db.remove('articles', req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== STATEMENTS =====
app.get('/api/statements', async (req, res) => {
  try {
    res.json(await db.query(
      'SELECT s.*, u.full_name as uploaded_by FROM statements s LEFT JOIN users u ON s.user_id = u.id ORDER BY s.id DESC'
    ));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/statements', async (req, res) => {
  try {
    const { fileName, documents, userId } = req.body;
    const statementId = await db.insert('statements', {
      file_name: fileName,
      total_operations: documents.length,
      status: 'processing',
      user_id: userId
    });

    let autoProcessed = 0;
    let errorCount = 0;
    const clients = await db.query('SELECT * FROM clients');

    for (const doc of documents) {
      try {
        const amount = parseNumber(doc['Сумма'] || '0');
        const payerName = extractName(doc['Плательщик'] || '');
        const payerInn = extractInn(doc['Плательщик'] || '');
        const payeeName = extractName(doc['Получатель'] || '');
        const payeeInn = extractInn(doc['Получатель'] || '');
        const purpose = doc['НазначениеПлатежа'] || '';

        const matchedClient = clients.find(c =>
          c.inn === payerInn || c.inn === payeeInn ||
          c.name.toLowerCase().includes(payerName.toLowerCase()) ||
          c.name.toLowerCase().includes(payeeName.toLowerCase())
        );

        const ourOrgInn = '7713699602';
        const isIncome = payeeInn === ourOrgInn || payeeName.toLowerCase().includes('социальные услуги');
        const paymentTypeId = isIncome ? 1 : 2;

        const paymentId = await db.insert('payments', {
          statement_id: statementId,
          doc_number: doc['Номер'] || '',
          doc_date: normalizeDate(doc['Дата'] || ''),
          amount: amount,
          payer_name: payerName,
          payer_inn: payerInn,
          payer_account: '',
          payee_name: payeeName,
          payee_inn: payeeInn,
          payee_account: '',
          purpose: purpose,
          payment_type_id: paymentTypeId,
          client_id: matchedClient ? matchedClient.id : null,
          article_id: null,
          status: matchedClient ? 'processed' : 'manual'
        });

        if (!matchedClient) {
          await db.insert('errors', {
            payment_id: paymentId,
            error_type: 'Неизвестный контрагент',
            description: 'Не удалось найти контрагента: ' + (payerName || payeeName),
            status: 'new'
          });
          errorCount++;
        } else {
          autoProcessed++;
        }
      } catch (docErr) {
        errorCount++;
      }
    }

    await db.update('statements', statementId, {
      auto_processed: autoProcessed,
      error_count: errorCount,
      status: 'processed'
    });

    if (userId) {
      await db.query('INSERT INTO logs (user_id, action) VALUES (?, ?)',
        [userId, 'Загружена выписка: ' + fileName + ' (' + documents.length + ' операций)']);
    }

    res.json({ statementId, autoProcessed, errorCount, total: documents.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/statements/:id', async (req, res) => {
  try { await db.remove('statements', req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== PAYMENTS =====
app.get('/api/payments', async (req, res) => {
  try {
    const { statementId, status, search } = req.query;
    let sql = 'SELECT p.*, c.name as client_name, pt.name as payment_type_name, a.name as article_name FROM payments p LEFT JOIN clients c ON p.client_id = c.id LEFT JOIN payment_types pt ON p.payment_type_id = pt.id LEFT JOIN articles a ON p.article_id = a.id WHERE 1=1';
    const params = [];
    if (statementId) { sql += ' AND p.statement_id = ?'; params.push(statementId); }
    if (status && status !== 'all') { sql += ' AND p.status = ?'; params.push(status); }
    if (search) { sql += ' AND (p.payer_name LIKE ? OR p.payee_name LIKE ? OR p.payer_inn LIKE ? OR p.payee_inn LIKE ? OR p.purpose LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); }
    sql += ' ORDER BY p.id DESC LIMIT 500';
    res.json(await db.query(sql, params));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/payments/:id', async (req, res) => {
  try {
    const p = await db.queryOne(
      'SELECT p.*, c.name as client_name, pt.name as payment_type_name, a.name as article_name, s.file_name as statement_file FROM payments p LEFT JOIN clients c ON p.client_id = c.id LEFT JOIN payment_types pt ON p.payment_type_id = pt.id LEFT JOIN articles a ON p.article_id = a.id LEFT JOIN statements s ON p.statement_id = s.id WHERE p.id = ?',
      [req.params.id]
    );
    if (!p) return res.status(404).json({ error: 'Платёж не найден' });
    res.json(p);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/payments/:id', async (req, res) => {
  try {
    const { clientId, paymentTypeId, articleId, status } = req.body;
    await db.update('payments', req.params.id, {
      client_id: clientId,
      payment_type_id: paymentTypeId,
      article_id: articleId,
      status: status || 'processed'
    });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== ERRORS =====
app.get('/api/errors', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT e.*, p.doc_number, p.amount, p.payer_name, p.payee_name, u.full_name as assigned_name FROM errors e LEFT JOIN payments p ON e.payment_id = p.id LEFT JOIN users u ON e.assigned_to = u.id';
    const params = [];
    if (status && status !== 'all') { sql += ' WHERE e.status = ?'; params.push(status); }
    sql += ' ORDER BY e.id DESC LIMIT 200';
    res.json(await db.query(sql, params));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/errors/:id', async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    const data = {};
    if (status) data.status = status;
    if (assignedTo) data.assigned_to = assignedTo;
    if (status === 'resolved') data.resolved_at = new Date().toISOString().replace('T', ' ').slice(0, 19);
    await db.update('errors', req.params.id, data);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== LOGS =====
app.get('/api/logs', async (req, res) => {
  try {
    res.json(await db.query(
      'SELECT l.*, u.login, u.full_name FROM logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.id DESC LIMIT 200'
    ));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== REPORTS =====
app.get('/api/reports/dds', async (req, res) => {
  try {
    const { from, to } = req.query;
    let sql = 'SELECT p.*, a.name as article_name, a.type as article_type, c.name as client_name FROM payments p LEFT JOIN articles a ON p.article_id = a.id LEFT JOIN clients c ON p.client_id = c.id WHERE 1=1';
    const params = [];
    if (from) { sql += ' AND p.doc_date >= ?'; params.push(from); }
    if (to) { sql += ' AND p.doc_date <= ?'; params.push(to); }
    sql += ' ORDER BY p.doc_date';
    const payments = await db.query(sql, params);

    const articles = {};
    let totalIncome = 0, totalExpense = 0;
    for (const p of payments) {
      const amount = parseFloat(p.amount) || 0;
      const key = p.article_name || 'Нераспределённые';
      if (!articles[key]) articles[key] = { name: key, type: p.article_type || 'unknown', income: 0, expense: 0, count: 0 };
      articles[key].count++;
      const type = p.payment_type_id === 1 ? 'income' : 'expense';
      if (type === 'income') { articles[key].income += amount; totalIncome += amount; }
      else { articles[key].expense += amount; totalExpense += amount; }
    }

    res.json({ articles: Object.values(articles), totalIncome, totalExpense, netFlow: totalIncome - totalExpense, paymentCount: payments.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== DASHBOARD STATS =====
app.get('/api/dashboard', async (req, res) => {
  try {
    const stmtCount = await db.queryOne('SELECT COUNT(*) as cnt FROM statements');
    const payCount = await db.queryOne('SELECT COUNT(*) as cnt FROM payments');
    const autoStats = await db.queryOne("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) as auto_count FROM payments");
    const errCount = await db.queryOne("SELECT COUNT(*) as cnt FROM errors WHERE status != 'resolved'");
    const recentStmts = await db.query('SELECT * FROM statements ORDER BY id DESC LIMIT 5');
    const recentErrors = await db.query('SELECT e.*, p.doc_number FROM errors e LEFT JOIN payments p ON e.payment_id = p.id ORDER BY e.id DESC LIMIT 5');

    const autoPct = autoStats && autoStats.total > 0 ? Math.round((autoStats.auto_count / autoStats.total) * 100) : 0;

    res.json({
      statementCount: stmtCount ? stmtCount.cnt : 0,
      paymentCount: payCount ? payCount.cnt : 0,
      autoPercent: autoPct,
      errorCount: errCount ? errCount.cnt : 0,
      recentStatements: recentStmts,
      recentErrors: recentErrors
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

function parseNumber(val) {
  if (!val) return 0;
  return parseFloat(String(val).replace(/[^-0-9.,]/g, '').replace(',', '.')) || 0;
}

function extractInn(text) {
  if (!text) return '';
  const m = text.match(/\b(\d{10}|\d{12})\b/);
  return m ? m[1] : '';
}

function extractName(text) {
  if (!text) return '';
  return text.replace(/ИНН\s*/i, '').replace(/["«»]/g, '"').replace(/\s+/g, ' ').trim();
}

function normalizeDate(val) {
  if (!val) return '';
  var cleaned = val.replace(/[^\d.]/g, '').trim();
  var parts = cleaned.split('.');
  if (parts.length === 3) {
    if (parts[0].length === 4) return cleaned; // already YYYY.MM.DD
    return parts[2] + '-' + parts[1].padStart(2, '0') + '-' + parts[0].padStart(2, '0');
  }
  return cleaned;
}

// ===== ADMIN =====
app.post('/api/admin/backup', async (req, res) => {
  try {
    const fs = require('fs');
    const dbPath = path.join(__dirname, '..', 'asbo.db');
    const backupPath = path.join(__dirname, '..', 'asbo_backup_' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '.db');
    fs.copyFileSync(dbPath, backupPath);
    await db.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [req.body.userId || null, 'Создана резервная копия БД: ' + backupPath]);
    res.json({ ok: true, path: backupPath });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/restore', async (req, res) => {
  try {
    const fs = require('fs');
    const backupPath = req.body.path;
    if (!backupPath || !fs.existsSync(backupPath)) return res.status(400).json({ error: 'Файл резервной копии не найден' });
    const dbPath = path.join(__dirname, '..', 'asbo.db');
    fs.copyFileSync(backupPath, dbPath);
    await db.query('INSERT INTO logs (user_id, action) VALUES (?, ?)', [req.body.userId || null, 'Восстановлена БД из копии: ' + backupPath]);
    res.json({ ok: true, message: 'База данных восстановлена. Перезапустите сервер для применения изменений.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/reset', async (req, res) => {
  try {
    const d = db.getDB();
    d.exec(`
      DELETE FROM logs; DELETE FROM errors; DELETE FROM payments; DELETE FROM statements;
      DELETE FROM articles; DELETE FROM payment_types; DELETE FROM clients; DELETE FROM banks;
      DELETE FROM users; DELETE FROM roles;
    `);
    const { seedData, seedDemoIfEmpty } = require('./db');
    seedData(true);
    seedDemoIfEmpty();
    res.json({ ok: true, message: 'Все данные сброшены и переинициализированы.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Start server
app.listen(PORT, () => {
  console.log('============================================');
  console.log('  АСБО — Автоматизированная система');
  console.log('  банковских операций');
  console.log('  ООО «Социальные услуги»');
  console.log('============================================');
  console.log('  Сервер:  http://localhost:' + PORT);
  console.log('  БД:      SQLite (asbo.db)');
  console.log('  Демо:    admin/admin');
  console.log('============================================');
  console.log('Нажмите Ctrl+C для остановки');
});
