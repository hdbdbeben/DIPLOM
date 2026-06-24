import { getStatusBadge } from '@/lib/utils';
import type { StatusKey } from '@/lib/utils';

/**
 * Бейдж статуса. Отображает цветной индикатор с текстовой меткой,
 * соответствующий переданному значению статуса.
 *
 * Использует утилиту getStatusBadge для получения CSS-класса (badge) и
 * локализованной метки (label) на основе ключа статуса.
 * Приведение типа status к StatusKey необходимо для сопоставления
 * строкового значения с допустимыми ключами словаря статусов.
 *
 * @param props.status - Строковый идентификатор статуса (например, 'active', 'error', 'pending')
 * @component
 */
export function StatusBadge({ status }: { status: string }) {
  const { badge, label } = getStatusBadge(status as StatusKey);
  return <span className={`badge badge-${badge}`}>{label}</span>;
}
