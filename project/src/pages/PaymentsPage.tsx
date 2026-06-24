import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchPayments, fetchPayment, updatePayment, fetchClients, fetchPaymentTypes, fetchArticles } from '@/api/endpoints';
import { formatDate, formatMoney } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showModal, hideModal, showAlert, showToast } from '@/contexts/UIContext';
import type { Payment, Client, PaymentType, Article } from '@/types';

export function PaymentsPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [stmtId] = useState(searchParams.get('statementId') || '');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchPayments({ statementId: stmtId ? parseInt(stmtId) : undefined, status, search })
      .then(setPayments)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [stmtId, status, search]);

  const handleShowDetail = async (id: number) => {
    try {
      const [payment, clients, types, articles] = await Promise.all([
        fetchPayment(id), fetchClients(), fetchPaymentTypes(), fetchArticles(),
      ]);
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
          <hr /><h5>Классификация операции</h5>
          <div className="form-row">
            <div className="form-group"><label>Контрагент</label><select id="pdClient" defaultValue={payment.client_id ?? ''}><option value="">— выберите —</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div className="form-group"><label>Тип платежа</label><select id="pdType" defaultValue={payment.payment_type_id ?? ''}><option value="">— выберите —</option>{types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Статья ДДС</label><select id="pdArticle" defaultValue={payment.article_id ?? ''}><option value="">— выберите —</option>{articles.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
            <div className="form-group"><label>Статус</label><select id="pdStatus" defaultValue={payment.status}><option value="processed">Обработано</option><option value="manual">Требует ручной проверки</option><option value="error">Ошибка</option></select></div>
          </div>
        </div>
      );
      const footer = (
        <>
          <button className="btn btn-primary" onClick={async () => {
            const clientId = (document.getElementById('pdClient') as HTMLSelectElement)?.value;
            const paymentTypeId = (document.getElementById('pdType') as HTMLSelectElement)?.value;
            const articleId = (document.getElementById('pdArticle') as HTMLSelectElement)?.value;
            const newStatus = (document.getElementById('pdStatus') as HTMLSelectElement)?.value;
            try {
              await updatePayment(id, { clientId: clientId ? parseInt(clientId) : null, paymentTypeId: parseInt(paymentTypeId) || 1, articleId: articleId ? parseInt(articleId) : null, status: newStatus });
              hideModal(); showToast('Сохранено', 'success'); load();
            } catch (err) { showAlert('Ошибка: ' + (err as Error).message); }
          }}>Сохранить</button>
          <button className="btn btn-outline" onClick={hideModal}>Закрыть</button>
        </>
      );
      showModal('Детали операции №' + id, body, footer);
    } catch (err) { showAlert('Ошибка: ' + (err as Error).message); }
  };

  return (
    <div className="content-page active">
      <div className="toolbar">
        <input type="text" placeholder="Поиск по контрагенту, ИНН, назначению..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Все статусы</option><option value="processed">Обработано</option><option value="manual">Требует ручной проверки</option><option value="error">Ошибка</option>
        </select>
        {stmtId && <span className="badge badge-info">Выписка #{stmtId}</span>}
      </div>
      <div className="page-scroll">
        <div className="panel">
          <h4>Платёжные операции</h4>
          {loading ? <LoadingSpinner /> : (
            <table className="table">
              <thead><tr><th>ID</th><th>Дата</th><th>Номер</th><th>Контрагент</th><th>Сумма</th><th>Назначение</th><th>Статус</th><th></th></tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}><td>{p.id}</td><td>{formatDate(p.doc_date)}</td><td>{p.doc_number}</td><td>{p.client_name || p.payer_name || p.payee_name}</td><td>{formatMoney(p.amount)}</td><td>{(p.purpose || '').substring(0, 50)}</td><td><StatusBadge status={p.status} /></td><td><button className="btn btn-sm btn-outline" onClick={() => handleShowDetail(p.id)}>Детали</button></td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
