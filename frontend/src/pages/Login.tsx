import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'
import Logo from '../components/ui/Logo'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { login, isLoading, error } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await login({ email, password })

            // Check for admin role
            const user = useAuthStore.getState().user
            toast.success('🎮 Welcome back, Hunter!')

            if (user?.role === 'Admin') {
                navigate('/admin')
            } else {
                navigate('/dashboard')
            }
        } catch (error) {
            toast.error('Failed to login. Check your credentials.')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <div className="glass-panel p-8 md:p-12 max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="text-xs font-accent tracking-widest text-cyan-400 mb-2 uppercase">
                        [ Access Control ]
                    </div>
                    <div className="flex justify-center mb-4">
                        <Logo className="h-20 w-auto drop-shadow-[0_0_10px_rgba(0,234,255,0.5)] scale-90" />
                    </div>
                    <h1 className="text-4xl font-display font-bold neon-text mb-2">
                        HUNTER LOGIN
                    </h1>
                    <p className="text-gray-400 font-accent">
                        Initialize System Connection
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-cyan-400 mb-2 font-accent uppercase tracking-wider">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full"
                            placeholder="hunter@focusarena.io"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-cyan-400 mb-2 font-accent uppercase tracking-wider">
                            Access Code
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="flex justify-end mb-6">
                        <Link
                            to="/forgot-password"
                            className="text-xs text-cyan-400/80 hover:text-cyan-300 font-accent tracking-wider hover:underline transition-all"
                        >
                            FORGOT PASSWORD?
                        </Link>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm font-accent">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="holo-button w-full bg-cyan-900/30 border-cyan-400 text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-all shadow-[0_0_15px_rgba(0,234,255,0.2)] hover:shadow-[0_0_25px_rgba(0,234,255,0.5)] font-bold tracking-widest"
                    >
                        {isLoading ? 'CONNECTING...' : '⚔️ ENTER ARENA'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400 font-accent">
                    New Hunter?{' '}
                    <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                        Initialize Profile
                    </Link>
                </div>
            </div>
        </div>
    )
}
