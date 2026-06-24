const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initDB() {
  const env = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'asbo'
  };

  let conn;
  try {
    conn = await mysql.createConnection({
      host: env.host,
      port: env.port,
      user: env.user,
      password: env.password,
      multipleStatements: true
    });

    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await conn.query(sql);
    console.log('База данных инициализирована успешно.');
    console.log('Подключение: ' + env.user + '@' + env.host + ':' + env.port + ' / ' + env.database);
  } catch (err) {
    console.error('Ошибка инициализации БД:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('Сервер MySQL недоступен. Проверьте, что MySQL запущен.');
    }
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

initDB();
