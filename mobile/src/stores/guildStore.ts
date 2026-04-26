import { create } from 'zustand'
import { guildAPI } from '../services/api'
import type { Guild, CreateGuildDto, JoinGuildDto } from '../types'
import { useAppStore } from './appStore'

interface GuildState {
  currentGuild: Guild | null
  isLoading: boolean
  error: string

  fetchMyGuild: () => Promise<void>
  createGuild: (data: CreateGuildDto) => Promise<void>
  joinGuild: (guildId: number, data?: JoinGuildDto) => Promise<void>
  leaveGuild: () => Promise<void>
}

export const useGuildStore = create<GuildState>((set, get) => ({
  currentGuild: null,
  isLoading: false,
  error: '',

  fetchMyGuild: async () => {
    set({ isLoading: true, error: '' })
    try {
      const guild = await guildAPI.getMyGuild()
      set({ currentGuild: guild })
    } catch (err: any) {
      if (err?.response?.status === 404) {
        set({ currentGuild: null })
      } else {
        set({ error: 'Failed to fetch guild info.' })
      }
    } finally {
      set({ isLoading: false })
    }
  },

  createGuild: async (data: CreateGuildDto) => {
    set({ isLoading: true, error: '' })
    try {
      const guild = await guildAPI.create(data)
      set({ currentGuild: guild })
      // Update the user's profile guildId as well
      await useAppStore.getState().hydrateDashboard()
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to create guild.' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  joinGuild: async (guildId: number, data?: JoinGuildDto) => {
    set({ isLoading: true, error: '' })
    try {
      await guildAPI.join(guildId, data)
      await get().fetchMyGuild()
      await useAppStore.getState().hydrateDashboard()
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to join guild.' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  leaveGuild: async () => {
    set({ isLoading: true, error: '' })
    try {
      await guildAPI.leave()
      set({ currentGuild: null })
      await useAppStore.getState().hydrateDashboard()
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to leave guild.' })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
}))
