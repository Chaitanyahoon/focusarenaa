// Sound Assets (using reliable CDNs for UI sounds)
const SOUNDS = {
    hover: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Soft beep
    click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Sci-fi click
    success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Level up/Success
    error: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3', // Error buzz
    notification: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // System ping
    levelUp: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Epic power up
}

class AudioController {
    private sounds: Record<string, HTMLAudioElement> = {}
    private enabled: boolean = true

    constructor() {
        // Preload sounds
        Object.entries(SOUNDS).forEach(([key, url]) => {
            this.sounds[key] = new Audio(url)
            this.sounds[key].volume = 0.5
        })
    }

    play(key: keyof typeof SOUNDS) {
        if (!this.enabled) return

        const sound = this.sounds[key]
        if (sound) {
            sound.currentTime = 0
            sound.play().catch(() => { /* Audio requires user interaction first */ })
        }
    }

    toggle(enabled: boolean) {
        this.enabled = enabled
    }
}

export const sfx = new AudioController()
