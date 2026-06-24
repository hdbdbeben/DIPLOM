/**
 * @file Репозиторий платежей — слой доступа к данным платёжных операций.
 *
 * Управляет выборкой и обновлением платёжных документов, полученных
 * из банковских выписок. Каждый платёж связан с клиентом, типом платежа,
 * статьёй ДДС и выпиской-источником. Поддерживается поиск и фильтрация.
 */
import { query, queryOne, update, insert } from '../db';
import type { PaymentRow, PaymentUpdateBody, PaymentCreateBody } from '../types';

/**
 * Возвращает список платежей с фильтрацией и поиском.
 *
 * Поддерживаемые фильтры:
 * - `statementId` — по конкретной выписке
 * - `status` — по статусу обработки (processed, error, unmatched); 'all' отключает фильтр
 * - `search` — полнотекстовый поиск по плательщику, получателю, ИНН и назначению
 *
 * Все JOIN-ы LEFT — платёж возвращается даже если связанная сущность удалена.
 * Результат ограничен 500 записями для производительности.
 *
 * @param {Object} params - Параметры фильтрации
 * @param {number} [params.statementId] - Фильтр по ID выписки
 * @param {string} [params.status] - Фильтр по статусу ('all' — без фильтра)
 * @param {string} [params.search] - Поисковая строка (по названиям, ИНН, назначению)
 * @returns {Promise<PaymentRow[]>} Массив платежей с именами связанных сущностей
 */
export async function findAll(params: {
  statementId?: number;
  status?: string;
  search?: string;
}): Promise<PaymentRow[]> {
  // Базовый запрос с LEFT JOIN ко всем справочникам.
  // WHERE 1=1 — трюк для удобного динамического добавления условий через AND.
  let sql = `SELECT p.*, c.name as client_name, pt.name as payment_type_name, a.name as article_name
             FROM payments p
             LEFT JOIN clients c ON p.client_id = c.id
             LEFT JOIN payment_types pt ON p.payment_type_id = pt.id
             LEFT JOIN articles a ON p.article_id = a.id
             WHERE 1=1`;
  const values: (string | number)[] = [];

  // Динамическое добавление фильтров
  if (params.statementId) { sql += ' AND p.statement_id = ?'; values.push(params.statementId); }
  if (params.status && params.status !== 'all') { sql += ' AND p.status = ?'; values.push(params.status); }
  if (params.search) {
    // Поиск по пяти полям: плательщик, получатель, ИНН плательщика, ИНН получателя, назначение
    sql += ' AND (p.payer_name LIKE ? OR p.payee_name LIKE ? OR p.payer_inn LIKE ? OR p.payee_inn LIKE ? OR p.purpose LIKE ?)';
    const s = `%${params.search}%`;
    values.push(s, s, s, s, s);
  }
  // Ограничение в 500 записей для предотвращения проблем с производительностью
  sql += ' ORDER BY p.id DESC LIMIT 500';
  return query<PaymentRow>(sql, values);
}

/**
 * Возвращает детальную информацию об одном платеже.
 *
 * В отличие от findAll, здесь дополнительно присоединяется файл выписки
 * (statement_file) для отображения источника платежа на странице деталей.
 *
 * @param {number} id - ID платежа
 * @returns {Promise<PaymentRow | null>} Детальная запись платежа или null
 */
export async function findById(id: number): Promise<PaymentRow | null> {
  // Детальная выборка с пятью JOIN: клиент, тип, статья, выписка.
  // Добавлено поле statement_file для отображения источника.
  return queryOne<PaymentRow>(
    `SELECT p.*, c.name as client_name, pt.name as payment_type_name, a.name as article_name, s.file_name as statement_file
     FROM payments p
     LEFT JOIN clients c ON p.client_id = c.id
     LEFT JOIN payment_types pt ON p.payment_type_id = pt.id
     LEFT JOIN articles a ON p.article_id = a.id
     LEFT JOIN statements s ON p.statement_id = s.id
     WHERE p.id = ?`,
    [id]
  );
}

/**
 * Обновляет сопоставленные данные платежа.
 *
 * Позволяет оператору вручную указать клиента, тип платежа, статью ДДС
 * и статус обработки. Если статус не передан, устанавливается 'processed'.
 * Поля маппятся из camelCase в snake_case для БД.
 *
 * @param {number} id - ID платежа
 * @param {PaymentUpdateBody} data - Обновляемые поля (clientId, paymentTypeId, articleId, status)
 * @returns {Promise<void>}
 */
export async function updatePayment(id: number, data: PaymentUpdateBody): Promise<void> {
  await update('payments', id, {
    client_id: data.clientId,
    payment_type_id: data.paymentTypeId,
    article_id: data.articleId,
    status: data.status || 'processed',
  });
}

/**
 * Создаёт новый платёж (ручной ввод пользователем).
 *
 * Платёж создаётся без привязки к выписке (statement_id = null).
 * Все обязательные поля берутся из тела запроса, поля справочников
 * (payment_type_id, article_id, client_id) — из выбора пользователя.
 *
 * @param {PaymentCreateBody} data — данные нового платежа
 * @returns {Promise<PaymentRow>} Созданная запись платежа с JOIN-полями
 */
export async function createPayment(data: PaymentCreateBody): Promise<PaymentRow> {
  const id = insert('payments', {
    statement_id: null,
    doc_number: data.docNumber,
    doc_date: data.docDate,
    amount: data.amount,
    payer_name: data.payerName,
    payer_inn: data.payerInn,
    payer_account: data.payerAccount,
    payee_name: data.payeeName,
    payee_inn: data.payeeInn,
    payee_account: data.payeeAccount,
    purpose: data.purpose,
    payment_type_id: data.paymentTypeId,
    article_id: data.articleId,
    client_id: data.clientId,
    contract_id: data.contractId,
    contract_number: data.contractNumber,
    status: data.status || 'processed',
  }) as number;

  return (await findById(id))!;
}
