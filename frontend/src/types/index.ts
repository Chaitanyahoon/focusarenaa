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
    guildId?: number
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
    recurrence?: RecurrenceType
    recurrenceInterval?: number
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

export enum RecurrenceType {
    None = 0,
    Daily = 1,
    Weekly = 2,
    Monthly = 3
}

export interface CreateTaskDto {
    title: string
    description?: string
    category: TaskCategory
    difficulty: TaskDifficulty
    dueDate?: string
    recurrence?: RecurrenceType
    recurrenceInterval?: number
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
    theme?: string
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

export interface WeeklyProductivityData {
    weekNumber: number
    weekStart: string
    weekEnd: string
    tasksCompleted: number
    xpEarned: number
    productivityScore: number
}

export interface WeeklyProductivityResponse {
    period: string
    weeks: WeeklyProductivityData[]
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

// Chat Types
export interface ChatUser {
    id: number
    name: string
    avatarUrl?: string
    lastMessage?: string
    lastMessageTime?: string
    unreadCount: number
    isOnline: boolean
}

export interface PrivateMessage {
    id: number
    senderId: number
    senderName: string
    senderAvatarUrl?: string
    receiverId: number
    content: string
    sentAt: string
    isRead: boolean
    isMe: boolean
}

// Friend Types
export enum FriendshipStatus {
    Pending = 0,
    Accepted = 1,
    Declined = 2,
    Blocked = 3
}

export interface FriendResponseDto {
    id: number
    friendId: number
    name: string
    avatarUrl?: string
    level: number
    status: FriendshipStatus
    isIncoming: boolean
    sentAt: string
}
