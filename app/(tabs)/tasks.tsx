import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// --- 資料型別 (對應資料庫同一張表的結構) ---
interface TaskItem {
  id: string;
  parentId: string | null; // 用來判斷是主還是子
  title: string;
  description: string;
  category?: string;       // 子任務此欄位為 null
  estimatedTime: number;
  isCompleted: boolean;
  tags: {
    priority?: string;
    attention?: string;
    tools: string[];
    place?: string;        // 新增 Place
  };
}

// --- 扁平化的假資料 (模擬資料庫直接 Select All 的結果) ---
const FLAT_TASKS_DB: TaskItem[] = [
  // 任務 1: 主任務
  {
    id: '1', parentId: null, title: '完成期末報告', description: '包含文獻回顧', category: 'School', estimatedTime: 180, isCompleted: false,
    tags: { tools: [] }
  },
  // 任務 1 的子任務
  {
    id: '101', parentId: '1', title: '找文獻', description: '至少五篇', estimatedTime: 60, isCompleted: true,
    tags: { priority: 'High', attention: 'Focus', tools: ['Computer'], place: 'Library' }
  },
  {
    id: '102', parentId: '1', title: '寫緒論', description: '', estimatedTime: 120, isCompleted: false,
    tags: { priority: 'Medium', attention: 'Focus', tools: ['Computer'], place: 'Dorm' }
  },

  // 任務 2: 單獨任務 (無子任務)
  {
    id: '2', parentId: null, title: '整理房間', description: '週末大掃除', category: 'Home', estimatedTime: 45, isCompleted: false,
    tags: { priority: 'Low', attention: 'Relax', tools: [], place: 'Home' }
  }
];

export default function TasksScreen() {
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // --- 資料轉換邏輯 (Flat -> Tree) ---
  // 這段通常在前端做，或是後端用 ORM 處理好再丟過來
  // 這裡演示前端如何處理扁平資料
  const structuredTasks = useMemo(() => {
    // 1. 找出所有主任務
    const mainTasks = FLAT_TASKS_DB.filter(t => t.parentId === null);

    // 2. 將子任務掛載到對應的主任務下
    return mainTasks.map(main => {
      const subtasks = FLAT_TASKS_DB.filter(t => t.parentId === main.id);
      return {
        ...main,
        subtasks: subtasks // 這裡臨時加一個屬性給 UI 渲染用
      };
    });
  }, []);

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  };

  const renderItem = ({ item }: { item: TaskItem & { subtasks: TaskItem[] } }) => {
    const isExpanded = expandedIds.has(item.id);
    const hasSubtasks = item.subtasks.length > 0;

    // 計算進度
    const totalSub = item.subtasks.length;
    const completedSub = item.subtasks.filter(s => s.isCompleted).length;
    // 如果沒有子任務，進度條看自己是否完成 (或直接顯示 0%)
    const progressPercent = totalSub > 0 ? (completedSub / totalSub) * 100 : (item.isCompleted ? 100 : 0);

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.taskHeader}
          onPress={() => hasSubtasks && toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          {/* Header Top */}
          <View style={styles.headerTop}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category || 'TASK'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>{item.title}</Text>
            </View>
            {/* 只有有子任務時才顯示箭頭 */}
            {hasSubtasks && (
              <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#999" />
            )}
          </View>

          {item.description ? <Text style={styles.taskDesc}>{item.description}</Text> : null}

          {/* 如果是單獨任務，直接顯示它的 Tag 在這裡 */}
          {!hasSubtasks && (
            <View style={styles.tagsRow}>
              <Text style={styles.tagTime}>⏱ {item.estimatedTime} min</Text>
              <TagsDisplay tags={item.tags} />
            </View>
          )}

          {/* 進度條 (有子任務才顯示，或統一顯示) */}
          {hasSubtasks && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progressPercent)}%</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 展開子任務 */}
        {isExpanded && hasSubtasks && (
          <View style={styles.subtaskList}>
            {item.subtasks.map((sub) => (
              <View key={sub.id} style={styles.subtaskContainer}>
                <View style={styles.subtaskRow}>
                  <Ionicons name={sub.isCompleted ? "checkbox" : "square-outline"} size={20} color={sub.isCompleted ? "#4CAF50" : "#999"} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.subtaskText, sub.isCompleted && styles.completedText]}>{sub.title}</Text>
                    {sub.description ? <Text style={styles.subtaskDesc}>{sub.description}</Text> : null}
                  </View>
                </View>

                {/* 子任務 Meta 資料 */}
                <View style={styles.tagsRow}>
                  <Text style={styles.tagTime}>⏱ {sub.estimatedTime} min</Text>
                  <TagsDisplay tags={sub.tags} />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task List</Text>
      </View>
      <FlatList
        data={structuredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/add_task')}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// 抽離出一個簡單的 Tag 顯示小組件，避免重複代碼
const TagsDisplay = ({ tags }: { tags: TaskItem['tags'] }) => (
  <>
    {tags.place && <View style={[styles.miniTag, { backgroundColor: '#E0F2F1' }]}><Text style={[styles.miniTagText, { color: '#00695C' }]}>{tags.place}</Text></View>}
    {tags.priority && <View style={[styles.miniTag, { backgroundColor: '#FFF3E0' }]}><Text style={[styles.miniTagText, { color: '#E65100' }]}>{tags.priority}</Text></View>}
    {tags.attention && <View style={[styles.miniTag, { backgroundColor: '#F3E5F5' }]}><Text style={[styles.miniTagText, { color: '#7B1FA2' }]}>{tags.attention}</Text></View>}
    {tags.tools.slice(0, 2).map(t => <View key={t} style={[styles.miniTag, { backgroundColor: '#E3F2FD' }]}><Text style={[styles.miniTagText, { color: '#1565C0' }]}>{t}</Text></View>)}
  </>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  listContent: { padding: 16, paddingBottom: 80 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden', elevation: 2 },
  taskHeader: { padding: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  categoryBadge: { backgroundColor: '#333', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  categoryText: { fontSize: 10, fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' },
  taskTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  taskDesc: { fontSize: 14, color: '#666', marginBottom: 10 },

  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  progressBarBg: { flex: 1, height: 6, backgroundColor: '#eee', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 3 },
  progressText: { fontSize: 12, color: '#888', width: 40, textAlign: 'right' },

  subtaskList: { backgroundColor: '#FAFAFA', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingVertical: 4 },
  subtaskContainer: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  subtaskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  subtaskText: { fontSize: 15, color: '#333', fontWeight: '500' },
  subtaskDesc: { fontSize: 13, color: '#888', marginTop: 2 },
  completedText: { textDecorationLine: 'line-through', color: '#aaa' },

  tagsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginLeft: 0 },
  tagTime: { fontSize: 12, color: '#888', marginRight: 4 },
  miniTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  miniTagText: { fontSize: 10, fontWeight: '600' },

  fab: { position: 'absolute', right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#2196f3', justifyContent: 'center', alignItems: 'center', elevation: 5 },
});