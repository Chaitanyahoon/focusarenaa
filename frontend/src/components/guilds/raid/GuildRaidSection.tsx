import { GuildRaid, GuildRaidStatus } from '../../types';
import BossHpBar from '../raid/BossHpBar'; // Reusing existing component
import { SparklesIcon } from '@heroicons/react/24/solid';

interface Props {
    raid: GuildRaid;
}

export default function GuildRaidSection({ raid }: Props) {
    const isCleared = raid.status === GuildRaidStatus.Cleared;
    const progress = Math.round(((raid.totalHP - raid.currentHP) / raid.totalHP) * 100);

    // Generate boss avatar
    const bossAvatarUrl = `https://api.dicebear.com/9.x/bottts/svg?seed=${raid.bossName}&scale=80`;

    return (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-purple-500/30 p-6 relative overflow-hidden mb-8 group">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                {/* Boss Avatar */}
                <div className="relative flex-shrink-0">
                    <div className={`w-32 h-32 rounded-full bg-black/50 border-4 border-purple-500/50 flex items-center justify-center relative overflow-hidden ${isCleared ? 'grayscale opacity-50' : 'animate-pulse-slow'}`}>
                        <img src={bossAvatarUrl} alt={raid.bossName} className="w-24 h-24 object-contain" />
                    </div>
                    {isCleared && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <SparklesIcon className="w-16 h-16 text-yellow-400 drop-shadow-lg animate-bounce" />
                        </div>
                    )}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-900/80 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-500/50 whitespace-nowrap">
                        RAID BOSS
                    </div>
                </div>

                {/* Info & HP */}
                <div className="flex-1 w-full text-center md:text-left">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                        <div>
                            <h2 className="text-2xl font-black font-rajdhani text-white tracking-wider flex items-center gap-2 justify-center md:justify-start">
                                {raid.title}
                                {isCleared && <span className="text-sm bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/50">CLEARED</span>}
                            </h2>
                            <p className="text-sm text-gray-400 font-mono">{raid.description || "The team must defeat this project."}</p>
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="text-xs text-purple-400 font-mono">PROJECT PROGRESS</div>
                            <div className="text-2xl font-black font-rajdhani text-white">{progress}%</div>
                        </div>
                    </div>

                    {/* HP Bar */}
                    <BossHpBar
                        currentHp={raid.currentHP}
                        maxHp={raid.totalHP}
                        bossName={raid.bossName}
                        rank={3} // Visual style B-Rank equivalent
                    />

                    <div className="flex justify-between text-xs font-mono text-gray-500 mt-1">
                        <span>HP: {raid.currentHP.toLocaleString()} / {raid.totalHP.toLocaleString()}</span>
                        <span>STATUS: {isCleared ? 'DEFEATED' : 'ACTIVE'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
