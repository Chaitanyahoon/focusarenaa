import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { guildAPI, CreateGuildDto } from '../../services/guild'

interface Props {
    isOpen: boolean
    onClose: () => void
    onGuildCreated: (guildId: number) => void
}

export default function CreateGuildModal({ isOpen, onClose, onGuildCreated }: Props) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateGuildDto>()
    const [isLoading, setIsLoading] = useState(false)

    const onSubmit = async (data: CreateGuildDto) => {
        setIsLoading(true)
        try {
            const guild = await guildAPI.create(data)
            toast.success('Guild Established!')
            reset()
            onGuildCreated(guild.id)
            onClose()
        } catch (error) {
            console.error(error)
            toast.error('Failed to create Guild.')
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
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#0a1120] border border-blue-500/30 p-6 shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-xl font-bold font-rajdhani text-white"
                                    >
                                        ESTABLISH NEW GUILD
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Guild Name</label>
                                        <input
                                            {...register('name', { required: 'Guild Name is required', minLength: { value: 3, message: 'Min 3 chars' } })}
                                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                            placeholder="e.g. Iron Blood"
                                        />
                                        {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Description (Optional)</label>
                                        <textarea
                                            {...register('description')}
                                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 min-h-[80px]"
                                            placeholder="Guild manifesto..."
                                        />
                                    </div>

                                    {/* Privacy Settings */}
                                    <div className="border-t border-gray-700 pt-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                {...register('isPrivate')}
                                                className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-300">Make this guild private (invite-only)</span>
                                        </label>

                                        <div className="mt-3">
                                            <label className="block text-xs text-gray-500 mb-1">Custom Invite Code (Optional - auto-generated if left blank)</label>
                                            <input
                                                {...register('inviteCode', { maxLength: { value: 20, message: 'Max 20 chars' } })}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 uppercase font-mono text-sm"
                                                placeholder="e.g. SECRET123"
                                                maxLength={20}
                                            />
                                            {errors.inviteCode && <span className="text-red-500 text-xs">{errors.inviteCode.message}</span>}
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded uppercase tracking-widest transition-all disabled:opacity-50"
                                        >
                                            {isLoading ? 'Processing...' : 'ESTABLISH GUILD'}
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
