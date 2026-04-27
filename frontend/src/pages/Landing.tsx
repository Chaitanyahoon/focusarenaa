import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-screen overflow-hidden px-4 py-6 md:px-8 relative">
            <div className="ambient-orb left-[-10rem] top-[-8rem]" />
            <div className="ambient-orb right-[-8rem] bottom-[-10rem] [animation-delay:2s]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgb(var(--color-system-blue-rgb)/0.16),transparent_42%)] pointer-events-none"></div>

            <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
                <header className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                        <Logo className="h-11 w-auto drop-shadow-[0_0_16px_rgb(var(--color-system-blue-rgb)/0.45)]" />
                        <div>
                            <div className="font-display text-lg font-black tracking-[0.28em] text-white">FOCUS ARENA</div>
                            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-blue-300/60">System online</div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="hidden rounded-full border border-blue-500/20 bg-blue-500/5 px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-200 transition-all hover:border-blue-400/50 hover:bg-blue-500/10 md:inline-flex"
                    >
                        Recover ID
                    </button>
                </header>

                <main className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr]">
                    <section className="float-in">
                        <div className="habit-chip rounded-full px-4 py-2 text-[11px]">Daily focus RPG</div>
                        <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.92] tracking-[0.06em] text-white md:text-7xl lg:text-8xl" style={{ textShadow: '0 0 32px rgb(var(--color-system-blue-rgb) / 0.24)' }}>
                            Turn your day into a raid you actually finish.
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100/72 md:text-xl">
                            FocusArena gives every session a reason to come back: daily quests, streak pressure, XP, guild energy, and a dashboard that feels like your personal system window.
                        </p>

                        <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <button
                                onClick={() => navigate('/register')}
                                className="system-button system-button-primary text-lg px-10 py-4"
                            >
                                Start Today&apos;s Run
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="text-sm font-bold uppercase tracking-[0.26em] text-gray-400 transition-colors hover:text-white md:hidden"
                            >
                                Recover ID
                            </button>
                            <a
                                href="https://github.com/Chaitanyahoon/focusarenaa/releases"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-blue-100"
                            >
                                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                                Desktop client
                            </a>
                        </div>

                        <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
                            {[
                                ['15m', 'Quest cadence'],
                                ['XP', 'Visible growth'],
                                ['Guild', 'Team raids'],
                            ].map(([value, label]) => (
                                <div key={label} className="system-card rounded-xl px-4 py-4">
                                    <div className="text-2xl font-black text-white md:text-3xl">{value}</div>
                                    <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.2em] text-blue-200/50">{label}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="relative float-in [animation-delay:120ms]">
                        <div className="system-panel overflow-hidden rounded-2xl border-blue-400/30 bg-black/55 p-4 shadow-[0_0_70px_rgba(0,0,0,0.65)] md:p-6">
                            <div className="absolute inset-0 scanline-overlay opacity-10" />
                            <div className="relative rounded-xl border border-blue-500/20 bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(2,6,23,0.72)_45%,rgba(16,185,129,0.08))] p-5 md:p-7">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-blue-300/60">System notification</div>
                                        <h2 className="mt-3 text-3xl font-black tracking-[0.12em] text-white md:text-4xl">Daily Quest Issued</h2>
                                    </div>
                                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-right">
                                        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-200/70">Streak</div>
                                        <div className="text-3xl font-black text-emerald-300">07</div>
                                    </div>
                                </div>

                                <div className="mt-7 space-y-3">
                                    {[
                                        ['Complete 3 priority tasks', 'XP + Gold', 'Ready'],
                                        ['Join one guild push', 'Raid damage', 'Live'],
                                        ['Review progress before logout', 'Streak lock', 'Pending'],
                                    ].map(([title, reward, status], index) => (
                                        <div key={title} className="group rounded-xl border border-blue-500/15 bg-black/35 p-4 transition-all hover:border-blue-400/45 hover:bg-blue-500/10" style={{ animationDelay: `${index * 80}ms` }}>
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="truncate font-bold text-white">{title}</div>
                                                    <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.2em] text-blue-200/45">{reward}</div>
                                                </div>
                                                <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-blue-200">
                                                    {status}
                                                </span>
                                            </div>
                                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-950">
                                                <div className={`h-full bg-gradient-to-r from-blue-500 to-emerald-300 ${index === 0 ? 'w-2/3' : index === 1 ? 'w-1/2' : 'w-1/4'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-yellow-400/15 bg-yellow-400/[0.08] p-4">
                                        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-yellow-200/60">Reward bank</div>
                                        <div className="mt-2 text-2xl font-black text-yellow-300">+350G</div>
                                    </div>
                                    <div className="rounded-xl border border-red-400/15 bg-red-400/[0.08] p-4">
                                        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-red-200/60">Missed today</div>
                                        <div className="mt-2 text-2xl font-black text-red-300">Streak at risk</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -right-4 -top-4 hidden rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.22em] text-blue-200 shadow-[0_0_30px_rgb(var(--color-system-blue-rgb)/0.2)] md:block">
                            Live arena preview
                        </div>
                    </section>
                </main>

                <footer className="flex flex-col gap-2 border-t border-white/10 py-4 text-[10px] font-mono uppercase tracking-[0.22em] text-gray-600 sm:flex-row sm:items-center sm:justify-between">
                    <span>SYSTEM VER. 2.5 // CONNECTED</span>
                    <span>Daily quests reset every login cycle</span>
                </footer>
            </div>
        </div>
    );
}

// aria-label
