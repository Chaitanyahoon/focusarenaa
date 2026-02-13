import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { UserCircleIcon, ShieldCheckIcon, Cog6ToothIcon, PencilIcon } from '@heroicons/react/24/outline'
import EditProfileModal from '../components/profile/EditProfileModal'

export default function Profile() {
    const { user } = useAuthStore()
    const [isEditOpen, setIsEditOpen] = useState(false)

    if (!user) return null

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12 text-center md:text-left">
                <div className="w-24 h-24 bg-gray-900 rounded-full border-2 border-system-blue overflow-hidden shadow-[0_0_20px_rgba(var(--color-system-blue-rgb),0.3)] shrink-0">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <UserCircleIcon className="w-full h-full text-gray-600 p-4" />
                    )}
                </div>
                <div className="flex-1">
                    <h1 className="text-4xl font-display font-bold text-white tracking-widest uppercase mb-1">
                        {user.name}
                    </h1>
                    <p className="text-system-blue font-mono tracking-widest text-sm">
                        HUNTER ID: #{user.id.toString().padStart(6, '0')}
                    </p>
                    <div className="flex gap-2 mt-3 justify-center md:justify-start">
                        <span className="px-2 py-0.5 border border-system-blue/50 bg-system-blue/10 text-system-blue text-xs tracking-wider">
                            SHADOW MONARCH
                        </span>
                        <span className="px-2 py-0.5 border border-green-500/50 bg-green-500/10 text-green-300 text-xs tracking-wider">
                            ONLINE
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => setIsEditOpen(true)}
                    className="w-full md:w-auto px-4 py-2 bg-system-blue/10 border border-system-blue/50 text-system-blue hover:bg-system-blue/20 rounded flex items-center justify-center gap-2 transition-all"
                >
                    <PencilIcon className="w-4 h-4" />
                    EDIT PROFILE
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">

                {/* Account Details */}
                <div className="system-panel p-8">
                    <div className="flex items-center gap-2 mb-6 text-system-blue border-b border-system-blue/30 pb-2">
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
                        <div className="flex justify-between items-center text-gray-400">
                            <span>CURRENT THEME</span>
                            <span className="text-system-blue uppercase">{user.theme || 'Blue'}</span>
                        </div>
                    </div>
                </div>

                {/* Settings / Bio */}
                <div className="system-panel p-8">
                    <div className="flex items-center gap-2 mb-6 text-gray-400 border-b border-gray-700 pb-2">
                        <Cog6ToothIcon className="w-6 h-6" />
                        <h2 className="font-display font-bold tracking-widest text-lg">BIO & CONFIG</h2>
                    </div>

                    <div className="text-gray-400 font-mono text-sm leading-relaxed min-h-[100px]">
                        {user.bio || "No system bio available. Initialize settings to update."}
                    </div>
                </div>

            </div>

            <EditProfileModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
            />

        </div>
    )
}
