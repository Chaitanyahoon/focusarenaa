import { useRef, useEffect, useMemo } from 'react';

interface Props {
    currentHp: number;
    maxHp: number;
    bossName: string;
    rank: number; // 0-5 (E-S)
}

const RANK_LABELS = ['E', 'D', 'C', 'B', 'A', 'S'];

const RANK_STYLES: Record<number, { text: string; bar: string; glow: string; shadow: string; pulse: boolean }> = {
    0: { text: 'text-gray-400', bar: 'from-gray-600 to-gray-500', glow: 'rgba(156,163,175,0.3)', shadow: 'shadow-gray-500/30', pulse: false },
    1: { text: 'text-green-400', bar: 'from-green-600 to-emerald-500', glow: 'rgba(74,222,128,0.3)', shadow: 'shadow-green-500/30', pulse: false },
    2: { text: 'text-blue-400', bar: 'from-blue-600 to-cyan-500', glow: 'rgba(96,165,250,0.4)', shadow: 'shadow-blue-500/30', pulse: false },
    3: { text: 'text-purple-400', bar: 'from-purple-600 to-fuchsia-500', glow: 'rgba(192,132,252,0.4)', shadow: 'shadow-purple-500/30', pulse: true },
    4: { text: 'text-red-400', bar: 'from-red-600 to-orange-500', glow: 'rgba(248,113,113,0.5)', shadow: 'shadow-red-500/40', pulse: true },
    5: { text: 'text-yellow-400', bar: 'from-yellow-500 to-amber-400', glow: 'rgba(250,204,21,0.6)', shadow: 'shadow-yellow-500/50', pulse: true },
};

export default function BossHpBar({ currentHp, maxHp, bossName, rank }: Props) {
    const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
    const prevHpRef = useRef(currentHp);
    const style = RANK_STYLES[rank] || RANK_STYLES[0];

    const hpColor = useMemo(() => {
        if (hpPercent > 60) return 'text-green-400';
        if (hpPercent > 30) return 'text-yellow-400';
        return 'text-red-400';
    }, [hpPercent]);

    useEffect(() => {
        prevHpRef.current = currentHp;
    }, [currentHp]);

    const isDead = currentHp <= 0;

    return (
        <div className="w-full relative">
            {/* Boss Name & Rank */}
            <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 border-2 rounded-lg flex items-center justify-center font-black text-sm bg-black/60 ${style.text} border-current`}>
                        {RANK_LABELS[rank] || '?'}
                    </div>
                    <div>
                        <h2 className={`text-xl font-black font-rajdhani uppercase tracking-wider ${style.text}`}>
                            {bossName}
                        </h2>
                        {!isDead && (
                            <span className="text-[10px] text-red-500/80 font-mono tracking-[0.3em] animate-pulse">
                                ▸ HOSTILE
                            </span>
                        )}
                        {isDead && (
                            <span className="text-[10px] text-green-500 font-mono tracking-[0.3em]">
                                ▸ DEFEATED
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-right font-mono flex items-baseline gap-1">
                    <span className={`text-xl font-black ${hpColor}`}>{currentHp.toLocaleString()}</span>
                    <span className="text-gray-600 text-xs">/ {maxHp.toLocaleString()} HP</span>
                </div>
            </div>

            {/* HP Bar */}
            <div className="h-5 w-full bg-gray-900/80 border border-red-900/30 relative overflow-hidden rounded-sm">
                {/* Striped background */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 5px)'
                }} />

                {/* Main HP Fill */}
                <div
                    className={`h-full bg-gradient-to-r ${style.bar} transition-all duration-700 ease-out relative`}
                    style={{
                        width: `${hpPercent}%`,
                        boxShadow: `0 0 20px ${style.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`
                    }}
                >
                    {/* Animated shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[shimmer_2s_infinite]" style={{
                        animation: 'shimmer 2.5s ease-in-out infinite'
                    }} />
                </div>

                {/* Damage flash */}
                <div className={`absolute inset-0 bg-red-500/40 transition-opacity duration-200 ${currentHp < prevHpRef.current ? 'opacity-100' : 'opacity-0'}`} />

                {/* Tick marks */}
                {[25, 50, 75].map(tick => (
                    <div key={tick} className="absolute top-0 bottom-0 w-px bg-white/10" style={{ left: `${tick}%` }} />
                ))}
            </div>

            {/* Percentage */}
            <div className="flex justify-between mt-1.5">
                <div className="text-[10px] text-gray-600 font-mono">
                    {isDead ? 'ELIMINATED' : `DMG: ${(maxHp - currentHp).toLocaleString()}`}
                </div>
                <div className={`text-[10px] font-mono font-bold ${hpColor}`}>
                    {hpPercent.toFixed(1)}%
                </div>
            </div>

            {/* CSS for shimmer */}
            <style>{`
                @keyframes shimmer {
                    0%, 100% { transform: translateX(-100%); }
                    50% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
