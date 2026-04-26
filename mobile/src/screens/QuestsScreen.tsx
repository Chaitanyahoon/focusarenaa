import React, { useCallback, useState } from 'react'
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from 'react-native'
import { useAppStore } from '../stores/appStore'
import TaskCard from '../components/TaskCard'
import type { Task } from '../types'

const CATEGORIES = [
  { id: 0, label: 'Main Quest' },
  { id: 1, label: 'Side Quest' },
  { id: 3, label: 'Daily Contract' },
]

const DIFFICULTIES = [
  { id: 1, label: 'F-Rank (Easy)' },
  { id: 3, label: 'D-Rank (Medium)' },
  { id: 5, label: 'B-Rank (Hard)' },
  { id: 7, label: 'S-Rank (Epic)' },
]

export default function QuestsScreen() {
  const { tasks, completeTask, createTask, deleteTask, hydrateDashboard, dashboardLoading } = useAppStore()
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskCategory, setNewTaskCategory] = useState(3)
  const [newTaskDifficulty, setNewTaskDifficulty] = useState(1)

  const activeTasks = tasks.filter((task) => task.category !== 5 && task.status !== 2)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const completedTasks = tasks.filter(t => {
      if (t.status !== 2) return false
      if (t.category === 5) return false
      if (!t.completedAt) return true
      const d = new Date(t.completedAt)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
  })

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return
    await createTask({
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      difficulty: newTaskDifficulty,
      recurrence: 0,
    })
    setNewTaskTitle('')
    setModalVisible(false)
  }

  // Memoized renderItem to prevent re-renders on FlatList scroll
  const renderItem = useCallback(
    ({ item }: { item: Task }) => <TaskCard task={item} onComplete={completeTask} onDelete={deleteTask} />,
    [completeTask, deleteTask]
  )

  const keyExtractor = useCallback((item: Task) => item.id.toString(), [])

  const renderFooter = () => {
    if (completedTasks.length === 0) return null;
    return (
      <View style={styles.footerContainer}>
        <View style={styles.footerHeader}>
          <Text style={styles.footerLabel}>TODAY'S COMPLETIONS</Text>
          <Text style={styles.footerXp}>
            {completedTasks.reduce((acc, curr) => acc + curr.xpReward, 0)} XP TOTAL
          </Text>
        </View>
        {completedTasks.map(task => (
          <View key={task.id} style={styles.completedCard}>
            <View style={styles.completedHeader}>
              <View style={[styles.taskTone, { backgroundColor: '#34D399', width: 6, height: 6 }]} />
              <Text style={styles.completedTitle}>{task.title}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.completedXp}>+{task.xpReward} XP</Text>
              <Pressable onPress={() => deleteTask(task.id)} hitSlop={8} style={styles.deleteButton}>
                <Text style={styles.deleteLabel}>✕</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.panelHeadingRow}>
          <View>
            <Text style={styles.panelLabel}>Active Contracts</Text>
            <Text style={styles.heroTitle}>{activeTasks.length} Quests</Text>
          </View>
          <Pressable onPress={() => setModalVisible(true)} style={styles.primaryChip} accessibilityRole="button">
            <Text style={styles.primaryChipLabel}>+ NEW QUEST</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={activeTasks}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={dashboardLoading} onRefresh={hydrateDashboard} tintColor="#F4F7FB" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No active contracts loaded.</Text>
            <Text style={styles.emptyBody}>Tap "+ NEW QUEST" to add a target for today.</Text>
          </View>
        }
        removeClippedSubviews={true}
        ListFooterComponent={renderFooter}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={8}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Issue Contract</Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={10}>
                <Text style={styles.closeModalText}>✕</Text>
              </Pressable>
            </View>

            <TextInput
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholder="What needs to be done?"
              placeholderTextColor="rgba(231, 237, 246, 0.28)"
              style={styles.modalInput}
              autoFocus
            />

            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.pillRow}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setNewTaskCategory(cat.id)}
                  style={[styles.pill, newTaskCategory === cat.id && styles.pillActive]}
                >
                  <Text style={[styles.pillText, newTaskCategory === cat.id && styles.pillTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Rank (Difficulty)</Text>
            <View style={styles.pillRow}>
              {DIFFICULTIES.map(diff => (
                <TouchableOpacity
                  key={diff.id}
                  onPress={() => setNewTaskDifficulty(diff.id)}
                  style={[styles.pill, newTaskDifficulty === diff.id && styles.pillActive]}
                >
                  <Text style={[styles.pillText, newTaskDifficulty === diff.id && styles.pillTextActive]}>
                    {diff.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Pressable onPress={handleCreateTask} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>ADD TO QUEST LOG</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1020',
  },
  header: {
    padding: 18,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(231, 237, 246, 0.08)',
    backgroundColor: 'rgba(9, 13, 24, 0.95)',
  },
  panelHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  panelLabel: {
    color: 'rgba(231, 237, 246, 0.42)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 4,
    color: '#F4F7FB',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  primaryChip: {
    borderRadius: 14,
    backgroundColor: '#F4F7FB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  primaryChipLabel: {
    color: '#09111F',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  listContent: {
    padding: 18,
    paddingBottom: 100, // Space for bottom tabs
  },
  emptyState: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    color: '#F4F7FB',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyBody: {
    color: 'rgba(231, 237, 246, 0.5)',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  footerContainer: {
    marginTop: 30,
    opacity: 0.8,
  },
  footerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerLabel: {
    color: 'rgba(231, 237, 246, 0.42)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  footerXp: {
    color: 'rgba(52, 211, 153, 0.6)',
    fontSize: 11,
    fontWeight: '800',
  },
  completedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  completedTitle: {
    color: 'rgba(231, 237, 246, 0.5)',
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  completedXp: {
    color: 'rgba(52, 211, 153, 0.5)',
    fontSize: 12,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  taskTone: {
    height: 10,
    width: 10,
    borderRadius: 999,
  },
  deleteButton: {
    padding: 4,
  },
  deleteLabel: {
    color: 'rgba(255, 100, 100, 0.8)',
    fontSize: 14,
    fontWeight: '800',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 9, 19, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0A1020',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    color: '#F4F7FB',
    fontSize: 20,
    fontWeight: '900',
  },
  closeModalText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 20,
    fontWeight: '700',
  },
  modalInput: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#F4F7FB',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 4,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  pillText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#3b82f6',
    fontWeight: '800',
  },
  submitButton: {
    backgroundColor: '#F4F7FB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#08111F',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
})
