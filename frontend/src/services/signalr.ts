import * as signalR from '@microsoft/signalr'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'
import { systemToast } from '../components/ui/SystemToast'
import { HUB_BASE } from '../config'

class SignalRService {
    private connection: signalR.HubConnection | null = null
    private baseUrl = `${HUB_BASE}/gamehub`

    public async startConnection() {
        const token = useAuthStore.getState().token
        if (!token || this.connection) return

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(this.baseUrl, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build()

        this.connection.on('ReceiveXPUpdate', (_userId: string, _xp: number) => {
            // XP updates handled silently — leaderboard refreshes on navigation
        })

        this.connection.on('ReceiveLevelUp', (_userId: string, newLevel: number, username: string) => {
            systemToast.info(`SYSTEM ALERT: Hunter ${username} has reached Level ${newLevel}!`)
        })

        this.connection.on('ReceiveSystemMessage', (message: string, type: 'info' | 'warning' | 'error' | 'success') => {
            const toastType = type === 'warning' ? 'info' : type;
            // @ts-ignore
            if (systemToast[toastType]) systemToast[toastType](message);
            else systemToast.info(message);
        })

        // Global Chat Listener
        this.connection.on('ReceivePrivateMessage', (msg: any) => {
            // Check if we are already on the chat page
            const isChatOpen = window.location.pathname === '/chat'
            const currentUserId = useAuthStore.getState().user?.id

            // Only notify if we are NOT the sender
            if (msg.senderId !== currentUserId) {
                // If not on chat page, or on chat page but maybe defined logic elsewhere handles it?
                // Actually, ChatPage handles its own state. We just want to notify if NOT on chat page
                // OR if on chat page but strictly for the badge counter.

                // For now, always increment globally. ChatPage can reset it when opened.
                useNotificationStore.getState().incrementUnreadMessages()

                if (!isChatOpen) {
                    systemToast.info(`New message from ${msg.senderName}`)
                }
            }
        })

        // Friend Requests
        this.connection.on('ReceiveFriendRequest', (req: any) => {
            useNotificationStore.getState().incrementFriendRequests()
            systemToast.success(`New Friend Request from ${req.name}`)
        })

        this.connection.on('ReceiveFriendResponse', (data: any) => {
            if (data.accepted) {
                systemToast.success(`${data.friendName} accepted your friend request!`)
                // Ideally refresh friend list if on chat page, but simple toast is enough globally
            }
        })

        try {
            await this.connection.start()
        } catch (_err) {
            setTimeout(() => this.startConnection(), 5000)
        }
    }

    public stopConnection() {
        if (this.connection) {
            this.connection.stop()
            this.connection = null
        }
    }
}

export const signalRService = new SignalRService()
