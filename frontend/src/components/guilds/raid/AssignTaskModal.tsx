import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { guildRaidAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';
import { GuildMember, GuildRole } from '../../../services/guild';
import { TaskDifficulty } from '../../../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    raidId: number;
    members: GuildMember[];
}

interface AssignTaskForm {
    targetUserId: number;
    title: string;
    description: string;
    difficulty: number;
}

export default function AssignTaskModal({ isOpen, onClose, raidId, members }: Props) {
    const { register, handleSubmit, reset } = useForm<AssignTaskForm>();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: AssignTaskForm) => {
        setIsLoading(true);
        try {
            await guildRaidAPI.assignTask({
                raidId,
                targetUserId: Number(data.targetUserId),
                title: data.title,
                description: data.description,
                difficulty: Number(data.difficulty)
            });
            toast.success("Task Assigned!");
            reset();
            onClose();
        } catch (error) {
            toast.error("Failed to assign task.");
        } finally {
            setIsLoading(false);
        }
    };

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
                    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" />
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#0c1527] border border-blue-500/30 p-6 shadow-2xl transition-all">
                                <h3 className="text-xl font-black font-rajdhani text-white mb-1 tracking-wider">ASSIGN GUILD TASK</h3>
                                <p className="text-xs text-gray-500 font-mono mb-5">Delegate responsibility to a member</p>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-mono block mb-1">ASSIGNEE</label>
                                        <select
                                            {...register('targetUserId', { required: true })}
                                            className="w-full bg-black/40 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-blue-500/50 outline-none"
                                        >
                                            {members.map(m => (
                                                <option key={m.userId} value={m.userId}>
                                                    {m.user.name} (Lvl {m.user.level}) {m.role === GuildRole.Leader ? '👑' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <input
                                        {...register('title', { required: true })}
                                        placeholder="Task Directives"
                                        className="w-full bg-black/40 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-blue-500/50 outline-none"
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <select {...register('difficulty', { valueAsNumber: true })} className="bg-black/40 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50">
                                            <option value={TaskDifficulty.Easy}>⚡ Easy (10 XP)</option>
                                            <option value={TaskDifficulty.Medium}>🔥 Medium (25 XP)</option>
                                            <option value={TaskDifficulty.Hard}>💀 Hard (50 XP)</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-bold tracking-wider transition-all shadow-lg shadow-blue-900/30"
                                    >
                                        {isLoading ? 'Assigning...' : 'DELEGATE TASK'}
                                    </button>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
