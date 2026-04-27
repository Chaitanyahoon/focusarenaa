import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await authAPI.requestPasswordReset(email);
            toast.success(response.message || 'If that email exists, a reset link has been sent.');
            setEmailSent(true);
        } catch (error) {
            console.error(error);
            toast.error('Unable to start password reset right now.');
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#020408] via-[#0a1120] to-[#020408] flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold font-rajdhani tracking-widest text-white mb-2">
                            CHECK YOUR EMAIL
                        </h2>
                        <p className="text-sm text-gray-400 font-mono">Recovery Link Dispatched</p>
                    </div>

                    <div className="bg-[#0a1120] border border-blue-500/30 rounded-lg p-8 shadow-xl">
                        <div className="text-center">
                            <EnvelopeIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                            <p className="text-gray-300 mb-6">
                                A password reset link has been sent to <strong className="text-white">{email}</strong>.
                                Click the link to reset your password.
                            </p>
                            <p className="text-xs text-gray-500 mb-6">
                                Link expires in 1 hour. Didn't receive it? Check your spam folder.
                            </p>
                            <Link
                                to="/login"
                                className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded uppercase tracking-widest transition-all text-sm"
                            >
                                Return to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020408] via-[#0a1120] to-[#020408] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold font-rajdhani tracking-widest text-white mb-2">
                        RESET PASSWORD
                    </h1>
                    <p className="text-sm text-gray-400 font-mono">Initialize Recovery Protocol</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-[#0a1120] border border-blue-500/30 rounded-lg p-8 shadow-xl">
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-400 mb-2 tracking-widest uppercase">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                            placeholder="hunter@example.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded uppercase tracking-widest transition-all disabled:opacity-50 text-sm mb-4"
                    >
                        {isLoading ? 'PROCESSING...' : 'SEND RESET LINK'}
                    </button>

                    <div className="text-center">
                        <Link to="/login" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
