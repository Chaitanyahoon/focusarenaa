import React, { useEffect, useState } from 'react'
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { API_HEALTH_URL } from '../config'
import { useAppStore } from '../stores/appStore'

export default function DashboardScreen() {
  const { auth, profile, stats, tasks, hydrateDashboard, dashboardLoading } = useAppStore()
  const [serverState, setServerState] = useState<'checking' | 'ready' | 'slow'>('checking')

  useEffect(() => {
    const pingHealth = async () => {
      setServerState('checking')
      const timeoutId = setTimeout(() => setServerState('slow'), 5000)
      try {
        await fetch(API_HEALTH_URL)
        clearTimeout(timeoutId)
        setServerState('ready')
      } catch {
        clearTimeout(timeoutId)
        setServerState('slow')
      }
    }
    pingHealth()
  }, [])

  const activeTasks = tasks.filter((task) => task.category !== 5 && task.status !== 2)
  const nextTask = activeTasks[0]
  const completionRatio = stats && stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={dashboardLoading} onRefresh={hydrateDashboard} tintColor="#F4F7FB" />}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.eyebrow}>Mobile command center</Text>
            <Text style={styles.heroTitle}>Focus Arena</Text>
            <Text style={styles.heroSubtitle}>Daily run briefing</Text>
          </View>
        </View>

        <View style={styles.identityRow}>
          <View style={styles.identitySeal}>
            <Ionicons name="sparkles-outline" size={20} color="#08111F" />
          </View>
          <View style={styles.identityCopy}>
            <Text style={styles.identityName}>{profile?.name || auth?.name}</Text>
            <Text style={styles.identityMeta}>
              Level {profile?.level || auth?.level}  •  {profile?.xp || auth?.xp} XP  •  Streak {profile?.streakCount || 0}
            </Text>
          </View>
        </View>

        <View style={styles.healthRow}>
          <View style={[styles.healthDot, serverState === 'slow' ? styles.healthDotSlow : styles.healthDotReady]} />
          <Text style={styles.healthText}>
            {serverState === 'slow' ? 'Backend is warming up.' : serverState === 'ready' ? 'Server ready.' : 'Checking backend.'}
          </Text>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelLabel}>Today's objective</Text>
        <Text style={styles.panelTitle}>{nextTask ? nextTask.title : 'Queue your first contract.'}</Text>
        <Text style={styles.panelBody}>
          {nextTask
            ? 'The next task is already selected. Clear it here so the desktop and web clients stay in sync.'
            : 'No active quests are loaded right now. Create one from mobile and keep the system moving.'}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            <Text style={styles.statLabel}>Open</Text>
            <Text style={styles.statValue}>{activeTasks.length}</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statLabel}>Complete</Text>
            <Text style={styles.statValue}>{stats?.completedTasks || 0}</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statLabel}>Daily rate</Text>
            <Text style={styles.statValue}>{completionRatio}%</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#0A1020',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 42,
    gap: 14,
  },
  heroCard: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(231, 237, 246, 0.08)',
    backgroundColor: 'rgba(10, 14, 26, 0.82)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eyebrow: {
    color: 'rgba(231, 237, 246, 0.42)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 8,
    color: '#F4F7FB',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  heroSubtitle: {
    marginTop: 4,
    color: 'rgba(231, 237, 246, 0.42)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  identityRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  identitySeal: {
    height: 46,
    width: 46,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B7F7D3',
  },
  identityCopy: {
    flex: 1,
  },
  identityName: {
    color: '#F4F7FB',
    fontSize: 18,
    fontWeight: '800',
  },
  identityMeta: {
    marginTop: 4,
    color: 'rgba(231, 237, 246, 0.48)',
    fontSize: 12,
    fontWeight: '600',
  },
  healthRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  healthDot: {
    height: 9,
    width: 9,
    borderRadius: 999,
  },
  healthDotReady: { backgroundColor: '#34D399' },
  healthDotSlow: { backgroundColor: '#F59E0B' },
  healthText: {
    color: '#D7DFEA',
    fontSize: 12,
    fontWeight: '700',
  },
  panel: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(231, 237, 246, 0.08)',
    backgroundColor: 'rgba(9, 13, 24, 0.78)',
    gap: 12,
  },
  panelLabel: {
    color: 'rgba(231, 237, 246, 0.42)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  panelTitle: {
    color: '#F4F7FB',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  panelBody: {
    color: 'rgba(231, 237, 246, 0.54)',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  statTile: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statLabel: {
    color: 'rgba(231, 237, 246, 0.34)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  statValue: {
    marginTop: 6,
    color: '#F4F7FB',
    fontSize: 20,
    fontWeight: '800',
  },
})
