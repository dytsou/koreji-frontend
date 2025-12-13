import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { post, patch, ApiClientError } from '@/services/api/client';
import { type LocalSubTask } from '@/types/add-task';
import { type TaskStatus } from '@/types/task-status';
import { TASK_SCREEN_STRINGS } from '@/constants/strings/tasks';
import { buildMainTaskPayload, buildSubtaskPayload, isExistingSubtask } from '@/utils/add-task/task-payload';
import { calculateTotalTime } from '@/utils/add-task/time-calculation';

/**
 * Hook for handling form submission (create/update task)
 */
export function useAddTaskSubmit(
  isEditMode: boolean,
  taskId: string | undefined,
  mainTitle: string,
  mainDesc: string,
  mainTime: string,
  mainDeadline: Date | null,
  mainStatus: TaskStatus,
  mainTags: any,
  subtasks: LocalSubTask[]
) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!mainTitle.trim()) {
      Alert.alert(TASK_SCREEN_STRINGS.addTask.alerts.errorTitle, TASK_SCREEN_STRINGS.addTask.alerts.errorMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      const calculatedTotalTimeValue = calculateTotalTime(subtasks, mainTime);
      const mainTaskPayload = buildMainTaskPayload(
        mainTitle,
        mainDesc,
        mainDeadline,
        mainStatus,
        calculatedTotalTimeValue,
        mainTags
      );

      if (isEditMode && taskId) {
        // Update existing task
        await patch(`/tasks/${taskId}`, mainTaskPayload);

        // Update subtasks
        if (subtasks.length > 0) {
          const subtaskPromises = subtasks.map(async (sub) => {
            const subtaskPayload = buildSubtaskPayload(sub);

            // Check if subtask exists (has UUID format) or is new
            if (isExistingSubtask(sub.id)) {
              // Update existing subtask
              return patch(`/tasks/subtasks/${sub.id}`, subtaskPayload);
            } else {
              // Create new subtask
              return post('/tasks/subtasks', {
                ...subtaskPayload,
                task_id: taskId,
              });
            }
          });

          await Promise.all(subtaskPromises);
        }
      } else {
        // Create new task
        const mainTaskResponse = await post<{ id: string; [key: string]: unknown }>('/tasks/', mainTaskPayload);
        const mainTaskId = mainTaskResponse.id;

        // Create subtasks if any
        if (subtasks.length > 0) {
          const subtaskPromises = subtasks.map(async (sub) => {
            const subtaskPayload = buildSubtaskPayload(sub, mainTaskId);
            return post('/tasks/subtasks', subtaskPayload);
          });

          await Promise.all(subtaskPromises);
        }
      }

      // Success - navigate back
      router.back();
    } catch (error) {
      console.error(`[${isEditMode ? 'Update' : 'Create'} Task] API error:`, error);
      let errorMessage = TASK_SCREEN_STRINGS.addTask.alerts.errorMessage;
      if (error instanceof ApiClientError) {
        errorMessage = error.message || errorMessage;
      }
      Alert.alert(TASK_SCREEN_STRINGS.addTask.alerts.errorTitle, errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
  };
}
