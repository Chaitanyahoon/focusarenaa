import { motion } from 'framer-motion'
import type { Task } from '../types'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { memo } from 'react'

interface NoteItemProps {
    item: Task
    theme: any
    onDelete: (id: number) => void
    index: number
}

const NoteItem = memo(({ item, theme, onDelete, index }: NoteItemProps) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            className={`break-inside-avoid mb-2 p-3 rounded-lg border ${theme.border} bg-white/5 hover:bg-white/10 transition-colors group relative`}
        >
            <p className={`text-xs ${theme.text} whitespace-pre-wrap font-mono leading-relaxed`}>{item.title}</p>
            <button
                onClick={() => onDelete(item.id)}
                className={`absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-500/20 text-red-400 transition-all`}
            >
                <XMarkIcon className="w-3 h-3" />
            </button>
        </motion.div>
    )
})

export default NoteItem
