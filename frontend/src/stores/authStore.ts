import { create } from 'zustand'
import { authAPI } from '../services/api'
import type { User, AuthResponse, LoginDto, RegisterDto } from '../types'

interface AuthStore {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null

    login: (data: LoginDto) => Promise<void>
    register: (data: RegisterDto) => Promise<void>
    checkAuth: () => Promise<void>
    fetchProfile: () => Promise<void>
    logout: () => void
    setUser: (user: User) => void
    clearError: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,

    login: async (data: LoginDto) => {
        set({ isLoading: true, error: null })
        try {
            const response: AuthResponse = await authAPI.login(data)
            localStorage.setItem('token', response.token)

            const user: User = {
                id: response.userId,
                name: response.name,
                email: response.email,
                xp: response.xp,
                level: response.level,
                streakCount: 0,
                joinDate: new Date().toISOString(),
                gold: 0 // Default until profile fetch
            }

            set({
                user,
                token: response.token,
                isAuthenticated: true,
                isLoading: false
            })
            // Fetch full profile to get Gold
            if (response.token) {
                // We can trigger fetchProfile but getting the store instance inside might be tricky.
                // Actually we can just call the internal logic or let the component do it.
                // Ideally authentication just sets basic info.
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Login failed',
                isLoading: false
            })
            throw error
        }
    },

    register: async (data: RegisterDto) => {
        set({ isLoading: true, error: null })
        try {
            const response: AuthResponse = await authAPI.register(data)
            localStorage.setItem('token', response.token)

            const user: User = {
                id: response.userId,
                name: response.name,
                email: response.email,
                xp: response.xp,
                level: response.level,
                streakCount: 0,
                joinDate: new Date().toISOString(),
                gold: 0
            }

            set({
                user,
                token: response.token,
                isAuthenticated: true,
                isLoading: false
            })
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Registration failed',
                isLoading: false
            })
            throw error
        }
    },

    logout: () => {
        localStorage.removeItem('token')
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null
        })
    },

    fetchProfile: async () => {
        try {
            const { profileAPI } = await import('../services/api')
            const userProfile = await profileAPI.get()

            const user: User = {
                id: userProfile.id,
                name: userProfile.name,
                email: userProfile.email,
                xp: userProfile.xp,
                level: userProfile.level,
                streakCount: userProfile.streakCount,
                joinDate: userProfile.joinDate,
                avatarUrl: userProfile.avatarUrl,
                gold: userProfile.gold ?? 0
            }

            set({ user })
        } catch (error) {
            console.error("Failed to fetch profile", error)
        }
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            set({ isAuthenticated: false, user: null, isLoading: false })
            return
        }

        set({ isLoading: true })
        try {
            const { profileAPI } = await import('../services/api')
            const userProfile = await profileAPI.get()

            const user: User = {
                id: userProfile.id,
                name: userProfile.name,
                email: userProfile.email,
                xp: userProfile.xp,
                level: userProfile.level,
                streakCount: userProfile.streakCount,
                joinDate: userProfile.joinDate,
                avatarUrl: userProfile.avatarUrl,
                gold: userProfile.gold ?? 0
            }

            set({
                user,
                isAuthenticated: true,
                isLoading: false
            })
        } catch (error) {
            console.error('Session restoration failed:', error)
            localStorage.removeItem('token')
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: 'Session expired'
            })
        }
    },

    setUser: (user: User) => {
        set({ user })
    },

    clearError: () => {
        set({ error: null })
    }
}))
