import * as signalR from '@microsoft/signalr'
import { useAuthStore } from '../stores/authStore'
import { systemToast } from '../components/ui/SystemToast'

class SignalRService {
    private connection: signalR.HubConnection | null = null
    private baseUrl = '/gamehub' // Proxied to backend

    public async startConnection() {
        const token = useAuthStore.getState().token
        if (!token || this.connection) return

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(this.baseUrl, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build()

        this.connection.on('ReceiveXPUpdate', (userId: string, xp: number) => {
            // Handle XP updates (maybe update leaderboard if open)
            console.log(`User ${userId} gained ${xp} XP`)
        })

        this.connection.on('ReceiveLevelUp', (userId: string, newLevel: number, username: string) => {
            systemToast.info(`SYSTEM ALERT: Hunter ${username} has reached Level ${newLevel}!`)
        })

        try {
            await this.connection.start()
            console.log('SignalR Connected to System')
        } catch (err) {
            console.error('SignalR Connection Failed:', err)
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
