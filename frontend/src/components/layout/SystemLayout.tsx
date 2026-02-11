import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import {
    Squares2X2Icon,
    ClipboardDocumentListIcon,
    TrophyIcon,
    ChartBarIcon,
    UserIcon,
    ArrowRightOnRectangleIcon,
    ShoppingBagIcon,
    MapIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline'
import Logo from '../ui/Logo'
import LevelUpCelebration from '../effects/LevelUpCelebration'

const NAVIGATION = [
    { name: 'STATUS', path: '/dashboard', icon: Squares2X2Icon },
    { name: 'QUESTS', path: '/quests', icon: ClipboardDocumentListIcon },
    { name: 'GATES', path: '/gates', icon: MapIcon },
    { name: 'GUILDS', path: '/guilds', icon: UserGroupIcon },
    { name: 'RANKING', path: '/leaderboard', icon: TrophyIcon },
    { name: 'SHOP', path: '/shop', icon: ShoppingBagIcon },
    { name: 'ANALYSIS', path: '/analytics', icon: ChartBarIcon },
    { name: 'PROFILE', path: '/profile', icon: UserIcon },
]

export default function SystemLayout() {
    const location = useLocation()
    const { logout } = useAuthStore()

    return (
        <div className="flex min-h-screen bg-[#020408] text-blue-100 font-body selection:bg-blue-500/30">
            <LevelUpCelebration />

            {/* SIDEBAR NAVIGATION */}
            <aside className="fixed left-0 top-0 h-full w-20 md:w-64 bg-[#050914]/95 border-r border-blue-500/20 backdrop-blur-sm z-50 flex flex-col transition-all duration-300">

                {/* Logo / Header */}
                <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-blue-500/20">
                    <Logo className="h-10 w-auto" />
                    <span className="hidden md:block ml-3 font-display font-bold text-xl tracking-widest text-white">
                        FOCUS ARENA
                    </span>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-8 flex flex-col gap-2 px-2">
                    {NAVIGATION.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`
                  group flex items-center gap-3 px-3 md:px-4 py-3 rounded-sm transition-all duration-300
                  ${isActive
                                        ? 'bg-blue-600/10 border-l-2 border-blue-500 text-blue-400 shadow-[inset_10px_0_20px_-10px_rgba(59,130,246,0.2)]'
                                        : 'text-gray-500 hover:text-blue-300 hover:bg-blue-500/5 hover:border-l-2 hover:border-blue-500/50'
                                    }
                `}
                            >
                                <item.icon className={`w-6 h-6 shrink-0 ${isActive ? 'animate-pulse' : ''}`} />
                                <span className={`hidden md:block font-display tracking-widest text-sm font-medium ${isActive ? 'text-blue-400' : ''}`}>
                                    {item.name}
                                </span>

                                {/* Active Indicator (Right side) */}
                                {isActive && (
                                    <div className="hidden md:block ml-auto w-1.5 h-1.5 bg-blue-500 shadow-[0_0_5px_#3b82f6]"></div>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* System Info / Logout */}
                <div className="p-4 border-t border-blue-500/20 bg-blue-900/5">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors rounded-sm border border-transparent hover:border-red-500/30"
                    >
                        <ArrowRightOnRectangleIcon className="w-6 h-6 shrink-0" />
                        <span className="hidden md:block font-display tracking-widest text-sm">SYSTEM LOGOUT</span>
                    </button>

                    <div className="hidden md:flex justify-between mt-4 text-[10px] text-gray-600 font-mono tracking-widest">
                        <span>VER. 2.4.1</span>
                        <span>ONLINE</span>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 ml-20 md:ml-64 relative min-h-screen">
                {/* Background Grid repeating */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle at 50% 50%, #1e3a8a 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}>
                </div>

                {/* Content */}
                <div className="relative z-10 p-4 md:p-8 max-w-[90%] mx-auto">
                    <Outlet />
                </div>
            </main>

        </div>
    )
}
