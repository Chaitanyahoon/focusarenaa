import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { profileAPI } from '../services/api'
import { UserProfile } from '../types' // Import interface
import { UserCircleIcon, ShieldCheckIcon, Cog6ToothIcon, PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import EditProfileModal from '../components/profile/EditProfileModal'
import { toast } from 'react-hot-toast'

export default function Profile() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user: currentUser } = useAuthStore()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditOpen, setIsEditOpen] = useState(false)

    // Check if viewing own profile
    const isMe = !id || (currentUser && id === currentUser.id.toString())

    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true)
            try {
                if (isMe) {
                    // Use local store if available and matches, or fetch my profile
                    if (currentUser && !id) {
                        setProfile(currentUser as unknown as UserProfile) // Cast to compatible type
                    } else {
                        const data = await profileAPI.get()
                        setProfile(data)
                    }
                } else {
                    // Fetch other user
                    if (id) {
                        const data = await profileAPI.getById(parseInt(id))
                        setProfile(data)
                    }
                }
            } catch (error) {
                toast.error("Failed to load profile hunter data.")
                navigate('/dashboard')
            } finally {
                setIsLoading(false)
            }
        }
        loadProfile()
    }, [id, isMe, currentUser, navigate])

    // Update local state if editing own profile
    const handleProfileUpdate = async () => {
        if (isMe) {
            const { useAuthStore } = await import('../stores/authStore')
            useAuthStore.getState().fetchProfile()
        }
    }

    if (isLoading) return <div className="text-center py-20 text-blue-500 animate-pulse">Decrypting Hunter Dossier...</div>

    if (!profile) return null

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            {/* Back Button for visitors */}
            {!isMe && (
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    BACK TO REGISTRY
                </button>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12 text-center md:text-left">
                <div className="w-24 h-24 bg-gray-900 rounded-full border-2 border-system-blue overflow-hidden shadow-[0_0_20px_rgba(var(--color-system-blue-rgb),0.3)] shrink-0">
                    {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <UserCircleIcon className="w-full h-full text-gray-600 p-4" />
                    )}
                </div>
                <div className="flex-1">
                    <h1 className="text-4xl font-display font-bold text-white tracking-widest uppercase mb-1">
                        {profile.name}
                    </h1>
                    <p className="text-system-blue font-mono tracking-widest text-sm">
                        HUNTER ID: #{profile.id.toString().padStart(6, '0')}
                    </p>
                    <div className="flex gap-2 mt-3 justify-center md:justify-start">
                        <span className="px-2 py-0.5 border border-system-blue/50 bg-system-blue/10 text-system-blue text-xs tracking-wider">
                            SHADOW MONARCH
                        </span>
                        {/* Only show online status if real-time data connected later */}
                        <span className="px-2 py-0.5 border border-green-500/50 bg-green-500/10 text-green-300 text-xs tracking-wider">
                            ACTIVE STATUS
                        </span>
                    </div>
                </div>

                {isMe && (
                    <button
                        onClick={() => setIsEditOpen(true)}
                        className="w-full md:w-auto px-4 py-2 bg-system-blue/10 border border-system-blue/50 text-system-blue hover:bg-system-blue/20 rounded flex items-center justify-center gap-2 transition-all"
                    >
                        <PencilIcon className="w-4 h-4" />
                        EDIT PROFILE
                    </button>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">

                {/* Account Details */}
                <div className="system-panel p-8">
                    <div className="flex items-center gap-2 mb-6 text-system-blue border-b border-system-blue/30 pb-2">
                        <ShieldCheckIcon className="w-6 h-6" />
                        <h2 className="font-display font-bold tracking-widest text-lg">HUNTER DATA</h2>
                    </div>

                    <div className="space-y-4 font-mono text-sm">
                        <div className="flex justify-between items-center text-gray-400">
                            <span>LEVEL</span>
                            <span className="text-white font-bold text-lg">{profile.level}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-400">
                            <span>TOTAL XP</span>
                            <span className="text-system-blue">{profile.xp.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-400">
                            <span>JOIN DATE</span>
                            <span className="text-white">{new Date(profile.joinDate).toLocaleDateString()}</span>
                        </div>
                        {isMe && (
                            <div className="flex justify-between items-center text-gray-400">
                                <span>EMAIL ADDRESS</span>
                                <span className="text-white">{profile.email}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-gray-400">
                            <span>CURRENT THEME</span>
                            <span className="text-system-blue uppercase">{profile.theme || 'Blue'}</span>
                        </div>
                    </div>
                </div>

                {/* Settings / Bio */}
                <div className="system-panel p-8">
                    <div className="flex items-center gap-2 mb-6 text-gray-400 border-b border-gray-700 pb-2">
                        <Cog6ToothIcon className="w-6 h-6" />
                        <h2 className="font-display font-bold tracking-widest text-lg">BIO & CONFIG</h2>
                    </div>

                    <div className="text-gray-400 font-mono text-sm leading-relaxed min-h-[100px] whitespace-pre-wrap">
                        {profile.bio || "No system bio available."}
                    </div>
                </div>

            </div>

            <EditProfileModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onProfileUpdate={handleProfileUpdate}
            />

        </div>
    )
}
