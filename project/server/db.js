const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'asbo.db');

let db;

function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
    seedData();
    seedDemoIfEmpty();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (role_id) REFERENCES roles(id)
    );

    CREATE TABLE IF NOT EXISTS banks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      bik TEXT NOT NULL UNIQUE,
      corr_account TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      inn TEXT NOT NULL,
      kpp TEXT DEFAULT '',
      account TEXT DEFAULT '',
      bik TEXT DEFAULT '',
      status TEXT DEFAULT 'active'
    );
    CREATE INDEX IF NOT EXISTS idx_clients_inn ON clients(inn);

    CREATE TABLE IF NOT EXISTS payment_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income','expense'))
    );

    CREATE TABLE IF NOT EXISTS statements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT NOT NULL,
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      total_operations INTEGER NOT NULL DEFAULT 0,
      auto_processed INTEGER NOT NULL DEFAULT 0,
      error_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'uploaded',
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      statement_id INTEGER,
      doc_number TEXT DEFAULT '',
      doc_date TEXT DEFAULT '',
      amount REAL NOT NULL DEFAULT 0,
      payer_name TEXT DEFAULT '',
      payer_inn TEXT DEFAULT '',
      payer_account TEXT DEFAULT '',
      payee_name TEXT DEFAULT '',
      payee_inn TEXT DEFAULT '',
      payee_account TEXT DEFAULT '',
      purpose TEXT DEFAULT '',
      payment_type_id INTEGER,
      article_id INTEGER,
      client_id INTEGER,
      status TEXT NOT NULL DEFAULT 'processed',
      FOREIGN KEY (statement_id) REFERENCES statements(id) ON DELETE SET NULL,
      FOREIGN KEY (payment_type_id) REFERENCES payment_types(id) ON DELETE SET NULL,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(doc_date);
    CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

    CREATE TABLE IF NOT EXISTS errors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_id INTEGER,
      error_type TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      assigned_to INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      resolved_at TEXT,
      FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_errors_status ON errors(status);

    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
  `);
}

function seedData(force) {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM roles').get();
  if (!force && count.cnt > 0) return;

  const insert = db.transaction(() => {
    db.prepare("INSERT INTO roles (code, name, description) VALUES (?,?,?)").run('admin', 'Администратор', 'Полный доступ к системе');
    db.prepare("INSERT INTO roles (code, name, description) VALUES (?,?,?)").run('accountant', 'Бухгалтер', 'Работа с выписками, операции, справочники, отчёты');
    db.prepare("INSERT INTO roles (code, name, description) VALUES (?,?,?)").run('manager', 'Руководитель', 'Просмотр отчётов, журнала ошибок, выписок');

    db.prepare("INSERT INTO users (login, password, full_name, role_id, active) VALUES (?,?,?,?,1)").run('admin', 'admin', 'Чистякова М.В.', 1);
    db.prepare("INSERT INTO users (login, password, full_name, role_id, active) VALUES (?,?,?,?,1)").run('buh', 'buh123', 'Петрова А.С.', 2);
    db.prepare("INSERT INTO users (login, password, full_name, role_id, active) VALUES (?,?,?,?,1)").run('buh2', 'buh123', 'Смирнова Е.В.', 2);
    db.prepare("INSERT INTO users (login, password, full_name, role_id, active) VALUES (?,?,?,?,1)").run('dir', 'dir123', 'Иванов К.Н.', 3);

    db.prepare("INSERT INTO banks (name, bik, corr_account) VALUES (?,?,?)").run('ПАО Сбербанк', '044525225', '30101810400000000225');
    db.prepare("INSERT INTO banks (name, bik, corr_account) VALUES (?,?,?)").run('Банк ВТБ (ПАО)', '044525411', '30101810145250000411');
    db.prepare("INSERT INTO banks (name, bik, corr_account) VALUES (?,?,?)").run('АО "Альфа-Банк"', '044525593', '30101810200000000593');
    db.prepare("INSERT INTO banks (name, bik, corr_account) VALUES (?,?,?)").run('АО "Тинькофф Банк"', '044525999', '30101810145250000999');
    db.prepare("INSERT INTO banks (name, bik, corr_account) VALUES (?,?,?)").run('ПАО "Промсвязьбанк"', '044525555', '30101810400000000555');
    db.prepare("INSERT INTO banks (name, bik, corr_account) VALUES (?,?,?)").run('АО "Райффайзенбанк"', '044525700', '30101810200000000700');
    db.prepare("INSERT INTO banks (name, bik, corr_account) VALUES (?,?,?)").run('ПАО Банк "ФК Открытие"', '044525985', '30101810300000000985');
    db.prepare("INSERT INTO banks (name, bik, corr_account) VALUES (?,?,?)").run('АО "Россельхозбанк"', '044525111', '30101810200000000111');

    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('ООО "Мави Джинс"', '7734660892', '773401001', '40702810500010001234', '044525225');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('АО "Флант"', '7702033720', '770201001', '40702810700020004567', '044525411');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('ИП Иванов И.И.', '771501001234', '', '40802810200030007890', '044525225');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('Департамент труда и соцзащиты г. Москвы', '7710660053', '771001001', '40102810545370000003', '044525225');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('ООО "Ромашка"', '7728300200', '772801001', '40702810600050009876', '044525999');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('ООО "Социальные услуги"', '7713699602', '771301001', '40702810800220100505', '044525225');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('ООО "Медтехника-Сервис"', '7718014456', '771801001', '40702810900070006543', '044525555');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('АО "Газпромбанк"', '7744001497', '774401001', '40702810000080003210', '044525700');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('ООО "ЧОП "Гарант-Безопасность"', '7705001134', '770501001', '40702810300090008765', '044525985');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('ГБУЗ "Городская поликлиника №5"', '7715072345', '771501001', '40702810100100004321', '044525111');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('ПАО "МГТС"', '7710016640', '771001001', '40702810400110001234', '044525225');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('ООО "Клининг-Профи"', '7719078562', '771901001', '40702810500120005678', '044525555');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('АО "Мосэнергосбыт"', '7736520080', '773601001', '40702810000130009876', '044525225');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('ООО "СофтЛайн Трейд"', '7728543046', '772801001', '40702810700140005432', '044525700');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('ИП Петрова М.С.', '772000112345', '', '40802810800150007654', '044525225');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('ООО "Такси-Люкс"', '7732005678', '773201001', '40702810900160003456', '044525111');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('АО "ВСК"', '7710026574', '771001001', '40702810100170008765', '044525985');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('УФК по г. Москве (ИФНС России №13)', '7713034630', '771301001', '40101810045250010041', '044525225');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('ООО "Фарм-Поставка"', '7710645000', '771001001', '40702810800190001234', '044525555');
    db.prepare("INSERT INTO clients (name, inn, kpp, account, bik) VALUES (?,?,?,?,?)").run('АНО "Центр социальной помощи"', '7716012300', '771601001', '40702810200200005678', '044525700');

    db.prepare("INSERT INTO payment_types (code, name) VALUES (?,?)").run('IN', 'Поступление');
    db.prepare("INSERT INTO payment_types (code, name) VALUES (?,?)").run('OUT', 'Списание');
    db.prepare("INSERT INTO payment_types (code, name) VALUES (?,?)").run('TRANSFER', 'Внутренний перевод');

    db.prepare("INSERT INTO articles (code, name, type) VALUES (?,?,?)").run('DDC_001', 'Поступления от оказания социальных услуг', 'income');
    db.prepare("INSERT INTO articles (code, name, type) VALUES (?,?,?)").run('DDC_002', 'Оплата товаров и материалов', 'expense');
    db.prepare("INSERT INTO articles (code, name, type) VALUES (?,?,?)").run('DDC_003', 'Заработная плата', 'expense');
    db.prepare("INSERT INTO articles (code, name, type) VALUES (?,?,?)").run('DDC_004', 'Налоги и сборы', 'expense');
    db.prepare("INSERT INTO articles (code, name, type) VALUES (?,?,?)").run('DDC_005', 'Аренда помещений', 'expense');
    db.prepare("INSERT INTO articles (code, name, type) VALUES (?,?,?)").run('DDC_006', 'Услуги связи и интернета', 'expense');
    db.prepare("INSERT INTO articles (code, name, type) VALUES (?,?,?)").run('DDC_007', 'Прочие поступления', 'income');
    db.prepare("INSERT INTO articles (code, name, type) VALUES (?,?,?)").run('DDC_008', 'Коммунальные услуги', 'expense');
  });

  insert();
}

function seedDemoIfEmpty() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const today = `${y}-${m}-${String(now.getDate()).padStart(2, '0')}`;

  const stmt1 = db.prepare("INSERT INTO statements (file_name, uploaded_at, total_operations, auto_processed, error_count, status, user_id) VALUES (?,?,?,?,?,?,?)").run(
    'demo_may_2026.txt', `${y}-${m}-05 10:15:00`, 8, 5, 3, 'processed', 2
  ).lastInsertRowid;

  const stmt2 = db.prepare("INSERT INTO statements (file_name, uploaded_at, total_operations, auto_processed, error_count, status, user_id) VALUES (?,?,?,?,?,?,?)").run(
    'demo_april_2026.txt', `${y}-${m}-03 14:30:00`, 6, 4, 2, 'processed', 1
  ).lastInsertRowid;

  const stmt3 = db.prepare("INSERT INTO statements (file_name, uploaded_at, total_operations, auto_processed, error_count, status, user_id) VALUES (?,?,?,?,?,?,?)").run(
    'demo_june_2026.txt', today + ' 09:00:00', 5, 5, 0, 'processed', 2
  ).lastInsertRowid;

  const payInsert = db.prepare(`INSERT INTO payments (statement_id, doc_number, doc_date, amount, payer_name, payer_inn, payee_name, payee_inn, purpose, payment_type_id, article_id, client_id, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);

  payInsert.run(stmt1, '1248', `${y}-${m}-05`, 202898.75, 'ООО "Мави Джинс"', '7734660892', 'ООО "Социальные услуги"', '7713699602', 'Оплата по счету № 1595/92 от 01.04.2026 обслуживание за 05.2026', 1, 1, 1, 'processed');
  payInsert.run(stmt1, '1356', `${y}-${m}-04`, 157000.00, 'Департамент труда и соцзащиты г. Москвы', '7710660053', 'ООО "Социальные услуги"', '7713699602', 'Оплата по госконтракту № 2026-045 от 15.01.2026 за оказание социальных услуг', 1, 1, 4, 'processed');
  payInsert.run(stmt1, '1275', `${y}-${m}-03`, 89000.00, 'ИП Иванов И.И.', '771501001234', 'ООО "Социальные услуги"', '7713699602', 'Оплата по договору № 12 от 10.01.2026 за социально-психологические услуги', 1, 1, 3, 'processed');
  payInsert.run(stmt1, '1401', `${y}-${m}-02`, 45000.00, 'ООО "Социальные услуги"', '7713699602', 'ООО "Ромашка"', '7728300200', 'Оплата по договору № 45 от 12.02.2026 за канцелярские товары', 2, 2, 5, 'processed');
  payInsert.run(stmt1, '1402', `${y}-${m}-01`, 32000.50, 'ООО "Социальные услуги"', '7713699602', 'АО "Флант"', '7702033720', 'Оплата по счету № FL-887 за услуги хостинга и техподдержки', 2, 6, 2, 'processed');

  const p1 = payInsert.run(stmt1, '1403', `${y}-${m}-01`, 18500.00, 'Неизвестный отправитель', '0000000000', 'ООО "Социальные услуги"', '7713699602', 'Оплата по договору № Н/Д за консультационные услуги', 1, null, null, 'manual').lastInsertRowid;
  const p2 = payInsert.run(stmt1, '1404', `${y}-${m}-01`, 77000.00, 'ООО "Социальные услуги"', '7713699602', 'ООО "ТехноПром"', '0000000001', 'Предоплата по договору поставки № 88/П', 2, null, null, 'error').lastInsertRowid;
  const p3 = payInsert.run(stmt1, '1405', `${y}-${m}-01`, 12500.00, 'ООО "Социальные услуги"', '7713699602', 'ИП Сидоров А.В.', '0000000002', 'Оплата транспортных услуг по сч. № ТР-156', 2, null, null, 'manual').lastInsertRowid;

  const errInsert = db.prepare("INSERT INTO errors (payment_id, error_type, description, status, assigned_to, created_at) VALUES (?,?,?,?,?,?)");
  errInsert.run(p1, 'Неизвестный контрагент', 'Не удалось найти контрагента: Неизвестный отправитель', 'new', null, `${y}-${m}-05 10:20:00`);
  errInsert.run(p2, 'Неизвестный контрагент', 'Не удалось найти контрагента: ООО "ТехноПром"', 'in_progress', 2, `${y}-${m}-05 10:21:00`);
  errInsert.run(p3, 'Неизвестный контрагент', 'Не удалось найти контрагента: ИП Сидоров А.В.', 'new', null, `${y}-${m}-05 10:22:00`);

  payInsert.run(stmt2, '1180', '2026-04-15', 195000.00, 'Департамент труда и соцзащиты г. Москвы', '7710660053', 'ООО "Социальные услуги"', '7713699602', 'Оплата по госконтракту № 2026-045 за март 2026', 1, 1, 4, 'processed');
  payInsert.run(stmt2, '1191', '2026-04-14', 43200.00, 'ООО "Социальные услуги"', '7713699602', 'ООО "Медтехника-Сервис"', '7718014456', 'Оплата по сч. № МТ-445 за медицинское оборудование', 2, 2, 7, 'processed');
  payInsert.run(stmt2, '1195', '2026-04-12', 56000.00, 'ИП Петрова М.С.', '772000112345', 'ООО "Социальные услуги"', '7713699602', 'Оплата по договору № 34 за catering-услуги', 1, 7, 15, 'processed');
  payInsert.run(stmt2, '1203', '2026-04-10', 128000.00, 'ООО "Социальные услуги"', '7713699602', 'АО "ВСК"', '7710026574', 'Страховая премия по дог. № 567-С/2026', 2, 4, 17, 'processed');

  const p4 = payInsert.run(stmt2, '1210', '2026-04-08', 34000.00, 'ООО "Социальные услуги"', '7713699602', 'ООО "ТехСнаб"', '0000000003', 'Оплата по сч. ТС-789 за хозтовары', 2, null, null, 'manual').lastInsertRowid;
  const p5 = payInsert.run(stmt2, '1215', '2026-04-05', 91500.00, 'АНО "ЦСП "Надежда"', '0000000004', 'ООО "Социальные услуги"', '7713699602', 'Благотворительный взнос по договору', 1, null, null, 'manual').lastInsertRowid;
  errInsert.run(p4, 'Неизвестный контрагент', 'Не удалось найти контрагента: ООО "ТехСнаб"', 'resolved', 1, `${y}-${m}-03 15:00:00`);
  errInsert.run(p5, 'Неизвестный контрагент', 'Не удалось найти контрагента: АНО "ЦСП "Надежда"', 'new', null, `${y}-${m}-03 15:10:00`);

  payInsert.run(stmt3, '1501', today, 250000.00, 'Департамент труда и соцзащиты г. Москвы', '7710660053', 'ООО "Социальные услуги"', '7713699602', 'Оплата по госконтракту № 2026-045 за май 2026', 1, null, 4, 'processed');
  payInsert.run(stmt3, '1502', today, 67000.00, 'ООО "Социальные услуги"', '7713699602', 'ПАО "МГТС"', '7710016640', 'Оплата услуг связи за июнь 2026', 2, null, 11, 'processed');
  payInsert.run(stmt3, '1503', today, 54000.00, 'ООО "Социальные услуги"', '7713699602', 'АО "Мосэнергосбыт"', '7736520080', 'Оплата электроэнергии за май 2026', 2, null, 13, 'processed');
  payInsert.run(stmt3, '1504', today, 38500.00, 'ООО "Социальные услуги"', '7713699602', 'ООО "Клининг-Профи"', '7719078562', 'Оплата клининговых услуг за июнь 2026', 2, null, 12, 'processed');
  payInsert.run(stmt3, '1505', today, 93000.00, 'ООО "Фарм-Поставка"', '7710645000', 'ООО "Социальные услуги"', '7713699602', 'Возврат по акту сверки № ФП-223', 1, null, 19, 'processed');

  db.prepare("INSERT INTO logs (user_id, action) VALUES (?,?)").run(1, 'Загружена выписка: demo_april_2026.txt (6 операций)');
  db.prepare("INSERT INTO logs (user_id, action) VALUES (?,?)").run(2, 'Загружена выписка: demo_may_2026.txt (8 операций)');
  db.prepare("INSERT INTO logs (user_id, action) VALUES (?,?)").run(2, 'Загружена выписка: demo_june_2026.txt (5 операций)');
  db.prepare("INSERT INTO logs (user_id, action) VALUES (?,?)").run(1, 'Ошибка №4 решена (ООО "ТехСнаб")');
  db.prepare("INSERT INTO logs (user_id, action) VALUES (?,?)").run(2, 'Ошибка №5 взята в работу');
}

function query(sql, params) {
  const d = getDB();
  const stmt = d.prepare(sql);
  const upper = sql.trim().toUpperCase();
  if (upper.startsWith('INSERT') || upper.startsWith('UPDATE') || upper.startsWith('DELETE') || upper.startsWith('CREATE') || upper.startsWith('ALTER') || upper.startsWith('DROP')) {
    if (params) stmt.run(...(Array.isArray(params) ? params : [params]));
    else stmt.run();
    return [];
  }
  if (params) return stmt.all(...(Array.isArray(params) ? params : [params]));
  return stmt.all();
}

function queryOne(sql, params) {
  const d = getDB();
  const stmt = d.prepare(sql);
  const row = params ? stmt.get(...(Array.isArray(params) ? params : [params])) : stmt.get();
  return row || null;
}

function insert(table, data) {
  const d = getDB();
  const keys = Object.keys(data);
  const vals = Object.values(data);
  const ph = keys.map(() => '?').join(', ');
  const sql = `INSERT INTO "${table}" ("${keys.join('", "')}") VALUES (${ph})`;
  const result = d.prepare(sql).run(...vals);
  return result.lastInsertRowid;
}

function update(table, id, data) {
  const d = getDB();
  const sets = Object.keys(data).map(k => `"${k}" = ?`).join(', ');
  const vals = Object.values(data);
  d.prepare(`UPDATE "${table}" SET ${sets} WHERE id = ?`).run(...vals, id);
}

function remove(table, id) {
  const d = getDB();
  d.prepare(`DELETE FROM "${table}" WHERE id = ?`).run(id);
}

module.exports = { query, queryOne, insert, update, remove, getDB, seedData, seedDemoIfEmpty };
