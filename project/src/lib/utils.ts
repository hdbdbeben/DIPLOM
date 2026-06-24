export function formatDate(d: string | null | undefined): string {
  if (!d) return '-';
  return String(d).substring(0, 10);
}

export function formatDateTime(d: string | null | undefined): string {
  if (!d) return '-';
  return String(d).replace('T', ' ').substring(0, 19);
}

export function formatMoney(n: number | null | undefined): string {
  return (
    Number(n || 0).toLocaleString('ru-RU', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' ₽'
  );
}

export type StatusKey =
  | 'uploaded'
  | 'processing'
  | 'processed'
  | 'manual'
  | 'error'
  | 'new'
  | 'in_progress'
  | 'resolved';

const STATUS_MAP: Record<string, { badge: string; label: string }> = {
  uploaded: { badge: 'info', label: 'Загружено' },
  processing: { badge: 'info', label: 'Обработка' },
  processed: { badge: 'success', label: 'Обработано' },
  manual: { badge: 'warning', label: 'Ручная проверка' },
  error: { badge: 'danger', label: 'Ошибка' },
  new: { badge: 'danger', label: 'Новая' },
  in_progress: { badge: 'warning', label: 'В работе' },
  resolved: { badge: 'success', label: 'Решено' },
};

export function getStatusBadge(status: string): { badge: string; label: string } {
  return STATUS_MAP[status] || { badge: 'info', label: status };
}

export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
