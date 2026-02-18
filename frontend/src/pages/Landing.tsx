import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>

            {/* Main System Window */}
            <div className="system-panel max-w-4xl w-full p-8 md:p-12 text-center animate-in fade-in zoom-in duration-700 scale-90 origin-center transform transition-transform">

                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl text-blue-400 tracking-[0.3em] uppercase mb-4 animate-pulse">
                        System Notification
                    </h2>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 mb-8"></div>
                </div>

                <div className="flex justify-center mb-6">
                    <Logo className="h-24 md:h-32 w-auto animate-pulse scale-90" />
                </div>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-wider" style={{ textShadow: '0 0 20px rgba(0,234,255,0.4)' }}>
                    FOCUS ARENA
                </h1>

                <div className="space-y-6 max-w-2xl mx-auto mb-12">
                    <p className="text-2xl md:text-3xl text-gray-200 font-light leading-relaxed">
                        Welcome, Player.
                    </p>
                    <p className="text-lg text-blue-200/80 tracking-wide">
                        [ A Daily Quest is waiting for you. ]<br />
                        [ Will you accept the System's invitation? ]
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-8">
                    <button
                        onClick={() => navigate('/register')}
                        className="system-button text-xl px-12 py-4 hover:bg-blue-500/20 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,234,255,0.3)] hover:shadow-[0_0_30px_rgba(0,234,255,0.6)]"
                    >
                        Accept
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        className="text-gray-400 hover:text-white transition-colors tracking-widest text-sm uppercase border-b border-transparent hover:border-gray-500 pb-1"
                    >
                        Recover ID
                    </button>
                </div>

                {/* Desktop Download Section */}
                <div className="mt-16 pt-8 border-t border-white/10 w-full max-w-lg mx-auto">
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-blue-300/60 text-sm tracking-[0.2em] font-mono uppercase">
                            Available on Desktop
                        </p>
                        <a
                            href="/downloads/focus-arena-setup.exe"
                            className="group flex items-center gap-4 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-lg transition-all duration-300"
                        >
                            <svg className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <div className="text-left">
                                <div className="text-white font-bold tracking-wide group-hover:text-blue-200 transition-colors">Windows Client</div>
                                <div className="text-xs text-gray-500 font-mono">SYSTEM VER. 1.0.0</div>
                            </div>
                            <svg className="w-5 h-5 text-gray-500 group-hover:text-white ml-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Decorative System Elements */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
            </div>

            <div className="mt-4 text-gray-600 font-mono text-xs tracking-widest absolute bottom-4">
                SYSTEM VER. 2.0 // CONNECTED
            </div>
        </div>
    );
}
