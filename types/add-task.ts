import { type TaskTags } from '@/components/ui/tag-display-row';
import { type TaskStatus } from '@/types/task-status';
import { type BackendTaskStatus } from '@/utils/mapping/status';

// Frontend local state type for subtasks
export interface LocalSubTask {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  deadline: Date | null;
  status: TaskStatus;
  tags: TaskTags;
}

// API response type for task data
export interface ApiTaskResponse {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  status: BackendTaskStatus;
  estimated_minutes?: number | null;
  due_date?: string | null;
  subtasks?: ApiTaskResponse[];
}

