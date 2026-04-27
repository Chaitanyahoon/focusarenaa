import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { profileAPI } from '../services/api'
import { shopService } from '../services/shop'
import toast from 'react-hot-toast'
import DailyQuestWidget from '../components/dashboard/DailyQuestWidget';
import DailyQuestModal from '../components/dashboard/DailyQuestModal';
import DailyHomeHub from '../components/dashboard/DailyHomeHub';
import FirstRunOnboarding from '../components/dashboard/FirstRunOnboarding';
import { Skeleton } from '../components/shared/Skeleton';

const DEFAULT_AVATARS = [
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Midnight&backgroundColor=b6e3f4',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Shadow&backgroundColor=c0aede',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=King&backgroundColor=ffdfbf',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Queen&backgroundColor=d1d4f9',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Prince&backgroundColor=ffdfbf',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Hunter&backgroundColor=b6e3f4'
]

export default function Dashboard() {
    const { user, setUser } = useAuthStore()
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)
    const [avatarUrlInput, setAvatarUrlInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [ownedThemes, setOwnedThemes] = useState<string[]>(['blue'])

    // Theme Presets (Stored in User Profile)
    const [themeColor, setThemeColor] = useState('blue')

    // Sync local state with user profile on load
    useEffect(() => {
        if (user?.theme) {
            setThemeColor(user.theme)
        }
    }, [user?.theme])

    // Fetch owned themes when modal opens
    useEffect(() => {
        if (isThemeModalOpen) {
            shopService.getOwnedThemes().then(setOwnedThemes).catch(() => setOwnedThemes(['blue']))
        }
    }, [isThemeModalOpen])

    const handleThemeUpdate = async (color: string) => {
        if (!user) return
        if (color !== 'blue' && !ownedThemes.includes(color)) {
            toast.error('Purchase this theme from the Shop first!')
            return
        }
        setThemeColor(color)
        try {
            await profileAPI.update({ theme: color })
            setUser({ ...user, theme: color })
            toast.success('System: Theme Color Re-calibrated')
        } catch (error: any) {
            setThemeColor(user.theme || 'blue')
            toast.error(error.response?.data?.message || 'System Error: Theme Update Failed')
        }
    }

    const handleAvatarUpdate = async (url: string) => {
        if (!user) return
        setIsLoading(true)
        try {
            await profileAPI.update({ avatarUrl: url })
            setUser({ ...user, avatarUrl: url })
            toast.success('System: Avatar Updated')
            setIsAvatarModalOpen(false)
        } catch (error) {
            toast.error('System Error: Update Failed')
        } finally {
            setIsLoading(false)
        }
    }

    // If user data is missing (should be handled by AuthGuard but safe to check)
    if (!user) {
        return (
            <div className="min-h-screen p-4 md:p-8 flex justify-center items-start pt-12 animate-pulse">
                <div className="system-panel w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-0 relative overflow-hidden">
                    {/* LEFT COLUMN SKELETON */}
                    <div className="md:col-span-5 p-8 border-b md:border-b-0 md:border-r border-blue-500/20 flex flex-col items-center text-center relative">
                        <Skeleton className="w-48 h-48 rounded-full mb-6" />
                        <Skeleton className="h-8 w-32 mb-2" />
                        <Skeleton className="h-6 w-48 mb-8" />
                        <div className="w-full space-y-4">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    </div>

                    {/* RIGHT COLUMN SKELETON */}
                    <div className="md:col-span-7 p-8">
                        <Skeleton className="h-8 w-24 mb-6" />
                        <div className="space-y-6 mb-10">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-10">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const xpPercent = Math.min((user.xp / 100) * 100, 100)
    const xpToNextLevel = Math.max(100 - user.xp, 0)
    const rankTitle = user.level < 10 ? 'E-RANK HUNTER' : user.level < 25 ? 'A-RANK HUNTER' : 'SHADOW MONARCH'
    const streakState = user.streakCount > 0 ? 'Momentum online' : 'Start the chain'

    return (
        <div className="min-h-screen p-3 md:p-6 flex flex-col items-center gap-6 pt-6 md:pt-10">
            <FirstRunOnboarding />
            <div className="w-full max-w-6xl space-y-6">
                <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
                    <div className="system-card rounded-2xl p-5 md:p-6 float-in">
                        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div>
                                <div className="habit-chip rounded-full px-3 py-1.5 text-[10px]">{streakState}</div>
                                <h1 className="mt-4 text-3xl font-black tracking-[0.12em] text-white md:text-5xl">
                                    Today&apos;s arena is open.
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100/65 md:text-base">
                                    Clear one daily objective, bank the reward, and keep your profile from feeling idle. The next action should always be obvious.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    to="/quests"
                                    className="system-button system-button-primary px-5 py-3 text-xs"
                                >
                                    Open Quests
                                </Link>
                                <Link
                                    to="/gates"
                                    className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-blue-400/40 hover:text-white"
                                >
                                    Enter Gates
                                </Link>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                            {[
                                ['Rank', rankTitle],
                                ['Streak', `${user.streakCount} days`],
                                ['Next level', xpToNextLevel === 0 ? 'Ready' : `${xpToNextLevel} XP`],
                                ['Gold bank', `${user.gold}G`],
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-xl border border-blue-500/10 bg-black/35 px-4 py-3">
                                    <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-blue-200/45">{label}</div>
                                    <div className="mt-1 truncate text-lg font-black text-white">{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="system-card rounded-2xl p-5 float-in [animation-delay:100ms]">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-blue-200/50">Comeback trigger</div>
                                <h2 className="mt-2 text-2xl font-black tracking-[0.12em] text-white">One punch keeps it alive.</h2>
                            </div>
                            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-right">
                                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-200/60">XP</div>
                                <div className="text-xl font-black text-emerald-300">{Math.round(xpPercent)}%</div>
                            </div>
                        </div>
                        <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/50">
                            <div
                                className="h-full bg-gradient-to-r from-system-blue via-cyan-300 to-emerald-300 transition-all duration-700 heartbeat-glow"
                                style={{ width: `${xpPercent}%` }}
                            />
                        </div>
                        <p className="mt-4 text-xs font-mono uppercase leading-relaxed tracking-[0.16em] text-gray-500">
                            Take one small win now. XP, streaks, and guild pressure will pull you back tomorrow.
                        </p>
                    </div>
                </section>

                <DailyHomeHub streakCount={user.streakCount} gold={user.gold} />

            {/* STATUS WINDOW - Glassmorphism & Neon */}
            <div className="system-panel w-full grid grid-cols-1 lg:grid-cols-12 gap-0 relative overflow-hidden animate-in fade-in duration-500 backdrop-blur-xl bg-black/40 border border-blue-500/30 shadow-[0_0_50px_rgba(0,0,0,0.8)]">

                {/* Decorative Corner lines */}
                <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-blue-500/50 rounded-tl-lg pointer-events-none z-20"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-blue-500/50 rounded-br-lg pointer-events-none z-20"></div>

                {/* Scanline Overlay */}
                <div className="absolute inset-0 pointer-events-none z-10 scanline-overlay opacity-10"></div>

                {/* LEFT COLUMN: CHARACTER & BASICS */}
                <div className="lg:col-span-5 p-8 border-b lg:border-b-0 lg:border-r border-blue-500/20 flex flex-col items-center text-center relative bg-gradient-to-b from-blue-900/10 to-transparent">

                    {/* Avatar Section - Holofoil Upgrade */}
                    <div
                        className="w-32 h-32 md:w-48 md:h-48 rounded-full mb-6 relative group cursor-pointer transition-all holofoil-border avatar-s-rank"
                        onClick={() => setIsAvatarModalOpen(true)}
                    >
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-blue-500/20 text-6xl font-display group-hover:text-blue-500/40 transition-colors">
                                IMG
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                            <span className="text-blue-400 font-display tracking-widest text-sm border border-blue-400/50 px-2 py-1">UPDATE</span>
                        </div>
                    </div>


                    <h2 className="text-4xl font-display font-bold text-white mb-2 tracking-wider uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                        {user.name}
                    </h2>
                    <div className="flex items-center gap-3 mb-8">
                        <button
                            onClick={() => setIsThemeModalOpen(true)}
                            className="px-3 py-1 bg-blue-500/10 border border-blue-500/40 text-blue-400 text-sm font-bold tracking-wider shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:bg-blue-500/30 transition-all"
                        >
                            THEME VAULT
                        </button>
                        <span className="text-gray-400 text-sm tracking-widest uppercase font-mono">
                            {rankTitle}
                        </span>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="flex justify-between items-center border-b border-blue-500/20 pb-2 group hover:bg-blue-500/5 px-2 transition-colors">
                            <span className="text-blue-300/70 font-display tracking-widest text-sm">LEVEL</span>
                            <span className="text-3xl font-bold text-white neon-text-blue">{user.level}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-blue-500/20 pb-2 group hover:bg-blue-500/5 px-2 transition-colors">
                            <span className="text-blue-300/70 font-display tracking-widest text-sm">XP</span>
                            <span className="text-white tracking-tight font-mono">{user.xp} <span className="text-gray-500 text-xs">/ 100</span></span>
                        </div>
                        <div className="flex justify-between items-center border-b border-blue-500/20 pb-2 group hover:bg-blue-500/5 px-2 transition-colors">
                            <span className="text-blue-300/70 font-display tracking-widest text-sm">STREAK</span>
                            <span className="text-white text-sm font-mono">{user.streakCount} DAYS</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: STATS & QUESTS */}
                <div className="lg:col-span-7 p-4 md:p-8 bg-black/20">
                    <h3 className="system-header text-xl border-b border-blue-500/30 pb-2 mb-6 flex justify-between items-end">
                        <span className="neon-text-blue">TODAY&apos;S RUN</span>
                        <span className="text-[10px] text-blue-500/50 font-mono tracking-widest animate-pulse">LATEST DATA</span>
                    </h3>

                    {/* HP / MP / XP BARS */}
                    <div className="space-y-6 mb-10">
                        <div>
                            <div className="flex justify-between text-xs text-blue-300/70 mb-1 tracking-widest font-mono">
                                <span>HP</span>
                                <span>100%</span>
                            </div>
                            <div className="h-4 bg-gray-900/80 border border-gray-700/50 skew-x-[-15deg] overflow-hidden relative group">
                                <div className="absolute inset-0 bg-red-900/20"></div>
                                <div className="h-full bg-red-600 w-full shadow-[0_0_15px_rgba(220,38,38,0.6)] relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-blue-300/70 mb-1 tracking-widest font-mono">
                                <span>MP</span>
                                <span>100%</span>
                            </div>
                            <div className="h-4 bg-gray-900/80 border border-gray-700/50 skew-x-[-15deg] overflow-hidden relative">
                                <div className="absolute inset-0 bg-blue-900/20"></div>
                                <div className="h-full bg-blue-600 w-3/4 shadow-[0_0_15px_rgba(37,99,235,0.6)] relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-[shimmer_3s_infinite]"></div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-blue-300/70 mb-1 tracking-widest font-mono">
                                <span>XP</span>
                                <span>{Math.round(xpPercent)}%</span>
                            </div>
                            <div className="h-2 bg-gray-900/80 border border-gray-700/50 relative overflow-hidden">
                                <div
                                    className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-1000 relative"
                                    style={{ width: `${xpPercent}%` }}
                                >
                                    <div className="absolute top-0 right-0 h-full w-1 bg-white shadow-[0_0_10px_white]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ATTRIBUTES GRID - Scaled by Level */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-10 opacity-90">
                        <div className="flex justify-between items-center group hover:bg-red-500/5 px-3 py-1 -mx-3 rounded transition-colors border-b border-transparent hover:border-red-500/20">
                            <span className="text-gray-400 font-display text-lg group-hover:text-red-400 transition-colors">STR</span>
                            <span className="text-white text-xl font-bold font-mono tracking-wider">{10 + Math.floor(user.level * 1.5)}</span>
                        </div>
                        <div className="flex justify-between items-center group hover:bg-green-500/5 px-3 py-1 -mx-3 rounded transition-colors border-b border-transparent hover:border-green-500/20">
                            <span className="text-gray-400 font-display text-lg group-hover:text-green-400 transition-colors">VIT</span>
                            <span className="text-white text-xl font-bold font-mono tracking-wider">{10 + user.level}</span>
                        </div>
                        <div className="flex justify-between items-center group hover:bg-blue-500/5 px-3 py-1 -mx-3 rounded transition-colors border-b border-transparent hover:border-blue-500/20">
                            <span className="text-gray-400 font-display text-lg group-hover:text-blue-400 transition-colors">AGI</span>
                            <span className="text-white text-xl font-bold font-mono tracking-wider">{10 + Math.floor(user.level * 1.2)}</span>
                        </div>
                        <div className="flex justify-between items-center group hover:bg-teal-500/5 px-3 py-1 -mx-3 rounded transition-colors border-b border-transparent hover:border-teal-500/20">
                            <span className="text-gray-400 font-display text-lg group-hover:text-teal-400 transition-colors">INT</span>
                            <span className="text-white text-xl font-bold font-mono tracking-wider">{10 + Math.floor(user.level * 1.1)}</span>
                        </div>
                        <div className="flex justify-between items-center group hover:bg-yellow-500/5 px-3 py-1 -mx-3 rounded transition-colors border-b border-transparent hover:border-yellow-500/20">
                            <span className="text-gray-400 font-display text-lg group-hover:text-yellow-400 transition-colors">SENSE</span>
                            <span className="text-white text-xl font-bold font-mono tracking-wider">{10 + Math.floor(user.level * 1.3)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-blue-500/20 pt-2 mt-2 bg-yellow-500/5 px-3 -mx-3 rounded">
                            <span className="text-yellow-500/70 font-display text-lg tracking-widest">GOLD</span>
                            <span className="text-yellow-400 text-xl font-bold animate-pulse font-mono tracking-wider drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">{user.gold}</span>
                        </div>
                    </div>

                    {/* DAILY QUEST WIDGET */}
                    <div className="relative">
                        <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500/50 to-transparent"></div>
                        <DailyQuestWidget />
                    </div>
                </div>
            </div>
            </div>

            {/* AVATAR MODAL - Glass Panel */}
            {isAvatarModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="glass-panel-heavy w-full max-w-2xl p-1 animate-in zoom-in-95 duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)]">

                        {/* Header */}
                        <div className="bg-blue-900/20 p-4 border-b border-blue-500/30 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-blue-500/10 to-transparent"></div>
                            <div>
                                <h2 className="text-xl font-display font-bold text-white tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rotate-45 shadow-[0_0_5px_#3b82f6]"></span>
                                    HUNTER REGISTRY
                                </h2>
                                <p className="text-[10px] text-blue-400 font-mono mt-1 tracking-[0.2em] opacity-70">UPDATE PROFILE VISUALIZATION</p>
                            </div>
                            <button
                                onClick={() => setIsAvatarModalOpen(false)}
                                className="text-gray-500 hover:text-red-400 transition-colors font-mono text-xs border border-transparent hover:border-red-500/30 px-2 py-1"
                            >
                                [ TERMINATE ]
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {DEFAULT_AVATARS.map((url, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAvatarUpdate(url)}
                                        className="group relative aspect-square bg-black/50 border border-blue-900 hover:border-blue-400 transition-all overflow-hidden hover:shadow-[0_0_15px_rgba(0,234,255,0.3)]"
                                    >
                                        <img src={url} alt="Avatar" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0 duration-300" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                                            <span className="text-[10px] text-blue-300 font-mono tracking-widest">SELECT</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <div className="absolute -top-3 left-4 bg-[#050914] px-2 text-xs text-blue-500 font-mono tracking-widest z-10">
                                    CUSTOM DATA UPLOAD
                                </div>
                                <div className="border border-blue-500/30 p-4 flex gap-2 items-center bg-blue-900/5 relative group hover:border-blue-500/50 transition-colors">
                                    <input
                                        type="text"
                                        value={avatarUrlInput}
                                        onChange={(e) => setAvatarUrlInput(e.target.value)}
                                        placeholder="ENTER IMAGE URL LINK..."
                                        className="flex-1 bg-transparent border-none text-white text-sm font-mono focus:ring-0 placeholder-blue-900/50"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAvatarUpdate(avatarUrlInput)
                                        }}
                                    />
                                    <button
                                        onClick={() => handleAvatarUpdate(avatarUrlInput)}
                                        disabled={!avatarUrlInput || isLoading}
                                        className="px-6 py-2 bg-blue-600/10 border border-blue-500/50 text-blue-300 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                    >
                                        {isLoading ? 'PROCESSING...' : 'INITIALIZE'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-black/40 p-2 text-center border-t border-blue-500/20 flex justify-between px-4 text-[10px] text-gray-600 font-mono">
                            <span>SYSTEM_ID: REG_AVATAR_01</span>
                            <span className="animate-pulse text-green-500/50">MyR_v2.0</span>
                        </div>

                    </div>
                </div>
            )}

            <DailyQuestModal />

            {/* THEME MODAL */}
            {isThemeModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="glass-panel-heavy w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="relative border-b border-blue-500/20 bg-blue-900/10 p-5">
                            <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-blue-500/10 to-transparent" />
                            <div className="relative flex justify-between gap-4">
                                <div>
                                    <div className="habit-chip rounded-full px-2.5 py-1 text-[9px]">Optional reward</div>
                                    <h2 className="mt-3 text-2xl font-display font-bold text-white tracking-widest">THEME VAULT</h2>
                                    <p className="mt-2 max-w-md text-xs font-mono uppercase leading-relaxed tracking-[0.16em] text-gray-500">
                                        Shadow Blue is the core system look. Extra themes are trophy skins earned through play.
                                    </p>
                                </div>
                                <button onClick={() => setIsThemeModalOpen(false)} className="h-fit text-gray-500 hover:text-white">[X]</button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="mb-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-blue-200/50">Current system skin</div>
                                        <div className="mt-1 text-lg font-black tracking-[0.16em] text-white">{themeColor.toUpperCase()}</div>
                                    </div>
                                    <div className="h-10 w-10 rounded-full border border-blue-300/30 bg-system-blue/30 shadow-[0_0_20px_rgb(var(--color-system-blue-rgb)/0.35)]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'blue', name: 'SHADOW BLUE', price: 0, activeClass: 'border-blue-400 bg-blue-500/20 text-blue-300', ownedClass: 'border-blue-500/50 bg-blue-900/20 hover:bg-blue-500/20 text-blue-300' },
                                    { id: 'red', name: 'BLOOD RED', price: 1000, activeClass: 'border-red-400 bg-red-500/20 text-red-300', ownedClass: 'border-red-500/50 bg-red-900/20 hover:bg-red-500/20 text-red-300' },
                                    { id: 'teal', name: 'VOID teal', price: 1500, activeClass: 'border-teal-400 bg-teal-500/20 text-teal-300', ownedClass: 'border-teal-500/50 bg-teal-900/20 hover:bg-teal-500/20 text-teal-300' },
                                    { id: 'gold', name: 'ROYAL GOLD', price: 2000, activeClass: 'border-yellow-400 bg-yellow-500/20 text-yellow-300', ownedClass: 'border-yellow-500/50 bg-yellow-900/20 hover:bg-yellow-500/20 text-yellow-300' },
                                    { id: 'green', name: 'NECRO GREEN', price: 2500, activeClass: 'border-emerald-400 bg-emerald-500/20 text-emerald-300', ownedClass: 'border-emerald-500/50 bg-emerald-900/20 hover:bg-emerald-500/20 text-emerald-300' },
                                ].map((t) => {
                                    const isOwned = ownedThemes.includes(t.id)
                                    const isActive = themeColor === t.id
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => handleThemeUpdate(t.id)}
                                            className={`p-4 border relative transition-all font-mono tracking-widest ${isActive
                                                ? t.activeClass
                                                : isOwned
                                                    ? t.ownedClass
                                                    : 'border-gray-700 bg-gray-900/40 text-gray-600 cursor-not-allowed'
                                                }`}
                                        >
                                            <span className="block text-left text-xs">{t.name}</span>
                                            {!isOwned && (
                                                <span className="block text-left text-[10px] mt-2 text-gray-600">LOCKED // {t.price}G</span>
                                            )}
                                            {isActive && (
                                                <span className="absolute top-2 right-2 rounded-full border border-green-400/20 bg-green-400/10 px-2 py-0.5 text-[8px] text-green-300">ACTIVE</span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-yellow-500/10 bg-yellow-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs font-mono uppercase leading-relaxed tracking-[0.16em] text-gray-500">
                                    Earn gold through quests, then unlock skins in the Shop. The app still works best on Shadow Blue.
                                </p>
                                <Link
                                    to="/shop"
                                    onClick={() => setIsThemeModalOpen(false)}
                                    className="shrink-0 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-yellow-200 transition-all hover:border-yellow-300/50 hover:bg-yellow-400/20"
                                >
                                    Open Shop
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
