export interface Row {
  id: number;
  [key: string]: unknown;
}

export interface UserRow {
  id: number;
  login: string;
  password: string;
  full_name: string;
  role_id: number;
  active: number;
  role_code?: string;
  role_name?: string;
}

export interface RoleRow {
  id: number;
  code: string;
  name: string;
  description: string;
}

export interface BankRow {
  id: number;
  name: string;
  bik: string;
  corr_account: string;
}

export interface ClientRow {
  id: number;
  name: string;
  inn: string;
  kpp: string;
  account: string;
  bik: string;
  status: string;
}

export interface PaymentTypeRow {
  id: number;
  code: string;
  name: string;
}

export interface ArticleRow {
  id: number;
  code: string;
  name: string;
  type: 'income' | 'expense';
}

export interface StatementRow {
  id: number;
  file_name: string;
  uploaded_at: string;
  total_operations: number;
  auto_processed: number;
  error_count: number;
  status: string;
  user_id: number | null;
  uploaded_by?: string;
}

export interface PaymentRow {
  id: number;
  statement_id: number;
  doc_number: string;
  doc_date: string;
  amount: number;
  payer_name: string;
  payer_inn: string;
  payer_account: string;
  payee_name: string;
  payee_inn: string;
  payee_account: string;
  purpose: string;
  payment_type_id: number | null;
  article_id: number | null;
  client_id: number | null;
  status: string;
  client_name?: string;
  payment_type_name?: string;
  article_name?: string;
  article_type?: string;
  statement_file?: string;
}

export interface ErrorRow {
  id: number;
  payment_id: number;
  error_type: string;
  description: string;
  status: 'new' | 'in_progress' | 'resolved';
  assigned_to: number | null;
  created_at: string;
  resolved_at: string | null;
  doc_number?: string;
  amount?: number;
  payer_name?: string;
  payee_name?: string;
  assigned_name?: string;
}

export interface LogRow {
  id: number;
  user_id: number | null;
  action: string;
  timestamp: string;
  login?: string;
  full_name?: string;
}

export interface LoginBody {
  login: string;
  password: string;
}

export interface UserBody {
  login: string;
  password?: string;
  fullName: string;
  roleId: number;
  active?: boolean;
}

export interface BankBody {
  name: string;
  bik: string;
  corrAccount: string;
}

export interface ClientBody {
  name: string;
  inn: string;
  kpp?: string;
  account?: string;
  bik?: string;
}

export interface PaymentTypeBody {
  code: string;
  name: string;
}

export interface ArticleBody {
  code: string;
  name: string;
  type: 'income' | 'expense';
}

export interface StatementBody {
  fileName: string;
  documents: StatementDocument[];
  userId: number | null;
}

export interface StatementDocument {
  Номер: string;
  Дата: string;
  Сумма: string;
  Плательщик: string;
  Получатель: string;
  НазначениеПлатежа: string;
  ПлательщикИНН?: string;
  ПолучательИНН?: string;
  ПлательщикСчет?: string;
  ПолучательСчет?: string;
}

export interface PaymentUpdateBody {
  clientId: number | null;
  paymentTypeId: number;
  articleId: number | null;
  status: string;
}

export interface ErrorUpdateBody {
  status?: string;
  assignedTo?: number;
}

export interface ReportQuery {
  from?: string;
  to?: string;
}

export interface ReportResult {
  articles: ReportArticle[];
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
  paymentCount: number;
}

export interface ReportArticle {
  name: string;
  type: string;
  income: number;
  expense: number;
  count: number;
}

export interface DashboardResult {
  statementCount: number;
  paymentCount: number;
  autoPercent: number;
  errorCount: number;
  recentStatements: StatementRow[];
  recentErrors: ErrorRow[];
}
