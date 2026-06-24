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

/** Ключи вкладок справочников */
type TabKey = 'clients' | 'banks' | 'paymentTypes' | 'articles';

/**
 * Форма создания/редактирования контрагента.
 *
 * Содержит поля: название, ИНН, КПП, расчётный счёт, БИК.
 * Используется как тело модального окна при добавлении и редактировании.
 *
 * @param init - Начальные данные для режима редактирования (undefined — создание)
 */
function ClientForm({ init }: { init?: Client }) {
  return (
    <form onSubmit={e => e.preventDefault()}>
      <div className="form-group"><label>Название</label><input name="name" defaultValue={init?.name || ''} /></div>
      <div className="form-row"><div className="form-group"><label>ИНН</label><input name="inn" defaultValue={init?.inn || ''} /></div><div className="form-group"><label>КПП</label><input name="kpp" defaultValue={init?.kpp || ''} /></div></div>
      <div className="form-row"><div className="form-group"><label>Расчётный счёт</label><input name="account" defaultValue={init?.account || ''} /></div><div className="form-group"><label>БИК</label><input name="bik" defaultValue={init?.bik || ''} /></div></div>
    </form>
  );
}

/**
 * Форма создания/редактирования банка.
 *
 * Содержит поля: название, БИК, корреспондентский счёт.
 *
 * @param init - Начальные данные для режима редактирования (undefined — создание)
 */
function BankForm({ init }: { init?: Bank }) {
  return (
    <form onSubmit={e => e.preventDefault()}>
      <div className="form-group"><label>Название</label><input name="name" defaultValue={init?.name || ''} /></div>
      <div className="form-row"><div className="form-group"><label>БИК</label><input name="bik" defaultValue={init?.bik || ''} /></div><div className="form-group"><label>Корр. счёт</label><input name="corrAccount" defaultValue={init?.corr_account || ''} /></div></div>
    </form>
  );
}

/**
 * Форма создания/редактирования типа платежа.
 *
 * Содержит поля: код, название.
 *
 * @param init - Начальные данные для режима редактирования (undefined — создание)
 */
function PTForm({ init }: { init?: PaymentType }) {
  return (
    <form onSubmit={e => e.preventDefault()}>
      <div className="form-group"><label>Код</label><input name="code" defaultValue={init?.code || ''} /></div>
      <div className="form-group"><label>Название</label><input name="name" defaultValue={init?.name || ''} /></div>
    </form>
  );
}

/**
 * Форма создания/редактирования статьи ДДС.
 *
 * Содержит поля: код, название, тип (доход/расход).
 *
 * @param init - Начальные данные для режима редактирования (undefined — создание)
 */
function ArticleForm({ init }: { init?: Article }) {
  return (
    <form onSubmit={e => e.preventDefault()}>
      <div className="form-group"><label>Код</label><input name="code" defaultValue={init?.code || ''} /></div>
      <div className="form-group"><label>Название</label><input name="name" defaultValue={init?.name || ''} /></div>
      <div className="form-group"><label>Тип</label><select name="type" defaultValue={init?.type || 'income'}><option value="income">Доход</option><option value="expense">Расход</option></select></div>
    </form>
  );
}

/**
 * Извлекает значения всех полей формы в виде объекта Record<string, string>.
 *
 * Используется для считывания данных из форм модальных окон
 * перед отправкой на сервер.
 *
 * @param form - HTML-элемент формы
 * @returns Объект с парами имя_поля -> значение
 */
function readForm(form: HTMLFormElement): Record<string, string> {
  const fd = new FormData(form);
  const data: Record<string, string> = {};
  fd.forEach((v, k) => { data[k] = v as string; });
  return data;
}

/**
 * Страница управления справочниками системы.
 *
 * Реализует CRUD-операции для четырёх справочников, организованных
 * через вкладки (Tabs):
 * - Контрагенты (clients): название, ИНН, КПП, расчётный счёт, БИК
 * - Банки (banks): название, БИК, корреспондентский счёт
 * - Типы платежей (paymentTypes): код, название
 * - Статьи ДДС (articles): код, название, тип (доход/расход)
 *
 * Для каждого справочника доступны: создание, редактирование, удаление.
 * Создание и редактирование выполняются через модальные окна с формами.
 * Удаление требует подтверждения через диалог.
 * Для контрагентов поддерживается текстовый поиск с дебаунсом 400 мс.
 *
 * @component
 * @returns JSX-элемент страницы справочников
 */
export function DirectoriesPage() {
  // Ключ активной вкладки
  const [activeTab, setActiveTab] = useState<TabKey>('clients');
  // Строка поиска (только для контрагентов)
  const [search, setSearch] = useState('');
  // Значение поиска с задержкой (debounce) — используется в API-запросе
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Данные справочников
  const [clients, setClients] = useState<Client[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [ptypes, setPTypes] = useState<PaymentType[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  // Флаг загрузки данных
  const [loading, setLoading] = useState(false);

  /**
   * Эффект debounce для строки поиска контрагентов.
   *
   * Задержка 400 мс перед обновлением debouncedSearch предотвращает
   * избыточные API-запросы при быстром вводе текста.
   */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    // Очистка таймера при повторном изменении search
    return () => clearTimeout(t);
  }, [search]);

  /**
   * Загружает список контрагентов с сервера.
   *
   * Использует debouncedSearch для фильтрации по названию/ИНН.
   * Мемоизирован через useCallback.
   */
  const loadClients = useCallback(async () => { setLoading(true); try { setClients(await fetchClients(debouncedSearch)); } catch {} setLoading(false); }, [debouncedSearch]);

  /**
   * Загружает список банков с сервера.
   * Мемоизирован через useCallback.
   */
  const loadBanks = useCallback(async () => { setLoading(true); try { setBanks(await fetchBanks()); } catch {} setLoading(false); }, []);

  /**
   * Загружает список типов платежей с сервера.
   * Мемоизирован через useCallback.
   */
  const loadPT = useCallback(async () => { setLoading(true); try { setPTypes(await fetchPaymentTypes()); } catch {} setLoading(false); }, []);

  /**
   * Загружает список статей ДДС с сервера.
   * Мемоизирован через useCallback.
   */
  const loadArticles = useCallback(async () => { setLoading(true); try { setArticles(await fetchArticles()); } catch {} setLoading(false); }, []);

  /**
   * Эффекты загрузки данных при смене активной вкладки.
   * Каждый эффект срабатывает только для своей вкладки, что позволяет
   * загружать данные лениво — только при переходе на соответствующую вкладку.
   */
  useEffect(() => { if (activeTab === 'clients') loadClients(); }, [loadClients, activeTab]);
  useEffect(() => { if (activeTab === 'banks') loadBanks(); }, [loadBanks, activeTab]);
  useEffect(() => { if (activeTab === 'paymentTypes') loadPT(); }, [loadPT, activeTab]);
  useEffect(() => { if (activeTab === 'articles') loadArticles(); }, [loadArticles, activeTab]);

  /**
   * Открывает модальное окно для добавления нового контрагента.
   *
   * Форма содержит обязательные поля: название, ИНН.
   * При сохранении данные считываются из DOM-формы через readForm.
   */
  const handleAddClient = () => {
    showModal('Добавить контрагента', <ClientForm />,
      <><button className="btn btn-primary" onClick={async () => {
        const form = document.querySelector('.modal-body form') as HTMLFormElement; if (!form) return;
        const data = readForm(form); if (!data.name || !data.inn) { showAlert('Название и ИНН обязательны'); return; }
        try { await createClient(data as Parameters<typeof createClient>[0]); hideModal(); showToast('Сохранено', 'success'); loadClients(); } catch (err) { showAlert((err as Error).message); }
      }}>Сохранить</button><button className="btn btn-outline" onClick={hideModal}>Отмена</button></>);
  };

  /**
   * Открывает модальное окно для редактирования существующего контрагента.
   *
   * Форма предзаполняется текущими данными контрагента.
   *
   * @param c - Объект контрагента для редактирования
   */
  const handleEditClient = (c: Client) => {
    showModal('Редактировать', <ClientForm init={c} />,
      <><button className="btn btn-primary" onClick={async () => {
        const form = document.querySelector('.modal-body form') as HTMLFormElement; if (!form) return;
        const data = readForm(form); if (!data.name || !data.inn) { showAlert('Название и ИНН обязательны'); return; }
        try { await updateClient(c.id, data as Parameters<typeof createClient>[0]); hideModal(); showToast('Сохранено', 'success'); loadClients(); } catch (err) { showAlert((err as Error).message); }
      }}>Сохранить</button><button className="btn btn-outline" onClick={hideModal}>Отмена</button></>);
  };

  /**
   * Открывает модальное окно для добавления нового банка.
   *
   * Обязательные поля: название, БИК.
   */
  const handleAddBank = () => {
    showModal('Добавить банк', <BankForm />,
      <><button className="btn btn-primary" onClick={async () => {
        const form = document.querySelector('.modal-body form') as HTMLFormElement; if (!form) return;
        const data = readForm(form); if (!data.name || !data.bik) { showAlert('Название и БИК обязательны'); return; }
        try { await createBank(data as Parameters<typeof createBank>[0]); hideModal(); showToast('Сохранено', 'success'); loadBanks(); } catch (err) { showAlert((err as Error).message); }
      }}>Сохранить</button><button className="btn btn-outline" onClick={hideModal}>Отмена</button></>);
  };

  /**
   * Открывает модальное окно для редактирования существующего банка.
   *
   * @param b - Объект банка для редактирования
   */
  const handleEditBank = (b: Bank) => {
    showModal('Редактировать', <BankForm init={b} />,
      <><button className="btn btn-primary" onClick={async () => {
        const form = document.querySelector('.modal-body form') as HTMLFormElement; if (!form) return;
        const data = readForm(form); if (!data.name || !data.bik) { showAlert('Название и БИК обязательны'); return; }
        try { await updateBank(b.id, data as Parameters<typeof createBank>[0]); hideModal(); showToast('Сохранено', 'success'); loadBanks(); } catch (err) { showAlert((err as Error).message); }
      }}>Сохранить</button><button className="btn btn-outline" onClick={hideModal}>Отмена</button></>);
  };

  /**
   * Открывает модальное окно для добавления нового типа платежа.
   *
   * Обязательные поля: код, название.
   */
  const handleAddPt = () => {
    showModal('Добавить тип', <PTForm />,
      <><button className="btn btn-primary" onClick={async () => {
        const form = document.querySelector('.modal-body form') as HTMLFormElement; if (!form) return;
        const data = readForm(form); if (!data.code || !data.name) { showAlert('Заполните все поля'); return; }
        try { await createPaymentType(data as Parameters<typeof createPaymentType>[0]); hideModal(); showToast('Сохранено', 'success'); loadPT(); } catch (err) { showAlert((err as Error).message); }
      }}>Сохранить</button><button className="btn btn-outline" onClick={hideModal}>Отмена</button></>);
  };

  /**
   * Открывает модальное окно для редактирования существующего типа платежа.
   *
   * @param p - Объект типа платежа для редактирования
   */
  const handleEditPt = (p: PaymentType) => {
    showModal('Редактировать', <PTForm init={p} />,
      <><button className="btn btn-primary" onClick={async () => {
        const form = document.querySelector('.modal-body form') as HTMLFormElement; if (!form) return;
        const data = readForm(form); if (!data.code || !data.name) { showAlert('Заполните все поля'); return; }
        try { await updatePaymentType(p.id, data as Parameters<typeof createPaymentType>[0]); hideModal(); showToast('Сохранено', 'success'); loadPT(); } catch (err) { showAlert((err as Error).message); }
      }}>Сохранить</button><button className="btn btn-outline" onClick={hideModal}>Отмена</button></>);
  };

  /**
   * Открывает модальное окно для добавления новой статьи ДДС.
   *
   * Обязательные поля: код, название.
   */
  const handleAddArticle = () => {
    showModal('Добавить статью', <ArticleForm />,
      <><button className="btn btn-primary" onClick={async () => {
        const form = document.querySelector('.modal-body form') as HTMLFormElement; if (!form) return;
        const data = readForm(form); if (!data.code || !data.name) { showAlert('Заполните все поля'); return; }
        try { await createArticle(data as unknown as Parameters<typeof createArticle>[0]); hideModal(); showToast('Сохранено', 'success'); loadArticles(); } catch (err) { showAlert((err as Error).message); }
      }}>Сохранить</button><button className="btn btn-outline" onClick={hideModal}>Отмена</button></>);
  };

  /**
   * Открывает модальное окно для редактирования существующей статьи ДДС.
   *
   * @param a - Объект статьи ДДС для редактирования
   */
  const handleEditArticle = (a: Article) => {
    showModal('Редактировать', <ArticleForm init={a} />,
      <><button className="btn btn-primary" onClick={async () => {
        const form = document.querySelector('.modal-body form') as HTMLFormElement; if (!form) return;
        const data = readForm(form); if (!data.code || !data.name) { showAlert('Заполните все поля'); return; }
        try { await updateArticle(a.id, data as unknown as Parameters<typeof createArticle>[0]); hideModal(); showToast('Сохранено', 'success'); loadArticles(); } catch (err) { showAlert((err as Error).message); }
      }}>Сохранить</button><button className="btn btn-outline" onClick={hideModal}>Отмена</button></>);
  };

  /**
   * Универсальный обработчик удаления записи из любого справочника.
   *
   * Запрашивает подтверждение через асинхронный диалог showConfirm,
   * выполняет соответствующий API-запрос и обновляет данные активной вкладки.
   *
   * @param type - Тип справочника ('client' | 'bank' | 'pt' | 'article')
   * @param id - Идентификатор удаляемой записи
   * @async
   */
  const handleDelete = async (type: string, id: number) => {
    // Асинхронный диалог подтверждения
    if (!(await showConfirm('Удалить запись?'))) return;
    try {
      // Выбор API-метода в зависимости от типа справочника
      if (type === 'client') await deleteClient(id);
      else if (type === 'bank') await deleteBank(id);
      else if (type === 'pt') await deletePaymentType(id);
      else await deleteArticle(id);
      showToast('Удалено', 'success');
      // Перезагрузка данных активной вкладки
      if (activeTab === 'clients') loadClients();
      else if (activeTab === 'banks') loadBanks();
      else if (activeTab === 'paymentTypes') loadPT();
      else loadArticles();
    } catch (err) { showAlert((err as Error).message); }
  };

  return (
    <div className="content-page active">
      {/* Вкладки справочников: контрагенты, банки, типы платежей, статьи ДДС */}
      <Tabs items={[{ key: 'clients', label: 'Контрагенты' }, { key: 'banks', label: 'Банки' }, { key: 'paymentTypes', label: 'Типы платежей' }, { key: 'articles', label: 'Статьи ДДС' }]} activeTab={activeTab} onTabChange={k => setActiveTab(k as TabKey)} />
      {/* === Вкладка «Контрагенты» === */}
      {activeTab === 'clients' && (
        <div className="dir-panel active">
          {/* Панель инструментов: кнопка добавления + поле поиска с debounce */}
          <div className="toolbar"><button className="btn btn-primary" onClick={handleAddClient}>Добавить контрагента</button><input type="text" placeholder="Поиск по названию, ИНН..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div className="table-wrapper">
            {/* Таблица контрагентов: ID, название, ИНН, КПП, счёт, банк, кнопки действий */}
            {loading ? <LoadingSpinner /> : <table className="table"><thead><tr><th>ID</th><th>Название</th><th>ИНН</th><th>КПП</th><th>Расчётный счёт</th><th>Банк</th><th></th></tr></thead><tbody>{clients.map(c => <tr key={c.id}><td>{c.id}</td><td>{c.name}</td><td>{c.inn}</td><td>{c.kpp || '-'}</td><td>{c.account || '-'}</td><td>{c.bik || '-'}</td><td><button className="btn btn-sm btn-outline" style={{ marginRight: 6 }} onClick={() => handleEditClient(c)}>Ред.</button><button className="btn btn-sm btn-danger" onClick={() => handleDelete('client', c.id)}>Уд.</button></td></tr>)}</tbody></table>}
          </div>
        </div>
      )}
      {/* === Вкладка «Банки» === */}
      {activeTab === 'banks' && (
        <div className="dir-panel active">
          {/* Панель инструментов: кнопка добавления банка */}
          <div className="toolbar"><button className="btn btn-primary" onClick={handleAddBank}>Добавить банк</button></div>
          <div className="table-wrapper">
            {/* Таблица банков: ID, название, БИК, корр. счёт, кнопки действий */}
            {loading ? <LoadingSpinner /> : <table className="table"><thead><tr><th>ID</th><th>Название</th><th>БИК</th><th>Корр. счёт</th><th></th></tr></thead><tbody>{banks.map(b => <tr key={b.id}><td>{b.id}</td><td>{b.name}</td><td>{b.bik}</td><td>{b.corr_account}</td><td><button className="btn btn-sm btn-outline" style={{ marginRight: 6 }} onClick={() => handleEditBank(b)}>Ред.</button><button className="btn btn-sm btn-danger" onClick={() => handleDelete('bank', b.id)}>Уд.</button></td></tr>)}</tbody></table>}
          </div>
        </div>
      )}
      {/* === Вкладка «Типы платежей» === */}
      {activeTab === 'paymentTypes' && (
        <div className="dir-panel active">
          <div className="toolbar"><button className="btn btn-primary" onClick={handleAddPt}>Добавить тип платежа</button></div>
          <div className="table-wrapper">
            {/* Таблица типов платежей: ID, код, название, кнопки действий */}
            {loading ? <LoadingSpinner /> : <table className="table"><thead><tr><th>ID</th><th>Код</th><th>Название</th><th></th></tr></thead><tbody>{ptypes.map(p => <tr key={p.id}><td>{p.id}</td><td>{p.code}</td><td>{p.name}</td><td><button className="btn btn-sm btn-outline" style={{ marginRight: 6 }} onClick={() => handleEditPt(p)}>Ред.</button><button className="btn btn-sm btn-danger" onClick={() => handleDelete('pt', p.id)}>Уд.</button></td></tr>)}</tbody></table>}
          </div>
        </div>
      )}
      {/* === Вкладка «Статьи ДДС» === */}
      {activeTab === 'articles' && (
        <div className="dir-panel active">
          <div className="toolbar"><button className="btn btn-primary" onClick={handleAddArticle}>Добавить статью ДДС</button></div>
          <div className="table-wrapper">
            {/* Таблица статей ДДС: ID, код, название, тип (бейдж Доход/Расход), кнопки действий */}
            {loading ? <LoadingSpinner /> : <table className="table"><thead><tr><th>ID</th><th>Код</th><th>Название</th><th>Тип</th><th></th></tr></thead><tbody>{articles.map(a => <tr key={a.id}><td>{a.id}</td><td>{a.code}</td><td>{a.name}</td><td>{a.type === 'income' ? <span className="badge badge-success">Доход</span> : <span className="badge badge-warning">Расход</span>}</td><td><button className="btn btn-sm btn-outline" style={{ marginRight: 6 }} onClick={() => handleEditArticle(a)}>Ред.</button><button className="btn btn-sm btn-danger" onClick={() => handleDelete('article', a.id)}>Уд.</button></td></tr>)}</tbody></table>}
          </div>
        </div>
        )}
    </div>
  );
}
