import { useState } from 'react';
import { type TaskTags } from '@/components/ui/tag-display-row';
import { type LocalSubTask } from '@/types/add-task';
import { TAG_GROUPS, DEFAULT_TAG_GROUP_ORDER, TAG_GROUP_COLORS } from '@/constants/task-tags';

/**
 * Hook for managing tag modal state and tag editing logic
 */
export function useAddTaskTags(mainTags: TaskTags, subtasks: LocalSubTask[]) {
  const [editingTarget, setEditingTarget] = useState<'main' | string | null>(null);
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

  const openTagModal = (target: 'main' | string) => {
    setEditingTarget(target);
    if (target === 'main') {
      setTempTags({ ...mainTags });
    } else {
      const sub = subtasks.find((s) => s.id === target);
      if (sub) {
        // Remove Category from subtask tags
        const { Category, ...subTagsWithoutCategory } = sub.tags.tagGroups || {};
        setTempTags({ tagGroups: subTagsWithoutCategory });
      }
    }
    setShowTagGroupInput(false);
    setNewTagGroupName('');
    setEditingTagInGroup(null);
    setNewTagInGroupName('');
  };

  const saveTags = (onMainTagsSave: (tags: TaskTags) => void, onSubtaskTagsSave: (subtaskId: string, tags: TaskTags) => void) => {
    if (editingTarget === 'main') {
      onMainTagsSave(tempTags);
    } else if (typeof editingTarget === 'string') {
      // Ensure Category is removed from subtask tags
      const { Category, ...tagsWithoutCategory } = tempTags.tagGroups || {};
      onSubtaskTagsSave(editingTarget, { tagGroups: tagsWithoutCategory });
    }
    setEditingTarget(null);
    setShowTagGroupInput(false);
    setNewTagGroupName('');
    setEditingTagInGroup(null);
    setNewTagInGroupName('');
  };

  const handleAddNewTagGroup = () => {
    setShowTagGroupInput(true);
  };

  const handleSaveNewTagGroup = () => {
    const trimmedTagGroup = newTagGroupName.trim();
    if (trimmedTagGroup && !tagGroups[trimmedTagGroup]) {
      // Create a new tag group category with empty tags array
      setTagGroups((prev) => ({
        ...prev,
        [trimmedTagGroup]: [],
      }));
      // Add to order array (at the end to maintain creation order)
      setTagGroupOrder((prev) => [...prev, trimmedTagGroup]);

      // Automatically assign a color (rotate through available colors)
      const existingGroupNames = Object.keys(tagGroupColors);
      const usedColorIndices = existingGroupNames
        .map((name) =>
          TAG_GROUP_COLORS.findIndex(
            (c) => c.bg === tagGroupColors[name].bg && c.text === tagGroupColors[name].text
          )
        )
        .filter((idx) => idx !== -1);

      // Find first unused color, or cycle through if all are used
      let colorIndex = 0;
      for (let i = 0; i < TAG_GROUP_COLORS.length; i++) {
        if (!usedColorIndices.includes(i)) {
          colorIndex = i;
          break;
        }
      }
      // If all colors are used, cycle through starting from 0
      const selectedColor = TAG_GROUP_COLORS[colorIndex % TAG_GROUP_COLORS.length];

      // Store the automatically selected color for this tag group
      setTagGroupColors((prev) => ({
        ...prev,
        [trimmedTagGroup]: selectedColor,
      }));
      // Initialize empty selected tags for this group
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

  const toggleTagInGroup = (groupName: string, tag: string) => {
    const currentTagGroups = tempTags.tagGroups || {};
    const groupTags = currentTagGroups[groupName] || [];
    const groupConfig = TAG_GROUPS[groupName] || { isSingleSelect: false, allowAddTags: true };

    // Handle single-select groups
    let updatedGroupTags: string[];
    if (groupConfig.isSingleSelect) {
      // Single-select: replace with new tag or clear if same tag clicked
      updatedGroupTags = groupTags.includes(tag) ? [] : [tag];
    } else {
      // Multi-select: toggle tag
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

      // If adding to Category group and it's currently selected in tempTags, auto-select it
      if (editingTagInGroup.groupName === 'Category') {
        const currentTagGroups = tempTags.tagGroups || {};
        const groupConfig = TAG_GROUPS['Category'] || { isSingleSelect: true };
        if (groupConfig.isSingleSelect) {
          // Auto-select the newly added category
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

  const handleCancelTagInGroup = () => {
    setEditingTagInGroup(null);
    setNewTagInGroupName('');
  };

  const handleCancelTagGroup = () => {
    setShowTagGroupInput(false);
    setNewTagGroupName('');
  };

  const closeTagModal = () => {
    setEditingTarget(null);
  };

  return {
    // State
    editingTarget,
    tempTags,
    tagGroups,
    tagGroupOrder,
    tagGroupColors,
    showTagGroupInput,
    newTagGroupName,
    editingTagInGroup,
    newTagInGroupName,
    // Actions
    openTagModal,
    saveTags,
    handleAddNewTagGroup,
    handleSaveNewTagGroup,
    toggleTagInGroup,
    handleAddTagToGroup,
    handleSaveTagToGroup,
    handleCancelTagInGroup,
    handleCancelTagGroup,
    closeTagModal,
    setNewTagInGroupName,
    setNewTagGroupName,
  };
}
