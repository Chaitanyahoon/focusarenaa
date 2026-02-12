// API Types
export interface User {
    id: number
    name: string
    email: string
    avatarUrl?: string
    bio?: string
    xp: number
    level: number
    streakCount: number
    joinDate: string
    gold: number
    theme?: string
    guildId?: number
}

// ...

export interface UserProfile {
    // ...
    gold: number
    guildId?: number
}

export interface AuthResponse {
    token: string
    email: string
    name: string
    userId: number
    xp: number
    level: number
}

export interface LoginDto {
    email: string
    password: string
}

export interface RegisterDto {
    name: string
    email: string
    password: string
}

export interface Task {
    id: number
    taskId?: number // For compatibility with Gate entity response
    userId: number
    title: string
    description?: string
    category: TaskCategory
    difficulty: TaskDifficulty
    status: TaskStatus
    xpReward: number
    dueDate?: string
    completedAt?: string
    createdAt: string
}

export enum TaskCategory {
    Study = 0,
    Work = 1,
    Fitness = 2,
    Personal = 3,
    Learning = 4
}

export enum TaskDifficulty {
    Easy = 0,
    Medium = 1,
    Hard = 2
}

export enum TaskStatus {
    Todo = 0,
    InProgress = 1,
    Done = 2
}

export interface CreateTaskDto {
    title: string
    description?: string
    category: TaskCategory
    difficulty: TaskDifficulty
    dueDate?: string
}

export interface Badge {
    badgeId: number
    name: string
    description: string
    iconUrl?: string
    isEarned: boolean
    earnedDate?: string
}

export interface UserProfile {
    id: number
    name: string
    email: string
    avatarUrl?: string
    bio?: string
    xp: number
    level: number
    streakCount: number
    joinDate: string
    totalTasksCompleted: number
    badgesEarned: number
    gold: number
    guildId?: number
}

export interface LeaderboardEntry {
    userId: number
    name: string
    avatarUrl?: string
    xp: number
    level: number
    rank: number
}

export interface XPHistoryData {
    date: string
    xpEarned: number
    totalXP: number
}

export interface CategoryDistribution {
    category: string
    count: number
    percentage: number
}

export interface StreakDay {
    date: string
    taskCount: number
    hasActivity: boolean
}

export interface WeeklyProductivity {
    week: string
    tasksCompleted: number
    xpEarned: number
    productivity: number
}

export interface DashboardStats {
    totalTasks: number
    completedTasks: number
    currentStreak: number
    longestStreak: number
    totalXP: number
    level: number
    badgesEarned: number
    averageDailyXP: number
}

// SignalR Event Types
export interface XPUpdateEvent {
    userId: number
    userName: string
    xp: number
    level: number
    timestamp: string
}

export interface LevelUpEvent {
    userId: number
    userName: string
    level: number
    timestamp: string
}

export interface BadgeUnlockEvent {
    userId: number
    userName: string
    badgeName: string
    timestamp: string
}
