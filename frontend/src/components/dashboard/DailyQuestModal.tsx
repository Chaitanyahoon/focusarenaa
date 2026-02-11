import { useState, useEffect } from 'react';
import { dailyQuestService } from '../../services/dailyQuest';

export default function DailyQuestModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkDailyPopup = async () => {
            const today = new Date().toISOString().split('T')[0];
            const lastSeen = localStorage.getItem('daily_quest_seen_date');

            if (lastSeen !== today) {
                // Only show if there are quests
                try {
                    const quests = await dailyQuestService.getDailyQuests();
                    if (quests.length > 0) {
                        setIsOpen(true);
                        localStorage.setItem('daily_quest_seen_date', today);
                    }
                } catch (error) {
                    console.error("Failed to fetch quests for modal check");
                }
            }
        };

        checkDailyPopup();
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="system-panel w-full max-w-md p-1 border-t-4 border-t-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-in zoom-in-95 duration-500">
                <div className="bg-gradient-to-b from-red-900/40 to-black p-6 text-center border border-red-500/30 relative overflow-hidden">

                    {/* Background Glitch Effect */}
                    <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>

                    <h2 className="text-3xl font-display font-bold text-red-500 tracking-widest mb-2 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)] animate-pulse">
                        ⚠️ SYSTEM ALERT
                    </h2>

                    <div className="h-px w-full bg-red-500/50 my-4"></div>

                    <p className="text-white font-bold text-lg mb-4">
                        A NEW QUEST HAS ARRIVED.
                    </p>

                    <p className="text-gray-400 text-sm mb-8 font-mono">
                        Complete your daily objectives to survive and grow stronger. Failure will result in... consequences.
                    </p>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]"
                    >
                        ACCEPT QUEST
                    </button>
                </div>

                <div className="bg-black/80 p-2 text-center border-t border-red-900/50">
                    <span className="text-[10px] text-red-800 font-mono animate-pulse">Current Status: PENDING</span>
                </div>
            </div>
        </div>
    );
}
