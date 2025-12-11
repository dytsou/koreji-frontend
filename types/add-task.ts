import { type TaskTags } from '@/components/ui/tag-display-row';
import { type TaskStatus } from '@/types/task-status';

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

