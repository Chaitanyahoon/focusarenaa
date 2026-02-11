import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { sfx } from '../../utils/sounds';

// Generate random particles
const generateParticles = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,        // random horizontal position (%)
        delay: Math.random() * 0.5,     // stagger
        size: Math.random() * 8 + 4,    // 4-12px
        color: [
            '#3b82f6', '#22c55e', '#f59e0b', '#ef4444',
            '#8b5cf6', '#06b6d4', '#ec4899', '#00EAFF'
        ][Math.floor(Math.random() * 8)],
        rotation: Math.random() * 720 - 360,
        xDrift: Math.random() * 200 - 100,  // horizontal drift
    }));
};

export default function LevelUpCelebration() {
    const { user } = useAuthStore();
    const [showCelebration, setShowCelebration] = useState(false);
    const [prevLevel, setPrevLevel] = useState<number | null>(null);
    const [newLevel, setNewLevel] = useState(0);
    const [particles] = useState(() => generateParticles(50));

    useEffect(() => {
        if (!user) return;

        if (prevLevel !== null && user.level > prevLevel) {
            setNewLevel(user.level);
            setShowCelebration(true);
            sfx.play('levelUp');

            const timer = setTimeout(() => {
                setShowCelebration(false);
            }, 4000);

            return () => clearTimeout(timer);
        }

        setPrevLevel(user.level);
    }, [user?.level]);

    if (!showCelebration) return null;

    return (
        <AnimatePresence>
            {showCelebration && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center"
                >
                    {/* Dark Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black pointer-events-auto"
                        onClick={() => setShowCelebration(false)}
                    />

                    {/* Confetti Particles */}
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            initial={{
                                opacity: 1,
                                y: '50vh',
                                x: `${p.x}vw`,
                                scale: 0,
                                rotate: 0,
                            }}
                            animate={{
                                opacity: [1, 1, 0],
                                y: [0, -100, -300],
                                x: p.xDrift,
                                scale: [0, 1.5, 0.5],
                                rotate: p.rotation,
                            }}
                            transition={{
                                duration: 2.5,
                                delay: p.delay,
                                ease: 'easeOut',
                            }}
                            className="absolute"
                            style={{
                                width: p.size,
                                height: p.size,
                                backgroundColor: p.color,
                                left: `${p.x}%`,
                                top: '50%',
                            }}
                        />
                    ))}

                    {/* Level Up Text */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="relative z-10 text-center"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-6xl md:text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-orange-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]"
                        >
                            LEVEL UP!
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="mt-4 text-4xl md:text-6xl font-display font-bold text-white"
                        >
                            LV. {newLevel}
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="mt-3 text-sm text-gray-400 font-mono tracking-widest"
                        >
                            NEW POWER AWAKENED
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
