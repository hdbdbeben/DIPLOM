import { useUI } from '@/contexts/UIContext';

export function ToastContainer() {
  const { toasts } = useUI();
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type} show`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
