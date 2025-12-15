import { type TaskStatus } from '@/types/task-status';
import { type BackendTaskStatus } from '@/utils/mapping/status';

export interface TaskItem {
  id: string;
  parentId: string | null;
  title: string;
  description: string;
  category?: string;
  /**
   * Priority is a first-class field on the Task model in the backend.
   * We treat it similarly to Category: it has a dedicated field here
   * and may also be represented as a "Priority" tag group in the UI.
   */
  priority?: string | null;
  estimatedTime: number;
  deadline?: Date | null;
  isCompleted: boolean;
  status: TaskStatus;
  /**
   * Dynamic tag groups keyed by group name (e.g. "Tools", "Mode", "Location").
   * The available groups and their tags come from the backend
   * (`/api/tasks/tag-groups` + `/api/tasks/tag-groups/{id}/tags`),
   * so this shape must stay generic rather than hard-coded.
   *
   * NOTE: The "Category" group is stored separately on `category` and
   * is not expected to live inside this map.
   */
  tags: Record<string, string[]>;
}

export interface ApiTaskResponse {
  id: string;
  parent_id: string | null;
  title: string;
  description?: string | null;
  category?: string | null;
  priority?: string | null;
  status: BackendTaskStatus;
  estimated_minutes?: number | null;
  due_date?: string | null;
  tags?: unknown[]; // tags not mapped in UI yet
  subtasks?: ApiTaskResponse[];
}

export interface TaskItemWithSubtasks extends TaskItem {
  subtasks: TaskItem[];
  displayTime: number;
}
