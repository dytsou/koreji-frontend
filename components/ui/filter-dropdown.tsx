import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FilterDropdownProps<T extends string> = {
  label: string;
  selectedValue: T | T[];
  options: readonly T[];
  onSelect: (value: T | T[]) => void;
  multiple?: boolean;
};

export function FilterDropdown<T extends string>({
  label,
  selectedValue,
  options,
  onSelect,
  multiple = false,
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedValues = multiple
    ? (selectedValue as T[])
    : ([selectedValue].filter(Boolean) as T[]);

  const handleSelect = (value: T) => {
    if (multiple) {
      const currentValues = selectedValues;
      const isSelected = currentValues.includes(value);
      if (isSelected) {
        // Remove from selection
        const newValues = currentValues.filter((v) => v !== value);
        onSelect(newValues.length > 0 ? newValues : ([options[0]] as T[]));
      } else {
        // Add to selection (but exclude NO_SELECT if selecting something else)
        const filtered = currentValues.filter((v) => v !== (options[0] as T));
        onSelect([...filtered, value] as T[]);
      }
    } else {
      onSelect(value);
      setIsOpen(false);
    }
  };

  const getDisplayText = (): string => {
    if (multiple) {
      const noSelectOption = options[0] as T;
      const values = selectedValues.filter((v) => v !== noSelectOption);
      // If only NO_SELECT is selected, show it
      if (values.length === 0 && selectedValues.includes(noSelectOption)) {
        return noSelectOption;
      }
      // If no selections, show NO_SELECT
      if (values.length === 0) {
        return noSelectOption;
      }
      // If single selection, show it
      if (values.length === 1) {
        return values[0];
      }
      // If multiple selections, show count
      return `${values.length} selected`;
    }
    return selectedValue as string;
  };

  return (
    <View style={styles.filterItem}>
      <Text style={styles.filterLabel}>{label}</Text>
      <Pressable style={styles.filterValueBox} onPress={() => setIsOpen(true)}>
        <View style={styles.textContainer}>
          <Text style={styles.filterValue} numberOfLines={2} ellipsizeMode="tail">
            {getDisplayText()}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color="#4CAF50" style={styles.chevron} />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <Pressable onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color="#333333" />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = multiple
                  ? selectedValues.includes(item)
                  : selectedValue === item;
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name={multiple ? 'checkbox' : 'checkmark'}
                        size={20}
                        color="#4CAF50"
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
            {multiple && (
              <View style={styles.modalFooter}>
                <Pressable
                  style={styles.doneButton}
                  onPress={() => setIsOpen(false)}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </Pressable>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  filterItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  filterValueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    width: '100%',
    height: 56,
    gap: 4,
  },
  filterValue: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  chevron: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionItemSelected: {
    backgroundColor: '#F0F8F0',
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
  },
  optionTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

