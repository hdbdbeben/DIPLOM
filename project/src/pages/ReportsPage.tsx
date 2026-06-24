import { useState, useEffect } from 'react';
import { fetchReport } from '@/api/endpoints';
import { formatMoney } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showAlert } from '@/contexts/UIContext';
import type { ReportData } from '@/types';

export function ReportsPage() {
  const now = new Date();
  const [from, setFrom] = useState(new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [to, setTo] = useState(now.toISOString().split('T')[0]);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReport = () => {
    setLoading(true);
    setError('');
    fetchReport({ from, to })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const exportCSV = () => {
    if (!data) { showAlert('Сформируйте отчёт сначала.'); return; }
    const rows: string[] = [];
    rows.push('"Статья ДДС";"Тип";"Количество";"Поступления";"Списания"');
    for (const a of data.articles) {
      rows.push(`"${a.name}";"${a.type === 'income' ? 'Доход' : 'Расход'}";${a.count};${a.income};${a.expense}`);
    }
    rows.push(`"ИТОГО";;${data.paymentCount};${data.totalIncome};${data.totalExpense}`);
    const csv = '\uFEFF' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'DDS_report_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
  };

  return (
    <div className="content-page active">
      <div className="toolbar">
        <label>Период с:</label><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <label>по:</label><input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button className="btn btn-primary" onClick={generateReport}>Сформировать ДДС</button>
        <button className="btn btn-secondary" onClick={exportCSV}>Экспорт в Excel</button>
      </div>
      <div className="page-scroll">
        <div className="panel">
          <h4>Отчёт о движении денежных средств (ДДС)</h4>
          {loading && <LoadingSpinner />}
          {error && <div className="error-msg">{error}</div>}
          {data && (
            <>
              <div className="report-summary">
                <div className="report-summary-item"><div className="rs-label">Поступления</div><div className="rs-value" style={{ color: 'var(--success)' }}>{formatMoney(data.totalIncome)}</div></div>
                <div className="report-summary-item"><div className="rs-label">Списания</div><div className="rs-value" style={{ color: 'var(--danger)' }}>{formatMoney(data.totalExpense)}</div></div>
                <div className="report-summary-item"><div className="rs-label">Чистый поток</div><div className="rs-value" style={{ color: data.netFlow >= 0 ? 'var(--success)' : 'var(--danger)' }}>{formatMoney(data.netFlow)}</div></div>
              </div>
              <table className="report-table">
                <thead><tr><th>Статья ДДС</th><th>Тип</th><th>Кол-во</th><th>Поступления</th><th>Списания</th></tr></thead>
                <tbody>
                  {data.articles.map((a, i) => <tr key={i}><td>{a.name}</td><td>{a.type === 'income' ? 'Доход' : 'Расход'}</td><td>{a.count}</td><td className="amount">{formatMoney(a.income)}</td><td className="amount">{formatMoney(a.expense)}</td></tr>)}
                  <tr className="total-row"><td><strong>ИТОГО</strong></td><td></td><td>{data.paymentCount}</td><td className="amount"><strong>{formatMoney(data.totalIncome)}</strong></td><td className="amount"><strong>{formatMoney(data.totalExpense)}</strong></td></tr>
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
