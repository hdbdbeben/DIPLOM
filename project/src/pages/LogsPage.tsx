import { useState, useEffect } from 'react';
import { fetchLogs } from '@/api/endpoints';
import { formatDateTime } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import type { LogEntry } from '@/types';

/**
 * @file Страница журнала действий пользователей (аудит).
 * Отображает хронологический список всех действий, выполненных пользователями
 * в системе. Доступна только администраторам.
 */

/**
 * Компонент страницы журнала действий.
 *
 * Бизнес-логика:
 * - При монтировании загружает полный список записей аудита с сервера.
 * - Если текущий пользователь не администратор — перенаправляет на главную.
 * - Данные отображаются в таблице: ID, дата/время, пользователь, действие.
 */
export function LogsPage() {
  // Проверка прав доступа: только администратор может просматривать аудит
  const { isAdmin } = useAuth();
  // Список записей журнала аудита
  const [logs, setLogs] = useState<LogEntry[]>([]);
  // Индикатор загрузки
  const [loading, setLoading] = useState(true);

  // Загрузка всех записей аудита при монтировании компонента
  useEffect(() => {
    fetchLogs().then(setLogs).finally(() => setLoading(false));
  }, []);

  // Защита маршрута: не-администраторы перенаправляются на главную
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="content-page active">
      <div className="page-scroll">
        <div className="panel">
          <h4>Журнал действий пользователей</h4>
          {loading ? <LoadingSpinner /> : (
            <table className="table">
              <thead><tr><th>ID</th><th>Дата/Время</th><th>Пользователь</th><th>Действие</th></tr></thead>
              <tbody>
                {logs.map((l) => <tr key={l.id}><td>{l.id}</td><td>{formatDateTime(l.timestamp)}</td><td>{l.full_name || l.login || '-'}</td><td>{l.action}</td></tr>)}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
