import { useState, useEffect } from 'react';
import { guildAPI, Guild } from '../../services/guild';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';
import { ArrowLeftOnRectangleIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import GuildChat from './GuildChat';

interface Props {
    guildId: number;
    onLeave: () => void;
}

export default function GuildDashboard({ guildId, onLeave }: Props) {
    const [guild, setGuild] = useState<Guild | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadGuild = async () => {
            setIsLoading(true);
            try {
                const data = await guildAPI.get(guildId);
                setGuild(data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load Guild data.");
            } finally {
                setIsLoading(false);
            }
        };
        loadGuild();
    }, [guildId]);

    const handleLeave = async () => {
        if (!confirm("Are you sure you want to leave the guild?")) return;
        try {
            await guildAPI.leave();
            toast.success("Left guild.");
            onLeave();
        } catch (error) {
            toast.error("Failed to leave guild.");
        }
    };

    if (isLoading) return <div className="text-center py-20 text-blue-400 animate-pulse">Establishing secure connection...</div>;
    if (!guild) return <div className="text-center py-20 text-red-500">Guild not found.</div>;

    return (
        <div className="p-6 h-full overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b border-blue-900/30 pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <UserGroupIcon className="w-8 h-8 text-blue-500" />
                        <h1 className="text-4xl font-bold font-rajdhani text-white tracking-wide uppercase">{guild.name}</h1>
                    </div>
                    <p className="text-gray-400 mt-2 max-w-2xl">{guild.description}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                        <div className="text-sm text-gray-400 font-mono">LEVEL</div>
                        <div className="text-3xl font-bold text-blue-400 leading-none">{guild.level}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Members & Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Members List */}
                    <div className="bg-[#0a1120] border border-blue-900/30 rounded-lg p-6">
                        <h3 className="text-xl font-bold font-rajdhani text-white mb-4 flex justify-between items-center">
                            <span>MEMBERS ROSTER</span>
                            <span className="text-sm font-mono text-gray-500">{guild.members.length} / {guild.capacity}</span>
                        </h3>

                        <div className="space-y-3">
                            {guild.members.map(member => (
                                <div key={member.id} className="flex items-center justify-between bg-[#050914] p-3 rounded border border-gray-800 hover:border-blue-500/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center text-gray-400 font-bold overflow-hidden">
                                            {member.user.avatarUrl ? (
                                                <img src={member.user.avatarUrl} alt={member.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                member.user.name.substring(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium flex items-center gap-2">
                                                {member.user.name}
                                                {member.role === 2 && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1 rounded border border-yellow-500/30">LEADER</span>}
                                            </div>
                                            <div className="text-xs text-blue-400">Level {member.user.level}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">Contribution</div>
                                        <div className="text-sm text-gray-300 font-mono">{member.contributionXP} XP</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleLeave}
                        className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors text-sm font-bold opacity-80 hover:opacity-100"
                    >
                        <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                        LEAVE GUILD
                    </button>
                </div>

                {/* Right Column: Chat & Activities */}
                <div className="space-y-6">
                    <GuildChat guildId={guild.id} />

                    {/* Placeholder for Guild Quests/Raids (Future) */}
                    <div className="bg-[#0a1120] border border-blue-900/30 rounded-lg p-6 opacity-70">
                        <h3 className="text-lg font-bold font-rajdhani text-white mb-2">GUILD RAIDS</h3>
                        <p className="text-sm text-gray-500">No active raids available.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
