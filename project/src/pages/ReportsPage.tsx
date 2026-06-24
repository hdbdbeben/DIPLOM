import { useState, useEffect } from 'react';
import { fetchReport } from '@/api/endpoints';
import { formatMoney } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showAlert } from '@/contexts/UIContext';
import type { ReportData } from '@/types';

/**
 * @file Страница формирования отчёта о движении денежных средств (ДДС).
 * Позволяет выбирать период, генерировать сводку по статьям ДДС
 * с разбивкой на поступления и списания, а также экспортировать результат в CSV.
 */

/**
 * Компонент страницы отчёта ДДС.
 *
 * Бизнес-логика:
 * - Пользователь задаёт диапазон дат (с начала текущего года по сегодня).
 * - При нажатии «Сформировать ДДС» запрашивается сводный отчёт с сервера.
 * - Результат отображается в виде таблицы статей и итоговых сумм.
 * - Кнопка «Экспорт в Excel» формирует CSV-файл с BOM (UTF-8) для корректного открытия в Excel.
 */
export function ReportsPage() {
  const now = new Date();
  // Начальная дата — 1 января текущего года
  const [from, setFrom] = useState(new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]);
  // Конечная дата — сегодня
  const [to, setTo] = useState(now.toISOString().split('T')[0]);
  // Данные отчёта, полученные с сервера
  const [data, setData] = useState<ReportData | null>(null);
  // Индикатор загрузки
  const [loading, setLoading] = useState(false);
  // Текст ошибки запроса
  const [error, setError] = useState('');

  /**
   * Запрашивает отчёт ДДС с сервера за выбранный период.
   * При успехе сохраняет данные в состояние `data`,
   * при ошибке — записывает сообщение в `error`.
   */
  const generateReport = () => {
    setLoading(true);
    setError('');
    fetchReport({ from, to })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  /**
   * Экспортирует данные отчёта в CSV-файл.
   *
   * Алгоритм:
   * 1. Проверяет наличие данных (если нет — предупреждение).
   * 2. Формирует строки CSV: заголовок → статьи ДДС → итоговая строка.
   * 3. Добавляет BOM `\uFEFF` для корректной кодировки в Excel.
   * 4. Создаёт Blob, генерирует object URL и инициирует скачивание.
   */
  const exportCSV = () => {
    if (!data) { showAlert('Сформируйте отчёт сначала.'); return; }
    const rows: string[] = [];
    // Заголовки столбцов
    rows.push('"Статья ДДС";"Тип";"Количество";"Поступления";"Списания"');
    // Строки по каждой статье ДДС
    for (const a of data.articles) {
      rows.push(`"${a.name}";"${a.type === 'income' ? 'Доход' : 'Расход'}";${a.count};${a.income};${a.expense}`);
    }
    // Итоговая строка
    rows.push(`"ИТОГО";;${data.paymentCount};${data.totalIncome};${data.totalExpense}`);
    const csv = '\uFEFF' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    // Инициация скачивания через временную ссылку
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
