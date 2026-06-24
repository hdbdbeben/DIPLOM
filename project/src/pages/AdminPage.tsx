import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { fetchUsers, createUser, updateUser, deleteUser, fetchRoles, doBackup, doRestore, doReset } from '@/api/endpoints';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Tabs } from '@/components/ui/Tabs';
import { showModal, hideModal, showAlert, showToast, showConfirm } from '@/contexts/UIContext';
import type { User, Role } from '@/types';

type AdminTab = 'users' | 'roles' | 'settings';

function UserForm({ roles, init }: { roles: Role[]; init?: User }) {
  return (
    <form onSubmit={e => e.preventDefault()}>
      <div className="form-group"><label>Логин</label><input name="login" defaultValue={init?.login || ''} /></div>
      <div className="form-group"><label>Пароль{init ? ' (оставьте пустым)' : ''}</label><input type="password" name="password" /></div>
      <div className="form-group"><label>ФИО</label><input name="fullName" defaultValue={init?.fullName || ''} /></div>
      <div className="form-group"><label>Роль</label><select name="roleId" defaultValue={init?.roleId?.toString() || ''}><option value="">— выберите —</option>{roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
      {init && <div className="form-group"><label><input type="checkbox" name="active" defaultChecked={init.active !== 0} /> Активен</label></div>}
    </form>
  );
}

function readForm(f: HTMLFormElement): Record<string, string> {
  const fd = new FormData(f);
  const d: Record<string, string> = {};
  fd.forEach((v, k) => { d[k] = v as string; });
  return d;
}

export function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isAdmin) return <Navigate to="/" replace />;

  const loadUsers = useCallback(async () => { setLoading(true); try { setUsers(await fetchUsers()); } catch {} setLoading(false); }, []);
  const loadRoles = useCallback(async () => { try { setRoles(await fetchRoles()); } catch {} }, []);

  useEffect(() => { if (activeTab === 'users') loadUsers(); else if (activeTab === 'roles') loadRoles(); }, [activeTab, loadUsers, loadRoles]);

  const handleAddUser = () => {
    if (!roles.length) { loadRoles(); return; }
    showModal('Добавить пользователя', <UserForm roles={roles} />,
      <><button className="btn btn-primary" onClick={async () => {
        const f = document.querySelector('.modal-body form') as HTMLFormElement; if (!f) return;
        const d = readForm(f); if (!d.login || !d.fullName) { showAlert('Логин и ФИО обязательны'); return; } if (!d.password) { showAlert('Пароль обязателен'); return; }
        try { await createUser({ login: d.login, password: d.password, fullName: d.fullName, roleId: parseInt(d.roleId) }); hideModal(); showToast('Сохранено', 'success'); loadUsers(); } catch (err) { showAlert((err as Error).message); }
      }}>Сохранить</button><button className="btn btn-outline" onClick={hideModal}>Отмена</button></>);
  };

  const handleEditUser = (u: User) => {
    showModal('Редактировать', <UserForm roles={roles} init={u} />,
      <><button className="btn btn-primary" onClick={async () => {
        const f = document.querySelector('.modal-body form') as HTMLFormElement; if (!f) return;
        const d = readForm(f); if (!d.login || !d.fullName) { showAlert('Логин и ФИО обязательны'); return; }
        const data: Record<string, unknown> = { login: d.login, fullName: d.fullName, roleId: parseInt(d.roleId), active: d.active === 'on' };
        if (d.password) data.password = d.password;
        try { await updateUser(u.id, data as Parameters<typeof updateUser>[1]); hideModal(); showToast('Сохранено', 'success'); loadUsers(); } catch (err) { showAlert((err as Error).message); }
      }}>Сохранить</button><button className="btn btn-outline" onClick={hideModal}>Отмена</button></>);
  };

  const handleDeleteUser = async (id: number) => { if (await showConfirm('Удалить?')) { try { await deleteUser(id); showToast('Удалено', 'success'); loadUsers(); } catch (err) { showAlert((err as Error).message); } } };
  const handleBackup = async () => { try { const r = await doBackup(); showAlert('Резервная копия:\n' + r.path); } catch (err) { showAlert((err as Error).message); } };
  const handleRestore = () => { const path = window.prompt('Путь к файлу (*.db):'); if (!path) return; doRestore(path).then(r => showAlert(r.message)).catch((err: Error) => showAlert(err.message)); };
  const handleReset = async () => { if (!(await showConfirm('ВНИМАНИЕ! Все данные будут удалены!\n\nПродолжить?'))) return; try { const r = await doReset(); showAlert(r.message); navigate('/'); } catch (err) { showAlert((err as Error).message); } };

  return (
    <div className="content-page active">
      <Tabs items={[{ key: 'users', label: 'Пользователи' }, { key: 'roles', label: 'Роли' }, { key: 'settings', label: 'Настройки' }]} activeTab={activeTab} onTabChange={k => setActiveTab(k as AdminTab)} />
      {activeTab === 'users' && (
        <div className="admin-panel active">
          <div className="toolbar"><button className="btn btn-primary" onClick={handleAddUser}>Добавить пользователя</button></div>
          <div className="table-wrapper">
            {loading ? <LoadingSpinner /> : <table className="table"><thead><tr><th>ID</th><th>Логин</th><th>ФИО</th><th>Роль</th><th>Активен</th><th></th></tr></thead><tbody>{users.map(u => <tr key={u.id}><td>{u.id}</td><td>{u.login}</td><td>{u.fullName}</td><td>{u.roleName}</td><td>{u.active ? <span className="badge badge-success">Да</span> : <span className="badge badge-danger">Нет</span>}</td><td><button className="btn btn-sm btn-outline" style={{ marginRight: 6 }} onClick={() => handleEditUser(u)}>Ред.</button><button className="btn btn-sm btn-danger" onClick={() => handleDeleteUser(u.id)}>Уд.</button></td></tr>)}</tbody></table>}
          </div>
        </div>
      )}
      {activeTab === 'roles' && (
        <div className="admin-panel active">
          <div className="table-wrapper"><table className="table"><thead><tr><th>ID</th><th>Код</th><th>Название</th><th>Описание</th></tr></thead><tbody>{roles.map(r => <tr key={r.id}><td>{r.id}</td><td>{r.code}</td><td>{r.name}</td><td>{r.description}</td></tr>)}</tbody></table></div>
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="admin-panel active">
          <div className="page-scroll tight">
            <div className="panel">
              <div className="form-group" style={{ marginBottom: 20 }}><label style={{ marginBottom: 8 }}>Резервное копирование БД</label><div style={{ display: 'flex', gap: 8 }}><button className="btn btn-secondary" onClick={handleBackup}>Создать копию</button><button className="btn btn-outline" onClick={handleRestore}>Восстановить</button></div></div>
              <div className="form-group"><label style={{ marginBottom: 8 }}>Очистка данных</label><button className="btn btn-danger" onClick={handleReset}>Сбросить все данные</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
