import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { UIProvider } from '@/contexts/UIContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { RequireAuth } from '@/components/layout/RequireAuth';
import { LoginPage } from '@/pages/LoginPage';
import { StatementsPage } from '@/pages/StatementsPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { DirectoriesPage } from '@/pages/DirectoriesPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { ErrorsPage } from '@/pages/ErrorsPage';
import { LogsPage } from '@/pages/LogsPage';
import { AdminPage } from '@/pages/AdminPage';

export function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/statements" replace />} />
                <Route path="/statements" element={<StatementsPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/directories" element={<DirectoriesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/errors" element={<ErrorsPage />} />
                <Route path="/logs" element={<LogsPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/statements" replace />} />
          </Routes>
        </BrowserRouter>
      </UIProvider>
    </AuthProvider>
  );
}
