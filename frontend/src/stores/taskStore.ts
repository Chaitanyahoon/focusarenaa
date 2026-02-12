import { create } from 'zustand'
import { taskAPI } from '../services/api'
import type { Task, CreateTaskDto } from '../types'

interface TaskStore {
    tasks: Task[]
    isLoading: boolean
    error: string | null

    fetchTasks: () => Promise<void>
    createTask: (data: CreateTaskDto) => Promise<void>
    updateTask: (id: number, data: Partial<CreateTaskDto>) => Promise<void>
    updateStatus: (id: number, status: number) => Promise<void>
    completeTask: (id: number) => Promise<any>
    deleteTask: (id: number) => Promise<void>
}

export const useTaskStore = create<TaskStore>((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,

    fetchTasks: async () => {
        set({ isLoading: true, error: null })
        try {
            const tasks = await taskAPI.getAll()
            set({ tasks, isLoading: false })
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch tasks',
                isLoading: false
            })
        }
    },

    createTask: async (data: CreateTaskDto) => {
        set({ isLoading: true, error: null })
        try {
            const newTask = await taskAPI.create(data)
            set(state => ({
                tasks: [...state.tasks, newTask],
                isLoading: false
            }))
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to create task',
                isLoading: false
            })
            throw error
        }
    },

    updateTask: async (id: number, data: Partial<CreateTaskDto>) => {
        try {
            await taskAPI.update(id, data)
            set(state => ({
                tasks: state.tasks.map(task =>
                    task.id === id ? { ...task, ...data } : task
                )
            }))
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to update task' })
            throw error
        }
    },

    updateStatus: async (id: number, status: number) => {
        try {
            await taskAPI.updateStatus(id, status)
            set(state => ({
                tasks: state.tasks.map(task =>
                    task.id === id ? { ...task, status } : task
                )
            }))
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to update status' })
            throw error
        }
    },

    completeTask: async (id: number) => {
        try {
            const result = await taskAPI.complete(id)
            // Refresh tasks to get updated data
            await get().fetchTasks()
            return result
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to complete task' })
            throw error
        }
    },

    deleteTask: async (id: number) => {
        try {
            await taskAPI.delete(id)
            set(state => ({
                tasks: state.tasks.filter(task => task.id !== id)
            }))
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to delete task' })
            throw error
        }
    }
}))
