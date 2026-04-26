import { useEffect, useRef, useState } from 'react';
import { dailyQuestService, DailyQuest } from '../../services/dailyQuest';
import toast from 'react-hot-toast';
import { Skeleton } from '../shared/Skeleton';
import RewardReveal from '../effects/RewardReveal';

const COOLDOWN_MINUTES = 15;

function getCooldownRemaining(lastProgressAt?: string | null): number {
    if (!lastProgressAt) return 0;

    const lastProgress = new Date(lastProgressAt).getTime();
    const now = Date.now();
    const elapsed = now - lastProgress;
    const cooldownMs = COOLDOWN_MINUTES * 60 * 1000;
    return Math.max(0, cooldownMs - elapsed);
}

function formatCooldown(ms: number): string {
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

function getQuestStatusLabel(isCompleted: boolean, isOnCooldown: boolean, isPending: boolean): string {
    if (isCompleted) return 'Cleared';
    if (isPending) return 'Syncing';
    if (isOnCooldown) return 'Cooldown';
    return 'Ready';
}

function getQuestFlavor(quest: DailyQuest): string {
    const title = quest.title.toLowerCase();
    if (title.includes('work') || title.includes('study') || title.includes('focus')) return 'Deep Work';
    if (title.includes('push') || title.includes('walk') || title.includes('fitness') || title.includes('run')) return 'Training';
    if (title.includes('read') || title.includes('learn')) return 'Knowledge';
    if (quest.difficulty >= 3) return 'Boss Prep';
    return 'Discipline';
}

function getRewardEstimate(quest: DailyQuest): { xp: number; gold: number } {
    const difficulty = Math.max(1, quest.difficulty || 1);
    return {
        xp: difficulty * 15,
        gold: difficulty * 10,
    };
}

export default function DailyQuestWidget() {
    const [quests, setQuests] = useState<DailyQuest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(true);
    const [pendingQuestIds, setPendingQuestIds] = useState<number[]>([]);
    const [rewardReveal, setRewardReveal] = useState<{
        title: string;
        subtitle: string;
        xp: number;
        gold: number;
        tone: 'blue' | 'green' | 'gold';
    } | null>(null);
    const [, setTick] = useState(0); // Force re-render for countdown
    const isMountedRef = useRef(true);

    const fetchData = async (showLoading: boolean = false) => {
        if (showLoading && isMountedRef.current) {
            setIsLoading(true);
        }

        setError(null);
        try {
            const data = await dailyQuestService.getDailyQuests();
            if (!isMountedRef.current) return;
            setQuests(data);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            if (!isMountedRef.current) return;
            setError('Unable to load daily quests.');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Tick every second to update cooldown timers
    useEffect(() => {
        const hasActiveCooldown = quests.some(q => !q.isCompleted && getCooldownRemaining(q.lastProgressAt) > 0);
        if (!hasActiveCooldown) return;

        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [quests]);

    const handlePunch = async (questId: number, currentCount: number, target: number, lastProgressAt?: string | null) => {
        if (currentCount >= target || pendingQuestIds.includes(questId)) return;

        // Client-side cooldown check
        const remaining = getCooldownRemaining(lastProgressAt);
        if (remaining > 0) {
            toast.error(`Quest is on cooldown! Wait ${formatCooldown(remaining)}`);
            return;
        }

        // Optimistic update
        const newCount = currentCount + 1;
        const optimisticTimestamp = new Date().toISOString();
        setPendingQuestIds(prev => prev.includes(questId) ? prev : [...prev, questId]);
        setQuests(prev => prev.map(q =>
            q.id === questId
                ? {
                    ...q,
                    currentCount: newCount,
                    isCompleted: newCount >= target,
                    lastProgressAt: optimisticTimestamp
                }
                : q
        ));

        try {
            await dailyQuestService.logProgress(questId, newCount);
            const quest = quests.find(q => q.id === questId);
            const reward = quest ? getRewardEstimate(quest) : { xp: 15, gold: 10 };
            if (newCount === target) {
                toast.success('QUEST COMPLETED!');
                setRewardReveal({
                    title: 'Quest cleared',
                    subtitle: 'Streak pressure reduced. The System logged your progress.',
                    xp: reward.xp,
                    gold: reward.gold,
                    tone: 'gold',
                });
            } else {
                toast.success('PUNCH!', { duration: 1000 });
                setRewardReveal({
                    title: 'Progress punched',
                    subtitle: `${target - newCount} more ${target - newCount === 1 ? 'step' : 'steps'} until this contract clears.`,
                    xp: Math.max(5, Math.floor(reward.xp / target)),
                    gold: Math.max(2, Math.floor(reward.gold / target)),
                    tone: 'blue',
                });
            }
        } catch (error: any) {
            const msg = error?.response?.data || 'Failed to save progress';
            toast.error(typeof msg === 'string' ? msg : 'Failed to save progress');
            fetchData(); // Revert on error
        } finally {
            if (isMountedRef.current) {
                setPendingQuestIds(prev => prev.filter(id => id !== questId));
            }
        }
    };

    const completedQuests = quests.filter(quest => quest.isCompleted).length;
    const activeQuests = quests.filter(quest => !quest.isCompleted).length;
    const cooldownQuests = quests.filter(quest => !quest.isCompleted && getCooldownRemaining(quest.lastProgressAt) > 0).length;
    const completionPercent = quests.length ? (completedQuests / quests.length) * 100 : 0;
    const boardState = quests.length === 0
        ? 'Standby'
        : completedQuests === quests.length
            ? 'Claimed'
            : cooldownQuests > 0
                ? 'Recovering'
                : 'Live';

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

    if (error) return (
        <div className="system-panel p-4 mb-6 border border-red-500/30">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-display text-red-400 tracking-widest">DAILY QUESTS</h3>
                    <p className="text-sm text-gray-400 mt-1">{error}</p>
                </div>
                <button
                    onClick={() => {
                        fetchData(true);
                    }}
                    className="px-3 py-2 text-xs font-bold tracking-widest border border-red-500/40 text-red-300 hover:bg-red-500/10 transition-colors"
                >
                    RETRY
                </button>
            </div>
        </div>
    );

    return (
        <div className="system-panel p-4 mb-6 border border-blue-500/30 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="absolute right-0 top-0 h-24 w-40 bg-[radial-gradient(circle_at_top_right,rgb(var(--color-system-blue-rgb)/0.18),transparent_65%)] pointer-events-none" />
            <div className="flex justify-between items-start gap-4 mb-4 relative">
                <div>
                    <div className="habit-chip rounded-full px-2.5 py-1 text-[9px]">{boardState}</div>
                    <h3 className="mt-3 text-xl font-display text-blue-300 tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rotate-45 shadow-[0_0_10px_rgb(var(--color-system-blue-rgb))]"></span>
                        DAILY CONTRACT BOARD
                    </h3>
                    <p className="mt-1 text-xs font-mono uppercase tracking-[0.18em] text-gray-500">
                        Punch progress. Protect the chain. Get paid.
                    </p>
                </div>
                <button onClick={() => setExpanded(!expanded)} className="text-blue-500/50 hover:text-blue-400 text-xs transition-colors shrink-0">
                    [{expanded ? 'MINIMIZE' : 'EXPAND'}]
                </button>
            </div>

            {expanded && (
                <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 px-3 py-3">
                            <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-blue-200/45">Active</div>
                            <div className="mt-1 text-xl font-black text-white">{activeQuests}</div>
                        </div>
                        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-3 py-3">
                            <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-emerald-200/45">Cleared</div>
                            <div className="mt-1 text-xl font-black text-emerald-300">{completedQuests}</div>
                        </div>
                        <div className="rounded-xl border border-yellow-500/10 bg-yellow-500/5 px-3 py-3">
                            <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-yellow-200/45">Cooldown</div>
                            <div className="mt-1 text-xl font-black text-yellow-300">{cooldownQuests}</div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-blue-900/30 bg-blue-950/20 px-3 py-3">
                        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-blue-200/70">
                            <span>Run completion</span>
                            <span>{completedQuests} / {quests.length || 0} cleared</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full border border-blue-500/10 bg-black/40">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-500 heartbeat-glow"
                                style={{ width: `${completionPercent}%` }}
                            />
                        </div>
                    </div>
                    {quests.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-blue-900/40 bg-black/30 px-4 py-6 text-center">
                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/5">
                                <span className="h-2 w-2 rotate-45 bg-blue-300/70 shadow-[0_0_10px_rgb(var(--color-system-blue-rgb)/0.35)]" />
                            </div>
                            <p className="text-sm font-medium text-gray-300">No active quests assigned.</p>
                            <p className="mt-1 text-xs font-mono uppercase tracking-widest text-gray-500">
                                The system is waiting for your next objective.
                            </p>
                        </div>
                    ) : (
                        quests.map(quest => {
                            const cooldownMs = getCooldownRemaining(quest.lastProgressAt);
                            const isOnCooldown = cooldownMs > 0 && !quest.isCompleted;
                            const isPending = pendingQuestIds.includes(quest.id);
                            const progressPercent = Math.min((quest.currentCount / quest.targetCount) * 100, 100);
                            const questStatusLabel = getQuestStatusLabel(quest.isCompleted, isOnCooldown, isPending);
                            const flavor = getQuestFlavor(quest);

                            return (
                                <div key={quest.id} className={`system-card rounded-xl p-3 transition-all duration-300 ${quest.isCompleted ? 'border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.08)]' : isOnCooldown ? 'border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.08)]' : 'border-blue-900/30 hover:border-blue-500/50 hover:bg-black/50'} focus-within:border-blue-400/60`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`font-bold transition-all duration-300 ${quest.isCompleted ? 'text-green-400 line-through decoration-green-500/50' : 'text-white'}`}>
                                                    {quest.title}
                                                </span>
                                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest ${quest.isCompleted ? 'border-green-500/20 bg-green-500/10 text-green-300' : isOnCooldown ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300' : 'border-blue-500/20 bg-blue-500/10 text-blue-300'}`}>
                                                    {questStatusLabel}
                                                </span>
                                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-gray-400">
                                                    {flavor}
                                                </span>
                                            </div>
                                            {quest.description && (
                                                <p className="mt-1 line-clamp-2 text-xs text-gray-400">
                                                    {quest.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-mono ${quest.isCompleted ? 'text-green-500' : 'text-blue-400'}`}>
                                                {quest.currentCount} / {quest.targetCount} {quest.unit}
                                            </span>
                                            {isOnCooldown && (
                                                <div className="mt-1 text-[10px] font-mono text-yellow-400">
                                                    WAIT {formatCooldown(cooldownMs)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-3 h-2 overflow-hidden rounded-full border border-gray-700 bg-gray-900 relative">
                                        <div
                                            className={`h-full transition-all duration-500 ease-out ${quest.isCompleted ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : isOnCooldown ? 'bg-yellow-500/50' : 'bg-blue-600 shadow-[0_0_5px_rgba(37,99,235,0.5)]'}`}
                                            style={{ width: `${progressPercent}%` }}
                                        ></div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between gap-3">
                                        <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
                                            {quest.isCompleted ? 'Reward processed' : isOnCooldown ? 'Recovery window active' : 'Action available'}
                                        </div>
                                        {!quest.isCompleted && (
                                            <button
                                                className="rounded-md border border-blue-300/20 bg-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_0_14px_rgba(37,99,235,0.5)] transition-all hover:bg-blue-500 hover:shadow-[0_0_24px_rgba(37,99,235,0.45)] active:scale-95 disabled:cursor-not-allowed disabled:bg-blue-900/70 disabled:text-blue-200"
                                                onClick={() => handlePunch(quest.id, quest.currentCount, quest.targetCount, quest.lastProgressAt)}
                                                disabled={isPending || isOnCooldown}
                                                aria-label={`Punch ${quest.title}`}
                                            >
                                                {isPending ? 'SYNCING' : isOnCooldown ? 'LOCKED' : 'PUNCH +1'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            <RewardReveal
                isOpen={rewardReveal !== null}
                title={rewardReveal?.title ?? ''}
                subtitle={rewardReveal?.subtitle}
                xp={rewardReveal?.xp}
                gold={rewardReveal?.gold}
                tone={rewardReveal?.tone}
                onClose={() => setRewardReveal(null)}
            />

            {!expanded && (
                <div className="h-1 bg-blue-900/30 w-full mt-2 rounded overflow-hidden">
                    <div className="h-full bg-blue-500 w-1/3 animate-pulse"></div>
                </div>
            )}
        </div>
    );
}

