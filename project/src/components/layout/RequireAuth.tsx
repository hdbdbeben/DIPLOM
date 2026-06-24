import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Компонент-защитник маршрутов. Используется как обёртка (layout route)
 * для всех страниц, требующих аутентификации.
 *
 * Логика работы:
 * - Если пользователь не аутентифицирован — выполняет редирект на /login
 * - Если аутентифицирован — рендерит дочерние маршруты через Outlet
 *
 * Зависит от AuthContext.isAuthenticated для определения состояния аутентификации.
 *
 * @component
 */
export function RequireAuth() {
  const { isAuthenticated } = useAuth();

  /** Если сессия отсутствует — принудительный редирект на страницу входа */
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  /** Пользователь авторизован — отображаем защищённое содержимое */
  return <Outlet />;
}
