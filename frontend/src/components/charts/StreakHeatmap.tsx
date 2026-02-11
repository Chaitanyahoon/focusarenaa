import { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import type { StreakDay } from '../../types';
import { FireIcon } from '@heroicons/react/24/solid';

export default function StreakHeatmap() {
    const [calendar, setCalendar] = useState<StreakDay[]>([]);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [totalActive, setTotalActive] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await analyticsAPI.getStreakCalendar(90);
                setCalendar(data.calendar);
                setCurrentStreak(data.currentStreak);
                setTotalActive(data.totalActiveDays);
            } catch (e) {
                console.error('Failed to load streak data', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Get intensity level (0-4) based on task count
    const getIntensity = (count: number): number => {
        if (count === 0) return 0;
        if (count <= 1) return 1;
        if (count <= 3) return 2;
        if (count <= 5) return 3;
        return 4;
    };

    const intensityColors: Record<number, string> = {
        0: 'bg-[#0a1120] border-blue-900/20',
        1: 'bg-blue-900/40 border-blue-800/30',
        2: 'bg-blue-700/50 border-blue-600/40',
        3: 'bg-blue-500/60 border-blue-400/50',
        4: 'bg-blue-400/80 border-blue-300/60 shadow-[0_0_6px_rgba(56,189,248,0.3)]',
    };

    // Organize data into weeks (columns) for GitHub-style grid
    const getWeeks = () => {
        if (calendar.length === 0) return [];

        // Pad start to align with day of week
        const firstDate = new Date(calendar[0]?.date);
        const startDay = firstDate.getDay(); // 0=Sun, 6=Sat
        const padded: (StreakDay | null)[] = Array(startDay).fill(null);
        padded.push(...calendar);

        const weeks: (StreakDay | null)[][] = [];
        for (let i = 0; i < padded.length; i += 7) {
            weeks.push(padded.slice(i, i + 7));
        }
        // Pad last week
        const lastWeek = weeks[weeks.length - 1];
        while (lastWeek && lastWeek.length < 7) {
            lastWeek.push(null);
        }

        return weeks;
    };

    const weeks = getWeeks();
    const dayLabels = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];

    if (loading) {
        return (
            <div className="system-panel p-6 min-h-[200px] flex items-center justify-center">
                <div className="text-blue-400 animate-pulse font-mono text-sm">LOADING ACTIVITY DATA...</div>
            </div>
        );
    }

    return (
        <div className="system-panel p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display font-bold text-cyan-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                    ACTIVITY HEATMAP
                </h3>
                <div className="flex items-center gap-4 text-sm font-mono">
                    <div className="flex items-center gap-1.5 text-orange-400">
                        <FireIcon className="w-4 h-4" />
                        <span>{currentStreak} DAY STREAK</span>
                    </div>
                    <div className="text-gray-400">
                        {totalActive} ACTIVE DAYS
                    </div>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-2">
                {/* Day Labels */}
                <div className="flex flex-col gap-[3px] mr-1 flex-shrink-0">
                    {dayLabels.map((label, i) => (
                        <div key={i} className="h-[14px] text-[10px] text-gray-500 font-mono flex items-center">
                            {label}
                        </div>
                    ))}
                </div>

                {/* Weeks */}
                {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[3px]">
                        {week.map((day, di) => {
                            if (!day) {
                                return <div key={di} className="w-[14px] h-[14px]" />;
                            }
                            const intensity = getIntensity(day.taskCount);
                            const date = new Date(day.date);
                            const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            return (
                                <div
                                    key={di}
                                    className={`w-[14px] h-[14px] rounded-[2px] border transition-all hover:scale-150 hover:z-10 cursor-default ${intensityColors[intensity]}`}
                                    title={`${label}: ${day.taskCount} task${day.taskCount !== 1 ? 's' : ''}`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-gray-500 font-mono">
                <span>LESS</span>
                {[0, 1, 2, 3, 4].map(level => (
                    <div
                        key={level}
                        className={`w-[12px] h-[12px] rounded-[2px] border ${intensityColors[level]}`}
                    />
                ))}
                <span>MORE</span>
            </div>
        </div>
    );
}
