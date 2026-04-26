import { useEffect, useState } from 'react';

const STORAGE_KEY = 'focusarena_onboarding_complete';

const focusStyles = [
    {
        id: 'sprinter',
        title: 'Sprinter',
        copy: 'Short bursts, fast wins, visible XP.',
    },
    {
        id: 'raider',
        title: 'Raider',
        copy: 'Bigger objectives, gates, and boss pressure.',
    },
    {
        id: 'keeper',
        title: 'Keeper',
        copy: 'Streaks, routines, and daily consistency.',
    },
];

export default function FirstRunOnboarding() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState(focusStyles[0].id);

    useEffect(() => {
        setIsOpen(localStorage.getItem(STORAGE_KEY) !== 'true');
    }, []);

    const finish = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        localStorage.setItem('focusarena_focus_style', selectedStyle);
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="system-panel w-full max-w-2xl overflow-hidden rounded-2xl border-blue-500/30 bg-black/95 shadow-[0_0_80px_rgba(0,0,0,0.7)]">
                <div className="relative border-b border-blue-500/20 bg-blue-900/10 p-6">
                    <div className="absolute right-0 top-0 h-full w-40 bg-gradient-to-l from-blue-500/10 to-transparent" />
                    <div className="relative">
                        <div className="habit-chip rounded-full px-3 py-1.5 text-[10px]">First login calibration</div>
                        <h2 className="mt-4 text-3xl font-black tracking-[0.14em] text-white">Build your daily loop.</h2>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
                            Pick the pressure style that fits you. This keeps onboarding lightweight while giving the app a personal first-run ritual.
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid gap-3 md:grid-cols-3">
                        {focusStyles.map(style => {
                            const isSelected = selectedStyle === style.id;
                            return (
                                <button
                                    key={style.id}
                                    type="button"
                                    onClick={() => setSelectedStyle(style.id)}
                                    className={`rounded-xl border p-4 text-left transition-all ${isSelected
                                        ? 'border-blue-400/60 bg-blue-500/15 text-blue-100 shadow-[0_0_28px_rgb(var(--color-system-blue-rgb)/0.12)]'
                                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-blue-400/30 hover:text-white'
                                        }`}
                                >
                                    <div className="text-lg font-black tracking-[0.16em] text-white">{style.title}</div>
                                    <p className="mt-3 text-xs font-mono uppercase leading-relaxed tracking-[0.14em] opacity-70">{style.copy}</p>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
                        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-blue-200/50">Your first move</div>
                        <p className="mt-2 text-sm text-gray-300">
                            Open the contract board, punch one daily quest, and secure the streak before exploring gates or guilds.
                        </p>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={finish}
                            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-300 transition-all hover:text-white"
                        >
                            Skip setup
                        </button>
                        <button
                            type="button"
                            onClick={finish}
                            className="system-button system-button-primary px-6 py-3 text-xs"
                        >
                            Enter arena
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
