import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface TaskTags {
    priority?: string;
    attention?: string;
    tools: string[];
    place?: string;
}

interface TagDisplayRowProps {
    tags: TaskTags;
    onEdit: () => void;
}

export function TagDisplayRow({ tags, onEdit }: TagDisplayRowProps) {
    return (
        <View style={styles.tagDisplayContainer}>
            <View style={styles.tagRow}>
                {tags.priority && (
                    <View style={[styles.miniTag, { backgroundColor: '#FFF3E0' }]}>
                        <Text style={[styles.miniTagText, { color: '#E65100' }]}>
                            {tags.priority}
                        </Text>
                    </View>
                )}
                {tags.attention && (
                    <View style={[styles.miniTag, { backgroundColor: '#F3E5F5' }]}>
                        <Text style={[styles.miniTagText, { color: '#7B1FA2' }]}>
                            {tags.attention}
                        </Text>
                    </View>
                )}
                {tags.place && (
                    <View style={[styles.miniTag, { backgroundColor: '#E0F2F1' }]}>
                        <Ionicons name="location" size={10} color="#00695C" />
                        <Text style={[styles.miniTagText, { color: '#00695C' }]}>
                            {tags.place}
                        </Text>
                    </View>
                )}
                {tags.tools.map(t => (
                    <View key={t} style={[styles.miniTag, { backgroundColor: '#E3F2FD' }]}>
                        <Text style={[styles.miniTagText, { color: '#1565C0' }]}>
                            {t}
                        </Text>
                    </View>
                ))}
            </View>
            <TouchableOpacity style={styles.addTagBtn} onPress={onEdit}>
                <Ionicons name="add" size={18} color="#666" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    tagDisplayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    tagRow: {
        flexDirection: 'row',
        gap: 6,
        flexWrap: 'wrap',
    },
    addTagBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    miniTagText: {
        fontSize: 11,
        fontWeight: '600',
    },
});
