import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../stores/authStore'
import { chatAPI, friendAPI } from '../services/api'
import { ChatUser, PrivateMessage, FriendResponseDto } from '../types'
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { HUB_BASE } from '../config'
import {
    PaperAirplaneIcon,
    MagnifyingGlassIcon,
    UserCircleIcon,
    ChatBubbleLeftRightIcon,
    UserGroupIcon,
    PlusIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/solid'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function ChatPage() {
    const { user, token } = useAuthStore()
    const [recentChats, setRecentChats] = useState<ChatUser[]>([])
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
    const [messages, setMessages] = useState<PrivateMessage[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<ChatUser[]>([])
    const [viewMode, setViewMode] = useState<'chats' | 'friends'>('chats')
    const [friends, setFriends] = useState<FriendResponseDto[]>([])
    const [requests, setRequests] = useState<FriendResponseDto[]>([])
    const [showAddFriend, setShowAddFriend] = useState(false)
    const [addFriendId, setAddFriendId] = useState('')

    const [connection, setConnection] = useState<HubConnection | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // 1. Initialize SignalR Connection
    useEffect(() => {
        if (!token) return

        const newConnection = new HubConnectionBuilder()
            .withUrl(`${HUB_BASE}/gamehub`, {
                accessTokenFactory: () => token
            })
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build()

        setConnection(newConnection)

        return () => {
            newConnection.stop()
        }
    }, [token])

    // Load Friends & Requests
    const loadFriendsData = async () => {
        try {
            const [friendsData, requestsData] = await Promise.all([
                friendAPI.getFriends(),
                friendAPI.getRequests()
            ])
            setFriends(friendsData)
            setRequests(requestsData)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        loadFriendsData()
    }, [])

    const handleAddFriend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!addFriendId.trim()) return

        try {
            await friendAPI.sendRequest(parseInt(addFriendId))
            toast.success('Friend request sent!')
            setShowAddFriend(false)
            setAddFriendId('')
            loadFriendsData()
        } catch (error: any) {
            toast.error(error.response?.data || 'Failed to send request')
        }
    }

    const handleRespond = async (requestId: number, accept: boolean) => {
        try {
            await friendAPI.respondToRequest(requestId, accept)
            toast.success(accept ? 'Friend added!' : 'Request declined')
            loadFriendsData()
        } catch (error) {
            toast.error('Operation failed')
        }
    }

    const startChat = (friend: FriendResponseDto) => {
        const chatUser: ChatUser = {
            id: friend.friendId,
            name: friend.name,
            avatarUrl: friend.avatarUrl,
            unreadCount: 0,
            isOnline: false
        }
        setSelectedUser(chatUser)
        setViewMode('chats')
    }

    // 2. Start Connection & Setup Listeners
    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('Chat Connected');

                    connection.on('ReceivePrivateMessage', (msg: any) => {
                        // If chat is open with this user (either sender or receiver matches current selected)
                        if (selectedUser && (msg.senderId === selectedUser.id || msg.receiverId === selectedUser.id)) {
                            setMessages(prev => [...prev, { ...msg, isMe: msg.senderId === user?.id }])
                            // Mark as read immediately if window open (API call needed normally, but verified by backend on get)
                        } else {
                            // Update recent chats list to show new message/unread
                            loadRecentChats()
                            if (msg.senderId !== user?.id) {
                                toast(`New message from ${msg.senderName}`, { icon: '💬' })
                            }
                        }
                    })
                })
                .catch(err => console.error('Chat Connection Failed', err))
        }
    }, [connection, selectedUser, user])

    // 3. Load Recent Chats
    const loadRecentChats = async () => {
        try {
            const data = await chatAPI.getRecent()
            setRecentChats(data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        loadRecentChats()
    }, [])

    // 4. Load Conversation
    useEffect(() => {
        if (!selectedUser) return

        const loadHistory = async () => {
            try {
                const history = await chatAPI.getHistory(selectedUser.id)
                setMessages(history)
                scrollToBottom()
                // Refresh recent list to clear unread count locally
                loadRecentChats()
            } catch (error) {
                console.error(error)
            }
        }
        loadHistory()
    }, [selectedUser])

    // Auto-scroll
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // 5. Build Handlers
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedUser || !connection) return

        try {
            // Optimistic update (optional, but waiting for server echo is safer to ensure ID/Timestamp match)
            await connection.invoke('SendPrivateMessage', user?.id, selectedUser.id, newMessage)
            setNewMessage('')
        } catch (error) {
            toast.error('Failed to send')
            console.error(error)
        }
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return
        try {
            const results = await chatAPI.searchUsers(searchQuery)
            setSearchResults(results)
        } catch (error) {
            console.error(error)
        }
    }

    const selectResultUser = (u: ChatUser) => {
        setSelectedUser(u)
        setSearchResults([])
        setSearchQuery('')
    }

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex gap-4 animate-in fade-in duration-500">

            {/* LEFT PANEL: Users List */}
            <div className="w-1/3 system-panel flex flex-col overflow-hidden">
                {/* View Toggles */}
                <div className="flex border-b border-system-blue/20">
                    <button
                        onClick={() => setViewMode('chats')}
                        className={`flex-1 py-3 text-sm font-bold tracking-widest transition-colors ${viewMode === 'chats' ? 'bg-system-blue/20 text-blue-300 border-b-2 border-system-blue' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        CHATS
                    </button>
                    <button
                        onClick={() => setViewMode('friends')}
                        className={`flex-1 py-3 text-sm font-bold tracking-widest transition-colors ${viewMode === 'friends' ? 'bg-system-blue/20 text-blue-300 border-b-2 border-system-blue' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        FRIENDS
                    </button>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {viewMode === 'chats' ? (
                        <div className="space-y-1">
                            <div className="p-2 border-b border-gray-800 mb-2">
                                <form onSubmit={handleSearch} className="relative">
                                    <input
                                        type="text"
                                        placeholder="Find Hunter..."
                                        className="w-full bg-black/50 border border-system-blue/30 rounded px-4 py-2 text-xs text-white focus:outline-none focus:border-system-blue transition-colors pl-8"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                    <MagnifyingGlassIcon className="w-3 h-3 text-gray-400 absolute left-3 top-2.5" />
                                </form>
                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="mt-2 bg-gray-900 border border-gray-700 rounded shadow-xl overflow-hidden">
                                        {searchResults.map(u => (
                                            <div
                                                key={u.id}
                                                onClick={() => selectResultUser(u)}
                                                className="p-2 hover:bg-gray-800 cursor-pointer flex items-center gap-2 border-b border-gray-800 last:border-0"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
                                                    {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" /> : <UserCircleIcon className="p-0.5" />}
                                                </div>
                                                <span className="text-xs text-white font-bold">{u.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {recentChats.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-xs">No recent chats</div>
                            ) : (
                                recentChats.map(chat => (
                                    <div
                                        key={chat.id}
                                        onClick={() => setSelectedUser(chat)}
                                        className={`p-3 rounded-lg cursor-pointer transition-all flex items-center gap-3 border border-transparent
                                        ${selectedUser?.id === chat.id
                                                ? 'bg-system-blue/20 border-system-blue/50'
                                                : 'hover:bg-gray-800/50 hover:border-gray-700'
                                            }`}
                                    >
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
                                                {chat.avatarUrl ? (
                                                    <img src={chat.avatarUrl} alt={chat.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                        {chat.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            {chat.unreadCount > 0 && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-system-red rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#0a1120]">
                                                    {chat.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className={`font-bold truncate ${selectedUser?.id === chat.id ? 'text-white' : 'text-gray-300'}`}>
                                                    {chat.name}
                                                </span>
                                                {chat.lastMessageTime && (
                                                    <span className="text-[10px] text-gray-500">
                                                        {new Date(chat.lastMessageTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">
                                                {chat.lastMessage || 'No messages'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 pt-2">
                            {/* Actions */}
                            <button
                                onClick={() => setShowAddFriend(true)}
                                className="w-full py-2 bg-system-blue/10 border border-system-blue/30 rounded text-blue-300 text-xs font-bold hover:bg-system-blue/20 transition-all flex items-center justify-center gap-2"
                            >
                                <PlusIcon className="w-4 h-4" /> ADD FRIEND
                            </button>

                            {/* Friend Requests */}
                            {requests.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold text-gray-500 px-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                                        REQUESTS
                                    </h3>
                                    {requests.map(req => (
                                        <div key={req.id} className="p-3 bg-gray-900/50 border border-gray-700 rounded flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden">
                                                    {req.avatarUrl ? <img src={req.avatarUrl} className="w-full h-full object-cover" /> : <UserCircleIcon className="p-1" />}
                                                </div>
                                                <span className="text-sm font-bold text-white">{req.name}</span>
                                            </div>
                                            {req.isIncoming ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleRespond(req.id, true)} className="flex-1 py-1 bg-green-900/30 border border-green-500/30 text-green-400 text-xs rounded hover:bg-green-900/50 flex items-center justify-center gap-1"><CheckIcon className="w-3 h-3" /> ACCEPT</button>
                                                    <button onClick={() => handleRespond(req.id, false)} className="flex-1 py-1 bg-red-900/30 border border-red-500/30 text-red-400 text-xs rounded hover:bg-red-900/50 flex items-center justify-center gap-1"><XMarkIcon className="w-3 h-3" /> DECLINE</button>
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-gray-500 text-center uppercase tracking-widest bg-gray-800/50 py-1 rounded">Pending</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Friends List */}
                            <div className="space-y-1">
                                <h3 className="text-xs font-bold text-gray-500 px-2 uppercase">Your Friends ({friends.length})</h3>
                                {friends.length === 0 && <div className="text-center text-gray-600 text-xs py-4 italic">No hunters in your network yet.</div>}
                                {friends.map(friend => (
                                    <div
                                        key={friend.id}
                                        onClick={() => startChat(friend)}
                                        className="p-2 hover:bg-white/5 rounded cursor-pointer flex items-center gap-3 transition-colors group border border-transparent hover:border-gray-700"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden ring-1 ring-gray-700 group-hover:ring-system-blue/50">
                                            {friend.avatarUrl ? <img src={friend.avatarUrl} className="w-full h-full object-cover" /> : <UserCircleIcon className="p-1" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-gray-300 group-hover:text-white flex items-center gap-2">
                                                {friend.name}
                                                <span className="text-[10px] px-1.5 bg-gray-800 rounded text-gray-500">LVL {friend.level}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-mono">ID: {friend.friendId}</div>
                                        </div>
                                        <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-600 group-hover:text-system-blue opacity-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: Chat Window */}
            <div className="w-2/3 system-panel flex flex-col overflow-hidden relative">
                {!selectedUser ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-50">
                        <ChatBubbleLeftRightIcon className="w-24 h-24 mb-4 text-system-blue" />
                        <p className="font-display tracking-widest text-lg">SELECT A FREQUENCY TO BEGIN</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-system-blue/30 bg-blue-900/10 flex items-center gap-3">
                            <Link to={`/profile/${selectedUser.id}`} className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-system-blue/30 hover:ring-2 hover:ring-blue-500 transition-all">
                                {selectedUser.avatarUrl ? (
                                    <img src={selectedUser.avatarUrl} alt={selectedUser.name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircleIcon className="p-1 w-full h-full text-gray-500" />
                                )}
                            </Link>
                            <div>
                                <Link to={`/profile/${selectedUser.id}`} className="font-display font-bold text-xl text-white hover:text-blue-400 transition-colors">
                                    {selectedUser.name}
                                </Link>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-xs text-green-400 font-mono tracking-widest">ONLINE</span>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/20">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] rounded-lg p-3 ${msg.isMe
                                        ? 'bg-system-blue/20 border border-system-blue/30 text-blue-100 rounded-tr-none'
                                        : 'bg-gray-800/80 border border-gray-700 text-gray-200 rounded-tl-none'
                                        }`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        <div className={`text-[10px] mt-1 flex gap-1 ${msg.isMe ? 'justify-end text-blue-400/70' : 'text-gray-500'}`}>
                                            {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {msg.isMe && <span>{msg.isRead ? '✓✓' : '✓'}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-system-blue/30 bg-blue-900/10">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={`Message ${selectedUser.name}...`}
                                    className="flex-1 bg-black/50 border border-system-blue/30 rounded px-4 py-3 text-white focus:outline-none focus:border-system-blue transition-all font-mono text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="px-4 bg-system-blue hover:bg-blue-500 text-black font-bold rounded flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>

        </div>
    )
}
