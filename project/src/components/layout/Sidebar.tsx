import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-item${isActive ? ' active' : ''}`;

  return (
    <aside id="sidebar">
      <div className="sidebar-brand">
        <h2>АСБО</h2>
        <small>ООО «Социальные услуги»</small>
      </div>
      <nav id="mainNav">
        <NavLink to="/statements" className={linkClass}>
          <span className="nav-icon">◆</span> Банковские выписки
        </NavLink>
        <NavLink to="/payments" className={linkClass}>
          <span className="nav-icon">●</span> Платёжные операции
        </NavLink>
        <NavLink to="/directories" className={linkClass}>
          <span className="nav-icon">☰</span> Справочники
        </NavLink>
        <NavLink to="/reports" className={linkClass}>
          <span className="nav-icon">☃</span> Отчёты
        </NavLink>
        <NavLink to="/errors" className={linkClass}>
          <span className="nav-icon">⚠</span> Журнал ошибок
        </NavLink>
        {isAdmin && (
          <>
            <NavLink to="/logs" className={linkClass}>
              <span className="nav-icon">✎</span> Журнал действий
            </NavLink>
            <NavLink to="/admin" className={linkClass}>
              <span className="nav-icon">⚙</span> Администрирование
            </NavLink>
          </>
        )}
      </nav>
      <div className="sidebar-footer">
        <span>{user?.fullName}</span>
        <button className="btn btn-sm btn-outline" onClick={handleLogout}>
          Выход
        </button>
      </div>
    </aside>
  );
}
