import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useNotificationStore } from '../../stores/notificationStore'
import {
    Squares2X2Icon,
    ClipboardDocumentListIcon,
    TrophyIcon,
    ChartBarIcon,
    UserIcon,
    ArrowRightOnRectangleIcon,
    ShoppingBagIcon,
    MapIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline'
import Logo from '../ui/Logo'
import LevelUpCelebration from '../effects/LevelUpCelebration'

const NAVIGATION = [
    { name: 'STATUS', path: '/dashboard', icon: Squares2X2Icon },
    { name: 'QUESTS', path: '/quests', icon: ClipboardDocumentListIcon },
    { name: 'GATES', path: '/gates', icon: MapIcon },
    { name: 'GUILDS', path: '/guilds', icon: UserGroupIcon },
    { name: 'RANKING', path: '/leaderboard', icon: TrophyIcon },
    { name: 'CHAT', path: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'SHOP', path: '/shop', icon: ShoppingBagIcon },
    { name: 'ANALYSIS', path: '/analytics', icon: ChartBarIcon },
    { name: 'PROFILE', path: '/profile', icon: UserIcon },
]

export default function SystemLayout() {
    const location = useLocation()
    const { logout, user } = useAuthStore()
    const { unreadMessages, friendRequests } = useNotificationStore()

    return (
        <div className="flex min-h-screen bg-[#020408] text-blue-100 font-body selection:bg-blue-500/30 overflow-hidden relative">
            <LevelUpCelebration />

            {/* SIDEBAR NAVIGATION - DESKTOP ONLY */}
            <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 glass-panel z-50 flex-col transition-all duration-300 border-r border-system-blue/30">

                {/* Logo / Header with Scan effect */}
                <div className="h-20 flex items-center justify-start px-6 border-b border-system-blue/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-system-blue/5 group-hover:bg-system-blue/10 transition-colors"></div>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-system-blue to-transparent opacity-50"></div>

                    <Logo className="h-10 w-auto relative z-10 drop-shadow-[0_0_8px_rgba(var(--color-system-blue-rgb),0.5)]" />
                    <span className="ml-3 font-display font-bold text-xl tracking-widest text-white neon-text-blue relative z-10">
                        FOCUS ARENA
                    </span>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-8 flex flex-col gap-2 px-2 overflow-y-auto custom-scrollbar">
                    {NAVIGATION.map((item) => {
                        const isActive = location.pathname === item.path

                        let badgeCount = 0
                        if (item.path === '/chat') {
                            badgeCount = unreadMessages + friendRequests
                        }

                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 relative overflow-hidden
                  ${isActive
                                        ? 'bg-system-blue/20 border-l-2 border-system-blue text-blue-300 shadow-[inset_0_0_20px_rgba(var(--color-system-blue-rgb),0.1)]'
                                        : 'text-gray-500 hover:text-blue-300 hover:bg-system-blue/5'
                                    }
                `}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-system-blue/10 to-transparent pointer-events-none"></div>
                                )}
                                <item.icon className={`w-6 h-6 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-system-blue drop-shadow-[0_0_5px_rgba(var(--color-system-blue-rgb),0.5)]' : ''}`} />
                                <span className={`font-display tracking-widest text-sm font-medium ${isActive ? 'text-blue-200' : ''}`}>
                                    {item.name}
                                </span>

                                {/* Notification Badge */}
                                {badgeCount > 0 && (
                                    <div className="ml-auto bg-system-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-[#020408] shadow-sm animate-pulse">
                                        {badgeCount > 9 ? '9+' : badgeCount}
                                    </div>
                                )}

                                {/* Active Indicator (Right side) */}
                                {isActive && !badgeCount && (
                                    <div className="ml-auto w-1.5 h-1.5 bg-system-blue rounded-full shadow-[0_0_8px_rgb(var(--color-system-blue-rgb))] animate-pulse"></div>
                                )}
                            </Link>
                        )
                    })}

                    {/* Admin Link */}
                    {user?.role === 'Admin' && (
                        <Link
                            to="/admin"
                            className={`
              group flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 relative overflow-hidden
              ${location.pathname === '/admin'
                                    ? 'bg-red-500/20 border-l-2 border-red-500 text-red-300 shadow-[inset_0_0_20px_rgba(255,0,0,0.1)]'
                                    : 'text-gray-500 hover:text-red-300 hover:bg-red-500/5'
                                }
            `}
                        >
                            {location.pathname === '/admin' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent pointer-events-none"></div>
                            )}
                            <ShieldCheckIcon className={`w-6 h-6 shrink-0 transition-transform group-hover:scale-110 ${location.pathname === '/admin' ? 'text-red-500 drop-shadow-[0_0_5px_rgba(255,0,0,0.5)]' : ''}`} />
                            <span className={`font-display tracking-widest text-sm font-medium ${location.pathname === '/admin' ? 'text-red-200' : ''}`}>
                                ADMIN
                            </span>

                            {location.pathname === '/admin' && (
                                <div className="ml-auto w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(255,0,0,1)] animate-pulse"></div>
                            )}
                        </Link>
                    )}
                </nav>

                {/* Desktop Download CTA */}
                <div className="px-4 pb-4">
                    <a
                        href="https://github.com/Chaitanyahoon/focusarenaa/releases"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-blue-100 border border-blue-500/20 hover:border-blue-500/40 rounded-sm transition-all group"
                    >
                        <div className="relative">
                            <ArrowRightOnRectangleIcon className="w-5 h-5 rotate-90" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="font-display tracking-widest text-xs font-bold">DESKTOP CLIENT</span>
                            <span className="text-[9px] text-blue-400/60 font-mono">GET THE APP</span>
                        </div>
                    </a>
                </div>

                {/* System Info / Logout */}
                <div className="p-4 border-t border-system-blue/20 bg-black/40 backdrop-blur-sm relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-900 to-transparent"></div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-start gap-3 px-4 py-3 text-system-red hover:bg-system-red/10 hover:text-red-300 transition-all rounded-sm border border-transparent hover:border-system-red/30 group"
                    >
                        <ArrowRightOnRectangleIcon className="w-6 h-6 shrink-0 group-hover:translate-x-1 transition-transform" />
                        <span className="font-display tracking-widest text-sm">SYSTEM LOGOUT</span>
                    </button>

                    <div className="flex justify-between mt-4 text-[10px] text-gray-600 font-mono tracking-widest">
                        <span className="text-system-blue/50">VER. 2.5.0</span>
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            ONLINE
                        </span>
                    </div>
                </div>
            </aside>

            {/* BOTTOM NAVIGATION - MOBILE ONLY */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#0a1120]/95 backdrop-blur-xl border-t border-system-blue/30 z-50 px-2 py-2 flex justify-around items-center overflow-x-auto no-scrollbar pb-safe">
                {NAVIGATION.slice(0, 6).map((item) => {
                    const isActive = location.pathname === item.path

                    // For mobile, we only show top 5 items. If Chat is not in top 5, user might catch it.
                    // But Chat IS in top 5 items?
                    // NAVIGATION index: 5 is Chat. slice(0, 5) covers 0,1,2,3,4. 
                    // 0: Status
                    // 1: Quests
                    // 2: Gates
                    // 3: Guilds
                    // 4: Ranking
                    // Chat is 5. It is hidden on mobile nav bottom bar? 
                    // Current code: NAVIGATION.slice(0, 5). Chat is NOT in the bottom bar!
                    // This is a UX issue if users want to chat on mobile.
                    // I should probably replace Ranking or Guilds with Chat if it has unread? 
                    // Or just extend the slice?
                    // 5 items fit well. 6 might update layout.
                    // Let's check the user request. "make it refresh there only". 
                    // If I add Chat to mobile nav it solves the access issue too.
                    // For now, I will just add badge logic, but I suspect Chat is missing from mobile nav.
                    // Wait, NAVIGATION[5] is Chat. slice(0,5) excludes it.
                    // I will change it to include Chat (item 5) instead of Guilds (item 3) or Gates (item 2)?
                    // Or just add Chat as a 6th item and see if it fits (overflow-x-auto handles it).
                    // I'll change slice(0, 6).

                    let badgeCount = 0
                    if (item.path === '/chat') {
                        badgeCount = unreadMessages + friendRequests
                    }

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`relative flex flex-col items-center justify-center p-2 rounded-lg transition-all ${isActive ? 'text-system-blue' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <div className="relative">
                                <item.icon className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_8px_rgba(var(--color-system-blue-rgb),0.8)]' : ''}`} />
                                {badgeCount > 0 && (
                                    <div className="absolute -top-1 -right-1 bg-system-red text-white text-[9px] font-bold px-1 rounded-full border border-[#0a1120] animate-pulse">
                                        {badgeCount > 9 ? '!' : badgeCount}
                                    </div>
                                )}
                            </div>
                            <span className="text-[10px] font-display tracking-widest mt-1">{item.name}</span>
                        </Link>
                    )
                })}
                {/* Mobile Admin Link */}
                {user?.role === 'Admin' && (
                    <Link
                        to="/admin"
                        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${location.pathname === '/admin' ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <ShieldCheckIcon className={`w-6 h-6 ${location.pathname === '/admin' ? 'drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]' : ''}`} />
                        <span className="text-[10px] font-display tracking-widest mt-1">ADMIN</span>
                    </Link>
                )}
                {/* Mobile Logout (Icon only) */}
                <button onClick={logout} className="p-2 text-system-red/70 hover:text-system-red">
                    <ArrowRightOnRectangleIcon className="w-6 h-6" />
                </button>
            </nav>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 md:ml-64 relative min-h-screen bg-[#020408] pb-24 md:pb-8">
                {/* Background Grid repeating - Animated */}
                <div className="absolute inset-0 z-0 bg-grid-animate opacity-30 pointer-events-none"></div>

                {/* Vignette */}
                <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none"></div>

                {/* Content */}
                <div className="relative z-10 p-4 md:p-8 max-w-[95%] mx-auto">
                    <Outlet />
                </div>
            </main>

        </div>
    )
}
