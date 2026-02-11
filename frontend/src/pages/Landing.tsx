import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>

            {/* Main System Window */}
            <div className="system-panel max-w-4xl w-full p-12 text-center animate-in fade-in zoom-in duration-700">

                <div className="mb-8">
                    <h2 className="text-xl md:text-2xl text-blue-400 tracking-[0.3em] uppercase mb-4 animate-pulse">
                        System Notification
                    </h2>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 mb-8"></div>
                </div>

                <div className="flex justify-center mb-6">
                    <Logo className="h-24 md:h-32 w-auto animate-pulse scale-90" />
                </div>

                <h1 className="text-6xl md:text-8xl font-bold mb-6 text-white tracking-wider" style={{ textShadow: '0 0 20px rgba(0,234,255,0.4)' }}>
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

                <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-12">
                    <button
                        onClick={() => navigate('/register')}
                        className="system-button text-xl px-12 py-4 hover:bg-blue-500/10"
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

                {/* Decorative System Elements */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
            </div>

            <div className="mt-8 text-gray-600 font-mono text-xs tracking-widest">
                SYSTEM VER. 2.0 // CONNECTED
            </div>
        </div>
    );
}
