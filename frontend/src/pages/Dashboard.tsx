import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { profileAPI } from '../services/api'
import toast from 'react-hot-toast'
import DailyQuestWidget from '../components/dashboard/DailyQuestWidget';
import DailyQuestModal from '../components/dashboard/DailyQuestModal';
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
    const [avatarUrlInput, setAvatarUrlInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)

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

    return (
        <div className="min-h-screen p-4 md:p-8 flex justify-center items-start pt-12">

            {/* STATUS WINDOW */}
            <div className="system-panel w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-0 relative overflow-hidden animate-in fade-in duration-500">

                {/* Decorative Corner lines */}
                <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-blue-500/30 rounded-tl-lg pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-blue-500/30 rounded-br-lg pointer-events-none"></div>

                {/* LEFT COLUMN: CHARACTER & BASICS */}
                <div className="md:col-span-5 p-8 border-b md:border-b-0 md:border-r border-blue-500/20 flex flex-col items-center text-center relative">

                    {/* Avatar Section */}
                    <div
                        className="w-48 h-48 bg-gray-900 border-2 border-blue-500/50 rounded-full mb-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,234,255,0.2)] group cursor-pointer transition-all hover:border-blue-400"
                        onClick={() => setIsAvatarModalOpen(true)}
                    >
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-blue-500/20 text-6xl font-display group-hover:text-blue-500/40 transition-colors">
                                IMG
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-blue-400 font-display tracking-widest text-sm">CHANGE</span>
                        </div>
                    </div>

                    <h2 className="text-4xl font-display font-bold text-white mb-2 tracking-wider uppercase">
                        {user.name}
                    </h2>
                    <div className="flex items-center gap-3 mb-8">
                        <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/40 text-blue-400 text-sm font-bold tracking-wider">
                            PLAYER
                        </span>
                        <span className="text-gray-400 text-sm tracking-widest uppercase">
                            {user.level < 10 ? 'E-RANK HUNTER' : 'SHADOW MONARCH'}
                        </span>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                            <span className="text-gray-400 font-display">LEVEL</span>
                            <span className="text-3xl font-bold text-white">{user.level}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                            <span className="text-gray-400 font-display">XP</span>
                            <span className="text-white tracking-tight">{user.xp} / 100</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                            <span className="text-gray-400 font-display">STREAK</span>
                            <span className="text-white text-sm">{user.streakCount} DAYS</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: STATS & QUESTS */}
                <div className="md:col-span-7 p-8">
                    <h3 className="system-header text-xl">STATUS</h3>

                    {/* HP / MP / XP BARS */}
                    <div className="space-y-6 mb-10">
                        <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1 tracking-widest">
                                <span>HP</span>
                                <span>100%</span>
                            </div>
                            <div className="h-4 bg-gray-900 border border-gray-700 skew-x-[-15deg]">
                                <div className="h-full bg-red-600 w-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1 tracking-widest">
                                <span>MP</span>
                                <span>100%</span>
                            </div>
                            <div className="h-4 bg-gray-900 border border-gray-700 skew-x-[-15deg]">
                                <div className="h-full bg-blue-600 w-3/4 shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1 tracking-widest">
                                <span>XP</span>
                                <span>{user.xp} / 100</span>
                            </div>
                            <div className="h-2 bg-gray-900 border border-gray-700">
                                <div
                                    className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-1000"
                                    style={{ width: `${Math.min((user.xp / 100) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* ATTRIBUTES GRID - Scaled by Level */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-10 opacity-80">
                        <div className="flex justify-between items-center group hover:bg-red-900/10 px-2 -mx-2 rounded transition-colors">
                            <span className="text-gray-400 font-display text-lg group-hover:text-red-400 transition-colors">STR</span>
                            <span className="text-white text-xl font-bold">{10 + Math.floor(user.level * 1.5)}</span>
                        </div>
                        <div className="flex justify-between items-center group hover:bg-green-900/10 px-2 -mx-2 rounded transition-colors">
                            <span className="text-gray-400 font-display text-lg group-hover:text-green-400 transition-colors">VIT</span>
                            <span className="text-white text-xl font-bold">{10 + user.level}</span>
                        </div>
                        <div className="flex justify-between items-center group hover:bg-blue-900/10 px-2 -mx-2 rounded transition-colors">
                            <span className="text-gray-400 font-display text-lg group-hover:text-blue-400 transition-colors">AGI</span>
                            <span className="text-white text-xl font-bold">{10 + Math.floor(user.level * 1.2)}</span>
                        </div>
                        <div className="flex justify-between items-center group hover:bg-purple-900/10 px-2 -mx-2 rounded transition-colors">
                            <span className="text-gray-400 font-display text-lg group-hover:text-purple-400 transition-colors">INT</span>
                            <span className="text-white text-xl font-bold">{10 + Math.floor(user.level * 1.1)}</span>
                        </div>
                        <div className="flex justify-between items-center group hover:bg-yellow-900/10 px-2 -mx-2 rounded transition-colors">
                            <span className="text-gray-400 font-display text-lg group-hover:text-yellow-400 transition-colors">SENSE</span>
                            <span className="text-white text-xl font-bold">{10 + Math.floor(user.level * 1.3)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-800 pt-2 mt-2">
                            <span className="text-gray-400 font-display text-lg">PTS</span>
                            <span className="text-yellow-400 text-xl font-bold animate-pulse">0</span>
                        </div>
                    </div>

                    {/* DAILY QUEST WIDGET */}
                    <DailyQuestWidget />
                </div>
            </div>

            {/* AVATAR MODAL */}
            {isAvatarModalOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="system-panel w-full max-w-2xl p-1 border-t-4 border-t-blue-500 animate-in zoom-in duration-300">

                        {/* Header */}
                        <div className="bg-blue-900/20 p-4 border-b border-blue-500/30 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-display font-bold text-white tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rotate-45"></span>
                                    HUNTER REGISTRY
                                </h2>
                                <p className="text-[10px] text-blue-400 font-mono mt-1">UPDATE PROFILE VISUALIZATION</p>
                            </div>
                            <button
                                onClick={() => setIsAvatarModalOpen(false)}
                                className="text-gray-500 hover:text-red-400 transition-colors"
                            >
                                [ CLOSE ]
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {DEFAULT_AVATARS.map((url, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAvatarUpdate(url)}
                                        className="group relative aspect-square bg-black/50 border border-blue-900 hover:border-blue-400 transition-all overflow-hidden"
                                    >
                                        <img src={url} alt="Avatar" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                                            <span className="text-[10px] text-blue-300 font-mono">SELECT</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <div className="absolute -top-3 left-4 bg-[#050914] px-2 text-xs text-blue-500 font-mono">
                                    CUSTOM DATA UPLOAD
                                </div>
                                <div className="border border-blue-500/30 p-4 flex gap-2 items-center bg-blue-900/5">
                                    <input
                                        type="text"
                                        value={avatarUrlInput}
                                        onChange={(e) => setAvatarUrlInput(e.target.value)}
                                        placeholder="ENTER IMAGE URL LINK..."
                                        className="flex-1 bg-transparent border-none text-white text-sm font-mono focus:ring-0 placeholder-blue-900"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAvatarUpdate(avatarUrlInput)
                                        }}
                                    />
                                    <button
                                        onClick={() => handleAvatarUpdate(avatarUrlInput)}
                                        disabled={!avatarUrlInput || isLoading}
                                        className="px-4 py-1 bg-blue-600/20 border border-blue-500 text-blue-300 text-xs hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'UPDATING...' : 'INITIALIZE'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-black/40 p-2 text-center border-t border-blue-500/20">
                            <span className="text-[10px] text-gray-600 font-mono">SYSTEM_ID: REG_AVATAR_01</span>
                        </div>

                    </div>
                </div>
            )}

            <DailyQuestModal />
        </div>
    )
}
