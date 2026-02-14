import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { HUB_BASE } from '../../config';
import { Link } from 'react-router-dom';

interface Message {
    id: string; // generated client-side or from server
    userId: number;
    userName: string;
    message: string;
    avatarUrl?: string;
    timestamp: string;
    isSystem?: boolean;
}

interface Props {
    guildId: number;
}

export default function GuildChat({ guildId }: Props) {
    const { user, token } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!token || !guildId) return;

        const hubUrl = `${HUB_BASE}/gamehub`

        const newConnection = new HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => token
            })
            .configureLogging(LogLevel.Error)
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        return () => {
            if (newConnection) {
                newConnection.stop();
            }
        };
    }, [token, guildId]); // Reconnect if guild changes (unlikely)

    useEffect(() => {
        if (connection && connection.state === HubConnectionState.Disconnected) {
            connection.start()
                .then(() => {
                    // Connected to Guild Chat
                    connection.invoke('JoinGuildGroup', guildId);

                    connection.on('ReceiveGuildMessage', (msg: any) => {
                        setMessages(prev => [...prev, { ...msg, id: Date.now().toString() + Math.random() }]);
                    });
                })
                .catch(() => { /* Connection failed, will retry */ });
        }
    }, [connection, guildId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !connection || !user) return;

        try {
            await connection.invoke('SendMessageToGuild', guildId, user.id, user.name, newMessage, user.avatarUrl);
            setNewMessage('');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-[#0a1120] border border-blue-900/30 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-blue-900/30 bg-blue-900/10">
                <h3 className="font-rajdhani font-bold text-white">GUILD CHAT</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 text-sm mt-10">
                        Channel secure. Begin transmission.
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.userId === user?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                                <Link to={`/profile/${msg.userId}`} className="w-8 h-8 rounded-full bg-gray-700 mr-2 overflow-hidden flex-shrink-0 border border-gray-600 hover:ring-2 hover:ring-blue-500 transition-all">
                                    {msg.avatarUrl ? (
                                        <img src={msg.avatarUrl} alt={msg.userName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                                            {msg.userName.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </Link>
                            )}

                            <div className={`max-w-[70%] rounded-lg p-3 ${isMe
                                ? 'bg-blue-600/20 border border-blue-500/30 text-white rounded-tr-none'
                                : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-none'
                                }`}>
                                {!isMe && (
                                    <Link to={`/profile/${msg.userId}`} className="text-xs text-blue-400 mb-1 font-bold hover:underline">
                                        {msg.userName}
                                    </Link>
                                )}
                                <p className="text-sm break-words">{msg.message}</p>
                                <div className="text-[10px] text-gray-500 text-right mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-blue-900/30 bg-blue-900/10 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#050914] border border-blue-900/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || !connection}
                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded disabled:opacity-50 transition-all"
                >
                    <PaperAirplaneIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
