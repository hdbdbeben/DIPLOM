import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchPayments, fetchPayment, updatePayment, fetchClients, fetchPaymentTypes, fetchArticles, sendPaymentsToBank } from '@/api/endpoints';
import { formatDate, formatMoney } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showModal, hideModal, showAlert, showToast, showConfirm } from '@/contexts/UIContext';
import type { Payment, Client, PaymentType, Article } from '@/types';

/**
 * Страница просмотра и классификации платёжных операций.
 *
 * Отображает таблицу платёжных операций с возможностью фильтрации по статусу,
 * текстового поиска по контрагенту/ИНН/назначению и фильтрации по ID выписки
 * (при переходе со страницы выписок).
 *
 * При клике на операцию открывается модальное окно с детальной информацией,
 * где можно классифицировать платёж: выбрать контрагента из справочника,
 * тип платежа, статью ДДС и изменить статус обработки.
 *
 * @component
 * @returns JSX-элемент страницы платёжных операций
 */
export function PaymentsPage() {
  // Параметры URL (например, ?statementId=5 при переходе из выписок)
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Фильтр по статусу обработки
  const [status, setStatus] = useState('all');
  // Строка текстового поиска
  const [search, setSearch] = useState('');
  // Значение поиска с задержкой (debounce) — используется в API-запросе
  const [debouncedSearch, setDebouncedSearch] = useState('');
  // ID выписки для фильтрации (из query-параметра URL)
  const [stmtId] = useState(searchParams.get('statementId') || '');
  // Список платёжных операций
  const [payments, setPayments] = useState<Payment[]>([]);
  // Флаг загрузки данных
  const [loading, setLoading] = useState(true);
  const [selectedPayments, setSelectedPayments] = useState<Set<number>>(new Set());

  /**
   * Эффект debounce для строки поиска платежей.
   *
   * Задержка 400 мс перед обновлением debouncedSearch предотвращает
   * избыточные API-запросы при быстром вводе текста.
   */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  /**
   * Загружает список платёжных операций с сервера с учётом текущих фильтров.
   *
   * Параметры запроса:
   * - statementId: фильтр по выписке (если передан в URL)
   * - status: фильтр по статусу обработки
   * - search: текстовый поиск
   *
   * Ошибки загрузки поглощаются.
   */
  const load = () => {
    setLoading(true);
    fetchPayments({ statementId: stmtId ? parseInt(stmtId) : undefined, status, search: debouncedSearch })
      .then(setPayments)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // Перезагрузка данных при изменении любого фильтра (с debounce для поиска)
  useEffect(() => { load(); }, [stmtId, status, debouncedSearch]);

  /**
   * Открывает модальное окно с деталями платёжной операции и формой классификации.
   *
   * Параллельно загружает детали операции, а также справочники контрагентов,
   * типов платежей и статей ДДС. В модальном окне доступны поля выбора
   * контрагента, типа, статьи и статуса с возможностью сохранения изменений.
   *
   * @param id - Идентификатор платёжной операции
   * @async
   */
  const handleShowDetail = async (id: number) => {
    try {
      // Параллельная загрузка деталей операции и справочников
      const [payment, clients, types, articles] = await Promise.all([
        fetchPayment(id), fetchClients(), fetchPaymentTypes(), fetchArticles(),
      ]);
      // Тело модального окна: детали операции и форма классификации
      const body = (
        <div>
          <div className="payment-detail-grid">
            <div className="form-group"><label>Номер документа</label><div className="field-value">{payment.doc_number || '-'}</div></div>
            <div className="form-group"><label>Дата</label><div className="field-value">{payment.doc_date || '-'}</div></div>
            <div className="form-group"><label>Сумма</label><div className="field-value">{formatMoney(payment.amount)}</div></div>
            <div className="form-group"><label>Плательщик</label><div className="field-value">{payment.payer_name || '-'}</div></div>
            <div className="form-group"><label>ИНН плательщика</label><div className="field-value">{payment.payer_inn || '-'}</div></div>
            <div className="form-group"><label>Получатель</label><div className="field-value">{payment.payee_name || '-'}</div></div>
            <div className="form-group"><label>ИНН получателя</label><div className="field-value">{payment.payee_inn || '-'}</div></div>
            <div className="form-group"><label>Назначение платежа</label><div className="field-value">{payment.purpose || '-'}</div></div>
            <div className="form-group"><label>Выписка</label><div className="field-value">{payment.statement_file || '-'}</div></div>
          </div>
          {/* Секция классификации операции */}
          <hr /><h5>Классификация операции</h5>
          <div className="form-row">
            {/* Выбор контрагента из справочника */}
            <div className="form-group"><label>Контрагент</label><select id="pdClient" defaultValue={payment.client_id ?? ''}><option value="">— выберите —</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            {/* Выбор типа платежа из справочника */}
            <div className="form-group"><label>Тип платежа</label><select id="pdType" defaultValue={payment.payment_type_id ?? ''}><option value="">— выберите —</option>{types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          </div>
          <div className="form-row">
            {/* Выбор статьи ДДС из справочника */}
            <div className="form-group"><label>Статья ДДС</label><select id="pdArticle" defaultValue={payment.article_id ?? ''}><option value="">— выберите —</option>{articles.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
            {/* Изменение статуса обработки */}
            <div className="form-group"><label>Статус</label><select id="pdStatus" defaultValue={payment.status}><option value="processed">Обработано</option><option value="manual">Требует ручной проверки</option><option value="error">Ошибка</option></select></div>
          </div>
        </div>
      );
      // Подвал модального окна: кнопки сохранения и закрытия
      const footer = (
        <>
          <button className="btn btn-primary" onClick={async () => {
            // Считываем выбранные значения из DOM-элементов модального окна
            const clientId = (document.getElementById('pdClient') as HTMLSelectElement)?.value;
            const paymentTypeId = (document.getElementById('pdType') as HTMLSelectElement)?.value;
            const articleId = (document.getElementById('pdArticle') as HTMLSelectElement)?.value;
            const newStatus = (document.getElementById('pdStatus') as HTMLSelectElement)?.value;
            try {
              // Сохранение классификации через API
              await updatePayment(id, { clientId: clientId ? parseInt(clientId) : null, paymentTypeId: parseInt(paymentTypeId) || 1, articleId: articleId ? parseInt(articleId) : null, status: newStatus });
              hideModal(); showToast('Сохранено', 'success'); load();
            } catch (err) { showAlert('Ошибка: ' + (err as Error).message); }
          }}>Сохранить</button>
          <button className="btn btn-outline" onClick={hideModal}>Закрыть</button>
        </>
      );
      // Отображаем модальное окно
      showModal('Детали операции №' + id, body, footer);
    } catch (err) { showAlert('Ошибка: ' + (err as Error).message); }
  };

  const togglePayment = (id: number) => {
    setSelectedPayments((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const handleSendToBank = async () => {
    if (selectedPayments.size === 0) { showAlert('Выберите платежи для отправки в банк'); return; }
    if (!(await showConfirm(`Сформировать файл платёжных поручений (${selectedPayments.size} шт.) для отправки в банк?`))) return;
    try {
      await sendPaymentsToBank(Array.from(selectedPayments));
      showToast('Файл платёжных поручений сформирован', 'success');
      setSelectedPayments(new Set());
      load();
    } catch (err) { showAlert((err as Error).message); }
  };

  return (
    <div className="content-page active">
      {/* Панель фильтров: текстовый поиск, фильтр по статусу, индикатор выписки */}
      <div className="toolbar">
        {/* Поле текстового поиска по контрагенту, ИНН или назначению */}
        <input type="text" placeholder="Поиск по контрагенту, ИНН, назначению..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {/* Выпадающий список фильтрации по статусу обработки */}
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Все статусы</option><option value="processed">Обработано</option><option value="manual">Требует ручной проверки</option><option value="error">Ошибка</option>
        </select>
        {/* Бейдж с ID выписки — отображается при фильтрации по конкретной выписке */}
        {stmtId && <span className="badge badge-info">Выписка #{stmtId}</span>}
        <button className="btn btn-primary" onClick={() => navigate('/payments/new')}>+ Создать платёж</button>
        <button className="btn btn-outline" onClick={handleSendToBank} disabled={selectedPayments.size === 0}>
          Отправить в банк ({selectedPayments.size})
        </button>
      </div>
      <div className="page-scroll">
        <div className="panel">
          <h4>Платёжные операции</h4>
          {/* Спиннер загрузки или таблица с данными */}
          {loading ? <LoadingSpinner /> : (
            <table className="table">
              <thead><tr><th></th><th>ID</th><th>Дата</th><th>Номер</th><th>Контрагент</th><th>Сумма</th><th>Назначение</th><th>Статус</th><th></th></tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td><input type="checkbox" checked={selectedPayments.has(p.id)} onChange={() => togglePayment(p.id)} /></td>
                    <td>{p.id}</td><td>{formatDate(p.doc_date)}</td><td>{p.doc_number}</td><td>{p.client_name || p.payer_name || p.payee_name}</td><td>{formatMoney(p.amount)}</td><td>{(p.purpose || '').substring(0, 50)}</td><td><StatusBadge status={p.status} /></td><td><button className="btn btn-sm btn-outline" onClick={() => handleShowDetail(p.id)}>Детали</button></td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
