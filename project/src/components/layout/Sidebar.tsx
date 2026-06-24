import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Боковая панель навигации приложения АСБО.
 *
 * Содержит:
 * - Бренд-блок с названием системы и организации
 * - Навигационное меню с основными разделами
 * - Административные разделы (видимы только для isAdmin)
 * - Подвал с ФИО пользователя и кнопкой выхода
 *
 * Использует React Router NavLink для синхронизации активного пункта меню
 * с текущим маршрутом. Состояние пользователя и права доступа получает из AuthContext.
 *
 * @component
 */
export function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Обработчик выхода из системы.
   * Вызывает logout() для очистки сессии в AuthContext,
   * затем перенаправляет пользователя на страницу входа.
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * Формирует CSS-класс для NavLink в зависимости от активности маршрута.
   * React Router передаёт объект { isActive } через prop className.
   */
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-item${isActive ? ' active' : ''}`;

  return (
    <aside id="sidebar">
      {/** Бренд-блок: наименование системы и организация */}
      <div className="sidebar-brand">
        <h2>АСБО</h2>
        <small>ООО «Социальные услуги»</small>
      </div>
      <nav id="mainNav">
        {/** Основная навигация — доступна всем пользователям */}
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
        <NavLink to="/1c" className={linkClass}>
          <span className="nav-icon">↻</span> Интеграция с 1С
        </NavLink>
        {/** Административные разделы — отображаются только для администраторов */}
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
      {/** Подвал боковой панели: информация о пользователе и кнопка выхода */}
      <div className="sidebar-footer">
        <span>{user?.fullName}</span>
        <button className="btn btn-sm btn-outline" onClick={handleLogout}>
          Выход
        </button>
      </div>
    </aside>
  );
}
