import { type TaskStatus } from '@/types/task-status';

// Task Tags Type
export interface TaskTags {
    priority?: 'High' | 'Medium' | 'Low';
    attention?: 'Focus' | 'Relax';
    tools: string[];
    place?: string; // Allow custom string
}

// Single Row Structure in Database
export interface TaskItem {
    id: string; // UUID
    parentId: string | null; // Key to distinguish main and subtasks
    title: string;
    description: string;
    category: string | null; // Only has value when parentId is null
    estimatedTime: number; // Minutes
    isCompleted: boolean;
    status: TaskStatus;
    tags: TaskTags;
    createdAt: number;
}