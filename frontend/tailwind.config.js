/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Solo Leveling Theme
                primary: {
                    500: '#6366f1',
                    600: '#5558dd',
                    700: '#4447c9',
                },
                accent: {
                    400: '#00d4ff',
                    500: '#00b8e6',
                },
                dark: {
                    900: '#0f1419',
                    800: '#1a1f2e',
                    700: '#252b3d',
                    600: '#30374c',
                },
                system: {
                    purple: '#8b5cf6',
                    blue: 'rgb(var(--color-system-blue-rgb) / <alpha-value>)',
                    green: '#10b981',
                    red: 'rgb(var(--color-system-red-rgb) / <alpha-value>)',
                    gold: '#f59e0b',
                }
            },
            fontFamily: {
                display: ['"Exo 2"', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
            animation: {
                'glow': 'glow 2s ease-in-out infinite alternate',
                'level-up': 'levelUp 0.5s ease-out',
                'xp-pulse': 'xpPulse 1.5s ease-in-out infinite',
            },
            keyframes: {
                glow: {
                    'from': { boxShadow: '0 0 10px #6366f1, 0 0 20px #6366f1' },
                    'to': { boxShadow: '0 0 20px #8b5cf6, 0 0 30px #8b5cf6' }
                },
                levelUp: {
                    '0%': { transform: 'scale(0.8)', opacity: '0' },
                    '50%': { transform: 'scale(1.2)' },
                    '100%': { transform: 'scale(1)', opacity: '1' }
                },
                xpPulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' }
                }
            }
        },
    },
    plugins: [],
}
