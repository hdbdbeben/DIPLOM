/**
 * @file Утилитарные функции общего назначения.
 * Включает форматирование дат, денежных сумм, статусов,
 * экранирование HTML и debounce-обёртку.
 */

/**
 * Форматирование даты в строку вида YYYY-MM-DD.
 * Использует первые 10 символов строки даты (ISO 8601).
 *
 * @param d Строка даты (ISO-формат), null или undefined
 * @returns Отформатированная дата или прочерк, если значение отсутствует
 */
export function formatDate(d: string | null | undefined): string {
  if (!d) return '-';
  // ISO-дата имеет формат "YYYY-MM-DDTHH:mm:ss.sssZ", берём первые 10 символов
  return String(d).substring(0, 10);
}

/**
 * Форматирование даты и времени в строку вида YYYY-MM-DD HH:mm:ss.
 *
 * @param d Строка даты-времени (ISO-формат), null или undefined
 * @returns Отформатированная дата-время или прочерк
 */
export function formatDateTime(d: string | null | undefined): string {
  if (!d) return '-';
  // Заменяем разделитель 'T' на пробел, берём первые 19 символов (без миллисекунд и таймзоны)
  return String(d).replace('T', ' ').substring(0, 19);
}

/**
 * Форматирование денежной суммы в рублях с разделителями разрядов.
 * Использует российскую локаль (ru-RU) для корректного форматирования.
 *
 * @param n Числовое значение суммы, null или undefined
 * @returns Строка вида "1 234,56 ₽" с символом рубля
 */
export function formatMoney(n: number | null | undefined): string {
  return (
    // Приводим null/undefined к 0, форматируем с двумя знаками после запятой
    Number(n || 0).toLocaleString('ru-RU', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' ₽'
  );
}

/**
 * Допустимые ключи статусов, используемые в системе.
 * Используется для типизации STATUS_MAP и getStatusBadge.
 */
export type StatusKey =
  | 'uploaded'
  | 'processing'
  | 'processed'
  | 'manual'
  | 'error'
  | 'new'
  | 'in_progress'
  | 'resolved';

/**
 * Словарь соответствия статуса → стиль бейджа и текстовая метка.
 * Ключ: технический статус (из БД)
 * Значение: badge (CSS-класс: info, success, warning, danger) и label (русское название)
 */
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

/**
 * Получение стиля бейджа и метки для заданного статуса.
 * Если статус не найден в словаре — возвращается нейтральный info-бейдж
 * с оригинальной строкой статуса в качестве метки.
 *
 * @param status Строковый идентификатор статуса
 * @returns Объект с полями badge (CSS-класс) и label (текст)
 */
export function getStatusBadge(status: string): { badge: string; label: string } {
  return STATUS_MAP[status] || { badge: 'info', label: status };
}

/**
 * Экранирование спецсимволов HTML для безопасной вставки в DOM.
 * Заменяет &, <, >, " на соответствующие HTML-сущности.
 * Защита от XSS-атак при рендеринге пользовательского ввода.
 *
 * @param str Исходная строка (может быть null/undefined)
 * @returns Экранированная строка или пустая строка
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  // Порядок замен важен: & должен заменяться первым, иначе будут задвоения
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Создание debounce-обёртки для функции.
 * Откладывает вызов fn на ms миллисекунд после последнего вызова обёртки.
 * При повторном вызове в течение задержки предыдущий таймер сбрасывается.
 *
 * Используется для оптимизации поиска (отправка запроса после паузы ввода).
 *
 * @param fn Оборачиваемая функция
 * @param ms Задержка в миллисекундах
 * @returns Debounce-обёртка с той же сигнатурой, что и fn
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    // Сбрасываем предыдущий таймер при каждом новом вызове
    clearTimeout(timer);
    // Устанавливаем новый таймер на ms миллисекунд
    timer = setTimeout(() => fn(...args), ms);
  };
}
