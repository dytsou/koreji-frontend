import { useState } from 'react';
import { type TaskTags } from '@/components/ui/tag-display-row';
import { type TaskItem } from '@/types/tasks';
import { TAG_GROUPS, DEFAULT_TAG_GROUP_ORDER, TAG_GROUP_COLORS } from '@/constants/task-tags';
import { buildTaskTagsFromTask, buildTaskFieldsFromSelection } from '@/utils/tasks/task-tags';

/**
 * Hook for managing tag modal state and tag editing logic for tasks screen
 */
export function useTaskTags(tasks: TaskItem[], updateTaskField: (id: string, field: keyof TaskItem, value: any) => Promise<void>, setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>) {
  const [editingTagTarget, setEditingTagTarget] = useState<'main' | string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [tempTags, setTempTags] = useState<TaskTags>({ tagGroups: {} });
  const [tagGroups, setTagGroups] = useState<{ [groupName: string]: string[] }>(
    Object.fromEntries(Object.entries(TAG_GROUPS).map(([name, data]) => [name, data.tags]))
  );
  const [tagGroupOrder, setTagGroupOrder] = useState<string[]>(DEFAULT_TAG_GROUP_ORDER);
  const [tagGroupColors, setTagGroupColors] = useState<{ [groupName: string]: { bg: string; text: string } }>(
    Object.fromEntries(Object.entries(TAG_GROUPS).map(([name, data]) => [name, data.color]))
  );
  const [showTagGroupInput, setShowTagGroupInput] = useState(false);
  const [newTagGroupName, setNewTagGroupName] = useState('');
  const [editingTagInGroup, setEditingTagInGroup] = useState<{ groupName: string } | null>(null);
  const [newTagInGroupName, setNewTagInGroupName] = useState('');

  const openTagModalForTask = (taskId: string, isMainTask: boolean) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const currentTags = buildTaskTagsFromTask(task);
    if (isMainTask) {
      setTempTags(currentTags);
      setEditingTagTarget('main');
    } else {
      const { Category, ...rest } = currentTags.tagGroups || {};
      setTempTags({ tagGroups: rest });
      setEditingTagTarget(taskId);
    }
    setEditingTaskId(taskId);
    setShowTagGroupInput(false);
    setNewTagGroupName('');
    setEditingTagInGroup(null);
    setNewTagInGroupName('');
  };

  const toggleTagInGroup = (groupName: string, tag: string) => {
    const currentTagGroups = tempTags.tagGroups || {};
    const groupTags = currentTagGroups[groupName] || [];
    const groupConfig = TAG_GROUPS[groupName] || { isSingleSelect: false, allowAddTags: true };

    let updatedGroupTags: string[];
    if (groupConfig.isSingleSelect) {
      updatedGroupTags = groupTags.includes(tag) ? [] : [tag];
    } else {
      updatedGroupTags = groupTags.includes(tag) ? groupTags.filter((t) => t !== tag) : [...groupTags, tag];
    }

    setTempTags({
      ...tempTags,
      tagGroups: {
        ...currentTagGroups,
        [groupName]: updatedGroupTags,
      },
    });
  };

  const handleAddTagToGroup = (groupName: string) => {
    setEditingTagInGroup({ groupName });
  };

  const handleSaveTagToGroup = () => {
    if (
      editingTagInGroup &&
      newTagInGroupName.trim() &&
      !tagGroups[editingTagInGroup.groupName]?.includes(newTagInGroupName.trim())
    ) {
      const trimmedTag = newTagInGroupName.trim();
      setTagGroups((prev) => ({
        ...prev,
        [editingTagInGroup.groupName]: [...(prev[editingTagInGroup.groupName] || []), trimmedTag],
      }));

      if (editingTagInGroup.groupName === 'Category') {
        const currentTagGroups = tempTags.tagGroups || {};
        const groupConfig = TAG_GROUPS['Category'] || { isSingleSelect: true };
        if (groupConfig.isSingleSelect) {
          setTempTags({
            ...tempTags,
            tagGroups: {
              ...currentTagGroups,
              Category: [trimmedTag],
            },
          });
        }
      }
    }
    setEditingTagInGroup(null);
    setNewTagInGroupName('');
  };

  const handleAddNewTagGroup = () => {
    setShowTagGroupInput(true);
  };

  const handleSaveNewTagGroup = () => {
    const trimmedTagGroup = newTagGroupName.trim();
    if (trimmedTagGroup && !tagGroups[trimmedTagGroup]) {
      setTagGroups((prev) => ({
        ...prev,
        [trimmedTagGroup]: [],
      }));
      setTagGroupOrder((prev) => [...prev, trimmedTagGroup]);

      const existingGroupNames = Object.keys(tagGroupColors);
      const usedColorIndices = existingGroupNames
        .map((name) =>
          TAG_GROUP_COLORS.findIndex(
            (c) => c.bg === tagGroupColors[name].bg && c.text === tagGroupColors[name].text
          )
        )
        .filter((idx) => idx !== -1);

      let colorIndex = 0;
      for (let i = 0; i < TAG_GROUP_COLORS.length; i++) {
        if (!usedColorIndices.includes(i)) {
          colorIndex = i;
          break;
        }
      }
      const selectedColor = TAG_GROUP_COLORS[colorIndex % TAG_GROUP_COLORS.length];

      setTagGroupColors((prev) => ({
        ...prev,
        [trimmedTagGroup]: selectedColor,
      }));

      const currentTagGroups = tempTags.tagGroups || {};
      setTempTags({
        ...tempTags,
        tagGroups: {
          ...currentTagGroups,
          [trimmedTagGroup]: [],
        },
      });
    }
    setShowTagGroupInput(false);
    setNewTagGroupName('');
  };

  const saveTagsForTask = async () => {
    if (!editingTaskId) {
      setEditingTagTarget(null);
      return;
    }

    const includeCategory = editingTagTarget === 'main';
    const selection = includeCategory
      ? tempTags
      : (() => {
          const { Category, ...rest } = tempTags.tagGroups || {};
          return { tagGroups: rest };
        })();

    const { categoryValue, nextTags } = buildTaskFieldsFromSelection(selection, includeCategory);

    const currentTask = tasks.find((t) => t.id === editingTaskId);
    if (currentTask) {
      console.log('[Tag Update] Task:', editingTaskId, 'New tags:', selection.tagGroups);

      // Update category in backend if it changed
      if (includeCategory && categoryValue !== currentTask.category) {
        await updateTaskField(editingTaskId, 'category', categoryValue || null);
      }
    }

    // Update local state
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== editingTaskId) return t;
        const nextTask: TaskItem = {
          ...t,
          tags: {
            ...t.tags,
            ...nextTags,
            tools: nextTags.tools || [],
          },
        };
        if (includeCategory) {
          nextTask.category = categoryValue || t.category;
        }
        return nextTask;
      })
    );

    setEditingTagTarget(null);
    setEditingTaskId(null);
    setShowTagGroupInput(false);
    setNewTagGroupName('');
    setEditingTagInGroup(null);
    setNewTagInGroupName('');
  };

  const closeTagModal = () => {
    setEditingTagTarget(null);
    setEditingTaskId(null);
  };

  const handleCancelTagInGroup = () => {
    setEditingTagInGroup(null);
    setNewTagInGroupName('');
  };

  const handleCancelTagGroup = () => {
    setShowTagGroupInput(false);
    setNewTagGroupName('');
  };

  return {
    // State
    editingTagTarget,
    editingTaskId,
    tempTags,
    tagGroups,
    tagGroupOrder,
    tagGroupColors,
    showTagGroupInput,
    newTagGroupName,
    editingTagInGroup,
    newTagInGroupName,
    // Actions
    openTagModalForTask,
    toggleTagInGroup,
    handleAddTagToGroup,
    handleSaveTagToGroup,
    handleAddNewTagGroup,
    handleSaveNewTagGroup,
    saveTagsForTask,
    closeTagModal,
    handleCancelTagInGroup,
    handleCancelTagGroup,
    setNewTagInGroupName,
    setNewTagGroupName,
  };
}
