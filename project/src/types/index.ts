/**
 * @file Централизованные TypeScript-типы, описывающие все сущности системы.
 * Интерфейсы соответствуют структуре данных, получаемых от REST API.
 * Используются во всех слоях приложения: API-клиент, контексты, страницы, компоненты.
 */

/** Пользователь системы */
export interface User {
  /** Уникальный идентификатор */
  id: number;
  /** Логин для входа */
  login: string;
  /** Полное имя (camelCase, используется в UI) */
  fullName: string;
  /** ID роли */
  roleId: number;
  /** Код роли (admin, accountant, manager) */
  role: 'admin' | 'accountant' | 'manager';
  /** Название роли (русское) */
  roleName: string;
  /** Флаг активности (1 — активен, 0 — заблокирован) */
  active: number;
  /** Полное имя (snake_case, из БД) */
  full_name?: string;
  /** Код роли (snake_case, из БД) */
  role_code?: string;
  /** Название роли (snake_case, из БД) */
  role_name?: string;
}

/** Роль пользователя */
export interface Role {
  /** Уникальный идентификатор */
  id: number;
  /** Код роли (admin, accountant, manager) */
  code: string;
  /** Название роли (русское) */
  name: string;
  /** Описание прав роли */
  description: string;
}

/** Банк (справочник) */
export interface Bank {
  /** Уникальный идентификатор */
  id: number;
  /** Название банка */
  name: string;
  /** БИК (банковский идентификационный код) */
  bik: string;
  /** Корреспондентский счёт */
  corr_account: string;
}

/** Клиент (контрагент) */
export interface Client {
  /** Уникальный идентификатор */
  id: number;
  /** Наименование клиента */
  name: string;
  /** ИНН клиента */
  inn: string;
  /** КПП клиента */
  kpp: string;
  /** Расчётный счёт */
  account: string;
  /** БИК банка клиента */
  bik: string;
  /** Статус клиента (например, 'active') */
  status: string;
}

/** Тип платежа (справочник) */
export interface PaymentType {
  /** Уникальный идентификатор */
  id: number;
  /** Код типа платежа (например, '01') */
  code: string;
  /** Название типа платежа (русское) */
  name: string;
}

/** Статья доходов/расходов (справочник) */
export interface Article {
  /** Уникальный идентификатор */
  id: number;
  /** Код статьи */
  code: string;
  /** Название статьи (русское) */
  name: string;
  /** Тип статьи: 'income' — доход, 'expense' — расход */
  type: 'income' | 'expense';
}

/** Выписка (загруженный файл с платёжными поручениями) */
export interface Statement {
  /** Уникальный идентификатор */
  id: number;
  /** Имя загруженного файла */
  file_name: string;
  /** Дата и время загрузки */
  uploaded_at: string;
  /** Общее количество операций в выписке */
  total_operations: number;
  /** Количество автоматически обработанных платежей */
  auto_processed: number;
  /** Количество платежей с ошибками */
  error_count: number;
  /** Статус обработки выписки */
  status: string;
  /** ID пользователя, загрузившего выписку */
  user_id: number | null;
  /** Имя пользователя, загрузившего выписку */
  uploaded_by: string | null;
}

/** Платёж (платёжное поручение из выписки) */
export interface Payment {
  /** Уникальный идентификатор */
  id: number;
  /** ID выписки, к которой относится платёж */
  statement_id: number;
  /** Номер платёжного документа */
  doc_number: string;
  /** Дата платёжного документа */
  doc_date: string;
  /** Сумма платежа */
  amount: number;
  /** Наименование плательщика */
  payer_name: string;
  /** ИНН плательщика */
  payer_inn: string;
  /** Счёт плательщика */
  payer_account: string;
  /** Наименование получателя */
  payee_name: string;
  /** ИНН получателя */
  payee_inn: string;
  /** Счёт получателя */
  payee_account: string;
  /** Назначение платежа */
  purpose: string;
  /** ID типа платежа (после сопоставления) */
  payment_type_id: number | null;
  /** ID статьи доходов/расходов (после сопоставления) */
  article_id: number | null;
  /** ID клиента-контрагента (после сопоставления) */
  client_id: number | null;
  /** ID договора из 1С */
  contract_id: number | null;
  /** Номер договора из 1С */
  contract_number: string;
  /** Статус обработки платежа */
  status: string;
  /** Наименование клиента (join из clients) */
  client_name?: string;
  /** Название типа платежа (join из payment_types) */
  payment_type_name?: string;
  /** Название статьи (join из articles) */
  article_name?: string;
  /** Имя файла выписки (join из statements) */
  statement_file?: string;
}

/** Ошибка обработки платежа */
export interface ErrorItem {
  /** Уникальный идентификатор */
  id: number;
  /** ID платежа, с которым связана ошибка */
  payment_id: number;
  /** Тип ошибки (например, 'unknown_client', 'duplicate') */
  error_type: string;
  /** Описание ошибки */
  description: string;
  /** Статус ошибки: новая, в работе, решена */
  status: 'new' | 'in_progress' | 'resolved';
  /** ID пользователя, назначенного для решения ошибки */
  assigned_to: number | null;
  /** Дата и время создания ошибки */
  created_at: string;
  /** Дата и время решения ошибки */
  resolved_at: string | null;
  /** Номер платёжного документа (join из payments) */
  doc_number?: string;
  /** Сумма платежа (join из payments) */
  amount?: number;
  /** Плательщик (join из payments) */
  payer_name?: string;
  /** Получатель (join из payments) */
  payee_name?: string;
  /** Имя назначенного пользователя (join из users) */
  assigned_name?: string;
}

/** Запись журнала действий */
export interface LogEntry {
  /** Уникальный идентификатор */
  id: number;
  /** ID пользователя, совершившего действие */
  user_id: number | null;
  /** Описание действия */
  action: string;
  /** Дата и время действия */
  timestamp: string;
  /** Логин пользователя (join из users) */
  login?: string;
  /** Полное имя пользователя (join из users) */
  full_name?: string;
}

/** Данные для главной панели (dashboard) */
export interface DashboardData {
  /** Количество загруженных выписок */
  statementCount: number;
  /** Общее количество платежей */
  paymentCount: number;
  /** Процент автоматически обработанных платежей */
  autoPercent: number;
  /** Количество нерешённых ошибок */
  errorCount: number;
  /** Последние загруженные выписки (для таблицы) */
  recentStatements: Statement[];
  /** Последние ошибки (для таблицы) */
  recentErrors: ErrorItem[];
}

/** Данные отчёта о движении денежных средств (ДДС) */
export interface ReportData {
  /** Детализация по статьям */
  articles: {
    /** Название статьи */
    name: string;
    /** Тип статьи (income/expense) */
    type: string;
    /** Сумма доходов по статье */
    income: number;
    /** Сумма расходов по статье */
    expense: number;
    /** Количество операций по статье */
    count: number;
  }[];
  /** Итого доходов */
  totalIncome: number;
  /** Итого расходов */
  totalExpense: number;
  /** Чистый денежный поток (доходы минус расходы) */
  netFlow: number;
  /** Общее количество платёжных операций */
  paymentCount: number;
}

/**
 * Документ платёжного поручения (результат парсинга).
 * Поля названы на русском языке в соответствии с оригинальным форматом 1С.
 */
export interface StatementDocument {
  /** Номер платёжного документа */
  Номер: string;
  /** Дата документа */
  Дата: string;
  /** Сумма платежа (строка, конвертируется в число сервером) */
  Сумма: string;
  /** Наименование плательщика */
  Плательщик: string;
  /** Наименование получателя */
  Получатель: string;
  /** Назначение платежа */
  НазначениеПлатежа: string;
  /** ИНН плательщика */
  ПлательщикИНН: string;
  /** ИНН получателя */
  ПолучательИНН: string;
  /** Расчётный счёт плательщика */
  ПлательщикСчет: string;
  /** Расчётный счёт получателя */
  ПолучательСчет: string;
}

/**
 * Результат парсинга файла выписки.
 * Содержит заголовок (метаданные файла) и массив распарсенных документов.
 */
export interface ParsedStatement {
  /** Заголовок файла — произвольные пары ключ=значение (из секции заголовка 1С) */
  header: Record<string, string>;
  /** Массив платёжных документов, извлечённых из файла */
  documents: StatementDocument[];
}

/** Организация из 1С (справочник «Организации») */
export interface OneCOrganization {
  /** Уникальный идентификатор в 1С */
  id: number;
  /** Наименование организации */
  name: string;
  /** ИНН */
  inn: string;
  /** КПП */
  kpp: string;
  /** Основной расчётный счёт */
  account: string;
  /** БИК банка */
  bik: string;
  /** GUID в 1С (для отслеживания дублей) */
  guid: string;
}

/** Договор из 1С (справочник «Договоры контрагентов») */
export interface OneCContract {
  /** Уникальный идентификатор в 1С */
  id: number;
  /** Номер договора */
  number: string;
  /** Дата договора */
  date: string;
  /** Наименование контрагента */
  clientName: string;
  /** ИНН контрагента */
  clientInn: string;
  /** GUID контрагента в 1С */
  clientGuid: string;
  /** Вид договора (с покупателем / с поставщиком) */
  type: string;
  /** Сумма договора (если указана) */
  amount?: number;
  /** GUID договора в 1С */
  guid: string;
}

/** Документ, подготовленный к экспорту в 1С */
export interface OneCExportDocument {
  /** ID платежа в АСБО */
  paymentId: number;
  /** Номер документа */
  docNumber: string;
  /** Дата документа */
  docDate: string;
  /** Сумма */
  amount: number;
  /** Наименование контрагента */
  clientName: string;
  /** ИНН контрагента */
  clientInn: string;
  /** Тип операции (Поступление / Списание) */
  operationType: string;
  /** Статья ДДС */
  articleName?: string;
  /** Назначение платежа */
  purpose: string;
  /** Статус экспорта: ready / sent / error / posted */
  exportStatus: string;
  /** Номер созданного документа в 1С (после экспорта) */
  oneCDocNumber?: string;
  /** Дата проведения в 1С */
  oneCDate?: string;
}

/** Результат экспорта пакета документов в 1С */
export interface OneCExportResult {
  /** Всего отправлено документов */
  totalSent: number;
  /** Успешно проведено в 1С */
  posted: number;
  /** Ошибки при проведении */
  errors: number;
  /** Детали по каждому документу */
  details: {
    paymentId: number;
    status: string;
    oneCDocNumber?: string;
    error?: string;
  }[];
}

/** Запись журнала обмена с 1С */
export interface OneCExchangeLogEntry {
  /** Уникальный идентификатор */
  id: number;
  /** Тип операции: import_contracts / import_orgs / export_payments */
  operation: string;
  /** Направление: import / export */
  direction: 'import' | 'export';
  /** Краткое описание */
  description: string;
  /** Количество записей */
  count: number;
  /** Статус: success / partial / error */
  status: string;
  /** Дата и время операции */
  timestamp: string;
  /** ID пользователя, выполнившего операцию */
  userId: number | null;
  /** Имя пользователя */
  userName?: string;
}
