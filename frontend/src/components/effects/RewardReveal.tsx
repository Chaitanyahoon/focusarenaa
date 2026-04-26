import { AnimatePresence, motion } from 'framer-motion';

interface RewardRevealProps {
    isOpen: boolean;
    title: string;
    subtitle?: string;
    xp?: number;
    gold?: number;
    tone?: 'blue' | 'green' | 'gold';
    onClose: () => void;
}

const toneClasses = {
    blue: 'from-blue-300 via-cyan-300 to-white text-blue-200 border-blue-400/30 bg-blue-500/10',
    green: 'from-emerald-300 via-green-300 to-white text-emerald-200 border-emerald-400/30 bg-emerald-500/10',
    gold: 'from-yellow-200 via-amber-300 to-white text-yellow-100 border-yellow-400/30 bg-yellow-500/10',
};

export default function RewardReveal({ isOpen, title, subtitle, xp, gold, tone = 'blue', onClose }: RewardRevealProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className={`relative w-full max-w-md overflow-hidden rounded-2xl border ${toneClasses[tone]} p-6 text-center shadow-[0_0_70px_rgba(0,0,0,0.65)]`}
                        initial={{ opacity: 0, scale: 0.86, y: 28 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 12 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="absolute inset-0 scanline-overlay opacity-10" />
                        <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-system-blue/20 blur-3xl" />

                        <div className="relative">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.12)]">
                                <span className="h-4 w-4 rotate-45 border border-white/50 bg-white/10" />
                            </div>
                            <div className="text-[10px] font-mono uppercase tracking-[0.28em] opacity-70">Reward processed</div>
                            <h2 className={`mt-3 bg-gradient-to-r ${toneClasses[tone].split(' ')[0]} ${toneClasses[tone].split(' ')[1]} ${toneClasses[tone].split(' ')[2]} bg-clip-text text-3xl font-black tracking-[0.16em] text-transparent`}>
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-gray-300">
                                    {subtitle}
                                </p>
                            )}

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-white/10 bg-black/35 px-4 py-3">
                                    <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-gray-500">XP</div>
                                    <div className="mt-1 text-2xl font-black text-white">+{xp ?? 0}</div>
                                </div>
                                <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3">
                                    <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-yellow-200/60">Gold</div>
                                    <div className="mt-1 text-2xl font-black text-yellow-300">+{gold ?? 0}</div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-6 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white transition-all hover:bg-white/15"
                            >
                                Continue run
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
