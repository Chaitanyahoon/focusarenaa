import { useAuthStore } from '../stores/authStore'
import { UserCircleIcon, ShieldCheckIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

export default function Profile() {
    const { user } = useAuthStore()

    if (!user) return null

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex items-center gap-6 mb-12">
                <div className="w-24 h-24 bg-gray-900 rounded-full border-2 border-blue-500 overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <UserCircleIcon className="w-full h-full text-gray-600 p-4" />
                    )}
                </div>
                <div>
                    <h1 className="text-4xl font-display font-bold text-white tracking-widest uppercase mb-1">
                        {user.name}
                    </h1>
                    <p className="text-blue-400 font-mono tracking-widest text-sm">
                        HUNTER ID: #{user.id.toString().padStart(6, '0')}
                    </p>
                    <div className="flex gap-2 mt-3">
                        <span className="px-2 py-0.5 border border-blue-500/50 bg-blue-500/10 text-blue-300 text-xs tracking-wider">
                            SHADOW MONARCH
                        </span>
                        <span className="px-2 py-0.5 border border-green-500/50 bg-green-500/10 text-green-300 text-xs tracking-wider">
                            ONLINE
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">

                {/* Account Details */}
                <div className="system-panel p-8">
                    <div className="flex items-center gap-2 mb-6 text-blue-400 border-b border-blue-500/30 pb-2">
                        <ShieldCheckIcon className="w-6 h-6" />
                        <h2 className="font-display font-bold tracking-widest text-lg">ACCOUNT DATA</h2>
                    </div>

                    <div className="space-y-4 font-mono text-sm">
                        <div className="flex justify-between items-center text-gray-400">
                            <span>EMAIL ADDRESS</span>
                            <span className="text-white">{user.email}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-400">
                            <span>JOIN DATE</span>
                            <span className="text-white">2026-01-15</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-400">
                            <span>ACCOUNT STATUS</span>
                            <span className="text-green-400">ACTIVE</span>
                        </div>
                    </div>
                </div>

                {/* Settings Stub */}
                <div className="system-panel p-8 opacity-75">
                    <div className="flex items-center gap-2 mb-6 text-gray-400 border-b border-gray-700 pb-2">
                        <Cog6ToothIcon className="w-6 h-6" />
                        <h2 className="font-display font-bold tracking-widest text-lg">SYSTEM SETTINGS</h2>
                    </div>

                    <div className="text-center py-8 text-gray-500 font-mono text-sm">
                        [ SETTINGS MODULE LOCKED ]<br />
                        Requires Level 10 Access
                    </div>
                </div>

            </div>

        </div>
    )
}
