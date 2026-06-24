import type { Role, User, Bank, Client, PaymentType, Article, Statement, Payment, ErrorItem, LogEntry, DashboardData, ReportData } from '@/types';

export const mockRoles: Role[] = [
  { id: 1, code: 'admin', name: 'Администратор', description: 'Полный доступ к системе' },
  { id: 2, code: 'accountant', name: 'Бухгалтер', description: 'Работа с выписками, операции, справочники, отчёты' },
  { id: 3, code: 'manager', name: 'Руководитель', description: 'Просмотр отчётов, журнала ошибок, выписок' },
];

export const mockUsers: User[] = [
  { id: 1, login: 'admin', fullName: 'Чистякова М.В.', roleId: 1, role: 'admin', roleName: 'Администратор', active: 1 },
  { id: 2, login: 'buh', fullName: 'Петрова А.С.', roleId: 2, role: 'accountant', roleName: 'Бухгалтер', active: 1 },
  { id: 3, login: 'buh2', fullName: 'Смирнова Е.В.', roleId: 2, role: 'accountant', roleName: 'Бухгалтер', active: 1 },
  { id: 4, login: 'dir', fullName: 'Иванов К.Н.', roleId: 3, role: 'manager', roleName: 'Руководитель', active: 1 },
];

export const mockBanks: Bank[] = [
  { id: 1, name: 'ПАО Сбербанк', bik: '044525225', corr_account: '30101810400000000225' },
  { id: 2, name: 'Банк ВТБ (ПАО)', bik: '044525411', corr_account: '30101810145250000411' },
  { id: 3, name: 'АО "Альфа-Банк"', bik: '044525593', corr_account: '30101810200000000593' },
  { id: 4, name: 'АО "Тинькофф Банк"', bik: '044525999', corr_account: '30101810145250000999' },
  { id: 5, name: 'ПАО "Промсвязьбанк"', bik: '044525555', corr_account: '30101810400000000555' },
  { id: 6, name: 'АО "Райффайзенбанк"', bik: '044525700', corr_account: '30101810200000000700' },
  { id: 7, name: 'ПАО Банк "ФК Открытие"', bik: '044525985', corr_account: '30101810300000000985' },
  { id: 8, name: 'АО "Россельхозбанк"', bik: '044525111', corr_account: '30101810200000000111' },
];

export const mockClients: Client[] = [
  { id: 1, name: 'ООО "Мави Джинс"', inn: '7734660892', kpp: '773401001', account: '40702810500010001234', bik: '044525225', status: 'active' },
  { id: 2, name: 'АО "Флант"', inn: '7702033720', kpp: '770201001', account: '40702810700020004567', bik: '044525411', status: 'active' },
  { id: 3, name: 'ИП Иванов И.И.', inn: '771501001234', kpp: '', account: '40802810200030007890', bik: '044525225', status: 'active' },
  { id: 4, name: 'Департамент труда и соцзащиты г. Москвы', inn: '7710660053', kpp: '771001001', account: '40102810545370000003', bik: '044525225', status: 'active' },
  { id: 5, name: 'ООО "Ромашка"', inn: '7728300200', kpp: '772801001', account: '40702810600050009876', bik: '044525999', status: 'active' },
  { id: 6, name: 'ООО "Социальные услуги"', inn: '7713699602', kpp: '771301001', account: '40702810800220100505', bik: '044525225', status: 'active' },
  { id: 7, name: 'ООО "Медтехника-Сервис"', inn: '7718014456', kpp: '771801001', account: '40702810900070006543', bik: '044525555', status: 'active' },
  { id: 8, name: 'АО "Газпромбанк"', inn: '7744001497', kpp: '774401001', account: '40702810000080003210', bik: '044525700', status: 'active' },
  { id: 9, name: 'ООО "ЧОП "Гарант-Безопасность"', inn: '7705001134', kpp: '770501001', account: '40702810300090008765', bik: '044525985', status: 'active' },
  { id: 10, name: 'ГБУЗ "Городская поликлиника №5"', inn: '7715072345', kpp: '771501001', account: '40702810100100004321', bik: '044525111', status: 'active' },
  { id: 11, name: 'ПАО "МГТС"', inn: '7710016640', kpp: '771001001', account: '40702810400110001234', bik: '044525225', status: 'active' },
  { id: 12, name: 'ООО "Клининг-Профи"', inn: '7719078562', kpp: '771901001', account: '40702810500120005678', bik: '044525555', status: 'active' },
  { id: 13, name: 'АО "Мосэнергосбыт"', inn: '7736520080', kpp: '773601001', account: '40702810000130009876', bik: '044525225', status: 'active' },
  { id: 14, name: 'ООО "СофтЛайн Трейд"', inn: '7728543046', kpp: '772801001', account: '40702810700140005432', bik: '044525700', status: 'active' },
  { id: 15, name: 'ИП Петрова М.С.', inn: '772000112345', kpp: '', account: '40802810800150007654', bik: '044525225', status: 'active' },
  { id: 16, name: 'ООО "Такси-Люкс"', inn: '7732005678', kpp: '773201001', account: '40702810900160003456', bik: '044525111', status: 'active' },
  { id: 17, name: 'АО "ВСК"', inn: '7710026574', kpp: '771001001', account: '40702810100170008765', bik: '044525985', status: 'active' },
  { id: 18, name: 'УФК по г. Москве (ИФНС России №13)', inn: '7713034630', kpp: '771301001', account: '40101810045250010041', bik: '044525225', status: 'active' },
  { id: 19, name: 'ООО "Фарм-Поставка"', inn: '7710645000', kpp: '771001001', account: '40702810800190001234', bik: '044525555', status: 'active' },
  { id: 20, name: 'АНО "Центр социальной помощи"', inn: '7716012300', kpp: '771601001', account: '40702810200200005678', bik: '044525700', status: 'active' },
];

export const mockPaymentTypes: PaymentType[] = [
  { id: 1, code: 'IN', name: 'Поступление' },
  { id: 2, code: 'OUT', name: 'Списание' },
  { id: 3, code: 'TRANSFER', name: 'Внутренний перевод' },
];

export const mockArticles: Article[] = [
  { id: 1, code: 'DDC_001', name: 'Поступления от оказания социальных услуг', type: 'income' },
  { id: 2, code: 'DDC_002', name: 'Оплата товаров и материалов', type: 'expense' },
  { id: 3, code: 'DDC_003', name: 'Заработная плата', type: 'expense' },
  { id: 4, code: 'DDC_004', name: 'Налоги и сборы', type: 'expense' },
  { id: 5, code: 'DDC_005', name: 'Аренда помещений', type: 'expense' },
  { id: 6, code: 'DDC_006', name: 'Услуги связи и интернета', type: 'expense' },
  { id: 7, code: 'DDC_007', name: 'Прочие поступления', type: 'income' },
  { id: 8, code: 'DDC_008', name: 'Коммунальные услуги', type: 'expense' },
];

const today = new Date().toISOString().slice(0, 10);

export const mockStatements: Statement[] = [
  { id: 1, file_name: 'demo_may_2026.txt', uploaded_at: today + ' 10:15:00', total_operations: 8, auto_processed: 5, error_count: 3, status: 'processed', user_id: 2, uploaded_by: 'Петрова А.С.' },
  { id: 2, file_name: 'demo_april_2026.txt', uploaded_at: today + ' 14:30:00', total_operations: 6, auto_processed: 4, error_count: 2, status: 'processed', user_id: 1, uploaded_by: 'Чистякова М.В.' },
  { id: 3, file_name: 'demo_june_2026.txt', uploaded_at: today + ' 09:00:00', total_operations: 5, auto_processed: 5, error_count: 0, status: 'processed', user_id: 2, uploaded_by: 'Петрова А.С.' },
];

export const mockPayments: Payment[] = [
  { id: 1, statement_id: 1, doc_number: '1248', doc_date: today, amount: 202898.75, payer_name: 'ООО "Мави Джинс"', payer_inn: '7734660892', payer_account: '', payee_name: 'ООО "Социальные услуги"', payee_inn: '7713699602', payee_account: '', purpose: 'Оплата по счету № 1595/92 от 01.04.2026 обслуживание за 05.2026', payment_type_id: 1, article_id: 1, client_id: 1, status: 'processed', client_name: 'ООО "Мави Джинс"', payment_type_name: 'Поступление', article_name: 'Поступления от оказания социальных услуг' },
  { id: 2, statement_id: 1, doc_number: '1356', doc_date: today, amount: 157000, payer_name: 'Департамент труда и соцзащиты г. Москвы', payer_inn: '7710660053', payer_account: '', payee_name: 'ООО "Социальные услуги"', payee_inn: '7713699602', payee_account: '', purpose: 'Оплата по госконтракту № 2026-045 от 15.01.2026', payment_type_id: 1, article_id: 1, client_id: 4, status: 'processed', client_name: 'Департамент труда и соцзащиты г. Москвы', payment_type_name: 'Поступление', article_name: 'Поступления от оказания социальных услуг' },
  { id: 3, statement_id: 1, doc_number: '1275', doc_date: today, amount: 89000, payer_name: 'ИП Иванов И.И.', payer_inn: '771501001234', payer_account: '', payee_name: 'ООО "Социальные услуги"', payee_inn: '7713699602', payee_account: '', purpose: 'Оплата по договору № 12 от 10.01.2026', payment_type_id: 1, article_id: 1, client_id: 3, status: 'processed', client_name: 'ИП Иванов И.И.', payment_type_name: 'Поступление', article_name: 'Поступления от оказания социальных услуг' },
  { id: 4, statement_id: 1, doc_number: '1401', doc_date: today, amount: 45000, payer_name: 'ООО "Социальные услуги"', payer_inn: '7713699602', payer_account: '', payee_name: 'ООО "Ромашка"', payee_inn: '7728300200', payee_account: '', purpose: 'Оплата по договору № 45 от 12.02.2026 за канцелярские товары', payment_type_id: 2, article_id: 2, client_id: 5, status: 'processed', client_name: 'ООО "Ромашка"', payment_type_name: 'Списание', article_name: 'Оплата товаров и материалов' },
  { id: 5, statement_id: 1, doc_number: '1402', doc_date: today, amount: 32000.5, payer_name: 'ООО "Социальные услуги"', payer_inn: '7713699602', payer_account: '', payee_name: 'АО "Флант"', payee_inn: '7702033720', payee_account: '', purpose: 'Оплата по счету № FL-887 за услуги хостинга', payment_type_id: 2, article_id: 6, client_id: 2, status: 'processed', client_name: 'АО "Флант"', payment_type_name: 'Списание', article_name: 'Услуги связи и интернета' },
  { id: 6, statement_id: 1, doc_number: '1403', doc_date: today, amount: 18500, payer_name: 'Неизвестный отправитель', payer_inn: '0000000000', payer_account: '', payee_name: 'ООО "Социальные услуги"', payee_inn: '7713699602', payee_account: '', purpose: 'Оплата по договору № Н/Д', payment_type_id: 1, article_id: null, client_id: null, status: 'manual' },
  { id: 7, statement_id: 1, doc_number: '1404', doc_date: today, amount: 77000, payer_name: 'ООО "Социальные услуги"', payer_inn: '7713699602', payer_account: '', payee_name: 'ООО "ТехноПром"', payee_inn: '0000000001', payee_account: '', purpose: 'Предоплата по договору поставки № 88/П', payment_type_id: 2, article_id: null, client_id: null, status: 'error' },
  { id: 8, statement_id: 1, doc_number: '1405', doc_date: today, amount: 12500, payer_name: 'ООО "Социальные услуги"', payer_inn: '7713699602', payer_account: '', payee_name: 'ИП Сидоров А.В.', payee_inn: '0000000002', payee_account: '', purpose: 'Оплата транспортных услуг по сч. № ТР-156', payment_type_id: 2, article_id: null, client_id: null, status: 'manual' },
  { id: 9, statement_id: 2, doc_number: '1180', doc_date: '2026-04-15', amount: 195000, payer_name: 'Департамент труда и соцзащиты г. Москвы', payer_inn: '7710660053', payer_account: '', payee_name: 'ООО "Социальные услуги"', payee_inn: '7713699602', payee_account: '', purpose: 'Оплата по госконтракту № 2026-045 за март 2026', payment_type_id: 1, article_id: 1, client_id: 4, status: 'processed', client_name: 'Департамент труда и соцзащиты г. Москвы' },
  { id: 10, statement_id: 2, doc_number: '1191', doc_date: '2026-04-14', amount: 43200, payer_name: 'ООО "Социальные услуги"', payer_inn: '7713699602', payer_account: '', payee_name: 'ООО "Медтехника-Сервис"', payee_inn: '7718014456', payee_account: '', purpose: 'Оплата по сч. № МТ-445 за медицинское оборудование', payment_type_id: 2, article_id: 2, client_id: 7, status: 'processed' },
  { id: 11, statement_id: 2, doc_number: '1195', doc_date: '2026-04-12', amount: 56000, payer_name: 'ИП Петрова М.С.', payer_inn: '772000112345', payer_account: '', payee_name: 'ООО "Социальные услуги"', payee_inn: '7713699602', payee_account: '', purpose: 'Оплата по договору № 34 за catering-услуги', payment_type_id: 1, article_id: 7, client_id: 15, status: 'processed' },
  { id: 12, statement_id: 2, doc_number: '1203', doc_date: '2026-04-10', amount: 128000, payer_name: 'ООО "Социальные услуги"', payer_inn: '7713699602', payer_account: '', payee_name: 'АО "ВСК"', payee_inn: '7710026574', payee_account: '', purpose: 'Страховая премия по дог. № 567-С/2026', payment_type_id: 2, article_id: 4, client_id: 17, status: 'processed' },
  { id: 13, statement_id: 2, doc_number: '1210', doc_date: '2026-04-08', amount: 34000, payer_name: 'ООО "Социальные услуги"', payer_inn: '7713699602', payer_account: '', payee_name: 'ООО "ТехСнаб"', payee_inn: '0000000003', payee_account: '', purpose: 'Оплата по сч. ТС-789 за хозтовары', payment_type_id: 2, article_id: null, client_id: null, status: 'manual' },
  { id: 14, statement_id: 2, doc_number: '1215', doc_date: '2026-04-05', amount: 91500, payer_name: 'АНО "ЦСП "Надежда"', payer_inn: '0000000004', payer_account: '', payee_name: 'ООО "Социальные услуги"', payee_inn: '7713699602', payee_account: '', purpose: 'Благотворительный взнос по договору', payment_type_id: 1, article_id: null, client_id: null, status: 'manual' },
  { id: 15, statement_id: 3, doc_number: '1501', doc_date: today, amount: 250000, payer_name: 'Департамент труда и соцзащиты г. Москвы', payer_inn: '7710660053', payer_account: '', payee_name: 'ООО "Социальные услуги"', payee_inn: '7713699602', payee_account: '', purpose: 'Оплата по госконтракту № 2026-045 за май 2026', payment_type_id: 1, article_id: null, client_id: 4, status: 'processed' },
  { id: 16, statement_id: 3, doc_number: '1502', doc_date: today, amount: 67000, payer_name: 'ООО "Социальные услуги"', payer_inn: '7713699602', payer_account: '', payee_name: 'ПАО "МГТС"', payee_inn: '7710016640', payee_account: '', purpose: 'Оплата услуг связи за июнь 2026', payment_type_id: 2, article_id: null, client_id: 11, status: 'processed' },
  { id: 17, statement_id: 3, doc_number: '1503', doc_date: today, amount: 54000, payer_name: 'ООО "Социальные услуги"', payer_inn: '7713699602', payer_account: '', payee_name: 'АО "Мосэнергосбыт"', payee_inn: '7736520080', payee_account: '', purpose: 'Оплата электроэнергии за май 2026', payment_type_id: 2, article_id: null, client_id: 13, status: 'processed' },
  { id: 18, statement_id: 3, doc_number: '1504', doc_date: today, amount: 38500, payer_name: 'ООО "Социальные услуги"', payer_inn: '7713699602', payer_account: '', payee_name: 'ООО "Клининг-Профи"', payee_inn: '7719078562', payee_account: '', purpose: 'Оплата клининговых услуг за июнь 2026', payment_type_id: 2, article_id: null, client_id: 12, status: 'processed' },
  { id: 19, statement_id: 3, doc_number: '1505', doc_date: today, amount: 93000, payer_name: 'ООО "Фарм-Поставка"', payer_inn: '7710645000', payer_account: '', payee_name: 'ООО "Социальные услуги"', payee_inn: '7713699602', payee_account: '', purpose: 'Возврат по акту сверки № ФП-223', payment_type_id: 1, article_id: null, client_id: 19, status: 'processed' },
];

export const mockErrors: ErrorItem[] = [
  { id: 1, payment_id: 6, error_type: 'Неизвестный контрагент', description: 'Не удалось найти контрагента: Неизвестный отправитель', status: 'new', assigned_to: null, created_at: today + ' 10:20:00', resolved_at: null, doc_number: '1403' },
  { id: 2, payment_id: 7, error_type: 'Неизвестный контрагент', description: 'Не удалось найти контрагента: ООО "ТехноПром"', status: 'in_progress', assigned_to: 2, created_at: today + ' 10:21:00', resolved_at: null, doc_number: '1404', assigned_name: 'Петрова А.С.' },
  { id: 3, payment_id: 8, error_type: 'Неизвестный контрагент', description: 'Не удалось найти контрагента: ИП Сидоров А.В.', status: 'new', assigned_to: null, created_at: today + ' 10:22:00', resolved_at: null, doc_number: '1405' },
  { id: 4, payment_id: 13, error_type: 'Неизвестный контрагент', description: 'Не удалось найти контрагента: ООО "ТехСнаб"', status: 'resolved', assigned_to: 1, created_at: today + ' 15:00:00', resolved_at: today + ' 16:00:00', doc_number: '1210', assigned_name: 'Чистякова М.В.' },
  { id: 5, payment_id: 14, error_type: 'Неизвестный контрагент', description: 'Не удалось найти контрагента: АНО "ЦСП "Надежда"', status: 'new', assigned_to: null, created_at: today + ' 15:10:00', resolved_at: null, doc_number: '1215' },
];

export const mockLogs: LogEntry[] = [
  { id: 1, user_id: 1, action: 'Загружена выписка: demo_april_2026.txt (6 операций)', timestamp: today + ' 14:35:00', login: 'admin', full_name: 'Чистякова М.В.' },
  { id: 2, user_id: 2, action: 'Загружена выписка: demo_may_2026.txt (8 операций)', timestamp: today + ' 10:20:00', login: 'buh', full_name: 'Петрова А.С.' },
  { id: 3, user_id: 2, action: 'Загружена выписка: demo_june_2026.txt (5 операций)', timestamp: today + ' 09:05:00', login: 'buh', full_name: 'Петрова А.С.' },
  { id: 4, user_id: 1, action: 'Ошибка №4 решена (ООО "ТехСнаб")', timestamp: today + ' 16:00:00', login: 'admin', full_name: 'Чистякова М.В.' },
  { id: 5, user_id: 2, action: 'Ошибка №5 взята в работу', timestamp: today + ' 15:15:00', login: 'buh', full_name: 'Петрова А.С.' },
];

export const mockDashboard: DashboardData = {
  statementCount: 3,
  paymentCount: 19,
  autoPercent: 68,
  errorCount: 3,
  recentStatements: mockStatements.slice(0, 5),
  recentErrors: mockErrors.slice(0, 5),
};

export const mockReport: ReportData = {
  articles: [
    { name: 'Поступления от оказания социальных услуг', type: 'income', income: 645898.75, expense: 0, count: 5 },
    { name: 'Оплата товаров и материалов', type: 'expense', income: 0, expense: 122200, count: 2 },
    { name: 'Услуги связи и интернета', type: 'expense', income: 0, expense: 32000.5, count: 1 },
    { name: 'Налоги и сборы', type: 'expense', income: 0, expense: 128000, count: 1 },
    { name: 'Прочие поступления', type: 'income', income: 56000, expense: 0, count: 1 },
    { name: 'Нераспределённые', type: 'unknown', income: 18500 + 91500, expense: 77000 + 12500 + 34000 + 250000 + 67000 + 54000 + 38500 + 93000, count: 8 },
  ],
  totalIncome: 811898.75,
  totalExpense: 764200.5,
  netFlow: 47698.25,
  paymentCount: 19,
};
