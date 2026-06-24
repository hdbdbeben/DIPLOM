import { getStatusBadge } from '@/lib/utils';
import type { StatusKey } from '@/lib/utils';

export function StatusBadge({ status }: { status: string }) {
  const { badge, label } = getStatusBadge(status as StatusKey);
  return <span className={`badge badge-${badge}`}>{label}</span>;
}
