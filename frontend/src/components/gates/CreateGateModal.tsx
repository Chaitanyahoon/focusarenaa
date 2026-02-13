import { Fragment, useState, useMemo } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, BoltIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { gateAPI, CreateGateDto, GateRank } from '../../services/gate'

interface Props {
    isOpen: boolean
    onClose: () => void
    onGateCreated: () => void
}

const RANK_CONFIG = [
    { value: GateRank.E, label: 'E', name: 'Simple', xp: 200, gold: 100, color: 'gray', glow: 'rgba(156,163,175,0.3)', border: 'border-gray-500', text: 'text-gray-400', bg: 'bg-gray-500' },
    { value: GateRank.D, label: 'D', name: 'Routine', xp: 500, gold: 250, color: 'green', glow: 'rgba(74,222,128,0.3)', border: 'border-green-500', text: 'text-green-400', bg: 'bg-green-500' },
    { value: GateRank.C, label: 'C', name: 'Moderate', xp: 1000, gold: 500, color: 'blue', glow: 'rgba(96,165,250,0.4)', border: 'border-blue-500', text: 'text-blue-400', bg: 'bg-blue-500' },
    { value: GateRank.B, label: 'B', name: 'Hard', xp: 2000, gold: 1000, color: 'purple', glow: 'rgba(192,132,252,0.4)', border: 'border-purple-500', text: 'text-purple-400', bg: 'bg-purple-500' },
    { value: GateRank.A, label: 'A', name: 'Extreme', xp: 3500, gold: 2000, color: 'red', glow: 'rgba(248,113,113,0.4)', border: 'border-red-500', text: 'text-red-400', bg: 'bg-red-500' },
    { value: GateRank.S, label: 'S', name: 'Impossible', xp: 5000, gold: 5000, color: 'yellow', glow: 'rgba(250,204,21,0.5)', border: 'border-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-500' },
]

export default function CreateGateModal({ isOpen, onClose, onGateCreated }: Props) {
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateGateDto>({
        defaultValues: { rank: GateRank.E }
    })
    const [isLoading, setIsLoading] = useState(false)
    const selectedRank = watch('rank')

    const rankInfo = useMemo(() => {
        return RANK_CONFIG.find(r => r.value == selectedRank) || RANK_CONFIG[0]
    }, [selectedRank])

    const onSubmit = async (data: CreateGateDto) => {
        setIsLoading(true)
        try {
            await gateAPI.createGate({
                ...data,
                rank: Number(data.rank),
                deadline: data.deadline ? data.deadline : undefined
            })
            toast.success('Dungeon Gate Opened!', { icon: '⚔️' })
            reset()
            onGateCreated()
            onClose()
        } catch {
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
                    <div className="fixed inset-0 bg-black/85 backdrop-blur-md" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-400"
                            enterFrom="opacity-0 scale-90 translate-y-4"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-90"
                        >
                            <Dialog.Panel
                                className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-gradient-to-b from-[#0c1527] to-[#060d1a] border border-blue-500/20 shadow-2xl transition-all relative"
                                style={{ boxShadow: `0 0 60px ${rankInfo.glow}, 0 0 120px ${rankInfo.glow}` }}
                            >
                                {/* Decorative top bar with rank color */}
                                <div className={`h-1 w-full ${rankInfo.bg} opacity-60`} />

                                {/* Animated corner runes */}
                                <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-blue-500/30" />
                                <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-blue-500/30" />
                                <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-blue-500/30" />
                                <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-blue-500/30" />

                                <div className="p-7">
                                    {/* Header */}
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg ${rankInfo.bg}/20 border ${rankInfo.border}/40 flex items-center justify-center`}>
                                                <SparklesIcon className={`w-5 h-5 ${rankInfo.text}`} />
                                            </div>
                                            <div>
                                                <Dialog.Title as="h3" className="text-xl font-bold font-rajdhani text-white tracking-wider">
                                                    OPEN NEW GATE
                                                </Dialog.Title>
                                                <p className="text-xs text-gray-500 font-mono">DIMENSIONAL RIFT GENERATOR</p>
                                            </div>
                                        </div>
                                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all">
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                        {/* Gate Title */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider font-mono">Gate Title</label>
                                            <input
                                                {...register('title', { required: 'Title is required' })}
                                                className="w-full bg-black/40 border border-gray-700/60 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all font-medium"
                                                placeholder="e.g. Build Portfolio Website"
                                            />
                                            {errors.title && <span className="text-red-400 text-xs mt-1 block">{errors.title.message}</span>}
                                        </div>

                                        {/* Boss Name + Type Row */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider font-mono">Boss Name</label>
                                                <input
                                                    {...register('bossName')}
                                                    className="w-full bg-black/40 border border-gray-700/60 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20 transition-all"
                                                    placeholder="The Taskmaster"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider font-mono">Type</label>
                                                <select
                                                    {...register('type')}
                                                    className="w-full bg-black/40 border border-gray-700/60 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/60 transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="Dungeon">⚔️ Dungeon</option>
                                                    <option value="Raid">🛡️ Raid</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider font-mono">Mission Briefing</label>
                                            <textarea
                                                {...register('description')}
                                                className="w-full bg-black/40 border border-gray-700/60 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all min-h-[72px] resize-none"
                                                placeholder="Describe the mission objectives..."
                                                rows={2}
                                            />
                                        </div>

                                        {/* Rank Selection - Interactive Cards */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider font-mono">Threat Level</label>
                                            <div className="grid grid-cols-6 gap-2">
                                                {RANK_CONFIG.map((rank) => (
                                                    <label
                                                        key={rank.value}
                                                        className={`relative cursor-pointer group`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            value={rank.value}
                                                            {...register('rank')}
                                                            className="sr-only peer"
                                                        />
                                                        <div className={`
                                                            flex flex-col items-center justify-center py-3 rounded-lg border-2 transition-all duration-200
                                                            peer-checked:${rank.border} peer-checked:bg-${rank.color}-500/10 peer-checked:shadow-[0_0_15px_${rank.glow}]
                                                            border-gray-700/40 hover:border-gray-600 bg-black/30 hover:bg-white/5
                                                        `}
                                                            style={selectedRank == rank.value ? {
                                                                borderColor: `var(--tw-border-opacity, 1)`,
                                                                boxShadow: `0 0 15px ${rank.glow}`,
                                                                background: `linear-gradient(to bottom, ${rank.glow.replace(')', ',0.1)')}, transparent)`
                                                            } : {}}
                                                        >
                                                            <span className={`text-lg font-black font-rajdhani ${selectedRank == rank.value ? rank.text : 'text-gray-500'} transition-colors`}>
                                                                {rank.label}
                                                            </span>
                                                            <span className={`text-[9px] font-mono ${selectedRank == rank.value ? 'text-gray-300' : 'text-gray-600'} transition-colors`}>
                                                                {rank.name}
                                                            </span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Reward Preview - Animated */}
                                        <div className="bg-black/40 rounded-xl border border-gray-700/30 p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
                                                    <BoltIcon className="w-4 h-4" />
                                                    Estimated Rewards
                                                </div>
                                                <div className={`text-xs font-bold ${rankInfo.text} px-2 py-0.5 rounded ${rankInfo.bg}/10 border ${rankInfo.border}/30`}>
                                                    {rankInfo.label}-RANK
                                                </div>
                                            </div>
                                            <div className="flex gap-8 mt-3">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-black font-rajdhani text-cyan-400">{rankInfo.xp.toLocaleString()}</span>
                                                    <span className="text-xs text-gray-500 font-mono">XP</span>
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-black font-rajdhani text-yellow-400">{rankInfo.gold.toLocaleString()}</span>
                                                    <span className="text-xs text-gray-500 font-mono">GOLD</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Deadline */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider font-mono">Time Limit</label>
                                            <input
                                                type="date"
                                                {...register('deadline')}
                                                className="w-full bg-black/40 border border-gray-700/60 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all [color-scheme:dark]"
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`
                                                w-full py-4 rounded-xl font-bold text-sm uppercase tracking-[0.2em] transition-all duration-300 relative overflow-hidden group
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400
                                                text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                                            `}
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {isLoading ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        OPENING RIFT...
                                                    </>
                                                ) : (
                                                    <>
                                                        <SparklesIcon className="w-5 h-5" />
                                                        INITIATE GATE
                                                    </>
                                                )}
                                            </span>
                                            {/* Shine effect */}
                                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                        </button>
                                    </form>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
