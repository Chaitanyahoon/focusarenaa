import axios from 'axios'
import { API_BASE } from '../config'
import type { AuthResponse, CreateTaskDto, LoginDto, DashboardStats, Task, UserProfile, Gate, LeaderboardEntry, ChatUser } from '../types'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export const authAPI = {
  async login(data: LoginDto) {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  },
  async register(data: import('../types').RegisterDto) {
    const response = await api.post<AuthResponse>('/auth/register', data)
    return response.data
  },
}

export const profileAPI = {
  async get() {
    const response = await api.get<UserProfile>('/profile')
    return response.data
  },
}

export const analyticsAPI = {
  async getDashboardStats() {
    const response = await api.get<DashboardStats>('/analytics/dashboard-stats')
    return response.data
  },
}

export const taskAPI = {
  async getAll() {
    const response = await api.get<Task[]>('/tasks')
    return response.data
  },

  async complete(id: number) {
    const response = await api.put(`/tasks/${id}/complete`)
    return response.data
  },

  async create(data: CreateTaskDto) {
    const response = await api.post<Task>('/tasks', data)
    return response.data
  },

  async delete(id: number) {
    const response = await api.delete(`/tasks/${id}`)
    return response.data
  },
}

export const gateAPI = {
  async getActive() {
    const response = await api.get<Gate[]>('/gates/active')
    return response.data
  },

  async generateProcedural() {
    const response = await api.post<Gate>('/gates/procedural')
    return response.data
  },
}

export const leaderboardAPI = {
  async getGlobal(limit = 100) {
    const response = await api.get<LeaderboardEntry[]>(`/leaderboard/global?limit=${limit}`)
    return response.data
  },

  async getWeekly(limit = 100) {
    const response = await api.get<LeaderboardEntry[]>(`/leaderboard/weekly?limit=${limit}`)
    return response.data
  },
}

export const chatAPI = {
  async getRecentChats() {
    const response = await api.get<ChatUser[]>('/chat/recent')
    return response.data
  },

  async searchUsers(query: string) {
    const response = await api.get<ChatUser[]>(`/chat/search?query=${query}`)
    return response.data
  },
}

export const guildAPI = {
  async getMyGuild() {
    const response = await api.get<import('../types').Guild>('/Guilds/my')
    return response.data
  },

  async search(query: string = '') {
    const response = await api.get<import('../types').Guild[]>(`/Guilds?query=${query}`)
    return response.data
  },

  async create(data: import('../types').CreateGuildDto) {
    const response = await api.post<import('../types').Guild>('/Guilds', data)
    return response.data
  },

  async join(guildId: number, data?: import('../types').JoinGuildDto) {
    const response = await api.post(`/Guilds/${guildId}/join`, data || {})
    return response.data
  },

  async leave() {
    const response = await api.post('/Guilds/leave')
    return response.data
  },
}
