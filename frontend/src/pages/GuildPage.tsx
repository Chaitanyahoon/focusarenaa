import { useState, useEffect } from 'react';
import { guildAPI, Guild } from '../services/guild';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-hot-toast';
import { PlusIcon, UserGroupIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import CreateGuildModal from '../components/guilds/CreateGuildModal';
import GuildDashboard from '../components/guilds/GuildDashboard';

export default function GuildPage() {
    const { user, fetchProfile } = useAuthStore();
    const [guilds, setGuilds] = useState<Guild[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const loadGuilds = async () => {
        setIsLoading(true);
        try {
            const data = await guildAPI.search(searchQuery);
            setGuilds(data);
        } catch {
            toast.error("Failed to load Guilds.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!user?.guildId) {
            loadGuilds();
        }
        // Also ensure user profile is up to date to check guild status
        fetchProfile();
    }, [searchQuery, user?.guildId]);

    const handleJoin = async (guild: Guild) => {
        try {
            let inviteCode: string | undefined;

            if (guild.isPrivate) {
                const code = prompt(`Guild "${guild.name}" is private. Enter invite code:`);
                if (!code) {
                    return; // User cancelled
                }
                inviteCode = code;
            }

            await guildAPI.join(guild.id, inviteCode);
            toast.success("Joined Guild!");
            await fetchProfile(); // Update user state
        } catch (error) {
            toast.error("Failed to join. Invalid invite code or guild full.");
        }
    };

    // If user has a guild, show dashboard
    if (user?.guildId) {
        return (
            <GuildDashboard
                guildId={user.guildId}
                onLeave={() => fetchProfile()}
            />
        );
    }

    return (
        <div className="p-6 h-full overflow-y-auto custom-scrollbar relative">
            <div className="flex justify-between items-center mb-8 border-b border-blue-900/30 pb-6">
                <div>
                    <h1 className="text-3xl font-bold font-rajdhani text-white tracking-wide flex items-center gap-3">
                        <UserGroupIcon className="w-8 h-8 text-blue-500" />
                        GUILD REGISTRY
                    </h1>
                    <p className="text-gray-400 mt-1">Join forces with other hunters.</p>
                </div>

                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                >
                    <PlusIcon className="w-5 h-5" />
                    CREATE GUILD
                </button>
            </div>

            {/* Search */}
            <div className="mb-8 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search Guilds..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0a1120] border border-blue-900/30 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all"
                />
            </div>

            {/* Guild List */}
            {isLoading ? (
                <div className="text-center py-12 text-blue-400 animate-pulse">Scanning frequencies...</div>
            ) : guilds.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No guilds found. Be the first to establish one.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {guilds.map(guild => (
                        <div key={guild.id} className="bg-[#0a1120] border border-blue-900/30 rounded-lg p-6 hover:border-blue-500/50 transition-all group relative overflow-hidden">
                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold font-rajdhani text-white">{guild.name}</h3>
                                    <span className="text-xs font-mono text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded">
                                        LVL {guild.level}
                                    </span>
                                </div>

                                <p className="text-gray-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
                                    {guild.description || "No description provided."}
                                </p>

                                <div className="flex justify-between items-center text-sm text-gray-500 font-mono mb-6">
                                    <span>MEMBERS: {guild.members?.length || 0} / {guild.capacity}</span>
                                </div>

                                <button
                                    onClick={() => handleJoin(guild)}
                                    className="w-full py-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 font-bold rounded hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest text-sm"
                                >
                                    {guild.isPrivate ? '🔒 REQUEST JOIN' : 'REQUEST JOIN'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateGuildModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onGuildCreated={(_guildId: number) => {
                    loadGuilds();
                    fetchProfile();
                }}
            />
        </div>
    );
}
