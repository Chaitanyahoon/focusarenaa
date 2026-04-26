import { useState, useEffect } from 'react';
import { dailyQuestService } from '../../services/dailyQuest';

export default function DailyQuestModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [questCount, setQuestCount] = useState(0);
    const [isChecking, setIsChecking] = useState(true);

    const handleClose = () => {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('daily_quest_seen_date', today);
        setIsOpen(false);
    };

    useEffect(() => {
        let isMounted = true;

        const checkDailyPopup = async () => {
            const today = new Date().toISOString().split('T')[0];
            const lastSeen = localStorage.getItem('daily_quest_seen_date');

            if (lastSeen !== today) {
                // Only show if there are quests
                try {
                    const quests = await dailyQuestService.getDailyQuests();
                    if (!isMounted) return;

                    setQuestCount(quests.length);
                    if (quests.length > 0) {
                        setIsOpen(true);
                    }
                } catch (error) {
                    console.error("Failed to fetch quests for modal check");
                } finally {
                    if (isMounted) {
                        setIsChecking(false);
                    }
                }
            } else if (isMounted) {
                setIsChecking(false);
            }
        };

        checkDailyPopup();

        return () => {
            isMounted = false;
        };
    }, []);

    if (isChecking || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="system-panel w-full max-w-lg overflow-hidden border border-blue-500/30 bg-black/95 shadow-[0_0_70px_rgba(37,99,235,0.28)] animate-in zoom-in-95 duration-500">
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="relative border-b border-blue-500/20 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_60%)] p-6">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />
                    <div className="relative flex items-start justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.24em] text-blue-300">
                                <span className="h-2 w-2 rotate-45 bg-blue-400" />
                                Daily Dispatch
                            </div>
                            <h2 className="mt-4 text-2xl font-display font-bold tracking-widest text-white">
                                Your run is waiting.
                            </h2>
                            <p className="mt-2 max-w-sm text-sm text-gray-400">
                                Today&apos;s quest rotation is live. Punch progress, lock the streak, and leave with visible XP before you close the app.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-right">
                            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-blue-200/70">Active</div>
                            <div className="mt-1 text-2xl font-black text-blue-300 tabular-nums">{questCount}</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 p-6">
                    <div className="grid grid-cols-3 gap-3 text-left">
                        <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 px-3 py-3">
                            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-blue-300/70">Cadence</div>
                            <div className="mt-1 text-sm font-semibold text-white">15 min</div>
                        </div>
                        <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 px-3 py-3">
                            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-blue-300/70">Flow</div>
                            <div className="mt-1 text-sm font-semibold text-white">Manual punch</div>
                        </div>
                        <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 px-3 py-3">
                            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-blue-300/70">Reward</div>
                            <div className="mt-1 text-sm font-semibold text-white">XP + streak</div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-dashed border-blue-500/20 bg-blue-950/10 px-4 py-3">
                        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-blue-300/70">Status</div>
                        <div className="mt-2 flex items-center justify-between gap-3 text-sm text-gray-300">
                            <span>Objectives queued. Your next small win is already picked.</span>
                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-300">
                                Ready
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="w-full rounded-xl border border-blue-300/20 bg-blue-600 py-3 text-sm font-bold tracking-[0.22em] text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.35)]"
                    >
                        OPEN CONTRACT BOARD
                    </button>
                </div>
            </div>
        </div>
    );
}
