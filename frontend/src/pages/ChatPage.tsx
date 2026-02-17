import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'
import { chatAPI, friendAPI, profileAPI } from '../services/api'
import { ChatUser, PrivateMessage, FriendResponseDto } from '../types'
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { HUB_BASE } from '../config'
import {
    PaperAirplaneIcon,
    MagnifyingGlassIcon,
    UserCircleIcon,
    ChatBubbleLeftRightIcon,
    PlusIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/solid'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function ChatPage() {
    const { user, token } = useAuthStore()
    const { setUnreadMessages, setFriendRequests } = useNotificationStore()
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
    const [foundUser, setFoundUser] = useState<any>(null)
    const [friendSearchError, setFriendSearchError] = useState('')
    const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set())

    const [connection, setConnection] = useState<HubConnection | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Friend Management Functions
    const loadFriendsData = async () => {
        try {
            const [friendsData, requestsData] = await Promise.all([
                friendAPI.getFriends(),
                friendAPI.getRequests()
            ])
            setFriends(friendsData)
            setRequests(requestsData)
            setFriendRequests(requestsData.filter(r => r.isIncoming).length)
        } catch (error) {
            console.error('Failed to load friends', error)
        }
    }

    useEffect(() => {
        loadFriendsData()
    }, [])

    const handleSearchFriend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!addFriendId) return
        setFriendSearchError('')
        try {
            const id = parseInt(addFriendId)
            if (isNaN(id)) {
                setFriendSearchError('Invalid Hunter ID')
                return
            }
            const user = await profileAPI.getById(id)
            setFoundUser(user)
        } catch (error) {
            setFriendSearchError('Hunter not found')
            setFoundUser(null)
        }
    }

    const handleAddFriend = async () => {
        if (!foundUser) return
        try {
            await friendAPI.sendRequest(foundUser.id)
            toast.success('Friend request sent!')
            setShowAddFriend(false)
            setFoundUser(null)
            setAddFriendId('')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send request')
        }
    }

    const handleRespond = async (requestId: number, accept: boolean) => {
        try {
            await friendAPI.respondToRequest(requestId, accept)
            toast.success(accept ? 'Friend request accepted!' : 'Request declined')
            loadFriendsData()
        } catch (error) {
            toast.error('Failed to respond')
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

    // 1. Initialize SignalR Connection & Listeners
    useEffect(() => {
        if (!token) return

        const newConnection = new HubConnectionBuilder()
            .withUrl(`${HUB_BASE}/gamehub`, {
                accessTokenFactory: () => token
            })
            .configureLogging(LogLevel.Error)
            .withAutomaticReconnect()
            .build()

        setConnection(newConnection)

        let isMounted = true

        newConnection.start()
            .then(() => {
                if (isMounted) {
                    // Listeners
                    newConnection.on('ReceivePrivateMessage', () => {
                        // We can't access selectedUser from closure here easily if it changes.
                        // However, we are setting state updates.
                        // To handle selectedUser dependency, we might need a Ref or a separate listener effect.
                        // But separate listener effect needs the connection to be ready.
                        // Given the complexity, let's keep the connection stable and add listeners in a separate effect
                        // BUT we must ensure start is finished.
                        // Actually, separating them caused the race condition.
                        // To fix "selectedUser" dependency, we can use a Ref for selectedUser.
                    })

                    newConnection.on('ReceiveFriendRequest', () => {
                        if (isMounted) loadFriendsData()
                    })

                    newConnection.on('ReceiveFriendResponse', () => {
                        if (isMounted) loadFriendsData()
                    })

                    newConnection.on('UserCameOnline', (userId: number) => {
                        setOnlineUsers(prev => {
                            const next = new Set(prev)
                            next.add(userId)
                            return next
                        })
                    })

                    newConnection.on('UserWentOffline', (userId: number) => {
                        setOnlineUsers(prev => {
                            const next = new Set(prev)
                            next.delete(userId)
                            return next
                        })
                    })

                    // Get initial online users
                    newConnection.invoke('GetOnlineUsers')
                        .then((users: number[]) => {
                            if (isMounted) setOnlineUsers(new Set(users))
                        })
                        .catch(err => console.error('Failed to get online users', err))
                }
            })
            .catch(err => {
                if (isMounted) console.error('Chat Connection Failed', err)
            })

        return () => {
            isMounted = false
            newConnection.stop().catch(() => { })
        }
    }, [token])

    // Handle Messages Listener with dynamic selectedUser 
    // We attach/detach this specific listener when selectedUser changes
    // OR we use a Ref for selectedUser inside the main listener.
    // Using a Ref is cleaner than re-attaching listeners.
    const selectedUserRef = useRef(selectedUser)

    useEffect(() => {
        selectedUserRef.current = selectedUser
    }, [selectedUser])

    useEffect(() => {
        if (!connection) return;

        // We need to ensure we don't duplicate listeners if connection re-establishes?
        // HubConnection.on replaces functionality? No, it appends? 
        // SignalR .on appends. We should use .off first.

        const handleMessage = (msg: any) => {
            const currentSelected = selectedUserRef.current
            if (currentSelected && (msg.senderId === currentSelected.id || msg.receiverId === currentSelected.id)) {
                setMessages(prev => [...prev, { ...msg, isMe: msg.senderId === user?.id }])
            } else {
                loadRecentChats()
            }
        }

        connection.off('ReceivePrivateMessage')
        connection.on('ReceivePrivateMessage', handleMessage)

        return () => {
            connection.off('ReceivePrivateMessage', handleMessage)
        }
    }, [connection, user]) // Re-bind if connection changes (re-created)


    // 3. Load Recent Chats
    const loadRecentChats = async () => {
        try {
            const data = await chatAPI.getRecent()
            setRecentChats(data)
            const totalUnread = data.reduce((acc, chat) => acc + chat.unreadCount, 0)
            setUnreadMessages(totalUnread)
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
        <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex gap-0 md:gap-4 animate-in fade-in duration-500">

            {/* LEFT PANEL: Users List */}
            <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 system-panel flex-col overflow-hidden`}>
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
                    {/* Add Friend Modal */}
                    {showAddFriend && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                            <div className="bg-[#0a1120] border border-system-blue p-6 rounded-lg max-w-sm w-full shadow-[0_0_30px_rgba(var(--color-system-blue-rgb),0.2)]">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-display font-bold text-white">ADD FRIEND</h3>
                                    <button onClick={() => {
                                        setShowAddFriend(false)
                                        setFoundUser(null)
                                        setAddFriendId('')
                                        setFriendSearchError('')
                                    }} className="text-gray-500 hover:text-white"><XMarkIcon className="w-5 h-5" /></button>
                                </div>

                                {!foundUser ? (
                                    <>
                                        <p className="text-gray-400 text-sm mb-4">
                                            Enter the Hunter ID of the user you want to add.
                                        </p>
                                        <form onSubmit={handleSearchFriend}>
                                            <div className="flex gap-2 mb-4">
                                                <input
                                                    type="number"
                                                    placeholder="Hunter ID (e.g., 1042)"
                                                    className="flex-1 bg-black/50 border border-gray-700 rounded px-4 py-2 text-white focus:border-system-blue focus:outline-none"
                                                    value={addFriendId}
                                                    onChange={e => {
                                                        setAddFriendId(e.target.value)
                                                        setFriendSearchError('')
                                                    }}
                                                    autoFocus
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!addFriendId.trim()}
                                                    className="px-4 bg-system-blue/10 border border-system-blue/30 text-blue-300 font-bold rounded hover:bg-system-blue/20 disabled:opacity-50"
                                                >
                                                    SEARCH
                                                </button>
                                            </div>
                                            {friendSearchError && <p className="text-red-400 text-xs mb-4">{friendSearchError}</p>}
                                        </form>
                                    </>
                                ) : (
                                    <div className="text-center mb-6 animate-in fade-in zoom-in duration-300">
                                        <div className="w-20 h-20 rounded-full bg-gray-800 mx-auto mb-3 overflow-hidden border-2 border-system-blue shadow-[0_0_15px_rgba(var(--color-system-blue-rgb),0.4)]">
                                            {foundUser.avatarUrl ? (
                                                <img src={foundUser.avatarUrl} alt={foundUser.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserCircleIcon className="p-2 text-gray-500" />
                                            )}
                                        </div>
                                        <h4 className="font-bold text-white text-lg">{foundUser.name}</h4>
                                        <p className="text-system-blue text-sm font-mono mb-2">Level {foundUser.level}</p>

                                        <div className="flex gap-2 justify-center mb-6">
                                            <Link
                                                to={`/profile/${foundUser.id}`}
                                                onClick={() => setShowAddFriend(false)}
                                                className="text-gray-400 hover:text-white text-xs underline"
                                            >
                                                View Full Profile
                                            </Link>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setFoundUser(null)
                                                    setAddFriendId('')
                                                }}
                                                className="flex-1 py-2 border border-gray-600 rounded text-gray-400 font-bold hover:bg-gray-800 transition-colors"
                                            >
                                                CANCEL
                                            </button>
                                            <button
                                                onClick={handleAddFriend}
                                                className="flex-1 py-2 bg-system-blue hover:bg-blue-500 text-black font-bold rounded transition-colors shadow-lg shadow-blue-900/20"
                                            >
                                                SEND REQUEST
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-gray-800 text-center">
                                    <span className="text-xs text-gray-500 block mb-1">YOUR HUNTER ID</span>
                                    <span className="font-mono text-xl text-white font-bold tracking-wider">{user?.id}</span>
                                </div>
                            </div>
                        </div>
                    )}
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
            <div className={`${selectedUser ? 'flex' : 'hidden md:flex'} w-full md:w-2/3 system-panel flex-col overflow-hidden relative`}>
                {!selectedUser ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-50">
                        <ChatBubbleLeftRightIcon className="w-24 h-24 mb-4 text-system-blue" />
                        <p className="font-display tracking-widest text-lg">SELECT A FREQUENCY TO BEGIN</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-system-blue/30 bg-blue-900/10 flex items-center gap-3">
                            {/* Back button — mobile only */}
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="md:hidden text-blue-400 hover:text-white transition-colors mr-1 flex-shrink-0"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
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
                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${onlineUsers.has(selectedUser.id) ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                    <span className={`text-xs font-mono tracking-widest ${onlineUsers.has(selectedUser.id) ? 'text-green-400' : 'text-gray-500'}`}>
                                        {onlineUsers.has(selectedUser.id) ? 'ONLINE' : 'OFFLINE'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/20">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] md:max-w-[70%] rounded-lg p-3 ${msg.isMe
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
