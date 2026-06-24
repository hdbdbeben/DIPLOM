import { useState, useEffect, useCallback } from 'react';
import {
  fetchOneCOrganizations,
  fetchOneCContracts,
  importOneCContracts,
  fetchOneCExportReady,
  exportToOneC,
  fetchOneCExchangeLog,
} from '@/api/endpoints';
import { formatDate, formatMoney, getStatusBadge } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Tabs } from '@/components/ui/Tabs';
import { showAlert, showToast, showConfirm } from '@/contexts/UIContext';
import type { OneCOrganization, OneCContract, OneCExportDocument, OneCExchangeLogEntry } from '@/types';

type TabKey = 'import' | 'export' | 'log';

export function OneCPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('import');

  const [organizations, setOrganizations] = useState<OneCOrganization[]>([]);
  const [contracts, setContracts] = useState<OneCContract[]>([]);
  const [exportDocs, setExportDocs] = useState<OneCExportDocument[]>([]);
  const [exchangeLog, setExchangeLog] = useState<OneCExchangeLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedContracts, setSelectedContracts] = useState<Set<number>>(new Set());
  const [selectedPayments, setSelectedPayments] = useState<Set<number>>(new Set());
  const [lastExportResult, setLastExportResult] = useState<{ totalSent: number; posted: number; errors: number } | null>(null);

  const loadImportData = useCallback(() => {
    setLoading(true);
    Promise.all([fetchOneCOrganizations(), fetchOneCContracts()])
      .then(([orgs, ctrs]) => { setOrganizations(orgs); setContracts(ctrs); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadExportData = useCallback(() => {
    setLoading(true);
    fetchOneCExportReady()
      .then(setExportDocs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadLog = useCallback(() => {
    setLoading(true);
    fetchOneCExchangeLog()
      .then(setExchangeLog)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (activeTab === 'import') loadImportData(); }, [loadImportData, activeTab]);
  useEffect(() => { if (activeTab === 'export') loadExportData(); }, [loadExportData, activeTab]);
  useEffect(() => { if (activeTab === 'log') loadLog(); }, [loadLog, activeTab]);

  const toggleContract = (id: number) => {
    setSelectedContracts((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const togglePayment = (id: number) => {
    setSelectedPayments((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const handleImport = async () => {
    if (selectedContracts.size === 0) { showAlert('Выберите договоры для импорта'); return; }
    if (!(await showConfirm(`Импортировать выбранные договоры (${selectedContracts.size} шт.) из 1С?\nКонтрагенты будут добавлены в справочник.`))) return;
    setLoading(true);
    try {
      const result = await importOneCContracts(Array.from(selectedContracts));
      showToast(`Импортировано: ${result.imported}. Контрагентов создано: ${result.clientsCreated}`, 'success');
      setSelectedContracts(new Set());
      loadImportData(); loadLog();
    } catch (err) { showAlert((err as Error).message); }
    finally { setLoading(false); }
  };

  const handleExport = async () => {
    if (selectedPayments.size === 0) { showAlert('Выберите платежи для экспорта'); return; }
    if (!(await showConfirm(`Экспортировать выбранные платежи (${selectedPayments.size} шт.) в 1С:Предприятие?`))) return;
    setLoading(true);
    try {
      const result = await exportToOneC(Array.from(selectedPayments));
      setLastExportResult(result);
      showToast(`Отправлено: ${result.totalSent}. Проведено: ${result.posted}. Ошибок: ${result.errors}`, result.errors > 0 ? 'error' : 'success');
      setSelectedPayments(new Set());
      loadExportData(); loadLog();
    } catch (err) { showAlert((err as Error).message); }
    finally { setLoading(false); }
  };

  const getLogOperationLabel = (op: string) => {
    return op === 'import_orgs' ? 'Импорт организаций' : op === 'import_contracts' ? 'Импорт договоров' : 'Экспорт платежей';
  };

  return (
    <div className="content-page active">
      <Tabs
        items={[{ key: 'import', label: 'Справочники из 1С' }, { key: 'export', label: 'Экспорт в 1С' }, { key: 'log', label: 'Журнал обмена' }]}
        activeTab={activeTab}
        onTabChange={(k) => setActiveTab(k as TabKey)}
      />

      {activeTab === 'import' && (
        <div className="dir-panel active">
          <div className="page-scroll">
            {lastExportResult && lastExportResult.errors > 0 && (
              <div className="panel">
                <p style={{ color: 'var(--danger)' }}>Результат последнего экспорта: отправлено {lastExportResult.totalSent}, проведено {lastExportResult.posted}, ошибок {lastExportResult.errors}</p>
              </div>
            )}
            <div className="panel">
              <h4>Организации в 1С ({organizations.length})</h4>
              {loading ? <LoadingSpinner /> : (
                <table className="table">
                  <thead><tr><th>ID</th><th>Наименование</th><th>ИНН</th><th>КПП</th><th>Расчётный счёт</th><th>БИК</th></tr></thead>
                  <tbody>
                    {organizations.map((o) => (
                      <tr key={o.id}><td>{o.id}</td><td>{o.name}</td><td>{o.inn}</td><td>{o.kpp}</td><td>{o.account}</td><td>{o.bik}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="panel">
              <h4>Договоры в 1С ({contracts.length})</h4>
              {loading ? <LoadingSpinner /> : (
                <table className="table">
                  <thead><tr><th></th><th>ID</th><th>№ договора</th><th>Дата</th><th>Контрагент</th><th>ИНН</th><th>Вид</th><th>Сумма</th></tr></thead>
                  <tbody>
                    {contracts.map((c) => {
                      const { badge, label } = getStatusBadge(c.type === 'С покупателем' ? 'processed' : 'manual');
                      return (
                        <tr key={c.id}>
                          <td><input type="checkbox" checked={selectedContracts.has(c.id)} onChange={() => toggleContract(c.id)} /></td>
                          <td>{c.id}</td><td>{c.number}</td><td>{c.date}</td><td>{c.clientName}</td><td>{c.clientInn}</td>
                          <td><span className={`badge badge-${badge}`}>{c.type}</span></td>
                          <td>{c.amount ? formatMoney(c.amount) : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="toolbar" style={{ padding: 0 }}>
              <button className="btn btn-primary" onClick={handleImport} disabled={selectedContracts.size === 0}>
                Импортировать выбранные договоры ({selectedContracts.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="dir-panel active">
          <div className="page-scroll">
            <div className="panel">
              <h4>Платежи, готовые к экспорту ({exportDocs.length})</h4>
              {loading ? <LoadingSpinner /> : (
                <table className="table">
                  <thead><tr><th></th><th>ID</th><th>№ документа</th><th>Дата</th><th>Контрагент</th><th>Тип</th><th>Статья</th><th>Сумма</th><th>Статус</th></tr></thead>
                  <tbody>
                    {exportDocs.map((d) => (
                      <tr key={d.paymentId}>
                        <td>{d.exportStatus === 'ready' ? <input type="checkbox" checked={selectedPayments.has(d.paymentId)} onChange={() => togglePayment(d.paymentId)} /> : null}</td>
                        <td>{d.paymentId}</td>
                        <td>{d.docNumber}{d.oneCDocNumber ? <div style={{ color: 'var(--ocean)', fontSize: '0.8em' }}>→ {d.oneCDocNumber}</div> : null}</td>
                        <td>{d.docDate}</td><td>{d.clientName}</td>
                        <td><StatusBadge status={d.operationType === 'Поступление' ? 'processed' : 'manual'} /></td>
                        <td>{d.articleName || '—'}</td>
                        <td>{formatMoney(d.amount)}</td>
                        <td><StatusBadge status={d.exportStatus === 'ready' ? 'new' : d.exportStatus === 'sent' ? 'processing' : d.exportStatus === 'posted' ? 'processed' : 'error'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="toolbar" style={{ padding: 0 }}>
              <button className="btn btn-primary" onClick={handleExport} disabled={selectedPayments.size === 0}>
                Экспортировать в 1С ({selectedPayments.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'log' && (
        <div className="dir-panel active">
          <div className="page-scroll">
            <div className="panel">
              <h4>Журнал обмена с 1С ({exchangeLog.length})</h4>
              {loading ? <LoadingSpinner /> : (
                <table className="table">
                  <thead><tr><th>ID</th><th>Дата</th><th>Операция</th><th>Направление</th><th>Описание</th><th>Записей</th><th>Статус</th><th>Пользователь</th></tr></thead>
                  <tbody>
                    {exchangeLog.map((e) => (
                      <tr key={e.id}>
                        <td>{e.id}</td><td>{formatDate(e.timestamp)}</td>
                        <td>{getLogOperationLabel(e.operation)}</td>
                        <td>{e.direction === 'import' ? '← Импорт' : '→ Экспорт'}</td>
                        <td>{e.description}</td><td>{e.count}</td>
                        <td><StatusBadge status={e.status === 'success' ? 'processed' : e.status === 'partial' ? 'processing' : 'error'} /></td>
                        <td>{e.userName || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
