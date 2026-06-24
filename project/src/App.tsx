/**
 * @file Корневой компонент приложения.
 * Определяет иерархию провайдеров и маршрутизацию.
 *
 * Структура:
 * - AuthProvider — состояние аутентификации
 * - UIProvider — тосты и модальные окна
 * - BrowserRouter — клиентская маршрутизация
 *
 * Маршруты:
 * - /login — страница входа (публичная)
 * - /statements, /payments, /directories, /reports, /errors, /logs, /admin
 *   — защищённые страницы (обёрнуты в RequireAuth и AppLayout)
 * - / — редирект на /statements
 * - * — fallback-редирект на /statements
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { UIProvider } from '@/contexts/UIContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { RequireAuth } from '@/components/layout/RequireAuth';
import { LoginPage } from '@/pages/LoginPage';
import { StatementsPage } from '@/pages/StatementsPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { PaymentCreatePage } from '@/pages/PaymentCreatePage';
import { DirectoriesPage } from '@/pages/DirectoriesPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { ErrorsPage } from '@/pages/ErrorsPage';
import { LogsPage } from '@/pages/LogsPage';
import { AdminPage } from '@/pages/AdminPage';
import { OneCPage } from '@/pages/OneCPage';

/**
 * Корневой компонент приложения с настройкой провайдеров и маршрутов.
 *
 * Порядок вложенности:
 * 1. AuthProvider — делает доступным useAuth во всех компонентах
 * 2. UIProvider — делает доступным useUI (тосты/модалки)
 * 3. BrowserRouter — активирует React Router
 *
 * Используется паттерн layout routes:
 * - RequireAuth оборачивает защищённые маршруты (редирект на /login при неавторизованном доступе)
 * - AppLayout рендерит общую разметку (шапка, сайдбар) вокруг дочерних маршрутов через <Outlet/>
 */
export function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <BrowserRouter>
          <Routes>
            {/* Публичный маршрут: страница входа */}
            <Route path="/login" element={<LoginPage />} />

            {/* Защищённые маршруты: обёрнуты в RequireAuth и AppLayout */}
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                {/* Корень редиректит на список выписок */}
                <Route path="/" element={<Navigate to="/statements" replace />} />
                <Route path="/statements" element={<StatementsPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/payments/new" element={<PaymentCreatePage />} />
                <Route path="/directories" element={<DirectoriesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/errors" element={<ErrorsPage />} />
                <Route path="/logs" element={<LogsPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/1c" element={<OneCPage />} />
              </Route>
            </Route>

            {/* Fallback: любой несуществующий маршрут → редирект на /statements */}
            <Route path="*" element={<Navigate to="/statements" replace />} />
          </Routes>
        </BrowserRouter>
      </UIProvider>
    </AuthProvider>
  );
}
