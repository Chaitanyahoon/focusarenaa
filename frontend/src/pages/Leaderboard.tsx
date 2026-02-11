import { useState, useEffect } from 'react'
import { leaderboardAPI } from '../services/api'
import { TrophyIcon } from '@heroicons/react/24/solid'

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<'global' | 'weekly'>('global')

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true)
            try {
                const data = filter === 'global'
                    ? await leaderboardAPI.getGlobal()
                    : await leaderboardAPI.getWeekly()
                setLeaderboard(data)
            } catch (error) {
                console.error('Failed to fetch leaderboard')
            } finally {
                setIsLoading(false)
            }
        }
        fetchLeaderboard()
    }, [filter])

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">

            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-widest uppercase">
                    Hunter Rankings
                </h1>
                <div className="h-1 w-32 bg-blue-500 mx-auto mb-8 shadow-[0_0_10px_#3b82f6]"></div>

                {/* Filter Toggle */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => setFilter('global')}
                        className={`px-6 py-2 border font-display tracking-widest transition-all ${filter === 'global'
                            ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_#3b82f6]'
                            : 'border-blue-900/50 text-blue-500 hover:bg-blue-900/20'
                            }`}
                    >
                        GLOBAL
                    </button>
                    <button
                        onClick={() => setFilter('weekly')}
                        className={`px-6 py-2 border font-display tracking-widest transition-all ${filter === 'weekly'
                            ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_#3b82f6]'
                            : 'border-blue-900/50 text-blue-500 hover:bg-blue-900/20'
                            }`}
                    >
                        WEEKLY
                    </button>
                </div>
            </div>

            <div className="system-panel p-0 overflow-hidden">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-blue-500/30 bg-blue-900/10 text-blue-400 font-display tracking-widest text-sm">
                    <div className="col-span-2 text-center">RANK</div>
                    <div className="col-span-5">HUNTER</div>
                    <div className="col-span-2 text-center">LEVEL</div>
                    <div className="col-span-3 text-right">XP</div>
                </div>

                {/* List */}
                {isLoading ? (
                    <div className="p-12 text-center text-blue-500/50 font-mono animate-pulse">
                        RETRIEVING GUILD DATA...
                    </div>
                ) : (
                    <div className="divide-y divide-blue-500/10">
                        {leaderboard.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 font-mono">NO HUNTERS FOUND IN THIS REGISTRY</div>
                        ) : (
                            leaderboard.map((entry, index) => {
                                const rank = entry.rank || index + 1
                                let rankColor = 'text-gray-400'
                                let rowBg = 'hover:bg-blue-500/5'

                                if (rank === 1) {
                                    rankColor = 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]'
                                    rowBg = 'bg-yellow-500/5 hover:bg-yellow-500/10'
                                } else if (rank === 2) {
                                    rankColor = 'text-gray-300 drop-shadow-[0_0_5px_rgba(209,213,219,0.5)]'
                                    rowBg = 'bg-gray-500/5 hover:bg-gray-500/10'
                                } else if (rank === 3) {
                                    rankColor = 'text-orange-400 drop-shadow-[0_0_5px_rgba(251,146,60,0.5)]'
                                    rowBg = 'bg-orange-500/5 hover:bg-orange-500/10'
                                }

                                return (
                                    <div key={entry.userId} className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors ${rowBg}`}>

                                        {/* Rank */}
                                        <div className="col-span-2 text-center flex justify-center">
                                            <span className={`font-display font-bold text-2xl ${rankColor}`}>
                                                #{rank}
                                            </span>
                                        </div>

                                        {/* Hunter Info */}
                                        <div className="col-span-5 flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-900 rounded-sm border border-blue-500/30 overflow-hidden">
                                                {entry.avatarUrl ? (
                                                    <img src={entry.avatarUrl} alt={entry.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-xs text-blue-500 bg-blue-900/20">IMG</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white tracking-wide">{entry.name || 'UNKNOWN HUNTER'}</div>
                                                <div className="text-xs text-gray-500 font-mono flex items-center gap-1">
                                                    {rank <= 3 && <TrophyIcon className="w-3 h-3 text-yellow-500" />}
                                                    {/* Only show ID if name is missing or as secondary info */}
                                                    <span className="text-blue-500/30">ID: {entry.userId.toString().padStart(4, '0')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Level */}
                                        <div className="col-span-2 text-center text-white font-mono">
                                            <span className="text-blue-400 text-xs">LVL.</span> {entry.level}
                                        </div>

                                        {/* XP */}
                                        <div className="col-span-3 text-right font-mono font-bold text-blue-300">
                                            {entry.xp.toLocaleString()} XP
                                        </div>

                                    </div>
                                )
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
