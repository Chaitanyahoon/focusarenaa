import { useState, useEffect } from 'react';
import { dailyQuestService, DailyQuest } from '../../services/dailyQuest';
import toast from 'react-hot-toast';
import { Skeleton } from '../shared/Skeleton';

const COOLDOWN_MINUTES = 15;

function getCooldownRemaining(createdAt: string): number {
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const elapsed = now - created;
    const cooldownMs = COOLDOWN_MINUTES * 60 * 1000;
    return Math.max(0, cooldownMs - elapsed);
}

function formatCooldown(ms: number): string {
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function DailyQuestWidget() {
    const [quests, setQuests] = useState<DailyQuest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expanded, setExpanded] = useState(true);
    const [, setTick] = useState(0); // Force re-render for countdown

    const fetchData = async () => {
        try {
            const data = await dailyQuestService.getDailyQuests();
            setQuests(data);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Tick every second to update cooldown timers
    useEffect(() => {
        const hasActiveCooldown = quests.some(q => !q.isCompleted && getCooldownRemaining(q.createdAt) > 0);
        if (!hasActiveCooldown) return;

        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [quests]);

    const handlePunch = async (questId: number, currentCount: number, target: number, createdAt: string) => {
        if (currentCount >= target) return;

        // Client-side cooldown check
        const remaining = getCooldownRemaining(createdAt);
        if (remaining > 0) {
            toast.error(`Quest is on cooldown! Wait ${formatCooldown(remaining)}`);
            return;
        }

        // Optimistic update
        const newCount = currentCount + 1;
        setQuests(prev => prev.map(q =>
            q.id === questId ? { ...q, currentCount: newCount, isCompleted: newCount >= target } : q
        ));

        try {
            await dailyQuestService.logProgress(questId, newCount);
            if (newCount === target) {
                toast.success('QUEST COMPLETED!', { icon: '🎉' });
            } else {
                toast.success('PUNCH!', { duration: 1000 });
            }
        } catch (error: any) {
            const msg = error?.response?.data || 'Failed to save progress';
            toast.error(typeof msg === 'string' ? msg : 'Failed to save progress');
            fetchData(); // Revert on error
        }
    };

    if (isLoading) return (
        <div className="system-panel p-4 mb-6 border border-blue-500/30">
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-3">
                <Skeleton className="h-16 w-full bg-gray-900/50" />
                <Skeleton className="h-16 w-full bg-gray-900/50" />
                <Skeleton className="h-16 w-full bg-gray-900/50" />
            </div>
        </div>
    );

    return (
        <div className="system-panel p-4 mb-6 border border-blue-500/30 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-display text-blue-400 tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rotate-45"></span>
                    DAILY QUESTS
                </h3>
                <button onClick={() => setExpanded(!expanded)} className="text-blue-500/50 hover:text-blue-400 text-xs transition-colors">
                    [{expanded ? 'MINIMIZE' : 'EXPAND'}]
                </button>
            </div>

            {expanded && (
                <div className="space-y-3">
                    {quests.length === 0 ? (
                        <div className="text-gray-500 text-sm italic py-2 text-center border border-dashed border-gray-800 rounded">
                            No active quests assigned by the System.
                        </div>
                    ) : (
                        quests.map(quest => {
                            const cooldownMs = getCooldownRemaining(quest.createdAt);
                            const isOnCooldown = cooldownMs > 0 && !quest.isCompleted;

                            return (
                                <div key={quest.id} className={`bg-black/40 border p-3 rounded relative group transition-all duration-300 ${quest.isCompleted ? 'border-green-500/30' : isOnCooldown ? 'border-yellow-500/30' : 'border-blue-900/30 hover:border-blue-500/50'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`font-bold transition-all duration-300 ${quest.isCompleted ? 'text-green-400 line-through decoration-green-500/50' : 'text-white'}`}>
                                            {quest.title}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {isOnCooldown && (
                                                <span className="text-[10px] font-mono text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-1.5 py-0.5 rounded animate-pulse">
                                                    ⏳ {formatCooldown(cooldownMs)}
                                                </span>
                                            )}
                                            <span className={`text-xs font-mono ${quest.isCompleted ? 'text-green-500' : 'text-blue-400'}`}>
                                                {quest.currentCount} / {quest.targetCount} {quest.unit}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-700 relative">
                                        <div
                                            className={`h-full transition-all duration-500 ease-out ${quest.isCompleted ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : isOnCooldown ? 'bg-yellow-500/50' : 'bg-blue-600 shadow-[0_0_5px_rgba(37,99,235,0.5)]'}`}
                                            style={{ width: `${Math.min((quest.currentCount / quest.targetCount) * 100, 100)}%` }}
                                        ></div>
                                    </div>

                                    {!quest.isCompleted && !isOnCooldown && (
                                        <button
                                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 bg-blue-600 text-white text-[10px] tracking-widest px-2 py-1 rounded hover:bg-blue-500 transition-all shadow-[0_0_10px_rgba(37,99,235,0.5)] active:scale-95 translate-x-2 group-hover:translate-x-0"
                                            onClick={() => handlePunch(quest.id, quest.currentCount, quest.targetCount, quest.createdAt)}
                                        >
                                            PUNCH
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {!expanded && (
                <div className="h-1 bg-blue-900/30 w-full mt-2 rounded overflow-hidden">
                    <div className="h-full bg-blue-500 w-1/3 animate-pulse"></div>
                </div>
            )}
        </div>
    );
}

