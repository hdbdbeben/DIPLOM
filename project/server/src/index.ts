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

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.use(express.static(path.join(__dirname, '..')));
}

app.use('/api', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/payment-types', paymentTypeRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/statements', statementRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/errors', errorRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
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
