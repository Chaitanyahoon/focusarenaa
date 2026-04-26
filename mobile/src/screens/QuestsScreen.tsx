import React, { useCallback, useState } from 'react'
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useAppStore } from '../stores/appStore'
import TaskCard from '../components/TaskCard'
import type { Task } from '../types'

export default function QuestsScreen() {
  const { tasks, completeTask, createTask, hydrateDashboard, dashboardLoading } = useAppStore()
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const activeTasks = tasks.filter((task) => task.category !== 5 && task.status !== 2)

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return
    await createTask(newTaskTitle.trim())
    setNewTaskTitle('')
  }

  // Memoized renderItem to prevent re-renders on FlatList scroll
  const renderItem = useCallback(
    ({ item }: { item: Task }) => <TaskCard task={item} onComplete={completeTask} />,
    [completeTask]
  )

  const keyExtractor = useCallback((item: Task) => item.id.toString(), [])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.panelHeadingRow}>
          <Text style={styles.panelLabel}>Quick capture</Text>
          <Pressable onPress={handleCreateTask} style={styles.primaryChip} accessibilityRole="button">
            <Text style={styles.primaryChipLabel}>Save</Text>
          </Pressable>
        </View>
        <TextInput
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          placeholder="Add a task for later today"
          placeholderTextColor="rgba(231, 237, 246, 0.28)"
          style={styles.input}
        />
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
            <Text style={styles.emptyBody}>Use quick capture above to make mobile useful instead of passive.</Text>
          </View>
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={8}
      />
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(231, 237, 246, 0.08)',
    backgroundColor: 'rgba(9, 13, 24, 0.95)',
  },
  panelHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  panelLabel: {
    color: 'rgba(231, 237, 246, 0.42)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  primaryChip: {
    borderRadius: 14,
    backgroundColor: '#F4F7FB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44, // Touch target size
    justifyContent: 'center',
  },
  primaryChipLabel: {
    color: '#09111F',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#F4F7FB',
    fontSize: 15,
    fontWeight: '600',
    minHeight: 48, // 48px touch target
  },
  listContent: {
    padding: 18,
    paddingBottom: 40,
  },
  emptyState: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    padding: 18,
    gap: 6,
    marginTop: 10,
  },
  emptyTitle: {
    color: '#F4F7FB',
    fontSize: 15,
    fontWeight: '800',
  },
  emptyBody: {
    color: 'rgba(231, 237, 246, 0.5)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
})
