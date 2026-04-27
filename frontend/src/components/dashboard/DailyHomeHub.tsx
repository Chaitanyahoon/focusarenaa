import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dailyQuestService, type DailyQuest } from '../../services/dailyQuest';

interface DailyHomeHubProps {
    streakCount: number;
    gold: number;
}

function getRunTheme(quests: DailyQuest[]): string {
    if (quests.some(q => q.title.toLowerCase().includes('work') || q.title.toLowerCase().includes('focus'))) {
        return 'Deep Work Raid';
    }
    if (quests.some(q => q.title.toLowerCase().includes('push') || q.title.toLowerCase().includes('fitness'))) {
        return 'Training Day';
    }
    if (quests.every(q => q.isCompleted) && quests.length > 0) {
        return 'Streak Secured';
    }
    return 'Discipline Trial';
}

export default function DailyHomeHub({ streakCount, gold }: DailyHomeHubProps) {
    const [quests, setQuests] = useState<DailyQuest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        dailyQuestService.getDailyQuests()
            .then((data) => {
                if (isMounted) setQuests(data);
            })
            .catch(() => {
                if (isMounted) setQuests([]);
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const nextQuest = quests.find(q => !q.isCompleted);
    const completed = quests.filter(q => q.isCompleted).length;
    const runTheme = getRunTheme(quests);

    return (
        <section className="system-card rounded-2xl p-5 md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <div className="habit-chip rounded-full px-3 py-1.5 text-[10px]">Today&apos;s command center</div>
                    <h2 className="mt-4 text-3xl font-black tracking-[0.12em] text-white md:text-4xl">
                        {isLoading ? 'Syncing daily run...' : runTheme}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100/65">
                        {nextQuest
                            ? `Next best action: ${nextQuest.title}. Finish the small contract, then the rest of the dashboard has momentum.`
                            : quests.length > 0
                                ? 'Every daily contract is cleared. Convert the momentum into a gate run or a guild push.'
                                : 'No daily contracts are active yet. Create a quest or enter a gate so today still has a win condition.'}
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-2 lg:w-[22rem]">
                    <div className="rounded-xl border border-blue-500/10 bg-black/35 px-3 py-3">
                        <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-blue-200/45">Daily</div>
                        <div className="mt-1 text-xl font-black text-white">{completed}/{quests.length}</div>
                    </div>
                    <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-3 py-3">
                        <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-emerald-200/45">Streak</div>
                        <div className="mt-1 text-xl font-black text-emerald-300">{streakCount}</div>
                    </div>
                    <div className="rounded-xl border border-yellow-500/10 bg-yellow-500/5 px-3 py-3">
                        <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-yellow-200/45">Gold</div>
                        <div className="mt-1 text-xl font-black text-yellow-300">{gold}</div>
                    </div>
                </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link to="/quests" className="system-button system-button-primary px-5 py-3 text-xs">
                    Start next objective
                </Link>
                <Link to="/guilds" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-blue-400/40 hover:text-white">
                    Check guild pressure
                </Link>
            </div>
        </section>
    );
}

// aria-label
