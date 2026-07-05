import { useState, useCallback, useRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { TaskItem } from './types';

export function useTasksBottomSheet(tasks: TaskItem[] = []) {
  const [isExpanded, setIsExpanded] = useState(false);
  const translateY = useSharedValue(0);
  const isExpandedShared = useSharedValue(false);
  const isExpandedSharedRef = useRef(isExpandedShared);

  const setExpanded = useCallback((expanded: boolean) => {
    setIsExpanded(expanded);
    isExpandedSharedRef.current.value = expanded;
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      isExpandedSharedRef.current.value = next;
      return next;
    });
  }, []);

  const expandSheet = useCallback(() => setExpanded(true), [setExpanded]);
  const collapseSheet = useCallback(() => setExpanded(false), [setExpanded]);

  return {
    isExpanded,
    isExpandedShared,
    translateY,
    displayTasks: tasks,
    toggleExpanded,
    expandSheet,
    collapseSheet,
  };
}
