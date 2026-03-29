import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/solid'

export default function Login() {
    const { login, isLoading } = useAuthStore()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [serverWarm, setServerWarm] = useState<'idle' | 'pinging' | 'ready' | 'slow'>('idle')

    // Ping backend on mount to warm up Render free-tier (non-blocking)
    useEffect(() => {
        setServerWarm('pinging')
        const timeout = setTimeout(() => setServerWarm('slow'), 5000)
        fetch('https://focusarenaa.onrender.com/api/health')
            .then(() => { clearTimeout(timeout); setServerWarm('ready') })
            .catch(() => { clearTimeout(timeout); setServerWarm('slow') })
        return () => clearTimeout(timeout)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        try {
            await login({ email, password })
            toast.success('Welcome back, Hunter!', {
                style: {
                    background: 'rgba(10,10,10,0.9)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '12px',
                    fontWeight: '700',
                }
            })
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Invalid credentials'
            setError(msg)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-full bg-zinc-950 relative overflow-hidden select-none">
            {/* Drag region */}
            <div className="absolute top-0 left-0 w-full h-10 app-drag-region z-50" />

            {/* Background radial gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-white/[0.03] rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[200px] h-[150px] bg-white/[0.02] rounded-full blur-[40px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 180, damping: 24 }}
                className="w-full px-6 relative z-10 space-y-5"
            >
                {/* Logo & Title */}
                <div className="text-center space-y-2 pt-6">
                    {/* Animated logo mark */}
                    <motion.div
                        className="flex items-center justify-center mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 18 }}
                    >
                        <div className="relative">
                            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center shadow-xl">
                                <div className="w-3 h-3 rounded-full bg-zinc-100 shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
                            </div>
                            <div className="absolute -inset-1 rounded-2xl bg-white/[0.02] blur-md -z-10" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-[20px] font-black text-white tracking-tight">Focus Arena</h1>
                        <p className="text-[10px] text-white/20 uppercase tracking-[0.25em] font-bold mt-1">Your productivity HQ</p>
                    </motion.div>
                </div>

                {/* Server status */}
                <AnimatePresence>
                    {serverWarm === 'slow' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                                <span className="text-[10px] text-amber-400/80 font-medium">Server warming up — first login may be slow</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form card */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-4 space-y-2.5 backdrop-blur-sm"
                >
                    <form onSubmit={handleSubmit} className="space-y-2.5">
                        {/* Email */}
                        <div className="relative group">
                            <div className="absolute inset-0 rounded-xl bg-white/[0.04] border border-white/[0.07] group-focus-within:border-white/20 group-focus-within:bg-white/[0.07] transition-all duration-200" />
                            <input
                                type="email"
                                required
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError('') }}
                                autoComplete="email"
                                className="w-full bg-transparent text-[12px] text-white py-3 px-4 outline-none placeholder:text-white/20 relative z-10 font-medium"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative group">
                            <div className="absolute inset-0 rounded-xl bg-white/[0.04] border border-white/[0.07] group-focus-within:border-white/20 group-focus-within:bg-white/[0.07] transition-all duration-200" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                placeholder="Password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError('') }}
                                autoComplete="current-password"
                                className="w-full bg-transparent text-[12px] text-white py-3 pl-4 pr-10 outline-none placeholder:text-white/20 relative z-10 font-medium"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-1 text-white/20 hover:text-white/50 transition-colors"
                            >
                                {showPassword
                                    ? <EyeSlashIcon className="w-3.5 h-3.5" />
                                    : <EyeIcon className="w-3.5 h-3.5" />
                                }
                            </button>
                        </div>

                        {/* Error message */}
                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="text-[10px] text-red-400/80 font-medium px-1"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !email || !password}
                            className="w-full py-3 rounded-xl bg-zinc-100 text-zinc-950 text-[11px] font-black uppercase tracking-[0.12em] transition-all duration-200 hover:bg-white active:scale-[0.97] disabled:opacity-25 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 mt-1"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-3 h-3 rounded-full border-[1.5px] border-zinc-400 border-t-zinc-900 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : 'Enter Arena'}
                        </button>
                    </form>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center pb-4"
                >
                    <span className="text-[10px] text-white/15">No account? </span>
                    <a
                        href="https://focusarenaa.vercel.app/register"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-white/30 hover:text-white/60 transition-colors font-bold"
                    >
                        Register on web ↗
                    </a>
                </motion.div>
            </motion.div>

            {/* Close App Button */}
            <div className="absolute top-4 right-4 z-50 no-drag">
                <button
                    onClick={() => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const ipc = (window as any).electron?.ipcRenderer
                        if (ipc) ipc.send('quit-app')
                    }}
                    className="p-2 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
