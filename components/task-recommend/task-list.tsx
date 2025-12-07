import { View, StyleSheet } from 'react-native';
import { TaskCard, Task } from './task-card';

interface TaskListProps {
  tasks: Task[];
  columns: number;
  cardWidth: number;
}

export function TaskList({ tasks, columns, cardWidth }: TaskListProps) {
  return (
    <View style={[styles.taskListContainer, styles.taskListContainerMasonry]}>
      {tasks.map((task, index) => {
        // Check if this is the last item in a row
        const isLastInRow = (index + 1) % columns === 0;
        // First task (index 0) is the recommended one
        const isRecommended = index === 0;
        return (
          <TaskCard
            key={task.id}
            task={task}
            width={cardWidth}
            isLastInRow={isLastInRow}
            isRecommended={isRecommended}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  taskListContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  taskListContainerMasonry: {
    // Always use masonry layout
  },
});



