import { type TaskStatus } from '@/types/task-status';

/**
 * Checks if a task status is considered complete
 */
export function isStatusComplete(status: TaskStatus): boolean {
  return status === 'Done' || status === 'Archive';
}
