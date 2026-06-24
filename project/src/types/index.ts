export interface User {
  id: number;
  login: string;
  fullName: string;
  roleId: number;
  role: 'admin' | 'accountant' | 'manager';
  roleName: string;
  active: number;
  full_name?: string;
  role_code?: string;
  role_name?: string;
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description: string;
}

export interface Bank {
  id: number;
  name: string;
  bik: string;
  corr_account: string;
}

export interface Client {
  id: number;
  name: string;
  inn: string;
  kpp: string;
  account: string;
  bik: string;
  status: string;
}

export interface PaymentType {
  id: number;
  code: string;
  name: string;
}

export interface Article {
  id: number;
  code: string;
  name: string;
  type: 'income' | 'expense';
}

export interface Statement {
  id: number;
  file_name: string;
  uploaded_at: string;
  total_operations: number;
  auto_processed: number;
  error_count: number;
  status: string;
  user_id: number | null;
  uploaded_by: string | null;
}

export interface Payment {
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
  statement_file?: string;
}

export interface ErrorItem {
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

export interface LogEntry {
  id: number;
  user_id: number | null;
  action: string;
  timestamp: string;
  login?: string;
  full_name?: string;
}

export interface DashboardData {
  statementCount: number;
  paymentCount: number;
  autoPercent: number;
  errorCount: number;
  recentStatements: Statement[];
  recentErrors: ErrorItem[];
}

export interface ReportData {
  articles: {
    name: string;
    type: string;
    income: number;
    expense: number;
    count: number;
  }[];
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
  paymentCount: number;
}

export interface StatementDocument {
  Номер: string;
  Дата: string;
  Сумма: string;
  Плательщик: string;
  Получатель: string;
  НазначениеПлатежа: string;
  ПлательщикИНН: string;
  ПолучательИНН: string;
  ПлательщикСчет: string;
  ПолучательСчет: string;
}

export interface ParsedStatement {
  header: Record<string, string>;
  documents: StatementDocument[];
}
