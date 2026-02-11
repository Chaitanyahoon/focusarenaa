import { api } from './api';

export interface DailyQuest {
    id: number;
    title: string;
    description?: string;
    targetCount: number;
    unit: string;
    difficulty: number;
    currentCount: number;
    isCompleted: boolean;
}

export interface DailyQuestLog {
    id: number;
    dailyQuestId: number;
    date: string;
    currentCount: number;
    isCompleted: boolean;
    completedAt?: string;
}

export interface DailyQuestStatus {
    totalQuests: number;
    completedQuests: number;
    isAllCompleted: boolean;
    hasPenalty: boolean;
}

export const dailyQuestService = {
    getDailyQuests: async () => {
        const response = await api.get<DailyQuest[]>('/DailyQuest');
        return response.data;
    },

    createDailyQuest: async (data: { title: string; targetCount: number; unit: string; difficulty: number }) => {
        const response = await api.post<DailyQuest>('/DailyQuest', data);
        return response.data;
    },

    logProgress: async (id: number, count: number) => {
        const response = await api.post<DailyQuestLog>(`/DailyQuest/${id}/progress`, count, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    },

    getStatus: async () => {
        const response = await api.get<DailyQuestStatus>('/DailyQuest/status');
        return response.data;
    }
};
