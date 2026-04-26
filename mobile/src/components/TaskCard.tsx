import React from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import type { Task } from '../types'

function getTaskCategoryLabel(category: number) {
  switch (category) {
    case 0: return 'Study'
    case 1: return 'Work'
    case 2: return 'Fitness'
    case 3: return 'Personal'
    case 4: return 'Learning'
    case 5: return 'Note'
    default: return 'Quest'
  }
}

function getTaskDifficultyTone(difficulty: number) {
  switch (difficulty) {
    case 0: return styles.taskToneLow
    case 2: return styles.taskToneHigh
    default: return styles.taskToneMid
  }
}

interface TaskCardProps {
  task: Task
  onComplete?: (taskId: number) => void
  onDelete?: (taskId: number) => void
}

const TaskCard = React.memo(({ task, onComplete, onDelete }: TaskCardProps) => {
  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={[styles.taskTone, getTaskDifficultyTone(task.difficulty)]} />
        <Text style={styles.taskCategory}>{getTaskCategoryLabel(task.category)}</Text>
      </View>
      <Text style={styles.taskTitle}>{task.title}</Text>
      <View style={styles.taskFooter}>
        <View style={styles.metaRow}>
          <Text style={styles.taskMeta}>{task.xpReward} XP</Text>
          {onDelete && (
            <Pressable onPress={() => onDelete(task.id)} hitSlop={8} style={styles.deleteButton}>
              <Text style={styles.deleteLabel}>✕</Text>
            </Pressable>
          )}
        </View>
        {onComplete && (
          <Pressable 
            onPress={() => onComplete(task.id)} 
            style={styles.completeButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Complete task: ${task.title}`}
          >
            <Text style={styles.completeButtonLabel}>Complete</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  taskCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    gap: 10,
    marginBottom: 12, // Used for FlatList spacing
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskTone: {
    height: 10,
    width: 10,
    borderRadius: 999,
  },
  taskToneLow: { backgroundColor: '#34D399' },
  taskToneMid: { backgroundColor: '#60A5FA' },
  taskToneHigh: { backgroundColor: '#FB7185' },
  taskCategory: {
    color: 'rgba(231, 237, 246, 0.42)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  taskTitle: {
    color: '#F4F7FB',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskMeta: {
    color: 'rgba(231, 237, 246, 0.5)',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 4,
  },
  deleteLabel: {
    color: 'rgba(255, 100, 100, 0.8)',
    fontSize: 14,
    fontWeight: '800',
  },
  completeButton: {
    borderRadius: 14,
    backgroundColor: '#B7F7D3',
    paddingHorizontal: 16, // Expanded touch target
    paddingVertical: 12,  // Ensure minimum 44px-48px height visually
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonLabel: {
    color: '#08111F',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
})

export default TaskCard
