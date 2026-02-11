import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { LockClosedIcon } from '@heroicons/react/24/outline';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#020408] via-[#0a1120] to-[#020408] flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Invalid Reset Link</h2>
                    <p className="text-gray-400 mb-6">This password reset link is invalid or missing.</p>
                    <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300">
                        Request a new reset link
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/reset-password', {
                token,
                newPassword
            });
            toast.success('Password reset successful! You can now login.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Invalid or expired reset token');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020408] via-[#0a1120] to-[#020408] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold font-rajdhani tracking-widest text-white mb-2">
                        NEW PASSWORD
                    </h1>
                    <p className="text-sm text-gray-400 font-mono">Security Protocol Initiated</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-[#0a1120] border border-blue-500/30 rounded-lg p-8 shadow-xl">
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-400 mb-2 tracking-widest uppercase">
                            New Password
                        </label>
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                                placeholder="••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-400 mb-2 tracking-widest uppercase">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                                placeholder="••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded uppercase tracking-widest transition-all disabled:opacity-50 text-sm mb-4"
                    >
                        {isLoading ? 'PROCESSING...' : '🔒 RESET PASSWORD'}
                    </button>

                    <div className="text-center">
                        <Link to="/login" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                            ← Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
