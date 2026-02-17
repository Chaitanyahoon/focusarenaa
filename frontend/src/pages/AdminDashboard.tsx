import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import {
    UsersIcon,
    NoSymbolIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
    ShieldCheckIcon,
    ShoppingBagIcon,
    PencilSquareIcon,
    TrashIcon,
    PlusIcon,
    XMarkIcon,
    ChatBubbleLeftRightIcon,
    UserGroupIcon,
    SparklesIcon
} from '@heroicons/react/24/solid'
import { shopService, ShopItem } from '../services/shop'
import { adminAPI } from '../services/api'

interface AdminUser {
    id: number
    name: string
    email: string
    role: string
    isBanned: boolean
    level: number
    joinDate: string
}

interface AdminGuild {
    id: number
    name: string
    description: string
    leaderName: string
    memberCount: number
    capacity: number
    level: number
    isPrivate: boolean
    createdAt: string
}

export default function AdminDashboard() {
    const { user } = useAuthStore()
    const [users, setUsers] = useState<AdminUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState<'users' | 'shop' | 'broadcast' | 'guilds' | 'quests' | 'gates'>('users')

    // Shop State
    const [shopItems, setShopItems] = useState<ShopItem[]>([])
    const [isShopModalOpen, setIsShopModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<ShopItem | null>(null)
    const [newItem, setNewItem] = useState<Partial<ShopItem>>({
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        type: 'Consumable',
        effectData: ''
    })

    // Gate State
    const [newGate, setNewGate] = useState({
        title: '',
        description: '',
        rank: 0, // E
        deadline: '',
        bossName: 'Dungeon Boss',
        type: 'Dungeon'
    })

    // Guilds State
    const [guilds, setGuilds] = useState<AdminGuild[]>([])

    // Quest State
    const [newQuest, setNewQuest] = useState({
        title: '',
        description: '',
        targetCount: 1,
        unit: 'times',
        difficulty: 1
    })

    // Fetch Users
    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const response = await api.get<AdminUser[]>(`/admin/users?search=${search}`)
            setUsers(response.data)
        } catch (error) {
            console.error("Failed to fetch users", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Fetch Shop Items
    const fetchShopItems = async () => {
        setIsLoading(true)
        try {
            const items = await shopService.getShopItems()
            setShopItems(items)
        } catch (error) {
            console.error("Failed to fetch shop items", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Fetch Guilds
    const fetchGuilds = async () => {
        setIsLoading(true)
        try {
            const data = await adminAPI.getGuilds(search)
            setGuilds(data)
        } catch (error) {
            console.error("Failed to fetch guilds", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (activeTab === 'users') {
            const timer = setTimeout(() => {
                fetchUsers()
            }, 500)
            return () => clearTimeout(timer)
        } else if (activeTab === 'shop') {
            fetchShopItems()
        } else if (activeTab === 'guilds') {
            const timer = setTimeout(() => {
                fetchGuilds()
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [search, activeTab])

    const handleBan = async (id: number) => {
        if (!window.confirm("Are you sure you want to BAN this user?")) return
        try {
            await api.post(`/admin/ban/${id}`)
            setUsers(users.map(u => u.id === id ? { ...u, isBanned: true } : u))
        } catch (error) {
            console.error("Failed to ban user", error)
            alert("Failed to ban user")
        }
    }

    const handleUnban = async (id: number) => {
        if (!window.confirm("Unban this user?")) return
        try {
            await api.post(`/admin/unban/${id}`)
            setUsers(users.map(u => u.id === id ? { ...u, isBanned: false } : u))
        } catch (error) {
            console.error("Failed to unban user", error)
            alert("Failed to unban user")
        }
    }

    // Shop Handlers
    const openShopModal = (item: ShopItem | null = null) => {
        if (item) {
            setEditingItem(item)
            setNewItem(item)
        } else {
            setEditingItem(null)
            setNewItem({
                name: '',
                description: '',
                price: 0,
                imageUrl: '',
                type: 'Consumable',
                effectData: ''
            })
        }
        setIsShopModalOpen(true)
    }

    const handleSaveItem = async () => {
        if (!newItem.name || newItem.price === undefined) {
            alert("Name and Price are required")
            return
        }
        try {
            if (editingItem) {
                await shopService.updateItem(editingItem.id, newItem as any)
            } else {
                await shopService.addItem(newItem as any)
            }
            setIsShopModalOpen(false)
            fetchShopItems()
        } catch (error) {
            console.error("Failed to save item", error)
            alert("Failed to save item")
        }
    }

    const handleDeleteItem = async (id: number) => {
        if (!window.confirm("Are you sure you want to DELETE this item?")) return
        try {
            await shopService.deleteItem(id)
            setShopItems(shopItems.filter(i => i.id !== id))
        } catch (error) {
            console.error("Failed to delete item", error)
            alert("Failed to delete item")
        }
    }

    // Guild Handlers
    const handleDeleteGuild = async (id: number) => {
        if (!window.confirm("Are you sure you want to DISBAND this guild? This action cannot be undone.")) return
        try {
            await adminAPI.deleteGuild(id)
            setGuilds(guilds.filter(g => g.id !== id))
            alert("Guild disbanded successfully")
        } catch (error) {
            console.error("Failed to disband guild", error)
            alert("Failed to disband guild")
        }
    }

    // Broadcast State & Handler
    const [broadcastMessage, setBroadcastMessage] = useState('')
    const [broadcastType, setBroadcastType] = useState<'info' | 'success' | 'warning' | 'error'>('info')

    const handleBroadcast = async () => {
        if (!broadcastMessage) return
        try {
            await api.post('/admin/broadcast', {
                message: broadcastMessage,
                type: broadcastType
            })
            alert("Broadcast sent successfully!")
            setBroadcastMessage('')
        } catch (error) {
            console.error("Failed to send broadcast", error)
            alert("Failed to send broadcast")
        }
    }

    const handleCreateQuest = async () => {
        if (!newQuest.title || !newQuest.description) {
            alert("Title and Description are required")
            return
        }
        try {
            await adminAPI.createGlobalQuest(newQuest)
            alert("Global Quest created successfully!")
            setNewQuest({
                title: '',
                description: '',
                targetCount: 1,
                unit: 'times',
                difficulty: 1
            })
        } catch (error) {
            console.error("Failed to create quest", error)
            alert("Failed to create quest")
        }
    }

    const handleCreateGate = async () => {
        try {
            await adminAPI.createGlobalGate(newGate)
            alert("Global Gate created successfully!")
            setNewGate({
                ...newGate,
                title: '',
                description: '',
                bossName: 'Dungeon Boss',
                deadline: ''
            })
        } catch (error) {
            console.error("Failed to create gate", error)
            alert("Failed to create gate")
        }
    }

    if (user?.role !== 'Admin') {
        return (
            <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                    <ShieldCheckIcon className="w-16 h-16 mx-auto text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-gray-400 mt-2">You do not have permission to view this page.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-400">Manage community and game content</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-white/10 overflow-x-auto pb-1">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'users'
                        ? 'bg-red-500/20 text-red-400 border-b-2 border-red-500'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <UsersIcon className="w-5 h-5" />
                        User Management
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('shop')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'shop'
                        ? 'bg-red-500/20 text-red-400 border-b-2 border-red-500'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <ShoppingBagIcon className="w-5 h-5" />
                        Shop Management
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('guilds')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'guilds'
                        ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <UserGroupIcon className="w-5 h-5" />
                        Guilds
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('quests')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'quests'
                        ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-500'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5" />
                        Quests
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('gates')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'gates'
                        ? 'bg-indigo-500/20 text-indigo-400 border-b-2 border-indigo-500'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="w-5 h-5" />
                        Gates
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('broadcast')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'broadcast'
                        ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        Broadcasts
                    </div>
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 shadow-xl relative overflow-hidden">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl -z-10" />

                {activeTab === 'broadcast' && (
                    <div className="space-y-6">
                        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white font-display">
                                <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-400" />
                                Send System Broadcast
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Message</label>
                                    <textarea
                                        value={broadcastMessage}
                                        onChange={e => setBroadcastMessage(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-600 h-24 resize-none"
                                        placeholder="Type your message to all online players..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <select
                                        value={broadcastType}
                                        onChange={e => setBroadcastType(e.target.value as any)}
                                        className="bg-black/40 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="info">Info</option>
                                        <option value="success">Success</option>
                                        <option value="warning">Warning</option>
                                        <option value="error">Error</option>
                                    </select>
                                    <button
                                        onClick={handleBroadcast}
                                        disabled={!broadcastMessage}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-white transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        Send Broadcast
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'quests' && (
                    <div className="space-y-6">
                        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white font-display">
                                <SparklesIcon className="w-6 h-6 text-yellow-500" />
                                Create Global Quest
                            </h2>
                            <p className="text-gray-400 text-sm mb-6">
                                Create a quest that will be instantly assigned to <strong>ALL</strong> users. Great for events or daily challenges.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Quest Title</label>
                                    <input
                                        type="text"
                                        value={newQuest.title}
                                        onChange={e => setNewQuest({ ...newQuest, title: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all placeholder-gray-600"
                                        placeholder="Ex: Weekend Warrior"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Description</label>
                                    <textarea
                                        value={newQuest.description}
                                        onChange={e => setNewQuest({ ...newQuest, description: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all placeholder-gray-600 h-20 resize-none"
                                        placeholder="Ex: Complete 50 pushups to earn bonus XP!"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Target Count</label>
                                        <input
                                            type="number"
                                            value={newQuest.targetCount}
                                            onChange={e => setNewQuest({ ...newQuest, targetCount: Number(e.target.value) })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Unit</label>
                                        <input
                                            type="text"
                                            value={newQuest.unit}
                                            onChange={e => setNewQuest({ ...newQuest, unit: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                                            placeholder="Ex: reps"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Difficulty (1-5)</label>
                                        <select
                                            value={newQuest.difficulty}
                                            onChange={e => setNewQuest({ ...newQuest, difficulty: Number(e.target.value) })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                                        >
                                            <option value={1}>1 - Easy</option>
                                            <option value={2}>2 - Normal</option>
                                            <option value={3}>3 - Hard</option>
                                            <option value={4}>4 - Expert</option>
                                            <option value={5}>5 - Master</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleCreateQuest}
                                        className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-xl font-bold text-white transition-all shadow-lg shadow-yellow-600/20"
                                    >
                                        Create Global Quest
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                )}

                {activeTab === 'gates' && (
                    <div className="space-y-6">
                        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white font-display">
                                <ShieldCheckIcon className="w-6 h-6 text-indigo-500" />
                                Create Global Gate (Dungeon/Raid)
                            </h2>
                            <p className="text-gray-400 text-sm mb-6">
                                Create a Gate that will be instantly assigned to <strong>ALL</strong> users.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Gate Title</label>
                                    <input
                                        type="text"
                                        value={newGate.title}
                                        onChange={e => setNewGate({ ...newGate, title: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-600"
                                        placeholder="Ex: The Spider Queen's Lair"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Description</label>
                                    <textarea
                                        value={newGate.description}
                                        onChange={e => setNewGate({ ...newGate, description: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-600 h-20 resize-none"
                                        placeholder="Clear the dungeon before it's too late!"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Rank</label>
                                        <select
                                            value={newGate.rank}
                                            onChange={e => setNewGate({ ...newGate, rank: Number(e.target.value) })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        >
                                            <option value={0}>E-Rank (Easy)</option>
                                            <option value={1}>D-Rank</option>
                                            <option value={2}>C-Rank</option>
                                            <option value={3}>B-Rank</option>
                                            <option value={4}>A-Rank</option>
                                            <option value={5}>S-Rank (Insane)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Type</label>
                                        <select
                                            value={newGate.type}
                                            onChange={e => setNewGate({ ...newGate, type: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        >
                                            <option value="Dungeon">Dungeon</option>
                                            <option value="Raid">Raid</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Boss Name</label>
                                        <input
                                            type="text"
                                            value={newGate.bossName}
                                            onChange={e => setNewGate({ ...newGate, bossName: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Deadline (Optional)</label>
                                        <input
                                            type="datetime-local"
                                            value={newGate.deadline}
                                            onChange={e => setNewGate({ ...newGate, deadline: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleCreateGate}
                                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold text-white transition-all shadow-lg shadow-indigo-600/20"
                                    >
                                        Create Global Gate
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-6">
                        {/* Search Bar */}
                        <div className="relative max-w-md">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            />
                        </div>

                        {/* Users Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                                        <th className="p-4">User</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-400">Loading users...</td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-400">No users found.</td>
                                        </tr>
                                    ) : (
                                        users.map(user => (
                                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-white">{user.name}</div>
                                                            <div className="text-xs text-gray-500">Lvl {user.level} • ID: {user.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-300">{user.email}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'Admin'
                                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {user.isBanned ? (
                                                        <span className="flex items-center gap-1 text-red-500 text-sm font-medium">
                                                            <NoSymbolIcon className="w-4 h-4" /> Banned
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-green-500 text-sm font-medium">
                                                            <CheckCircleIcon className="w-4 h-4" /> Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {user.role !== 'Admin' && (
                                                        user.isBanned ? (
                                                            <button
                                                                onClick={() => handleUnban(user.id)}
                                                                className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-medium transition-colors border border-green-500/30"
                                                            >
                                                                Unban
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleBan(user.id)}
                                                                className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-colors border border-red-500/30"
                                                            >
                                                                Ban
                                                            </button>
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Guilds Tab */}
                {activeTab === 'guilds' && (
                    <div className="space-y-6">
                        {/* Search Bar */}
                        <div className="relative max-w-md">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search guilds by name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>

                        {/* Guilds Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                                        <th className="p-4">Guild Name</th>
                                        <th className="p-4">Leader</th>
                                        <th className="p-4">Members</th>
                                        <th className="p-4">Level</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-gray-400">Loading guilds...</td>
                                        </tr>
                                    ) : guilds.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-gray-400">No guilds found.</td>
                                        </tr>
                                    ) : (
                                        guilds.map(guild => (
                                            <tr key={guild.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-medium text-white">{guild.name}</div>
                                                    <div className="text-xs text-gray-500 line-clamp-1">{guild.description}</div>
                                                </td>
                                                <td className="p-4 text-gray-300">{guild.leaderName}</td>
                                                <td className="p-4 text-gray-300">{guild.memberCount} / {guild.capacity}</td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 rounded text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                        Lvl {guild.level}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${guild.isPrivate
                                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                        : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                        }`}>
                                                        {guild.isPrivate ? 'Private' : 'Public'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteGuild(guild.id)}
                                                        className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-colors border border-red-500/30 flex items-center gap-1 ml-auto"
                                                    >
                                                        <TrashIcon className="w-4 h-4" /> Disband
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Shop Tab Content */}
                {activeTab === 'shop' && (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <button
                                onClick={() => openShopModal()}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg font-bold hover:shadow-lg hover:shadow-red-500/20 transition-all font-display text-white"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Add New Item
                            </button>
                        </div>
                        {/* Grid of items */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {shopItems.map(item => (
                                <div key={item.id} className="relative group bg-white/5 border border-white/10 rounded-xl p-4 hover:border-red-500/50 transition-all">
                                    <div className="h-32 mb-4 bg-black/20 rounded-lg flex items-center justify-center p-2">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="h-full object-contain" />
                                        ) : (
                                            <ShoppingBagIcon className="w-12 h-12 text-gray-600" />
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg text-white mb-1">{item.name}</h3>
                                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{item.description}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-yellow-400 font-mono font-bold">{item.price} G</span>
                                        <span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300 border border-white/5">{item.type}</span>
                                    </div>
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openShopModal(item)} className="p-1.5 bg-blue-500 rounded-lg hover:bg-blue-400 text-white shadow-lg"><PencilSquareIcon className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 bg-red-500 rounded-lg hover:bg-red-400 text-white shadow-lg"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Shop Modal */}
                {isShopModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6 w-full max-w-lg relative shadow-2xl">
                            <button onClick={() => setIsShopModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                            <h2 className="text-2xl font-bold mb-6 text-white font-display">
                                {editingItem ? 'Edit Item' : 'New Item'}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Name</label>
                                    <input
                                        type="text"
                                        value={newItem.name}
                                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all placeholder-gray-600"
                                        placeholder="Ex: Potion of Haste"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Price (Gold)</label>
                                        <input
                                            type="number"
                                            value={newItem.price}
                                            onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Type</label>
                                        <select
                                            value={newItem.type}
                                            onChange={e => setNewItem({ ...newItem, type: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all appearance-none"
                                        >
                                            <option value="Consumable">Consumable</option>
                                            <option value="Cosmetic">Cosmetic</option>
                                            <option value="Passive">Passive</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Image URL</label>
                                    <input
                                        type="text"
                                        value={newItem.imageUrl}
                                        onChange={e => setNewItem({ ...newItem, imageUrl: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all placeholder-gray-600"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Description</label>
                                    <textarea
                                        value={newItem.description}
                                        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all placeholder-gray-600 h-24 resize-none"
                                        placeholder="Describe the item's effects..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Effect Data (JSON)</label>
                                    <input
                                        type="text"
                                        value={newItem.effectData}
                                        onChange={e => setNewItem({ ...newItem, effectData: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono text-xs placeholder-gray-600"
                                        placeholder='{"effect": "restore_hp", "value": 50}'
                                    />
                                </div>
                                <button
                                    onClick={handleSaveItem}
                                    className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold mt-4 text-white transition-colors shadow-lg shadow-red-600/20"
                                >
                                    {editingItem ? 'Update Item' : 'Create Item'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
