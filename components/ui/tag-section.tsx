import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { TagChip } from './tag-chip';

interface TagSectionProps {
    title: string;
    options: string[];
    selectedValue?: string;
    onSelect: (value: string) => void;
    selectedStyle?: ViewStyle;
    isMultiSelect?: boolean;
    selectedValues?: string[];
}

export function TagSection({ 
    title, 
    options, 
    selectedValue, 
    onSelect, 
    selectedStyle,
    isMultiSelect = false,
    selectedValues = []
}: TagSectionProps) {
    return (
        <>
            <Text style={styles.modalLabel}>{title}</Text>
            <View style={styles.chipContainer}>
                {options.map(option => {
                    const isSelected = isMultiSelect
                        ? selectedValues.includes(option)
                        : selectedValue === option;
                    
                    return (
                        <TagChip
                            key={option}
                            label={option}
                            isSelected={isSelected}
                            onPress={() => onSelect(option)}
                            selectedStyle={selectedStyle}
                        />
                    );
                })}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    modalLabel: {
        marginTop: 16,
        marginBottom: 8,
        fontWeight: '600',
        color: '#666',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
});
