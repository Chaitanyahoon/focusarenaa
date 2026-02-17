import { motion } from 'framer-motion'
import { type Task, TaskStatus } from '../types'
import { memo } from 'react'

interface TaskItemProps {
    item: Task
    theme: any
    onComplete: (id: number) => void
}

const TaskItem = memo(({ item, theme, onComplete }: TaskItemProps) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`group flex items-center gap-3 text-xs py-3 px-5 border-b ${theme.border} hover:bg-white/5 transition-colors`}
        >
            <button
                onClick={() => onComplete(item.id)}
                className={`w-3.5 h-3.5 rounded-sm border ${theme.textMuted} hover:border-current hover:${theme.accentText} transition-colors flex-shrink-0 flex items-center justify-center`}
            >
                <div className={`w-2 h-2 rounded-sm ${theme.accentClass} opacity-0 hover:opacity-100 transition-opacity`}></div>
            </button>
            <span className={`flex-1 truncate ${item.status === TaskStatus.Done ? 'line-through opacity-40' : ''}`}>
                {item.title}
            </span>
        </motion.div>
    )
})

export default TaskItem
