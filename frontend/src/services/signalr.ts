import * as signalR from '@microsoft/signalr'
import { useAuthStore } from '../stores/authStore'
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
            // @ts-ignore - dynamic access to toast methods
            if (systemToast[toastType]) {
                // @ts-ignore
                systemToast[toastType](message);
            } else {
                systemToast.info(message);
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
