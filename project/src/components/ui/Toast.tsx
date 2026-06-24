import { useUI } from '@/contexts/UIContext';

/**
 * Контейнер всплывающих уведомлений (toast-сообщений).
 *
 * Отображает все активные toast-уведомления из UIContext.
 * Каждый toast имеет:
 * - Уникальный ключ (t.id) для корректного reconciliation React
 * - CSS-класс, зависящий от типа уведомления (t.type: success, error, warning, info)
 * - Класс 'show' для анимации появления
 * - Текстовое сообщение (t.message)
 *
 * Компонент реактивен — при изменении массива toasts в контексте
 * список уведомлений обновляется автоматически.
 *
 * @component
 */
export function ToastContainer() {
  const { toasts } = useUI();
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        /**
         * Формирование CSS-класса на основе типа уведомления.
         * Пример: t.type === 'error' → класс 'toast toast-error show'
         */
        <div key={t.id} className={`toast toast-${t.type} show`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
