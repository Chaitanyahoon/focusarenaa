import { motion } from 'framer-motion'
import { type Task, TaskStatus } from '../types'
import { memo } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'

interface TaskItemProps {
    item: Task
    theme: any
    onComplete: (id: number) => void
}

const TaskItem = memo(({ item, theme, onComplete }: TaskItemProps) => {
    const isDone = item.status === TaskStatus.Done

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`group flex items-center gap-4 py-3 px-4 rounded-2xl transition-all duration-300 hover:bg-white/5 border border-transparent hover:border-white/5`}
        >
            <button
                onClick={() => onComplete(item.id)}
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${isDone 
                    ? `${theme.accentClass} border-transparent` 
                    : `border-white/10 group-hover:border-${theme.accent}`}`}
            >
                {isDone ? (
                    <CheckIcon className={`w-3 h-3 ${theme.name === 'Obsidian' ? 'text-black' : 'text-white'} stroke-[3]`} />
                ) : (
                    <div className={`w-1.5 h-1.5 rounded-full ${theme.accentClass} opacity-0 group-hover:opacity-40 transition-opacity`} />
                )}
            </button>
            
            <span className={`text-[12px] font-medium transition-all duration-300 truncate flex-1 ${isDone ? 'text-white/20 line-through' : 'text-white/80 group-hover:text-white'}`}>
                {item.title}
            </span>
            
            {item.difficulty > 1 && (
                <div className="flex gap-0.5 opacity-20 group-hover:opacity-40 transition-opacity">
                    {[...Array(item.difficulty)].map((_, i) => (
                        <div key={i} className={`w-1 h-1 rounded-full ${theme.accentClass}`} />
                    ))}
                </div>
            )}
        </motion.div>
    )
})

export default TaskItem
