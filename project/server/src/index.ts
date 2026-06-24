/**
 * @file Точка входа сервера АСБО (Автоматизированная Система Банковских Операций).
 * Инициализирует Express-приложение, подключает промежуточное ПО (CORS, JSON-парсер),
 * раздаёт статические файлы фронтенда из сборки и регистрирует все API-маршруты.
 * Запускает HTTP-сервер на указанном порту (по умолчанию 3000).
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth';
import roleRoutes from './routes/roles';
import userRoutes from './routes/users';
import bankRoutes from './routes/banks';
import clientRoutes from './routes/clients';
import paymentTypeRoutes from './routes/paymentTypes';
import articleRoutes from './routes/articles';
import statementRoutes from './routes/statements';
import paymentRoutes from './routes/payments';
import errorRoutes from './routes/errors';
import logRoutes from './routes/logs';
import reportRoutes from './routes/reports';
import dashboardRoutes from './routes/dashboard';
import adminRoutes from './routes/admin';
import oneCRoutes from './routes/oneC';

/** Экземпляр Express-приложения */
const app = express();
// Разрешаем кросс-доменные запросы (CORS) для фронтенда
app.use(cors());
// Парсинг JSON-тела запросов с увеличенным лимитом для загрузки выписок
app.use(express.json({ limit: '5mb' }));

// --- Раздача статических файлов фронтенда ---
// Проверяем наличие собранной папки dist (production-режим Vite)
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  // В production отдаём статику из сборки
  app.use(express.static(distPath));
  // SPA fallback: все не-API запросы перенаправляем на index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // В development-режиме отдаём статику напрямую (если dist не собран)
  app.use(express.static(path.join(__dirname, '..')));
}

// --- Регистрация API-маршрутов ---
// Аутентификация и вход в систему
app.use('/api', authRoutes);
// Управление ролями (CRUD справочника ролей)
app.use('/api/roles', roleRoutes);
// Управление пользователями (CRUD справочника пользователей)
app.use('/api/users', userRoutes);
// Управление банками (CRUD справочника банков)
app.use('/api/banks', bankRoutes);
// Управление контрагентами-клиентами (CRUD справочника клиентов)
app.use('/api/clients', clientRoutes);
// Управление типами платежей (поступление/списание/перевод)
app.use('/api/payment-types', paymentTypeRoutes);
// Управление статьями ДДС (доходы/расходы)
app.use('/api/articles', articleRoutes);
// Загрузка и управление банковскими выписками
app.use('/api/statements', statementRoutes);
// Управление платёжными операциями (внутри выписок)
app.use('/api/payments', paymentRoutes);
// Управление ошибками обработки платежей
app.use('/api/errors', errorRoutes);
// Журнал действий пользователей
app.use('/api/logs', logRoutes);
// Генерация отчётов по статьям ДДС
app.use('/api/reports', reportRoutes);
// Данные для дашборда (главной страницы)
app.use('/api/dashboard', dashboardRoutes);
// Административные функции (состояние БД, сброс, системная информация)
app.use('/api/admin', adminRoutes);
// Интеграция с 1С:Предприятие (импорт справочников, экспорт платежей, журнал обмена)
app.use('/api/1c', oneCRoutes);

// --- Запуск HTTP-сервера ---
// Порт берётся из переменной окружения или используется 3000 по умолчанию
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // Баннер приветствия при старте сервера
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
