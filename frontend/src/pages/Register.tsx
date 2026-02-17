import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const { register, isLoading, error } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        try {
            await register({ name, email, password })
            toast.success('🎉 Welcome to Focus Arena, Hunter!')
            navigate('/dashboard')
        } catch (error) {
            toast.error('Registration failed. Email may already exist.')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <div className="glass-panel p-8 md:p-12 max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="text-xs font-accent tracking-widest text-cyan-400 mb-2 uppercase">
                        [ New Hunter Registration ]
                    </div>
                    <h1 className="text-4xl font-display font-bold neon-purple mb-2">
                        AWAKEN
                    </h1>
                    <p className="text-gray-400 font-accent">
                        Initialize Your Hunter Profile
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm  font-semibold text-cyan-400 mb-2 font-accent uppercase tracking-wider">
                            Hunter Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full"
                            placeholder="Enter your hunter name"
                            required
                        />
                    </div>

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
                            placeholder="Min. 6 characters"
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-cyan-400 mb-2 font-accent uppercase tracking-wider">
                            Confirm Code
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full"
                            placeholder="Re-enter access code"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm font-accent">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="holo-button w-full bg-purple-900/30 border-purple-400 text-purple-300 hover:bg-purple-500/20 hover:text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] font-bold tracking-widest"
                    >
                        {isLoading ? 'INITIALIZING...' : '⚡ BECOME A HUNTER'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400 font-accent">
                    Already registered?{' '}
                    <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                        Access System
                    </Link>
                </div>
            </div>
        </div>
    )
}
