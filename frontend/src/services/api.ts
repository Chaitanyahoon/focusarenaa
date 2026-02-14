import axios from 'axios'
import type {
    AuthResponse,
    LoginDto,
    RegisterDto,
    Task,
    CreateTaskDto,
    UserProfile,
    Badge,
    LeaderboardEntry,
    XPHistoryData,
    CategoryDistribution,
    StreakDay,
    WeeklyProductivityResponse,
    DashboardStats,
    FriendResponseDto
} from '../types'

import { API_BASE } from '../config'

const API_BASE_URL = API_BASE
console.log('🔌 API Base URL:', API_BASE_URL, '| Mode:', import.meta.env.MODE)

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Auth API
export const authAPI = {
    login: async (data: LoginDto): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', data)
        return response.data
    },

    register: async (data: RegisterDto): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data)
        return response.data
    },

    requestPasswordReset: async (email: string) => {
        const response = await api.post('/auth/request-password-reset', { email })
        return response.data
    },

    resetPassword: async (token: string, newPassword: string) => {
        const response = await api.post('/auth/reset-password', { token, newPassword })
        return response.data
    }
}

// Task API
export const taskAPI = {
    getAll: async (): Promise<Task[]> => {
        const response = await api.get<Task[]>('/tasks')
        return response.data
    },

    create: async (data: CreateTaskDto): Promise<Task> => {
        const response = await api.post<Task>('/tasks', data)
        return response.data
    },

    update: async (id: number, data: Partial<CreateTaskDto>): Promise<void> => {
        await api.put(`/tasks/${id}`, data)
    },

    updateStatus: async (id: number, status: number): Promise<void> => {
        await api.put(`/tasks/${id}/status`, { status })
    },

    complete: async (id: number): Promise<any> => {
        const response = await api.put(`/tasks/${id}/complete`)
        return response.data
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/tasks/${id}`)
    }
}

// Profile API
export const profileAPI = {
    get: async (): Promise<UserProfile> => {
        const response = await api.get<UserProfile>('/profile')
        return response.data
    },

    getById: async (id: number): Promise<UserProfile> => {
        const response = await api.get<UserProfile>(`/profile/${id}`)
        return response.data
    },

    update: async (data: Partial<UserProfile>): Promise<void> => {
        await api.put('/profile', data)
    },

    getBadges: async (): Promise<Badge[]> => {
        const response = await api.get<Badge[]>('/profile/badges')
        return response.data
    }
}

// Leaderboard API
export const leaderboardAPI = {
    getGlobal: async (): Promise<LeaderboardEntry[]> => {
        const response = await api.get<LeaderboardEntry[]>('/leaderboard/global')
        return response.data
    },

    getWeekly: async (): Promise<LeaderboardEntry[]> => {
        const response = await api.get<LeaderboardEntry[]>('/leaderboard/weekly')
        return response.data
    }
}

// Analytics API
export const analyticsAPI = {
    getXPHistory: async (days: number = 30): Promise<{ period: string; currentXP: number; data: XPHistoryData[] }> => {
        const response = await api.get(`/analytics/xp-history?days=${days}`)
        return response.data
    },

    getCategoryDistribution: async (): Promise<CategoryDistribution[]> => {
        const response = await api.get('/analytics/category-distribution')
        return response.data
    },

    getStreakCalendar: async (days: number = 90): Promise<{ currentStreak: number; totalActiveDays: number; calendar: StreakDay[] }> => {
        const response = await api.get(`/analytics/streak-calendar?days=${days}`)
        return response.data
    },

    getWeeklyProductivity: async (): Promise<WeeklyProductivityResponse> => {
        const response = await api.get('/analytics/weekly-productivity')
        return response.data
    },

    getDashboardStats: async (): Promise<DashboardStats> => {
        const response = await api.get('/analytics/dashboard-stats')
        return response.data
    }
}

// Chat API
export const chatAPI = {
    getRecent: async (): Promise<any[]> => {
        const response = await api.get('/chat/recent')
        return response.data
    },

    getHistory: async (otherUserId: number): Promise<any[]> => {
        const response = await api.get(`/chat/history/${otherUserId}`)
        return response.data
    },

    searchUsers: async (query: string): Promise<any[]> => {
        const response = await api.get(`/chat/search?query=${query}`)
        return response.data
    }
}

// Friend API
export const friendAPI = {
    getFriends: async (): Promise<FriendResponseDto[]> => {
        const response = await api.get<FriendResponseDto[]>('/friend')
        return response.data
    },

    getRequests: async (): Promise<FriendResponseDto[]> => {
        const response = await api.get<FriendResponseDto[]>('/friend/requests')
        return response.data
    },

    sendRequest: async (targetUserId: number): Promise<void> => {
        await api.post(`/friend/request/${targetUserId}`)
    },

    respondToRequest: async (requestId: number, accept: boolean): Promise<void> => {
        await api.post(`/friend/respond/${requestId}?accept=${accept}`)
    },

    removeFriend: async (friendshipId: number): Promise<void> => {
        await api.delete(`/friend/${friendshipId}`)
    }
}

// Admin API
export const adminAPI = {
    getGuilds: async (search: string = ''): Promise<any[]> => {
        const response = await api.get(`/admin/guilds?search=${search}`)
        return response.data
    },

    deleteGuild: async (id: number): Promise<void> => {
        await api.delete(`/admin/guilds/${id}`)
    },

    createGlobalQuest: async (data: { title: string; description: string; targetCount: number; unit: string; difficulty: number }): Promise<void> => {
        await api.post('/dailyquest/custom', data)
    },
    createGlobalGate: async (data: { title: string; description: string; rank: number; deadline?: string; bossName?: string; type?: string }): Promise<void> => {
        await api.post('/gates/admin/create-global', data)
    }
}

// Guild Raid API
export const guildRaidAPI = {
    getActive: async (guildId: number): Promise<any> => {
        try {
            const response = await api.get(`/guildraid/${guildId}/active`)
            return response.data
        } catch (error) {
            return null // Return null if not found (404)
        }
    },

    start: async (data: { title: string; description?: string; totalHP: number; bossName?: string }): Promise<any> => {
        const response = await api.post('/guildraid/start', data)
        return response.data
    },

    assignTask: async (data: { raidId: number; targetUserId: number; title: string; description?: string; difficulty: number }): Promise<Task> => {
        const response = await api.post('/guildraid/assign', data)
        return response.data
    }
}

export { api }
