import { create } from 'zustand'

export type ThemeName = 'obsidian' | 'midnight' | 'forest' | 'crimson'

export interface ThemeColors {
  primary: string
  background: string
  cardBg: string
  text: string
  muted: string
}

const THEMES: Record<ThemeName, ThemeColors> = {
  obsidian: {
    primary: '#A78BFA', // Purple
    background: '#060913',
    cardBg: 'rgba(255,255,255,0.03)',
    text: '#F4F7FB',
    muted: 'rgba(255,255,255,0.4)',
  },
  midnight: {
    primary: '#3b82f6', // Blue
    background: '#0A1020',
    cardBg: 'rgba(59,130,246,0.05)',
    text: '#F4F7FB',
    muted: 'rgba(255,255,255,0.4)',
  },
  forest: {
    primary: '#10b981', // Emerald
    background: '#06130C',
    cardBg: 'rgba(16,185,129,0.05)',
    text: '#F4F7FB',
    muted: 'rgba(255,255,255,0.4)',
  },
  crimson: {
    primary: '#ef4444', // Red
    background: '#130606',
    cardBg: 'rgba(239,68,68,0.05)',
    text: '#F4F7FB',
    muted: 'rgba(255,255,255,0.4)',
  },
}

interface ThemeState {
  currentTheme: ThemeName
  setTheme: (theme: ThemeName) => void
  colors: ThemeColors
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: 'midnight',
  colors: THEMES['midnight'],
  setTheme: (theme: ThemeName) => set({ currentTheme: theme, colors: THEMES[theme] }),
}))
