import { useState, useEffect, useCallback } from 'react';
import {
  fetchClients, createClient, updateClient, deleteClient,
  fetchBanks, createBank, updateBank, deleteBank,
  fetchPaymentTypes, createPaymentType, updatePaymentType, deletePaymentType,
  fetchArticles, createArticle, updateArticle, deleteArticle,
} from '@/api/endpoints';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Tabs } from '@/components/ui/Tabs';
import { showModal, hideModal, showAlert, showToast, showConfirm } from '@/contexts/UIContext';
import type { Client, Bank, PaymentType, Article } from '@/types';

type TabKey = 'clients' | 'banks' | 'paymentTypes' | 'articles';

function ClientForm({ init }: { init?: Client }) {
  return (
    <form onSubmit={e => e.preventDefault()}>
      <div className="form-group"><label>Название</label><input name="name" defaultValue={init?.name || ''} /></div>
      <div className="form-row"><div className="form-group"><label>ИНН</label><input name="inn" defaultValue={init?.inn || ''} /></div><div className="form-group"><label>КПП</label><input name="kpp" defaultValue={init?.kpp || ''} /></div></div>
      <div className="form-row"><div className="form-group"><label>Расчётный счёт</label><input name="account" defaultValue={init?.account || ''} /></div><div className="form-group"><label>БИК</label><input name="bik" defaultValue={init?.bik || ''} /></div></div>
    </form>
  );
}
function BankForm({ init }: { init?: Bank }) {
  return (
    <form onSubmit={e => e.preventDefault()}>
      <div className="form-group"><label>Название</label><input name="name" defaultValue={init?.name || ''} /></div>
      <div className="form-row"><div className="form-group"><label>БИК</label><input name="bik" defaultValue={init?.bik || ''} /></div><div className="form-group"><label>Корр. счёт</label><input name="corrAccount" defaultValue={init?.corr_account || ''} /></div></div>
    </form>
  );
}
function PTForm({ init }: { init?: PaymentType }) {
  return (
    <form onSubmit={e => e.preventDefault()}>
      <div className="form-group"><label>Код</label><input name="code" defaultValue={init?.code || ''} /></div>
      <div className="form-group"><label>Название</label><input name="name" defaultValue={init?.name || ''} /></div>
    </form>
  );
}
function ArticleForm({ init }: { init?: Article }) {
  return (
    <form onSubmit={e => e.preventDefault()}>
      <div className="form-group"><label>Код</label><input name="code" defaultValue={init?.code || ''} /></div>
      <div className="form-group"><label>Название</label><input name="name" defaultValue={init?.name || ''} /></div>
      <div className="form-group"><label>Тип</label><select name="type" defaultValue={init?.type || 'income'}><option value="income">Доход</option><option value="expense">Расход</option></select></div>
    </form>
  );
}

function readForm(form: HTMLFormElement): Record<string, string> {
  const fd = new FormData(form);
  const data: Record<string, string> = {};
  fd.forEach((v, k) => { data[k] = v as string; });
  return data;
}

export function DirectoriesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('clients');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [clients, setClients] = useState<Client[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [ptypes, setPTypes] = useState<PaymentType[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadClients = useCallback(async () => { setLoading(true); try { setClients(await fetchClients(debouncedSearch)); } catch {} setLoading(false); }, [debouncedSearch]);
  const loadBanks = useCallback(async () => { setLoading(true); try { setBanks(await fetchBanks()); } catch {} setLoading(false); }, []);
  const loadPT = useCallback(async () => { setLoading(true); try { setPTypes(await fetchPaymentTypes()); } catch {} setLoading(false); }, []);
  const loadArticles = useCallback(async () => { setLoading(true); try { setArticles(await fetchArticles()); } catch {} setLoading(false); }, []);

  useEffect(() => { if (activeTab === 'clients') loadClients(); }, [loadClients, activeTab]);
  useEffect(() => { if (activeTab === 'banks') loadBanks(); }, [loadBanks, activeTab]);
  useEffect(() => { if (activeTab === 'paymentTypes') loadPT(); }, [loadPT, activeTab]);
  useEffect(() => { if (activeTab === 'articles') loadArticles(); }, [loadArticles, activeTab]);

  const handleAddClient = () => {
    showModal('Добавить контрагента', <ClientForm />,
      <><button className="btn btn-primary" onClick={async () => {
        const form = document.querySelector('.modal-body form') as HTMLFormElement; if (!form) return;
        const data = readForm(form); if (!data.name || !data.inn) { showAlert('Название и ИНН обязательны'); return; }
        try { await createClient(data as Parameters<typeof createClient>[0]); hideModal(); showToast('Сохранено', 'success'); loadClients(); } catch (err) { showAlert((err as Error).message); }
      }}>Сохранить</button><button className="btn btn-outline" onClick={hideModal}>Отмена</button></>);
  };

  const handleEditClient = (c: Client) => {
    showModal('Редактировать', <ClientForm init={c} />,
      <><button className="btn btn-primary" onClick={async () => {
        const form = document.querySelector('.modal-body form') as HTMLFormElement; if (!form) return;
        const data = readForm(form); if (!data.name || !data.inn) { showAlert('Название и ИНН обязательны'); return; }
        try { await updateClient(c.id, data as Parameters<typeof createClient>[0]); hideModal(); showToast('Сохранено', 'success'); loadClients(); } catch (err) { showAlert((err as Error).message); }
      }}>Сохранить</button><button className="btn btn-outline" onClick={hideModal}>Отмена</button></>);
  };

  const handleAddBank = () => {
    showModal('Добавить банк', <BankForm />,
      <><button className="btn btn-primary" onClick={async () => {
        const form = document.querySelector('.modal-body form') as HTMLFormElement; if (!form) return;
        const data = readForm(form); if (!data.name || !data.bik) { showAlert('Название и БИК обязательны'); return; }
        try { await createBank(data as Parameters<typeof createBank>[0]); hideModal(); showToast('Сохранено', 'success'); loadBanks(); } catch (err) { showAlert((err as Error).message); }
      }}>Сохранить</button><button className="btn btn-outline" onClick={hideModal}>Отмена</button></>);
  };

  const handleEditBank = (b: Bank) => {
    showModal('Редактировать', <BankForm init={b} />,
      <><button className="btn btn-primary" onClick={async () => {
        const form = document.querySelector('.modal-body form') as HTMLFormElement; if (!form) return;
        const data = readForm(form); if (!data.name || !data.bik) { showAlert('Название и БИК обязательны'); return; }
        try { await updateBank(b.id, data as Parameters<typeof createBank>[0]); hideModal(); showToast('Сохранено', 'success'); loadBanks(); } catch (err) { showAlert((err as Error).message); }
      }}>Сохранить</button><button className="btn btn-outline" onClick={hideModal}>Отмена</button></>);
  };

  const handleAddPt = () => {
    showModal('Добавить тип', <PTForm />,
      <><button className="btn btn-primary" onClick={async () => {
        const form = document.querySelector('.modal-body form') as HTMLFormElement; if (!form) return;
        const data = readForm(form); if (!data.code || !data.name) { showAlert('Заполните все поля'); return; }
        try { await createPaymentType(data as Parameters<typeof createPaymentType>[0]); hideModal(); showToast('Сохранено', 'success'); loadPT(); } catch (err) { showAlert((err as Error).message); }
      }}>Сохранить</button><button className="btn btn-outline" onClick={hideModal}>Отмена</button></>);
  };

  const handleEditPt = (p: PaymentType) => {
    showModal('Редактировать', <PTForm init={p} />,
      <><button className="btn btn-primary" onClick={async () => {
        const form = document.querySelector('.modal-body form') as HTMLFormElement; if (!form) return;
        const data = readForm(form); if (!data.code || !data.name) { showAlert('Заполните все поля'); return; }
        try { await updatePaymentType(p.id, data as Parameters<typeof createPaymentType>[0]); hideModal(); showToast('Сохранено', 'success'); loadPT(); } catch (err) { showAlert((err as Error).message); }
      }}>Сохранить</button><button className="btn btn-outline" onClick={hideModal}>Отмена</button></>);
  };

  const handleAddArticle = () => {
    showModal('Добавить статью', <ArticleForm />,
      <><button className="btn btn-primary" onClick={async () => {
        const form = document.querySelector('.modal-body form') as HTMLFormElement; if (!form) return;
        const data = readForm(form); if (!data.code || !data.name) { showAlert('Заполните все поля'); return; }
        try { await createArticle(data as unknown as Parameters<typeof createArticle>[0]); hideModal(); showToast('Сохранено', 'success'); loadArticles(); } catch (err) { showAlert((err as Error).message); }
      }}>Сохранить</button><button className="btn btn-outline" onClick={hideModal}>Отмена</button></>);
  };

  const handleEditArticle = (a: Article) => {
    showModal('Редактировать', <ArticleForm init={a} />,
      <><button className="btn btn-primary" onClick={async () => {
        const form = document.querySelector('.modal-body form') as HTMLFormElement; if (!form) return;
        const data = readForm(form); if (!data.code || !data.name) { showAlert('Заполните все поля'); return; }
        try { await updateArticle(a.id, data as unknown as Parameters<typeof createArticle>[0]); hideModal(); showToast('Сохранено', 'success'); loadArticles(); } catch (err) { showAlert((err as Error).message); }
      }}>Сохранить</button><button className="btn btn-outline" onClick={hideModal}>Отмена</button></>);
  };

  const handleDelete = async (type: string, id: number) => {
    if (!(await showConfirm('Удалить запись?'))) return;
    try {
      if (type === 'client') await deleteClient(id);
      else if (type === 'bank') await deleteBank(id);
      else if (type === 'pt') await deletePaymentType(id);
      else await deleteArticle(id);
      showToast('Удалено', 'success');
      if (activeTab === 'clients') loadClients();
      else if (activeTab === 'banks') loadBanks();
      else if (activeTab === 'paymentTypes') loadPT();
      else loadArticles();
    } catch (err) { showAlert((err as Error).message); }
  };

  return (
    <div className="content-page active">
      <Tabs items={[{ key: 'clients', label: 'Контрагенты' }, { key: 'banks', label: 'Банки' }, { key: 'paymentTypes', label: 'Типы платежей' }, { key: 'articles', label: 'Статьи ДДС' }]} activeTab={activeTab} onTabChange={k => setActiveTab(k as TabKey)} />
      {activeTab === 'clients' && (
        <div className="dir-panel active">
          <div className="toolbar"><button className="btn btn-primary" onClick={handleAddClient}>Добавить контрагента</button><input type="text" placeholder="Поиск по названию, ИНН..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div className="table-wrapper">
            {loading ? <LoadingSpinner /> : <table className="table"><thead><tr><th>ID</th><th>Название</th><th>ИНН</th><th>КПП</th><th>Расчётный счёт</th><th>Банк</th><th></th></tr></thead><tbody>{clients.map(c => <tr key={c.id}><td>{c.id}</td><td>{c.name}</td><td>{c.inn}</td><td>{c.kpp || '-'}</td><td>{c.account || '-'}</td><td>{c.bik || '-'}</td><td><button className="btn btn-sm btn-outline" style={{ marginRight: 6 }} onClick={() => handleEditClient(c)}>Ред.</button><button className="btn btn-sm btn-danger" onClick={() => handleDelete('client', c.id)}>Уд.</button></td></tr>)}</tbody></table>}
          </div>
        </div>
      )}
      {activeTab === 'banks' && (
        <div className="dir-panel active">
          <div className="toolbar"><button className="btn btn-primary" onClick={handleAddBank}>Добавить банк</button></div>
          <div className="table-wrapper">
            {loading ? <LoadingSpinner /> : <table className="table"><thead><tr><th>ID</th><th>Название</th><th>БИК</th><th>Корр. счёт</th><th></th></tr></thead><tbody>{banks.map(b => <tr key={b.id}><td>{b.id}</td><td>{b.name}</td><td>{b.bik}</td><td>{b.corr_account}</td><td><button className="btn btn-sm btn-outline" style={{ marginRight: 6 }} onClick={() => handleEditBank(b)}>Ред.</button><button className="btn btn-sm btn-danger" onClick={() => handleDelete('bank', b.id)}>Уд.</button></td></tr>)}</tbody></table>}
          </div>
        </div>
      )}
      {activeTab === 'paymentTypes' && (
        <div className="dir-panel active">
          <div className="toolbar"><button className="btn btn-primary" onClick={handleAddPt}>Добавить тип платежа</button></div>
          <div className="table-wrapper">
            {loading ? <LoadingSpinner /> : <table className="table"><thead><tr><th>ID</th><th>Код</th><th>Название</th><th></th></tr></thead><tbody>{ptypes.map(p => <tr key={p.id}><td>{p.id}</td><td>{p.code}</td><td>{p.name}</td><td><button className="btn btn-sm btn-outline" style={{ marginRight: 6 }} onClick={() => handleEditPt(p)}>Ред.</button><button className="btn btn-sm btn-danger" onClick={() => handleDelete('pt', p.id)}>Уд.</button></td></tr>)}</tbody></table>}
          </div>
        </div>
      )}
      {activeTab === 'articles' && (
        <div className="dir-panel active">
          <div className="toolbar"><button className="btn btn-primary" onClick={handleAddArticle}>Добавить статью ДДС</button></div>
          <div className="table-wrapper">
            {loading ? <LoadingSpinner /> : <table className="table"><thead><tr><th>ID</th><th>Код</th><th>Название</th><th>Тип</th><th></th></tr></thead><tbody>{articles.map(a => <tr key={a.id}><td>{a.id}</td><td>{a.code}</td><td>{a.name}</td><td>{a.type === 'income' ? <span className="badge badge-success">Доход</span> : <span className="badge badge-warning">Расход</span>}</td><td><button className="btn btn-sm btn-outline" style={{ marginRight: 6 }} onClick={() => handleEditArticle(a)}>Ред.</button><button className="btn btn-sm btn-danger" onClick={() => handleDelete('article', a.id)}>Уд.</button></td></tr>)}</tbody></table>}
          </div>
        </div>
      )}
    </div>
  );
}
