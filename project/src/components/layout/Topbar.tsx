import { useAuth } from '@/contexts/AuthContext';

/**
 * Словарь сопоставления путей маршрутов и заголовков страниц.
 * Используется функцией getPageTitle для отображения человекопонятного названия
 * текущего раздела в верхней панели.
 */
const titles: Record<string, string> = {
  '/': 'Панель управления',
  '/statements': 'Банковские выписки',
  '/payments': 'Платёжные операции',
  '/directories': 'Справочники',
  '/reports': 'Отчёты',
  '/errors': 'Журнал ошибок',
  '/logs': 'Журнал действий',
  '/admin': 'Администрирование',
  '/1c': 'Интеграция с 1С',
};

/**
 * Верхняя панель (хедер) приложения.
 *
 * Отображает:
 * - Заголовок текущей страницы (получает через prop title)
 * - Логин и роль текущего пользователя (из AuthContext)
 *
 * Если title не передан, отображается значение по умолчанию — «Панель управления».
 *
 * @param props.title - Заголовок страницы, соответствующий текущему маршруту
 * @component
 */
export function Topbar({ title }: { title?: string }) {
  const { user } = useAuth();
  return (
    <header className="topbar">
      {/** Заголовок страницы; fallback на «Панель управления» если title не задан */}
      <h3>{title || 'Панель управления'}</h3>
      {/** Отображение логина и названия роли текущего пользователя */}
      <span>{user?.login} ({user?.roleName})</span>
    </header>
  );
}

/**
 * Возвращает заголовок страницы по её пути (pathname).
 * Если путь не найден в словаре titles, возвращает название системы по умолчанию.
 *
 * @param pathname - Текущий путь маршрута (location.pathname)
 * @returns Строковый заголовок страницы или 'АСБО' если путь не распознан
 */
export function getPageTitle(pathname: string): string {
  return titles[pathname] || 'АСБО';
}
