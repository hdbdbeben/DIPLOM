import { useState, useEffect } from 'react';
import { fetchLogs } from '@/api/endpoints';
import { formatDateTime } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import type { LogEntry } from '@/types';

export function LogsPage() {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs().then(setLogs).finally(() => setLoading(false));
  }, []);

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
