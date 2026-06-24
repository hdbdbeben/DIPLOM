CREATE DATABASE IF NOT EXISTS asbo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE asbo;

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  login VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  role_id INT NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS banks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  bik VARCHAR(9) NOT NULL UNIQUE,
  corr_account VARCHAR(20) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(300) NOT NULL,
  inn VARCHAR(12) NOT NULL,
  kpp VARCHAR(9),
  account VARCHAR(20),
  bik VARCHAR(9),
  status VARCHAR(20) DEFAULT 'active',
  INDEX idx_inn (inn),
  INDEX idx_bik (bik)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payment_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  type ENUM('income', 'expense') NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS statements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(300) NOT NULL,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_operations INT NOT NULL DEFAULT 0,
  auto_processed INT NOT NULL DEFAULT 0,
  error_count INT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'uploaded',
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  statement_id INT,
  doc_number VARCHAR(50),
  doc_date DATE,
  amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
  payer_name VARCHAR(300),
  payer_inn VARCHAR(12),
  payer_account VARCHAR(20),
  payee_name VARCHAR(300),
  payee_inn VARCHAR(12),
  payee_account VARCHAR(20),
  purpose TEXT,
  payment_type_id INT,
  article_id INT,
  client_id INT,
  status VARCHAR(30) NOT NULL DEFAULT 'processed',
  INDEX idx_date (doc_date),
  INDEX idx_client (client_id),
  INDEX idx_status (status),
  FOREIGN KEY (statement_id) REFERENCES statements(id) ON DELETE SET NULL,
  FOREIGN KEY (payment_type_id) REFERENCES payment_types(id) ON DELETE SET NULL,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS errors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT,
  error_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'new',
  assigned_to INT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(500) NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB;

-- Seed data
INSERT INTO roles (code, name, description) VALUES
('admin', 'Администратор', 'Полный доступ к системе: управление пользователями, справочниками, настройками'),
('accountant', 'Бухгалтер', 'Работа с выписками, операции, справочники, отчёты'),
('manager', 'Руководитель', 'Просмотр отчётов, журнала ошибок, выписок');

INSERT INTO users (login, password, full_name, role_id, active) VALUES
('admin', 'admin', 'Чистякова М.В.', 1, 1),
('buh', 'buh123', 'Петрова А.С.', 2, 1),
('buh2', 'buh123', 'Смирнова Е.В.', 2, 1),
('dir', 'dir123', 'Иванов К.Н.', 3, 1);

INSERT INTO banks (name, bik, corr_account) VALUES
('ПАО Сбербанк', '044525225', '30101810400000000225'),
('Банк ВТБ (ПАО)', '044525411', '30101810145250000411'),
('АО "Альфа-Банк"', '044525593', '30101810200000000593'),
('АО "Тинькофф Банк"', '044525999', '30101810145250000999');

INSERT INTO clients (name, inn, kpp, account, bik) VALUES
('ООО "Мави Джинс"', '7734660892', '773401001', '40702810500010001234', '044525225'),
('АО "Флант"', '7702033720', '770201001', '40702810700020004567', '044525411'),
('ИП Иванов И.И.', '771501001234', '', '40802810200030007890', '044525225'),
('Департамент труда и соцзащиты г. Москвы', '7710660053', '771001001', '40102810545370000003', '044525225'),
('ООО "Ромашка"', '7728300200', '772801001', '40702810600050009876', '044525999'),
('ООО "Социальные услуги"', '7713699602', '771301001', '40702810800220100505', '044525225');

INSERT INTO payment_types (code, name) VALUES
('IN', 'Поступление'),
('OUT', 'Списание'),
('TRANSFER', 'Внутренний перевод');

INSERT INTO articles (code, name, type) VALUES
('DDC_001', 'Поступления от оказания социальных услуг', 'income'),
('DDC_002', 'Оплата товаров и материалов', 'expense'),
('DDC_003', 'Заработная плата', 'expense'),
('DDC_004', 'Налоги и сборы', 'expense'),
('DDC_005', 'Аренда помещений', 'expense'),
('DDC_006', 'Услуги связи и интернета', 'expense'),
('DDC_007', 'Прочие поступления', 'income'),
('DDC_008', 'Коммунальные услуги', 'expense');
