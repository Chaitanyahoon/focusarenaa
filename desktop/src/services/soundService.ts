const CHIME_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'; // Professional "Ding"

export const SoundService = {
    playChime: () => {
        try {
            const audio = new Audio(CHIME_URL);
            audio.play();
        } catch (error) {
            console.warn('Could not play chime', error);
        }
    }
};
