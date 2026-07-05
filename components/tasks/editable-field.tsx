import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface EditableFieldProps {
  value: string;
  isNumeric?: boolean;
  textStyle?: any;
  containerStyle?: any;
  placeholder?: string;
  isReadOnly?: boolean;
  onSave: (newValue: string) => void;
}

export function EditableField({
  value,
  isNumeric,
  textStyle,
  containerStyle,
  placeholder,
  isReadOnly = false,
  onSave,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = () => {
    if (isReadOnly) return;
    setEditValue(value);
    setIsEditing(true);
  };

  const handleSubmit = () => {
    setIsEditing(false);
    // Update only if the value has changed
    if (editValue !== value) {
      onSave(editValue);
    }
  };

  if (isEditing) {
    return (
      <View style={[containerStyle, styles.inputWrapper]}>
        <TextInput
          value={editValue}
          onChangeText={setEditValue}
          onSubmitEditing={handleSubmit} // Trigger save when pressing Enter
          onBlur={handleSubmit} // Trigger save when losing focus
          autoFocus
          keyboardType={isNumeric ? 'numeric' : 'default'}
          style={[textStyle, { padding: 0, minWidth: 40 }]} // Keep the same style as the original text
          returnKeyType="done"
        />
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={handleStartEdit}
      onPressIn={(e) => {
        // Prevent event from bubbling to parent Pressable
        e.stopPropagation?.();
      }}
      style={containerStyle}
      activeOpacity={isReadOnly ? 1 : 0.6}
    >
      <Text
        style={[
          textStyle,
          isReadOnly && { opacity: 0.6 }, // When read-only, slightly fade out
        ]}
      >
        {value || placeholder}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    flex: 1,
  },
});
