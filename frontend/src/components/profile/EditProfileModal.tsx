import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PaintBrushIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../../stores/authStore'
import { shopService } from '../../services/shop'
import { profileAPI } from '../../services/api'
import { toast } from 'react-hot-toast'

interface Props {
    isOpen: boolean
    onClose: () => void
    onProfileUpdate?: () => Promise<void>
}

const THEMES = [
    { id: 'blue', name: 'Shadow Blue', color: 'bg-cyan-500', price: 0 },
    { id: 'red', name: 'Blood Red', color: 'bg-red-600', price: 1000 },
    { id: 'purple', name: 'Void Purple', color: 'bg-purple-600', price: 1500 },
    { id: 'gold', name: 'Royal Gold', color: 'bg-yellow-500', price: 2000 },
    { id: 'green', name: 'Necromancer Green', color: 'bg-emerald-500', price: 2500 },
    { id: 'orange', name: 'Blaze Orange', color: 'bg-orange-500', price: 1000 },
    { id: 'pink', name: 'Cyber Pink', color: 'bg-pink-500', price: 1000 },
    { id: 'monochrome', name: 'Noir Monochrome', color: 'bg-gray-100', price: 1500 },
]

export default function EditProfileModal({ isOpen, onClose, onProfileUpdate }: Props) {
    const { user, fetchProfile } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)
    const [ownedThemes, setOwnedThemes] = useState<string[]>(['blue'])

    // Form State
    const [name, setName] = useState('')
    const [bio, setBio] = useState('')
    const [theme, setTheme] = useState('blue')

    useEffect(() => {
        if (user) {
            setName(user.name)
            setBio(user.bio || '')
            setTheme(user.theme || 'blue')
        }
    }, [user, isOpen])

    useEffect(() => {
        if (isOpen) {
            shopService.getOwnedThemes()
                .then(setOwnedThemes)
                .catch((err) => {
                    console.error('Failed to fetch owned themes:', err)
                    setOwnedThemes(['blue'])
                })
        }
    }, [isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Using the robust profileAPI service instead of raw axios
            await profileAPI.update({
                name,
                bio,
                theme
            })

            await fetchProfile() // Refresh global state
            if (onProfileUpdate) await onProfileUpdate()
            toast.success('Profile updated successfully!')
            onClose()
        } catch (error: any) {
            console.error('Profile update failed:', error)
            const msg = error.response?.data?.message || 'Failed to update profile'
            toast.error(msg)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-[95%] max-w-md transform overflow-hidden rounded-2xl bg-[#0a1120] border border-system-blue/30 p-4 md:p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-6 border-b border-system-blue/20 pb-4">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-xl font-bold font-rajdhani text-white flex items-center gap-2"
                                    >
                                        <PaintBrushIcon className="w-5 h-5 text-system-blue" />
                                        CUSTOMIZE SYSTEM
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name Field */}
                                    <div>
                                        <label className="block text-xs font-mono text-gray-500 mb-1">HUNTER NAME</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-system-blue transition-colors font-rajdhani font-bold"
                                            required
                                        />
                                    </div>

                                    {/* Bio Field */}
                                    <div>
                                        <label className="block text-xs font-mono text-gray-500 mb-1">BIO / TITLES</label>
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-white outline-none focus:border-system-blue transition-colors h-24 resize-none text-sm"
                                            placeholder="Enter your system bio..."
                                        />
                                    </div>

                                    {/* Theme Selection */}
                                    <div>
                                        <label className="block text-xs font-mono text-gray-500 mb-3">SYSTEM THEME</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {THEMES.map((t) => {
                                                const isOwned = ownedThemes.includes(t.id)
                                                const isActive = theme === t.id
                                                return (
                                                    <button
                                                        key={t.id}
                                                        type="button"
                                                        onClick={() => {
                                                            if (isOwned) {
                                                                setTheme(t.id)
                                                            } else {
                                                                toast.error(`Purchase "${t.name}" from the Shop first!`)
                                                            }
                                                        }}
                                                        className={`flex items-center gap-3 p-2 rounded border transition-all ${isActive
                                                            ? 'bg-white/5 border-system-blue ring-1 ring-system-blue'
                                                            : isOwned
                                                                ? 'border-transparent hover:bg-white/5 hover:border-gray-700'
                                                                : 'border-transparent opacity-50 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        <div className={`w-4 h-4 rounded-full ${t.color} shadow-[0_0_10px_currentColor]`}></div>
                                                        <span className={`text-sm font-bold font-rajdhani ${isActive ? 'text-white' : isOwned ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            {t.name}
                                                        </span>
                                                        {isActive && (
                                                            <span className="ml-auto text-xs text-system-blue font-mono">[ACTIVE]</span>
                                                        )}
                                                        {!isOwned && (
                                                            <span className="ml-auto flex items-center gap-1 text-xs text-gray-600 font-mono">
                                                                <LockClosedIcon className="w-3 h-3" />
                                                                {t.price}G
                                                            </span>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 mt-8 pt-4 border-t border-gray-800">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 py-2 rounded font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
                                        >
                                            CANCEL
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1 py-2 rounded font-bold bg-system-blue text-black hover:bg-system-blue/90 transition-colors shadow-[0_0_15px_rgba(var(--color-system-blue-rgb),0.3)] text-sm"
                                        >
                                            {isLoading ? 'SAVING...' : 'SAVE CHANGES'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
