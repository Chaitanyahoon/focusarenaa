import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { taskAPI } from '../services/api'
import { type Task, TaskStatus, TaskCategory } from '../types'
import { useAuthStore } from '../stores/authStore'
import TaskItem from '../components/TaskItem'
import NoteItem from '../components/NoteItem'
import {
    ArrowsPointingInIcon,
    ArrowRightOnRectangleIcon,
    ArrowsPointingOutIcon,
    SwatchIcon,
    XMarkIcon
} from '@heroicons/react/24/solid'

// IPC helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ipcRenderer = (window as any).electron ? (window as any).electron.ipcRenderer : { send: () => console.warn('IPC not available') }

const THEMES = [
    {
        name: 'Obsidian',
        bg: 'bg-zinc-950',
        border: 'border-zinc-800',
        text: 'text-zinc-200',
        textMuted: 'text-zinc-500',
        accent: 'zinc-100', // For dynamic usage
        accentClass: 'bg-zinc-100',
        accentText: 'text-zinc-100',
        hover: 'hover:bg-zinc-900',
        active: 'bg-zinc-900'
    },
    {
        name: 'Midnight',
        bg: 'bg-slate-950',
        border: 'border-slate-800',
        text: 'text-slate-200',
        textMuted: 'text-slate-500',
        accent: 'indigo-500',
        accentClass: 'bg-indigo-500',
        accentText: 'text-indigo-400',
        hover: 'hover:bg-slate-900',
        active: 'bg-slate-900'
    },
    {
        name: 'Forest',
        bg: 'bg-stone-950',
        border: 'border-stone-800',
        text: 'text-stone-200',
        textMuted: 'text-stone-500',
        accent: 'emerald-500',
        accentClass: 'bg-emerald-500',
        accentText: 'text-emerald-400',
        hover: 'hover:bg-stone-900',
        active: 'bg-stone-900'
    },
    {
        name: 'Crimson',
        bg: 'bg-neutral-950',
        border: 'border-neutral-800',
        text: 'text-neutral-200',
        textMuted: 'text-neutral-500',
        accent: 'rose-500',
        accentClass: 'bg-rose-500',
        accentText: 'text-rose-400',
        hover: 'hover:bg-neutral-900',
        active: 'bg-neutral-900'
    },
    {
        name: 'Royal',
        bg: 'bg-slate-950',
        border: 'border-slate-800',
        text: 'text-slate-200',
        textMuted: 'text-slate-500',
        accent: 'violet-500',
        accentClass: 'bg-violet-500',
        accentText: 'text-violet-400',
        hover: 'hover:bg-slate-900',
        active: 'bg-slate-900'
    },
    {
        name: 'Sunset',
        bg: 'bg-orange-950',
        border: 'border-orange-900/50',
        text: 'text-orange-100',
        textMuted: 'text-orange-400/50',
        accent: 'orange-500',
        accentClass: 'bg-orange-500',
        accentText: 'text-orange-400',
        hover: 'hover:bg-orange-900/30',
        active: 'bg-orange-900/50'
    },
    {
        name: 'Ocean',
        bg: 'bg-sky-950',
        border: 'border-sky-900/50',
        text: 'text-sky-100',
        textMuted: 'text-sky-400/50',
        accent: 'sky-400',
        accentClass: 'bg-sky-400',
        accentText: 'text-sky-300',
        hover: 'hover:bg-sky-900/30',
        active: 'bg-sky-900/50'
    },
    {
        name: 'Mint',
        bg: 'bg-teal-950',
        border: 'border-teal-900/50',
        text: 'text-teal-100',
        textMuted: 'text-teal-400/50',
        accent: 'teal-400',
        accentClass: 'bg-teal-400',
        accentText: 'text-teal-300',
        hover: 'hover:bg-teal-900/30',
        active: 'bg-teal-900/50'
    }
]

export default function Dashboard() {
    const { logout } = useAuthStore()
    const [tasks, setTasks] = useState<Task[]>([])
    const [newItemTitle, setNewItemTitle] = useState('')
    const [isMiniMode, setIsMiniMode] = useState(false)
    const [activeTab, setActiveTab] = useState<'quests' | 'notes'>('quests')
    const [showSettings, setShowSettings] = useState(false)
    const [theme, setTheme] = useState(THEMES[0])

    const fetchTasks = async () => {
        try {
            const data = await taskAPI.getAll()
            setTasks(data)
        } catch (error) {
            console.error("Failed to load tasks", error)
        }
    }

    useEffect(() => {
        fetchTasks()
        // Initialize expanded - keeping compact
        ipcRenderer.send('resize-window', 320, 400)
    }, [])

    const toggleMiniMode = () => {
        setIsMiniMode(!isMiniMode)
        if (!isMiniMode) {
            ipcRenderer.send('resize-window', 180, 44) // Clean Pill
        } else {
            ipcRenderer.send('resize-window', 320, 400) // Compact Expand
        }
    }

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newItemTitle.trim()) return

        try {
            const isNote = activeTab === 'notes'
            await taskAPI.create({
                title: newItemTitle,
                category: isNote ? TaskCategory.Note : TaskCategory.Personal,
                difficulty: 1,
                recurrence: 0
            })
            setNewItemTitle('')
            fetchTasks()
        } catch (error) {
            console.error('Failed to save', error)
        }
    }

    const handleComplete = useCallback(async (id: number) => {
        try {
            await taskAPI.complete(id)
            setTasks(prev => prev.filter(t => t.id !== id))
        } catch (error) {
            console.error('Failed complete', error)
        }
    }, [])

    const handleDelete = useCallback(async (id: number) => {
        try {
            await taskAPI.delete(id)
            setTasks(prev => prev.filter(t => t.id !== id))
        } catch (error) {
            console.error('Failed delete', error)
        }
    }, [])

    const filteredItems = tasks.filter(t =>
        activeTab === 'notes'
            ? t.category === TaskCategory.Note
            : t.category !== TaskCategory.Note
    )

    const todoCount = tasks.filter(t => t.category !== TaskCategory.Note && t.status !== TaskStatus.Done).length

    // PILL MODE (Physical Window: 180x44)
    if (isMiniMode) {
        return (
            <motion.div
                layoutId="dashboard-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 25 }}
                className={`w-full h-full ${theme.bg} rounded-full border ${theme.border} flex items-center justify-between pl-4 pr-2 shadow-xl app-drag-region cursor-move group transition-colors overflow-hidden relative select-none`}
                title="Expand Focus Arena"
            >
                {/* Left: Brand/Context */}
                <div className="flex flex-col justify-center no-drag" onClick={(e) => { e.stopPropagation(); toggleMiniMode() }}>
                    <span className={`text-[9px] font-bold tracking-widest uppercase ${theme.textMuted} group-hover:${theme.text} transition-colors`}>
                        Focus
                    </span>
                </div>

                {/* Center: Count Badge */}
                <div onClick={(e) => { e.stopPropagation(); toggleMiniMode() }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 no-drag cursor-pointer z-10">
                    <div className={`h-6 px-2.5 rounded-full ${theme.accentClass} flex items-center justify-center shadow-sm`}>
                        <span className="text-[10px] font-bold text-white">{todoCount}</span>
                    </div>
                </div>

                {/* Right: Expand Arrow */}
                <button
                    onClick={(e) => { e.stopPropagation(); toggleMiniMode() }}
                    className={`p-1.5 rounded-full ${theme.textMuted} hover:${theme.text} hover:bg-white/5 transition-all no-drag z-10`}
                >
                    <ArrowsPointingOutIcon className="w-3.5 h-3.5" />
                </button>
            </motion.div>
        )
    }

    // EXPANDED MODE (Physical Window: 320x400)
    return (
        <motion.div
            layoutId="dashboard-container"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 25 }}
            className={`w-full h-full ${theme.bg} ${theme.text} flex flex-col border ${theme.border} overflow-hidden box-border relative font-sans rounded-3xl shadow-2xl`}
        >
            {/* Settings Overlay */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`absolute inset-0 ${theme.bg}/95 z-50 flex flex-col p-4 gap-4 backdrop-blur-sm rounded-3xl`}
                    >
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">Theme</h3>
                            <button onClick={() => setShowSettings(false)} className={`${theme.textMuted} hover:${theme.text}`}><XMarkIcon className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {THEMES.map(t => (
                                <button
                                    key={t.name}
                                    onClick={() => setTheme(t)}
                                    className={`flex items-center gap-2 p-2 rounded border transition-all ${theme.name === t.name ? `${t.border} ${t.active}` : 'border-transparent hover:bg-white/5'}`}
                                >
                                    <div className={`w-3 h-3 rounded-full ${t.accentClass}`} />
                                    <span className="text-xs font-medium">{t.name}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className={`h-12 flex-shrink-0 flex items-center justify-between px-5 border-b ${theme.border} app-drag-region cursor-move select-none`}>
                <div
                    onClick={toggleMiniMode}
                    className="flex items-center gap-2 cursor-pointer no-drag group"
                >
                    <div className={`w-2 h-2 rounded-full ${theme.accentClass}`} />
                    <span className="text-xs font-semibold tracking-wide">Focus Arena</span>
                </div>
                <div className="flex items-center gap-2 no-drag">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`${theme.textMuted} hover:${theme.text} transition-colors`}
                        title="Theme"
                    >
                        <SwatchIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={toggleMiniMode}
                        className={`${theme.textMuted} hover:${theme.text} transition-colors`}
                        title="Minimize"
                    >
                        <ArrowsPointingInIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={logout}
                        className={`${theme.textMuted} hover:text-red-400 transition-colors`}
                        title="Logout"
                    >
                        <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className={`flex border-b ${theme.border} relative`}>
                <button
                    onClick={() => setActiveTab('quests')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors relative flex items-center justify-center ${activeTab === 'quests' ? theme.accentText : `${theme.textMuted} hover:${theme.text}`}`}
                >
                    <span className="relative z-10 pb-1">
                        Quests
                        {activeTab === 'quests' && (
                            <motion.div
                                layoutId="tab-indicator"
                                className={`absolute -bottom-1 left-0 right-0 h-0.5 ${theme.accentClass} rounded-full`}
                            />
                        )}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors relative flex items-center justify-center ${activeTab === 'notes' ? theme.accentText : `${theme.textMuted} hover:${theme.text}`}`}
                >
                    <span className="relative z-10 pb-1">
                        Notes
                        {activeTab === 'notes' && (
                            <motion.div
                                layoutId="tab-indicator"
                                className={`absolute -bottom-1 left-0 right-0 h-0.5 ${theme.accentClass} rounded-full`}
                            />
                        )}
                    </span>
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                <AnimatePresence mode='popLayout'>
                    {filteredItems.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`text-center py-16 flex flex-col items-center ${theme.textMuted}`}
                        >
                            <p className="text-[10px]">Empty {activeTab}</p>
                        </motion.div>
                    ) : (
                        activeTab === 'notes' ? (
                            <div className="columns-2 gap-2 p-3">
                                {filteredItems.map((item, i) => (
                                    <NoteItem
                                        key={item.id}
                                        item={item}
                                        theme={theme}
                                        onDelete={handleDelete}
                                        index={i}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {filteredItems.map((item) => (
                                    <TaskItem
                                        key={item.id}
                                        item={item}
                                        theme={theme}
                                        onComplete={handleComplete}
                                    />
                                ))}
                            </div>
                        )
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Input */}
            <div className={`p-4 border-t ${theme.border} flex-shrink-0`}>
                <form onSubmit={handleAddItem} className="relative w-full group">
                    <input
                        type="text"
                        value={newItemTitle}
                        onChange={e => setNewItemTitle(e.target.value)}
                        placeholder={activeTab === 'quests' ? "Add a quest..." : "Add a note..."}
                        className={`w-full bg-transparent text-xs ${theme.text} py-2 px-1 border-b ${theme.border} focus:border-current outline-none placeholder:${theme.textMuted} transition-colors`}
                        style={{ borderColor: undefined }} // Let CSS classes handle it, or use style for focus color
                    />
                </form>
            </div>
        </motion.div>
    )
}
