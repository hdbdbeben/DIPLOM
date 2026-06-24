import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPayment, fetchClients, fetchPaymentTypes, fetchArticles, fetchOneCContracts } from '@/api/endpoints';
import { showToast, showAlert } from '@/contexts/UIContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Client, PaymentType, Article, OneCContract } from '@/types';

export function PaymentCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [types, setTypes] = useState<PaymentType[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [contracts, setContracts] = useState<OneCContract[]>([]);

  const emptyForm = {
    docNumber: '',
    docDate: new Date().toISOString().substring(0, 10),
    amount: '',
    payerName: '',
    payerInn: '',
    payerAccount: '',
    payerSelect: '',
    payeeName: 'ООО "Социальные услуги"',
    payeeInn: '7713699602',
    payeeAccount: '40702810800220100505',
    payeeSelect: '',
    purpose: '',
    paymentTypeId: '',
    articleId: '',
    clientId: '',
    contractId: '',
    status: 'processed',
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    Promise.all([fetchClients(), fetchPaymentTypes(), fetchArticles(), fetchOneCContracts()])
      .then(([c, t, a, ct]) => { setClients(c); setTypes(t); setArticles(a); setContracts(ct); })
      .catch(() => showAlert('Ошибка загрузки справочников'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleContractSelect = (contractId: string) => {
    if (!contractId) {
      setForm({ ...form, contractId: '' });
      return;
    }
    const contract = contracts.find((c) => c.id === parseInt(contractId));
    if (!contract) return;
    const client = clients.find((c) => c.inn === contract.clientInn);
    setForm({
      ...form,
      contractId,
      clientId: client ? String(client.id) : '',
    });
  };

  const handleClientSelect = (role: 'payer' | 'payee', clientId: string) => {
    if (clientId === 'manual') {
      setForm({
        ...form,
        [role === 'payer' ? 'payerSelect' : 'payeeSelect']: 'manual',
        [role === 'payer' ? 'payerName' : 'payeeName']: '',
        [role === 'payer' ? 'payerInn' : 'payeeInn']: '',
        [role === 'payer' ? 'payerAccount' : 'payeeAccount']: '',
      });
      return;
    }
    const client = clients.find((c) => c.id === parseInt(clientId));
    if (!client) return;

    const isOurOrg = client.inn === '7713699602';
    // Если выбрана не наша организация — подставляем её как контрагента
    const newClientId = isOurOrg ? '' : clientId;
    // Для контрагента также подбираем подходящий договор из 1С
    const matchedContract = !isOurOrg
      ? contracts.find((c) => c.clientInn === client.inn)
      : null;

    setForm({
      ...form,
      [role === 'payer' ? 'payerSelect' : 'payeeSelect']: clientId,
      [role === 'payer' ? 'payerName' : 'payeeName']: client.name,
      [role === 'payer' ? 'payerInn' : 'payeeInn']: client.inn,
      [role === 'payer' ? 'payerAccount' : 'payeeAccount']: client.account,
      clientId: newClientId,
      contractId: matchedContract ? String(matchedContract.id) : form.contractId,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.docNumber || !form.docDate || !form.amount || !form.payerName || !form.payeeName || !form.paymentTypeId) {
      showAlert('Заполните обязательные поля: номер, дата, сумма, плательщик, получатель, тип платежа');
      return;
    }
    setSaving(true);
    const selectedContract = contracts.find((c) => c.id === parseInt(form.contractId));
    try {
      await createPayment({
        docNumber: form.docNumber,
        docDate: form.docDate,
        amount: parseFloat(form.amount),
        payerName: form.payerName,
        payerInn: form.payerInn,
        payerAccount: form.payerAccount,
        payeeName: form.payeeName,
        payeeInn: form.payeeInn,
        payeeAccount: form.payeeAccount,
        purpose: form.purpose,
        paymentTypeId: parseInt(form.paymentTypeId),
        articleId: form.articleId ? parseInt(form.articleId) : null,
        clientId: form.clientId ? parseInt(form.clientId) : null,
        contractId: form.contractId ? parseInt(form.contractId) : null,
        contractNumber: selectedContract ? selectedContract.number : '',
        status: form.status,
      });
      showToast('Платёж создан', 'success');
      navigate('/payments');
    } catch (err) {
      showAlert('Ошибка: ' + (err as Error).message);
      setSaving(false);
    }
  };

  const selectedType = types.find((t) => t.id === parseInt(form.paymentTypeId));
  const filteredArticles = selectedType
    ? articles.filter((a) => {
        if (selectedType.code === 'IN') return a.type === 'income';
        if (selectedType.code === 'OUT') return a.type === 'expense';
        return true;
      })
    : articles;

  if (loading) return <div className="content-page active"><LoadingSpinner /></div>;

  return (
    <div className="content-page active">
      <div className="page-scroll">
        <div className="panel">
          <h4>Создание платежа</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Номер документа *</label>
                <input name="docNumber" value={form.docNumber} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Дата *</label>
                <input name="docDate" type="date" value={form.docDate} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Сумма *</label>
                <input name="amount" type="number" step="0.01" min="0" value={form.amount} onChange={handleChange} required />
              </div>
            </div>

            <h5>Плательщик</h5>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Выбрать из справочника</label>
              <select value={form.payerSelect} onChange={(e) => handleClientSelect('payer', e.target.value)}>
                <option value="">— выберите контрагента —</option>
                <option value="manual">▸ Ввести вручную</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name} (ИНН {c.inn})</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Наименование *</label>
                <input name="payerName" value={form.payerName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>ИНН</label>
                <input name="payerInn" value={form.payerInn} onChange={handleChange} placeholder="10 или 12 цифр" />
              </div>
              <div className="form-group">
                <label>Расчётный счёт</label>
                <input name="payerAccount" value={form.payerAccount} onChange={handleChange} placeholder="20 цифр" />
              </div>
            </div>

            <h5>Получатель</h5>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>Выбрать из справочника</label>
              <select value={form.payeeSelect} onChange={(e) => handleClientSelect('payee', e.target.value)}>
                <option value="">— выберите контрагента —</option>
                <option value="manual">▸ Ввести вручную</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name} (ИНН {c.inn})</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Наименование *</label>
                <input name="payeeName" value={form.payeeName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>ИНН</label>
                <input name="payeeInn" value={form.payeeInn} onChange={handleChange} placeholder="10 или 12 цифр" />
              </div>
              <div className="form-group">
                <label>Расчётный счёт</label>
                <input name="payeeAccount" value={form.payeeAccount} onChange={handleChange} placeholder="20 цифр" />
              </div>
            </div>

            <div className="form-group">
              <label>Назначение платежа</label>
              <textarea name="purpose" value={form.purpose} onChange={handleChange} rows={2} placeholder="Например: Оплата по счёту № 1595/92 от 01.04.2026..." />
            </div>

            <h5>Классификация</h5>
            <div className="form-row">
              <div className="form-group">
                <label>Тип платежа *</label>
                <select name="paymentTypeId" value={form.paymentTypeId} onChange={handleChange} required>
                  <option value="">— выберите —</option>
                  {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Договор (из 1С)</label>
                <select name="contractId" value={form.contractId} onChange={(e) => handleContractSelect(e.target.value)}>
                  <option value="">— не выбран —</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      №{c.number} от {c.date} — {c.clientName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Контрагент</label>
                <select name="clientId" value={form.clientId} onChange={handleChange}>
                  <option value="">— выберите —</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Статья ДДС</label>
                <select name="articleId" value={form.articleId} onChange={handleChange}>
                  <option value="">— выберите —</option>
                  {filteredArticles.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Статус</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="processed">Обработано</option>
                  <option value="manual">Требует ручной проверки</option>
                  <option value="error">Ошибка</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Сохранение...' : 'Создать платёж'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/payments')}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
