import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar, getPageTitle } from './Topbar';
import { Modal } from '@/components/ui/Modal';
import { ToastContainer } from '@/components/ui/Toast';

/**
 * Корневой компонент макета приложения АСБО.
 * Объединяет боковую панель навигации (Sidebar), верхнюю панель (Topbar),
 * область отображения дочерних маршрутов (Outlet), модальное окно (Modal)
 * и контейнер всплывающих уведомлений (ToastContainer).
 * Выступает точкой входа для всех защищённых страниц системы.
 *
 * @component
 */
export function AppLayout() {
  /** Определение текущего пути для динамического заголовка страницы */
  const location = useLocation();

  return (
    <div className="page active" id="appPage">
      <Sidebar />
      <main id="mainContent">
        {/** Формирование заголовка страницы на основе текущего маршрута */}
        <Topbar title={getPageTitle(location.pathname)} />
        {/** Точка рендера вложенных маршрутов (React Router Outlet) */}
        <Outlet />
      </main>
      {/** Глобальное модальное окно, управляемое через UIContext */}
      <Modal />
      {/** Глобальный контейнер toast-уведомлений */}
      <ToastContainer />
    </div>
  );
}
