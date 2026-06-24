/**
 * @file Типы и интерфейсы для АСБО.
 * Содержит полный набор TypeScript-интерфейсов:
 * - Row-типы для строк таблиц БД (UserRow, PaymentRow, ErrorRow и т.д.).
 * - Body-типы для входящих данных API-запросов (LoginBody, ClientBody, etc.).
 * - Составные типы для отчётов и дашборда (ReportResult, DashboardResult).
 *
 * Все интерфейсы экспортируются для использования в маршрутах и сервисах
 * (типизация параметров и результатов SQL-запросов).
 */

/** Базовая строка БД — минимальный контракт: обязательный числовой первичный ключ */
export interface Row {
  id: number;
  [key: string]: unknown; // допускает дополнительные поля (гибкость при JOIN)
}

/** Строка таблицы users (пользователь системы) */
export interface UserRow {
  id: number;
  login: string;           // логин для входа
  password: string;        // пароль (в демо — открытый текст)
  full_name: string;       // ФИО пользователя
  role_id: number;         // FK → roles.id
  active: number;          // 1 = активен, 0 = заблокирован
  role_code?: string;      // код роли (при JOIN с roles) — для фронтенда
  role_name?: string;      // название роли (при JOIN с roles) — для отображения
}

/** Строка таблицы roles (роль пользователя) */
export interface RoleRow {
  id: number;
  code: string;            // уникальный код: admin, accountant, manager
  name: string;            // читаемое название роли
  description: string;     // описание прав доступа
}

/** Строка таблицы banks (банк) */
export interface BankRow {
  id: number;
  name: string;            // наименование банка
  bik: string;             // БИК (9 цифр, уникальный)
  corr_account: string;    // корреспондентский счёт
}

/** Строка таблицы clients (контрагент) */
export interface ClientRow {
  id: number;
  name: string;            // наименование организации / ФИО ИП
  inn: string;             // ИНН (10 или 12 цифр)
  kpp: string;             // КПП (9 цифр, для ИП пусто)
  account: string;         // расчётный счёт
  bik: string;             // БИК банка контрагента
  status: string;          // active | inactive
}

/** Строка таблицы payment_types (тип платежа) */
export interface PaymentTypeRow {
  id: number;
  code: string;            // IN, OUT, TRANSFER
  name: string;            // Поступление, Списание, Внутренний перевод
}

/** Строка таблицы articles (статья ДДС) */
export interface ArticleRow {
  id: number;
  code: string;            // уникальный код (DDC_001 и т.д.)
  name: string;            // название статьи
  type: 'income' | 'expense'; // тип: доход или расход (ограничение CHECK в БД)
}

/** Строка таблицы statements (банковская выписка) */
export interface StatementRow {
  id: number;
  file_name: string;       // имя загруженного файла
  uploaded_at: string;     // дата/время загрузки (ISO-строка)
  total_operations: number;// общее количество операций в выписке
  auto_processed: number;  // количество автоматически обработанных
  error_count: number;     // количество операций с ошибками
  status: string;          // uploaded | processed | error
  user_id: number | null;  // FK → users.id (кто загрузил)
  uploaded_by?: string;    // имя пользователя (при JOIN) — для отображения
}

/** Строка таблицы payments (платёжная операция/документ выписки) */
export interface PaymentRow {
  id: number;
  statement_id: number;            // FK → statements.id
  doc_number: string;              // номер платёжного документа
  doc_date: string;                // дата документа
  amount: number;                  // сумма операции
  payer_name: string;              // наименование плательщика
  payer_inn: string;               // ИНН плательщика
  payer_account: string;           // расчётный счёт плательщика
  payee_name: string;              // наименование получателя
  payee_inn: string;               // ИНН получателя
  payee_account: string;           // расчётный счёт получателя
  purpose: string;                 // назначение платежа
  payment_type_id: number | null;  // FK → payment_types.id
  article_id: number | null;       // FK → articles.id (может быть не определён)
  client_id: number | null;        // FK → clients.id (контрагент, определённый парсером)
  contract_id: number | null;       // FK → 1C-договор (выбран при создании или импорте)
  contract_number: string;          // номер 1C-договора
  status: string;                  // processed | manual | error
  client_name?: string;            // имя контрагента (при JOIN) — для отображения
  payment_type_name?: string;      // название типа платежа (при JOIN)
  article_name?: string;           // название статьи ДДС (при JOIN)
  article_type?: string;           // тип статьи (income/expense) (при JOIN)
  statement_file?: string;         // имя файла выписки (при JOIN) — для отображения
}

/** Строка таблицы errors (ошибка обработки платежа) */
export interface ErrorRow {
  id: number;
  payment_id: number;              // FK → payments.id
  error_type: string;              // тип ошибки (напр. "Неизвестный контрагент")
  description: string;             // подробное описание ошибки
  status: 'new' | 'in_progress' | 'resolved'; // статус обработки
  assigned_to: number | null;      // FK → users.id (кому назначено исправление)
  created_at: string;              // дата/время создания
  resolved_at: string | null;      // дата/время решения (null, если не решена)
  doc_number?: string;             // номер документа платежа (при JOIN) — для отображения
  amount?: number;                 // сумма платежа (при JOIN) — для отображения
  payer_name?: string;             // плательщик (при JOIN) — для отображения
  payee_name?: string;             // получатель (при JOIN) — для отображения
  assigned_name?: string;          // имя назначенного пользователя (при JOIN)
}

/** Строка таблицы logs (запись журнала аудита) */
export interface LogRow {
  id: number;
  user_id: number | null;  // FK → users.id (может быть null для системных действий)
  action: string;          // описание выполненного действия
  timestamp: string;       // дата/время действия
  login?: string;          // логин пользователя (при JOIN) — для отображения
  full_name?: string;      // ФИО пользователя (при JOIN) — для отображения
}

// ========== Тела API-запросов (POST/PUT) ==========

/** Тело запроса POST /api/login */
export interface LoginBody {
  login: string;           // логин пользователя
  password: string;        // пароль
}

/** Тело запроса POST/PUT /api/users */
export interface UserBody {
  login: string;           // логин
  password?: string;       // пароль (опционально при обновлении)
  fullName: string;        // ФИО (camelCase — из JSON)
  roleId: number;          // ID роли
  active?: boolean;        // активность учётной записи
}

/** Тело запроса POST/PUT /api/banks */
export interface BankBody {
  name: string;            // название банка
  bik: string;             // БИК (9 цифр)
  corrAccount: string;     // корр. счёт (camelCase из JSON)
}

/** Тело запроса POST/PUT /api/clients */
export interface ClientBody {
  name: string;            // название компании / ФИО
  inn: string;             // ИНН
  kpp?: string;            // КПП (опционально — для ИП)
  account?: string;        // расчётный счёт (опционально)
  bik?: string;            // БИК (опционально)
}

/** Тело запроса POST/PUT /api/payment-types */
export interface PaymentTypeBody {
  code: string;            // уникальный код (IN, OUT, TRANSFER)
  name: string;            // читаемое название
}

/** Тело запроса POST/PUT /api/articles */
export interface ArticleBody {
  code: string;            // уникальный код статьи (DDC_XXX)
  name: string;            // название статьи
  type: 'income' | 'expense'; // тип: доход или расход
}

/** Тело запроса POST /api/statements (загрузка выписки) */
export interface StatementBody {
  fileName: string;                    // имя файла выписки
  documents: StatementDocument[];      // массив распарсенных документов
  userId: number | null;               // ID пользователя, загрузившего выписку
}

/** Структура одного документа внутри загружаемой выписки (формат 1С) */
export interface StatementDocument {
  Номер: string;                       // номер платёжного документа
  Дата: string;                        // дата документа
  Сумма: string;                       // сумма (строка, парсится в число)
  Плательщик: string;                  // наименование плательщика
  Получатель: string;                  // наименование получателя
  НазначениеПлатежа: string;           // назначение платежа
  ПлательщикИНН?: string;              // ИНН плательщика (может отсутствовать)
  ПолучательИНН?: string;              // ИНН получателя (может отсутствовать)
  ПлательщикСчет?: string;             // счёт плательщика (опционально)
  ПолучательСчет?: string;             // счёт получателя (опционально)
}

/** Тело запроса POST /api/payments (создание платежа пользователем) */
export interface PaymentCreateBody {
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
}

/** Тело запроса PUT /api/payments/:id (ручное обновление платежа) */
export interface PaymentUpdateBody {
  clientId: number | null;       // ID контрагента
  paymentTypeId: number;         // ID типа платежа
  articleId: number | null;      // ID статьи ДДС
  status: string;                // статус обработки
}

/** Тело запроса PUT /api/errors/:id (обновление статуса ошибки) */
export interface ErrorUpdateBody {
  status?: string;               // новый статус: new | in_progress | resolved
  assignedTo?: number;           // ID пользователя, которому назначить ошибку
}

// ========== Параметры и результаты отчётов ==========

/** Параметры GET /api/reports (фильтрация по дате) */
export interface ReportQuery {
  from?: string;                 // начальная дата (YYYY-MM-DD)
  to?: string;                   // конечная дата (YYYY-MM-DD)
}

/** Результат построения отчёта по статьям ДДС */
export interface ReportResult {
  articles: ReportArticle[];     // разбивка по статьям
  totalIncome: number;           // итоговая сумма доходов
  totalExpense: number;          // итоговая сумма расходов
  netFlow: number;               // чистый поток (доходы – расходы)
  paymentCount: number;          // общее количество обработанных платежей
}

/** Одна строка отчёта — агрегация по статье ДДС */
export interface ReportArticle {
  name: string;                  // название статьи
  type: string;                  // тип: income / expense
  income: number;                // сумма поступлений по статье
  expense: number;               // сумма списаний по статье
  count: number;                 // количество платежей
}

/** Данные для главной страницы (дашборд) */
export interface DashboardResult {
  statementCount: number;             // общее количество выписок
  paymentCount: number;               // общее количество платежей
  autoPercent: number;                // процент автоматической обработки
  errorCount: number;                 // количество активных ошибок
  recentStatements: StatementRow[];   // последние выписки (для таблицы)
  recentErrors: ErrorRow[];           // последние ошибки (для таблицы)
}
