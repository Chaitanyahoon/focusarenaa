import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gateAPI, Gate, GateRank, GateStatus } from '../services/gate';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Task } from '../types';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { TaskDifficulty, TaskCategory } from '../types';
import { taskAPI } from '../services/api';

// Reusing Task creation logic, simplified for Raid
interface CreateTaskDto {
    title: string;
    description?: string;
    difficulty: TaskDifficulty;
    category: TaskCategory;
}

export default function RaidPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [gate, setGate] = useState<Gate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

    const loadGate = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const data = await gateAPI.getGate(Number(id));
            setGate(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load Dungeon data.");
            navigate('/gates');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadGate();
    }, [id]);

    const handleTaskComplete = async (taskId: number) => {
        try {
            await taskAPI.updateStatus(taskId, 2); // 2 = Done
            toast.success("Monster defeated!", { icon: '⚔️' });
            loadGate(); // Refresh to check progress

            // Check if all done
            if (gate && gate.tasks.every(t => t.id === taskId || t.status === 2)) {
                // Trigger completion check or celebration
                toast.success("DUNGEON CLEARED!", { duration: 5000, icon: '🏆' });
            }
        } catch (error) {
            toast.error("Attack failed.");
        }
    };

    const handleClaimRewards = async () => {
        if (!gate) return;
        try {
            await gateAPI.claimRewards(gate.id);
            toast.success(`Rewards Claimed: ${gate.xpReward} XP, ${gate.goldReward} Gold!`);
            loadGate();
        } catch (error) {
            toast.error("Failed to claim rewards.");
        }
    };

    if (isLoading) return <div className="p-8 text-blue-400 animate-pulse">Scanning dungeon structure...</div>;
    if (!gate) return <div className="p-8 text-red-500">Dungeon collapsed.</div>;

    const progress = gate.tasks.length > 0
        ? (gate.tasks.filter(t => t.status === 2).length / gate.tasks.length) * 100
        : 0;

    const isCleared = gate.status === GateStatus.Cleared;
    const isAllDone = gate.tasks.length > 0 && gate.tasks.every(t => t.status === 2);

    return (
        <div className="p-6 h-full overflow-y-auto custom-scrollbar relative">
            {/* Header */}
            <button onClick={() => navigate('/gates')} className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeftIcon className="w-5 h-5 mr-1" />
                RETREAT
            </button>

            <div className="flex justify-between items-start mb-8 border-b border-blue-900/30 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-0.5 rounded text-sm font-bold bg-black/50 border ${getRankColor(gate.rank)}`}>
                            {GateRank[gate.rank]}-RANK
                        </span>
                        <h1 className="text-3xl font-bold font-rajdhani text-white tracking-wide">
                            {gate.title}
                        </h1>
                    </div>
                    <p className="text-gray-400 max-w-2xl">{gate.description}</p>
                </div>

                <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">REWARDS</div>
                    <div className="text-blue-400 font-mono font-bold">{gate.xpReward} XP</div>
                    <div className="text-yellow-400 font-mono font-bold">{gate.goldReward} GOLD</div>
                </div>
            </div>

            {/* Raid Progress */}
            <div className="mb-8 bg-[#0a1120] p-4 rounded-lg border border-blue-900/30">
                <div className="flex justify-between text-sm mb-2 text-gray-400 font-mono">
                    <span>DUNGEON CLEAR PROGRESS</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-4 bg-gray-900 rounded-full overflow-hidden relative">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-500 transition-all duration-1000 ease-out relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>

                {isAllDone && !isCleared && (
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={handleClaimRewards}
                            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded shadow-[0_0_20px_rgba(234,179,8,0.4)] animate-pulse transition-all"
                        >
                            CLAIM CLEAR REWARDS
                        </button>
                    </div>
                )}
                {isCleared && (
                    <div className="mt-4 text-center text-green-400 font-bold font-rajdhani text-xl flex items-center justify-center gap-2">
                        <CheckCircleIcon className="w-6 h-6" />
                        DUNGEON CLEARED
                    </div>
                )}
            </div>

            {/* Tasks (Monsters) */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold font-rajdhani text-white">ENCOUNTERS</h2>
                    {!isCleared && (
                        <button
                            onClick={() => setIsAddTaskOpen(true)}
                            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded text-sm flex items-center gap-1 transition-all"
                        >
                            <PlusIcon className="w-4 h-4" />
                            ADD TASK
                        </button>
                    )}
                </div>

                {gate.tasks.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 border border-dashed border-gray-800 rounded">
                        No monsters detected. Add tasks to populate the dungeon.
                    </div>
                ) : (
                    gate.tasks.map(task => (
                        <div
                            key={task.id}
                            className={`p-4 rounded-lg border transition-all flex items-center gap-4 ${task.status === 2
                                ? 'bg-gray-900/50 border-gray-800 opacity-50'
                                : 'bg-[#0a1120] border-blue-900/30 hover:border-blue-500/50'
                                }`}
                        >
                            <button
                                onClick={() => task.status !== 2 && handleTaskComplete(task.id)}
                                disabled={task.status === 2 || isCleared}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.status === 2
                                    ? 'bg-green-500/20 border-green-500 text-green-500'
                                    : 'border-gray-500 hover:border-blue-500 text-transparent hover:text-blue-500'
                                    }`}
                            >
                                <CheckCircleIcon className="w-4 h-4" />
                            </button>

                            <div className="flex-1">
                                <h3 className={`font-semibold ${task.status === 2 ? 'text-gray-500 line-through' : 'text-white'}`}>
                                    {task.title}
                                </h3>
                                {task.description && (
                                    <p className="text-sm text-gray-500">{task.description}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`text-xs px-2 py-0.5 rounded border ${getContentColor(task.difficulty)}`}>
                                    {TaskDifficulty[task.difficulty]}
                                </span>
                                <span className="text-xs text-blue-400 font-mono">+{task.xpReward} XP</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AddTaskModal
                isOpen={isAddTaskOpen}
                onClose={() => setIsAddTaskOpen(false)}
                gateId={gate.id}
                onTaskAdded={loadGate}
            />
        </div>
    );
}

// Helper Functions & Sub-components
function getRankColor(rank: GateRank) {
    switch (rank) {
        case GateRank.E: return "text-gray-400 border-gray-400";
        case GateRank.D: return "text-green-400 border-green-400";
        case GateRank.C: return "text-blue-400 border-blue-400";
        case GateRank.B: return "text-purple-400 border-purple-400";
        case GateRank.A: return "text-red-400 border-red-400";
        case GateRank.S: return "text-yellow-400 border-yellow-400";
        default: return "text-gray-400";
    }
}

function getContentColor(diff: number) {
    // reusing from previously known logic or just simpler logic
    if (diff === 0) return "text-green-400 border-green-500/30 bg-green-500/10";
    if (diff === 1) return "text-blue-400 border-blue-500/30 bg-blue-500/10";
    if (diff === 2) return "text-red-400 border-red-500/30 bg-red-500/10";
    return "text-gray-400";
}

// Simple Add Task Modal specifically for Gate
function AddTaskModal({ isOpen, onClose, gateId, onTaskAdded }: { isOpen: boolean, onClose: () => void, gateId: number, onTaskAdded: () => void }) {
    const { register, handleSubmit, reset } = useForm<CreateTaskDto>();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: CreateTaskDto) => {
        setIsLoading(true);
        try {
            // First create task
            const newTask = await taskAPI.create({
                ...data,
                deadline: undefined
            });

            // Then link to gate
            await gateAPI.addTaskToGate(gateId, newTask.id);

            toast.success("Encounter added!");
            reset();
            onTaskAdded();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to summon task.");
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
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#0a1120] border border-blue-500/30 p-6 shadow-xl transition-all">
                            <h3 className="text-xl font-bold font-rajdhani text-white mb-4">ADD DUNGEON TASK</h3>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <input {...register('title', { required: true })} placeholder="Task Name" className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white" />
                                <div className="grid grid-cols-2 gap-4">
                                    <select {...register('difficulty')} className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white">
                                        <option value={TaskDifficulty.Easy}>Easy</option>
                                        <option value={TaskDifficulty.Medium}>Medium</option>
                                        <option value={TaskDifficulty.Hard}>Hard</option>
                                    </select>
                                    <select {...register('category')} className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white">
                                        <option value={TaskCategory.Work}>Work</option>
                                        <option value={TaskCategory.Personal}>Personal</option>
                                        <option value={TaskCategory.Fitness}>Fitness</option>
                                        {/* Simplified categories */}
                                    </select>
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-500">
                                    {isLoading ? 'Summoning...' : 'ADD'}
                                </button>
                            </form>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
