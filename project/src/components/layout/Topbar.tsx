import { useAuth } from '@/contexts/AuthContext';

const titles: Record<string, string> = {
  '/': 'Панель управления',
  '/statements': 'Банковские выписки',
  '/payments': 'Платёжные операции',
  '/directories': 'Справочники',
  '/reports': 'Отчёты',
  '/errors': 'Журнал ошибок',
  '/logs': 'Журнал действий',
  '/admin': 'Администрирование',
};

export function Topbar({ title }: { title?: string }) {
  const { user } = useAuth();
  return (
    <header className="topbar">
      <h3>{title || 'Панель управления'}</h3>
      <span>{user?.login} ({user?.roleName})</span>
    </header>
  );
}

export function getPageTitle(pathname: string): string {
  return titles[pathname] || 'АСБО';
}
