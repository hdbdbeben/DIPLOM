import { useState, useEffect, useCallback } from 'react';
import { fetchErrors, updateError, fetchUsers } from '@/api/endpoints';
import { formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showModal, hideModal, showAlert, showToast } from '@/contexts/UIContext';
import type { ErrorItem } from '@/types';

/**
 * @file Страница журнала ошибок и исключений.
 * Отображает список ошибок, возникающих при обработке платёжных документов,
 * позволяет менять статус ошибки, назначать ответственного и отслеживать решение.
 */

/**
 * Компонент страницы журнала ошибок.
 *
 * Бизнес-логика:
 * - Фильтрация ошибок по статусу: все / новые / в работе / решённые.
 * - Кнопки действий зависят от текущего статуса ошибки:
 *   - «Новая» → можно взять в работу или назначить ответственного.
 *   - «В работе» → можно пометить как решённую.
 * - При назначении ответственного открывается модальное окно с выбором
 *   из списка пользователей с ролью бухгалтера или администратора.
 */
export function ErrorsPage() {
  // Текущий фильтр по статусу ошибки
  const [status, setStatus] = useState('all');
  // Список ошибок, загруженных с сервера
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  // Индикатор загрузки данных
  const [loading, setLoading] = useState(true);

  /**
   * Загружает список ошибок с сервера с учётом текущего фильтра `status`.
   * Оборачивается в useCallback для мемоизации при изменении фильтра.
   */
  const load = useCallback(() => {
    setLoading(true);
    fetchErrors({ status })
      .then(setErrors)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  // Автоматическая загрузка при изменении фильтра `status`
  useEffect(() => { load(); }, [load]);

  /**
   * Обновляет статус ошибки (например, «в работу» → «решено»).
   * После успешного обновления показывает уведомление и перезагружает список.
   */
  const resolveError = async (id: number, newStatus: string) => {
    try { await updateError(id, { status: newStatus }); showToast('Обновлено', 'success'); load(); }
    catch (err) { showAlert((err as Error).message); }
  };

  /**
   * Открывает модальное окно для назначения ответственного за ошибку.
   *
   * Алгоритм:
   * 1. Загружает список всех пользователей.
   * 2. Фильтрует пользователей с ролью администратора (ID=1) или бухгалтера (ID=2).
   * 3. Формирует тело модального окна с выпадающим списком выбора.
   * 4. При подтверждении отправляет запрос на назначение ответственного.
   */
  const showAssignForm = (id: number) => {
    fetchUsers().then((users) => {
      // Фильтрация: только администраторы и бухгалтеры могут быть ответственными
      const accountants = users.filter((u) => u.roleId === 2 || u.roleId === 1);
      const body = (
        <div className="form-group">
          <label>Ответственный</label>
          <select id="mfAssign"><option value="">— выберите —</option>{accountants.map((u) => <option key={u.id} value={u.id}>{u.fullName} ({u.login})</option>)}</select>
        </div>
      );
      const footer = (
        <>
          <button className="btn btn-primary" onClick={() => {
            const assignedTo = (document.getElementById('mfAssign') as HTMLSelectElement)?.value;
            if (!assignedTo) { showAlert('Выберите ответственного'); return; }
            // Отправка запроса на назначение ответственного
            updateError(id, { assignedTo: parseInt(assignedTo) }).then(() => { hideModal(); showToast('Назначено', 'success'); load(); }).catch((err: Error) => showAlert(err.message));
          }}>Назначить</button>
          <button className="btn btn-outline" onClick={hideModal}>Отмена</button>
        </>
      );
      showModal('Назначить ответственного', body, footer);
    });
  };

  return (
    <div className="content-page active">
      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Все</option><option value="new">Новые</option><option value="in_progress">В работе</option><option value="resolved">Решённые</option>
        </select>
      </div>
      <div className="page-scroll">
        <div className="panel">
          <h4>Журнал ошибок и исключений</h4>
          {loading ? <LoadingSpinner /> : (
            <table className="table">
              <thead><tr><th>ID</th><th>Дата</th><th>Тип</th><th>Описание</th><th>Операция</th><th>Статус</th><th>Ответственный</th><th></th></tr></thead>
              <tbody>
                {errors.map((e) => (
                  <tr key={e.id}><td>{e.id}</td><td>{formatDate(e.created_at)}</td><td>{e.error_type}</td><td>{e.description.substring(0, 60)}</td><td>{e.doc_number || '-'}</td><td><StatusBadge status={e.status} /></td><td>{e.assigned_name || '-'}</td><td>
                    {e.status === 'new' && <><button className="btn btn-sm btn-primary" style={{ marginRight: 6 }} onClick={() => resolveError(e.id, 'in_progress')}>В работу</button><button className="btn btn-sm btn-outline" style={{ marginRight: 6 }} onClick={() => showAssignForm(e.id)}>Назначить</button></>}
                    {e.status === 'in_progress' && <button className="btn btn-sm btn-success" onClick={() => resolveError(e.id, 'resolved')}>Решить</button>}
                  </td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
