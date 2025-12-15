import { type TaskItem, type ApiTaskResponse } from '@/types/tasks';
import { mapStatusFromBackend } from '@/utils/mapping/status';

export const flattenTasks = (items: ApiTaskResponse[], parentId: string | null = null): TaskItem[] => {
  const result: TaskItem[] = [];
  items.forEach((t) => {
    const taskId = t.id;
    const task: TaskItem = {
      id: taskId,
      parentId: parentId,
      title: t.title || '',
      description: t.description || '',
      category: t.category || undefined,
      priority: t.priority || null,
      estimatedTime: t.estimated_minutes ?? 0,
      deadline: t.due_date ? new Date(t.due_date) : null,
      isCompleted: t.status === 'completed',
      status: mapStatusFromBackend(t.status),
      // Start with an empty tag map; tags are populated via
      // the generic tag system (tag groups from backend) and
      // user edits in the tag modal.
      tags: {},
    };
    result.push(task);
    if (t.subtasks?.length) {
      result.push(...flattenTasks(t.subtasks, taskId));
    }
  });
  return result;
};
