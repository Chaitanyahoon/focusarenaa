import { create } from 'zustand'
import { setAuthToken, authAPI, profileAPI, analyticsAPI, taskAPI, gateAPI } from '../services/api'
import { storage } from '../utils/storage'
import { notificationService } from '../services/notifications'
import type { AuthResponse, UserProfile, DashboardStats, Task, LoginDto, Gate } from '../types'

interface AppState {
  booting: boolean
  authLoading: boolean
  dashboardLoading: boolean
  auth: AuthResponse | null
  profile: UserProfile | null
  stats: DashboardStats | null
  tasks: Task[]
  gates: Gate[]
  gateLoading: boolean
  error: string

  init: () => Promise<void>
  login: (data: LoginDto) => Promise<void>
  register: (data: import('../types').RegisterDto) => Promise<void>
  logout: () => Promise<void>
  hydrateDashboard: () => Promise<void>
  completeTask: (taskId: number) => Promise<void>
  createTask: (data: import('../types').CreateTaskDto) => Promise<void>
  deleteTask: (taskId: number) => Promise<void>
  fetchGate: () => Promise<void>
  scanAnomaly: () => Promise<void>
  setError: (error: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  booting: true,
  authLoading: false,
  dashboardLoading: false,
  auth: null,
  profile: null,
  stats: null,
  tasks: [],
  gates: [],
  gateLoading: false,
  error: '',

  init: async () => {
    try {
      const storedAuth = await storage.getAuth()
      if (storedAuth) {
        setAuthToken(storedAuth.token)
        set({ auth: storedAuth })
        await get().hydrateDashboard()
      }
    } catch {
      await storage.clearAuth()
      setAuthToken(null)
    } finally {
      set({ booting: false })
    }
  },

  login: async (data: LoginDto) => {
    set({ authLoading: true, error: '' })
    try {
      const nextAuth = await authAPI.login(data)
      setAuthToken(nextAuth.token)
      await storage.saveAuth(nextAuth)
      set({ auth: nextAuth })
      await get().hydrateDashboard()
    } catch (loginError: any) {
      set({ error: loginError?.response?.data?.message || 'Login failed. Check your credentials.' })
      throw loginError
    } finally {
      set({ authLoading: false })
    }
  },

  register: async (data: import('../types').RegisterDto) => {
    set({ authLoading: true, error: '' })
    try {
      const nextAuth = await authAPI.register(data)
      setAuthToken(nextAuth.token)
      await storage.saveAuth(nextAuth)
      set({ auth: nextAuth })
      await get().hydrateDashboard()
    } catch (registerError: any) {
      set({ error: registerError?.response?.data?.message || 'Registration failed.' })
      throw registerError
    } finally {
      set({ authLoading: false })
    }
  },

  logout: async () => {
    await storage.clearAuth()
    setAuthToken(null)
    set({ auth: null, profile: null, stats: null, tasks: [], error: '' })
    
    try {
      const { signalRService } = await import('../services/signalr')
      await signalRService.disconnect()
    } catch {
      // Ignore
    }
  },

  hydrateDashboard: async () => {
    set({ dashboardLoading: true })
    try {
      const [nextProfile, nextStats, nextTasks] = await Promise.all([
        profileAPI.get(),
        analyticsAPI.getDashboardStats(),
        taskAPI.getAll(),
      ])
      set({ profile: nextProfile, stats: nextStats, tasks: nextTasks, error: '' })
      
      // Connect to real-time services
      const { signalRService } = await import('../services/signalr')
      await signalRService.connect()
    } catch (loadError: any) {
      if (loadError?.response?.status === 401) {
        await get().logout()
      } else {
        set({ error: 'Unable to sync the mobile command center right now.' })
      }
    } finally {
      set({ dashboardLoading: false })
    }
  },

  completeTask: async (taskId: number) => {
    try {
      await taskAPI.complete(taskId)
      await get().hydrateDashboard()
    } catch {
      set({ error: 'Task completion did not sync. Try again.' })
    }
  },

  createTask: async (data: import('../types').CreateTaskDto) => {
    try {
      await taskAPI.create(data)
      await get().hydrateDashboard()
    } catch {
      set({ error: 'Task creation failed.' })
    }
  },

  deleteTask: async (taskId: number) => {
    try {
      await taskAPI.delete(taskId)
      set((state) => ({ tasks: state.tasks.filter(t => t.id !== taskId) }))
    } catch {
      set({ error: 'Task deletion failed.' })
    }
  },

  fetchGate: async () => {
    set({ gateLoading: true })
    try {
      const gates = await gateAPI.getActive()
      set({ gates, error: '' })
      
      // Schedule expiry notifications
      gates.forEach(g => {
        if (g.expiresAt) {
          notificationService.scheduleGateExpiry(g.name, g.expiresAt)
        }
      })
    } catch {
      set({ error: 'Failed to fetch active gates.' })
    } finally {
      set({ gateLoading: false })
    }
  },

  scanAnomaly: async () => {
    set({ gateLoading: true })
    try {
      const newGate = await gateAPI.generateProcedural()
      set((state) => ({ gates: [...state.gates, newGate], error: '' }))
      if (newGate?.expiresAt) {
        notificationService.scheduleGateExpiry(newGate.name, newGate.expiresAt)
      }
    } catch {
      set({ error: 'Failed to scan for an anomaly. The procedural engine might be offline.' })
    } finally {
      set({ gateLoading: false })
    }
  },

  setError: (error: string) => set({ error }),
}))
