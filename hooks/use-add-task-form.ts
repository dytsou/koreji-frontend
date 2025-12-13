import { useState } from 'react';
import { type TaskTags } from '@/components/ui/tag-display-row';
import { type TaskStatus } from '@/types/task-status';
import { DEFAULT_TASK_STATUS } from '@/constants/task-status';
import { DEFAULT_CATEGORIES } from '@/constants/task-tags';

/**
 * Hook for managing main task form state
 */
export function useAddTaskForm() {
  const [mainTitle, setMainTitle] = useState('');
  const [mainDesc, setMainDesc] = useState('');
  const [mainTime, setMainTime] = useState('');
  const [mainDeadline, setMainDeadline] = useState<Date | null>(null);
  const [mainStatus, setMainStatus] = useState<TaskStatus>(DEFAULT_TASK_STATUS);
  const [mainTags, setMainTags] = useState<TaskTags>({
    tagGroups: {
      Category: [DEFAULT_CATEGORIES[0]],
    },
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  return {
    // State
    mainTitle,
    mainDesc,
    mainTime,
    mainDeadline,
    mainStatus,
    mainTags,
    showDatePicker,
    // Setters
    setMainTitle,
    setMainDesc,
    setMainTime,
    setMainDeadline,
    setMainStatus,
    setMainTags,
    setShowDatePicker,
  };
}
