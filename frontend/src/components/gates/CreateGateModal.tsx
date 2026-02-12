import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { gateAPI, CreateGateDto, GateRank } from '../../services/gate'

interface Props {
    isOpen: boolean
    onClose: () => void
    onGateCreated: () => void
}

export default function CreateGateModal({ isOpen, onClose, onGateCreated }: Props) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateGateDto>()
    const [isLoading, setIsLoading] = useState(false)

    const onSubmit = async (data: CreateGateDto) => {
        setIsLoading(true)
        try {
            await gateAPI.createGate({
                ...data,
                rank: Number(data.rank), // Ensure number
                deadline: data.deadline ? data.deadline : undefined // Handle empty string/null
            })
            toast.success('Dungeon Gate Opened!')
            reset()
            onGateCreated()
            onClose()
        } catch (error) {
            console.error(error)
            toast.error('Failed to open Gate.')
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
                                        OPEN NEW GATE
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Gate Title</label>
                                        <input
                                            {...register('title', { required: 'Title is required' })}
                                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                            placeholder="e.g. Build Portfolio"
                                        />
                                        {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Description (Optional)</label>
                                        <textarea
                                            {...register('description')}
                                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 min-h-[80px]"
                                            placeholder="Mission details..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Rank Assessment</label>
                                        <select
                                            {...register('rank')}
                                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                            defaultValue={GateRank.E}
                                        >
                                            <option value={GateRank.E}>E-Rank (Simple)</option>
                                            <option value={GateRank.D}>D-Rank (Routine)</option>
                                            <option value={GateRank.C}>C-Rank (Moderate)</option>
                                            <option value={GateRank.B}>B-Rank (Hard)</option>
                                            <option value={GateRank.A}>A-Rank (Extreme)</option>
                                            <option value={GateRank.S}>S-Rank (Impossible)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Deadline (Optional)</label>
                                        <input
                                            type="date"
                                            {...register('deadline')}
                                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded uppercase tracking-widest transition-all disabled:opacity-50"
                                        >
                                            {isLoading ? 'Opening Gate...' : 'INITIATE GATE'}
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
