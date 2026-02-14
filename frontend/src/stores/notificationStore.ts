import { create } from 'zustand'

interface NotificationState {
    unreadMessages: number
    friendRequests: number
    setUnreadMessages: (count: number) => void
    setFriendRequests: (count: number) => void
    incrementUnreadMessages: () => void
    incrementFriendRequests: () => void
    decrementFriendRequests: () => void
    resetUnreadMessages: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
    unreadMessages: 0,
    friendRequests: 0,
    setUnreadMessages: (count) => set({ unreadMessages: count }),
    setFriendRequests: (count) => set({ friendRequests: count }),
    incrementUnreadMessages: () => set((state) => ({ unreadMessages: state.unreadMessages + 1 })),
    incrementFriendRequests: () => set((state) => ({ friendRequests: state.friendRequests + 1 })),
    decrementFriendRequests: () => set((state) => ({ friendRequests: Math.max(0, state.friendRequests - 1) })),
    resetUnreadMessages: () => set({ unreadMessages: 0 })
}))
