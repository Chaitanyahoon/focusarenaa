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
    WeeklyProductivity,
    DashboardStats
} from '../types'

const API_BASE_URL = '/api'

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

    update: async (data: { name?: string; bio?: string; avatarUrl?: string; theme?: string }): Promise<void> => {
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

    getWeeklyProductivity: async (): Promise<WeeklyProductivity[]> => {
        const response = await api.get('/analytics/weekly-productivity')
        return response.data
    },

    getDashboardStats: async (): Promise<DashboardStats> => {
        const response = await api.get('/analytics/dashboard-stats')
        return response.data
    }
}

export { api }
