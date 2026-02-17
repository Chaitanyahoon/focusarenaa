import { useState, useEffect } from 'react';
import { guildAPI, Guild, GuildRole } from '../../services/guild';
import { guildRaidAPI } from '../../services/api';
import { GuildRaid, GuildRaidStatus } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';
import { ArrowLeftOnRectangleIcon, UserGroupIcon, TrashIcon, XMarkIcon, ClipboardIcon, ShieldCheckIcon, PlayIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import GuildChat from './GuildChat';
import ConfirmModal from '../ConfirmModal';
import { Link } from 'react-router-dom';
import GuildRaidSection from './raid/GuildRaidSection';
import StartRaidModal from './raid/StartRaidModal';
import AssignTaskModal from './raid/AssignTaskModal';
import { useSignalR } from '../../hooks/useSignalR';

interface Props {
    guildId: number;
    onLeave: () => void;
}

export default function GuildDashboard({ guildId, onLeave }: Props) {
    const { user } = useAuthStore();
    const { connection } = useSignalR();
    const [guild, setGuild] = useState<Guild | null>(null);
    const [activeRaid, setActiveRaid] = useState<GuildRaid | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, type: 'kick' | 'delete' | 'leave', targetUserId?: number, targetName?: string }>({ isOpen: false, type: 'leave' });

    // Raid Modals
    const [isStartRaidOpen, setIsStartRaidOpen] = useState(false);
    const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);

    const isLeader = guild?.leaderId === user?.id;

    const loadGuild = async () => {
        setIsLoading(true);
        try {
            const data = await guildAPI.get(guildId);
            setGuild(data);

            // Load active raid
            const raid = await guildRaidAPI.getActive(guildId);
            setActiveRaid(raid);
        } catch {
            toast.error("Failed to load Guild data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadGuild();
    }, [guildId]);

    // Join the guild's SignalR group so we receive real-time updates
    useEffect(() => {
        if (!connection || !guildId) return;

        // Join the guild group on the shared connection
        connection.invoke('JoinGuildGroup', guildId).catch(() => { });

        return () => {
            connection.invoke('LeaveGuildGroup', guildId).catch(() => { });
        };
    }, [connection, guildId]);

    // SignalR Listeners for Raid
    useEffect(() => {
        if (!connection) return;

        connection.on("ReceiveRaidUpdate", (raidId: number, currentHP: number, isCleared: boolean) => {
            setActiveRaid(prev => {
                if (!prev || prev.id !== raidId) return prev;
                return {
                    ...prev,
                    currentHP,
                    status: isCleared ? GuildRaidStatus.Cleared : prev.status
                };
            });
        });

        // We could also listen for "RaidStarted" if we wanted auto-refresh for members
        // But system message usually covers notification, reloading is safer

        return () => {
            connection.off("ReceiveRaidUpdate");
        };
    }, [connection]);

    // SignalR Listeners for Guild Updates
    useEffect(() => {
        if (!connection || !guild) return;

        const handleGuildDeleted = () => {
            toast.error("This guild has been disbanded.");
            onLeave();
        };

        const handleMemberJoined = (member: any) => {
            toast.success(`${member.name} joined the guild!`);
            loadGuild();
        };

        const handleMemberLeft = (userId: number) => {
            if (userId === user?.id) {
                toast.error("You have been removed from the guild.");
                onLeave();
            } else {
                const member = guild.members.find(m => m.userId === userId);
                const name = member?.user.name || "A member";
                toast(`${name} left the guild.`, { icon: 'ℹ️' });
                loadGuild();
            }
        };

        connection.on("ReceiveGuildDeleted", handleGuildDeleted);
        connection.on("ReceiveGuildMemberJoined", handleMemberJoined);
        connection.on("ReceiveGuildMemberLeft", handleMemberLeft);

        return () => {
            connection.off("ReceiveGuildDeleted", handleGuildDeleted);
            connection.off("ReceiveGuildMemberJoined", handleMemberJoined);
            connection.off("ReceiveGuildMemberLeft", handleMemberLeft);
        };
    }, [connection, guild, user?.id]);



    const handleLeave = () => {
        setConfirmModal({ isOpen: true, type: 'leave' });
    };

    const handleKick = (userId: number, name: string) => {
        setConfirmModal({ isOpen: true, type: 'kick', targetUserId: userId, targetName: name });
    };

    const handleDeleteGuild = () => {
        setConfirmModal({ isOpen: true, type: 'delete' });
    };

    const handleConfirm = async () => {
        try {
            if (confirmModal.type === 'leave') {
                await guildAPI.leave();
                toast.success("Left guild.");
                onLeave();
            } else if (confirmModal.type === 'kick' && confirmModal.targetUserId && guild) {
                await guildAPI.kickMember(guild.id, confirmModal.targetUserId);
                toast.success(`Removed ${confirmModal.targetName} from the guild.`);
                loadGuild();
            } else if (confirmModal.type === 'delete' && guild) {
                await guildAPI.deleteGuild(guild.id);
                toast.success("Guild disbanded.");
                onLeave();
            }
        } catch {
            toast.error(`Failed to ${confirmModal.type}.`);
        }
    };

    const copyInviteCode = () => {
        if (guild?.inviteCode) {
            navigator.clipboard.writeText(guild.inviteCode);
            toast.success('Invite code copied!');
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-blue-400 font-mono text-sm animate-pulse">Establishing secure connection...</p>
            </div>
        </div>
    );
    if (!guild) return <div className="text-center py-20 text-red-500">Guild not found.</div>;

    const sortedMembers = [...guild.members].sort((a, b) => b.role - a.role);

    return (
        <div className="p-6 h-full overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 border-b border-system-blue/30 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-system-blue to-cyan-500 flex items-center justify-center">
                            <UserGroupIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black font-rajdhani text-white tracking-wide uppercase">{guild.name}</h1>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-system-blue bg-system-blue/10 px-2 py-0.5 rounded border border-system-blue/20">
                                    LVL {guild.level}
                                </span>
                                {guild.isPrivate && (
                                    <span className="text-xs font-mono text-system-gold bg-system-gold/10 px-2 py-0.5 rounded border border-system-gold/20">
                                        🔒 PRIVATE
                                    </span>
                                )}
                                {isLeader && (
                                    <span className="text-xs font-mono text-system-green bg-system-green/10 px-2 py-0.5 rounded border border-system-green/20 flex items-center gap-1">
                                        <ShieldCheckIcon className="w-3 h-3" /> LEADER
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {guild.description && <p className="text-gray-400 mt-2 max-w-2xl text-sm">{guild.description}</p>}
                </div>

                <div className="flex flex-col items-end gap-3">
                    <div className="text-right bg-black/30 rounded-lg border border-gray-800/50 p-3">
                        <div className="text-[10px] text-gray-500 font-mono">GUILD XP</div>
                        <div className="text-xl font-black text-system-blue font-rajdhani">{guild.xp.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Raid Section */}
            <div className="mb-8">
                {activeRaid ? (
                    <div>
                        <GuildRaidSection raid={activeRaid} />
                        {isLeader && activeRaid.status === GuildRaidStatus.Active && (
                            <div className="mt-2 flex justify-end">
                                <button
                                    onClick={() => setIsAssignTaskOpen(true)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-900/20"
                                >
                                    <PlusCircleIcon className="w-5 h-5" />
                                    ASSIGN PROJECT TASK
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    isLeader ? (
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-dashed border-gray-700 p-8 text-center">
                            <h3 className="text-xl font-bold text-white mb-2">No Active Project</h3>
                            <p className="text-gray-400 text-sm mb-6">Start a new Guild Raid to collaborate on a project and earn massive XP.</p>
                            <button
                                onClick={() => setIsStartRaidOpen(true)}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-6 py-3 rounded-xl font-black tracking-wider transition-all shadow-lg shadow-purple-900/30 hover:scale-105"
                            >
                                <PlayIcon className="w-5 h-5" />
                                INITIATE PROJECT RAID
                            </button>
                        </div>
                    ) : (
                        <div className="bg-[#0a1120] rounded-xl border border-gray-800 p-6 text-center">
                            <p className="text-gray-500 font-mono text-sm">No active projects. Waiting for Leader to initiate.</p>
                        </div>
                    )
                )}
            </div>


            {/* Invite Code Section (Leader Only) */}
            {isLeader && guild.isPrivate && guild.inviteCode && (
                <div className="mb-6 bg-system-gold/5 border border-system-gold/20 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-system-gold font-mono uppercase">Invite Code:</span>
                        <code className="text-system-gold font-mono font-bold text-lg tracking-[0.3em] bg-black/30 px-3 py-1 rounded">{guild.inviteCode}</code>
                    </div>
                    <button
                        onClick={copyInviteCode}
                        className="p-2 hover:bg-system-gold/10 rounded-lg text-system-gold hover:text-system-gold transition-all"
                        title="Copy invite code"
                    >
                        <ClipboardIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Members & Management */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Members List */}
                    <div className="bg-[#0a1120] border border-system-blue/30 rounded-xl p-6">
                        <h3 className="text-lg font-bold font-rajdhani text-white mb-4 flex justify-between items-center tracking-wider">
                            <span>MEMBERS ROSTER</span>
                            <span className="text-xs font-mono text-gray-500 bg-black/30 px-2 py-1 rounded">
                                {guild.members.length} / {guild.capacity}
                            </span>
                        </h3>

                        <div className="space-y-2">
                            {sortedMembers.map(member => (
                                <div key={member.id} className="flex items-center justify-between bg-[#050914] p-3 rounded-lg border border-gray-800/50 hover:border-system-blue/20 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <Link to={`/profile/${member.userId}`} className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 font-bold overflow-hidden text-sm hover:ring-2 hover:ring-blue-500 transition-all">
                                            {member.user.avatarUrl ? (
                                                <img src={member.user.avatarUrl} alt={member.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                member.user.name.substring(0, 2).toUpperCase()
                                            )}
                                        </Link>
                                        <div>
                                            <Link to={`/profile/${member.userId}`} className="text-white font-medium flex items-center gap-2 hover:text-blue-400 transition-colors">
                                                {member.user.name}
                                                {member.role === GuildRole.Leader && (
                                                    <span className="text-[9px] bg-system-gold/15 text-system-gold px-1.5 py-0.5 rounded font-mono font-bold border border-system-gold/20">
                                                        👑 LEADER
                                                    </span>
                                                )}
                                                {member.role === GuildRole.Officer && (
                                                    <span className="text-[9px] bg-system-blue/15 text-system-blue px-1.5 py-0.5 rounded font-mono font-bold border border-system-blue/20">
                                                        OFFICER
                                                    </span>
                                                )}
                                            </Link>
                                            <div className="text-xs text-gray-500">
                                                Level {member.user.level} · {member.contributionXP} XP contributed
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Kick button — only leader can kick, and can't kick self */}
                                        {isLeader && member.userId !== user?.id && (
                                            <button
                                                onClick={() => handleKick(member.userId, member.user.name)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-system-red hover:bg-system-red/10 rounded-lg transition-all"
                                                title={`Remove ${member.user.name}`}
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Disband/Leave Buttons */}
                    <div className="flex items-center justify-between mt-6">
                        <button onClick={handleLeave} className="flex items-center gap-2 text-system-red hover:text-red-400 transition-colors text-sm font-bold opacity-70 hover:opacity-100 px-3 py-2 rounded-lg hover:bg-system-red/5"><ArrowLeftOnRectangleIcon className="w-4 h-4" />{isLeader ? 'LEAVE & TRANSFER LEADERSHIP' : 'LEAVE GUILD'}</button>
                        {isLeader && <button onClick={handleDeleteGuild} className="flex items-center gap-2 text-system-red hover:text-red-500 transition-all text-sm font-bold opacity-60 hover:opacity-100 px-3 py-2 rounded-lg hover:bg-system-red/5 border border-transparent hover:border-system-red/20"><TrashIcon className="w-4 h-4" />DISBAND GUILD</button>}
                    </div>

                </div>

                {/* Right Column: Chat & Info */}
                <div className="space-y-6">
                    <GuildChat guildId={guild.id} />

                    {/* Guild Stats */}
                    <div className="bg-[#0a1120] border border-system-blue/30 rounded-xl p-6">
                        <h3 className="text-sm font-bold font-rajdhani text-white mb-3 tracking-wider">GUILD INFO</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-mono text-xs">Created</span>
                                <span className="text-gray-300">{new Date(guild.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-mono text-xs">Members</span>
                                <span className="text-gray-300">{guild.members.length} / {guild.capacity}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-mono text-xs">Total XP</span>
                                <span className="text-system-blue font-mono">{guild.xp.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-mono text-xs">Access</span>
                                <span className={guild.isPrivate ? 'text-system-gold' : 'text-system-green'}>{guild.isPrivate ? '🔒 Private' : '🌐 Public'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <StartRaidModal
                isOpen={isStartRaidOpen}
                onClose={() => setIsStartRaidOpen(false)}
                onRaidStarted={loadGuild}
            />

            {activeRaid && (
                <AssignTaskModal
                    isOpen={isAssignTaskOpen}
                    onClose={() => setIsAssignTaskOpen(false)}
                    raidId={activeRaid.id}
                    members={guild.members}
                />
            )}

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, type: 'leave' })}
                onConfirm={handleConfirm}
                title={
                    confirmModal.type === 'kick' ? `Remove ${confirmModal.targetName}?`
                        : confirmModal.type === 'delete' ? 'Disband Guild?'
                            : 'Leave Guild?'
                }
                message={
                    confirmModal.type === 'kick' ? `${confirmModal.targetName} will be removed from the guild immediately.`
                        : confirmModal.type === 'delete' ? 'This will permanently disband the guild and remove all members. This action cannot be undone.'
                            : isLeader ? 'As the leader, leaving will transfer leadership to the oldest member. If you are the only member, the guild will be disbanded.'
                                : 'Are you sure you want to leave this guild?'
                }
                confirmText={
                    confirmModal.type === 'kick' ? 'Remove'
                        : confirmModal.type === 'delete' ? 'Disband'
                            : 'Leave'
                }
                isDestructive={true}
            />
        </div>
    );
}
