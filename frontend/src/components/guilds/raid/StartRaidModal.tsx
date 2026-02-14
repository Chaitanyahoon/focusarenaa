import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { guildRaidAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onRaidStarted: () => void;
}

interface StartRaidForm {
    title: string;
    description: string;
    totalHP: number;
    bossName: string;
}

export default function StartRaidModal({ isOpen, onClose, onRaidStarted }: Props) {
    const { register, handleSubmit, reset } = useForm<StartRaidForm>();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: StartRaidForm) => {
        setIsLoading(true);
        try {
            await guildRaidAPI.start(data);
            toast.success("Raid Started!");
            reset();
            onRaidStarted();
            onClose();
        } catch (error) {
            toast.error("Failed to start raid.");
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#0c1527] border border-purple-500/30 p-6 shadow-2xl transition-all">
                                <h3 className="text-xl font-black font-rajdhani text-white mb-1 tracking-wider">INITIATE GUILD RAID</h3>
                                <p className="text-xs text-gray-500 font-mono mb-5">Define the project scope and difficulty</p>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <input
                                        {...register('title', { required: true })}
                                        placeholder="Project Name (e.g. Q4 Migration)"
                                        className="w-full bg-black/40 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-purple-500/50 outline-none"
                                    />
                                    <textarea
                                        {...register('description')}
                                        placeholder="Description"
                                        className="w-full bg-black/40 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-purple-500/50 outline-none h-20"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] text-gray-500 font-mono block mb-1">TOTAL HP (XP)</label>
                                            <input
                                                type="number"
                                                {...register('totalHP', { required: true, min: 100 })}
                                                defaultValue={1000}
                                                className="w-full bg-black/40 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-purple-500/50 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-500 font-mono block mb-1">BOSS NAME</label>
                                            <input
                                                {...register('bossName')}
                                                placeholder="e.g. The Monolith"
                                                className="w-full bg-black/40 border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-purple-500/50 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-lg font-bold tracking-wider transition-all shadow-lg shadow-purple-900/30"
                                    >
                                        {isLoading ? 'Initializing...' : 'START RAID'}
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
