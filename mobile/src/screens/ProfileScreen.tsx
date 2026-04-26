import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAppStore } from '../stores/appStore'
import { useThemeStore, ThemeName } from '../stores/themeStore'

export default function ProfileScreen() {
  const { auth, profile, stats, logout } = useAppStore()
  const { currentTheme, colors, setTheme } = useThemeStore()

  const statGrid = [
    { icon: 'flash', label: 'XP', value: (profile?.xp || auth?.xp || 0).toLocaleString(), color: colors.primary },
    { icon: 'flame', label: 'Streak', value: `${profile?.streakCount || stats?.currentStreak || 0}d`, color: '#f97316' },
    { icon: 'trophy', label: 'Badges', value: profile?.badgesEarned || stats?.badgesEarned || 0, color: '#eab308' },
    { icon: 'logo-bitcoin', label: 'Gold', value: (profile?.gold || 0).toLocaleString(), color: '#FFD700' },
    { icon: 'checkmark-done', label: 'Completed', value: profile?.totalTasksCompleted || stats?.completedTasks || 0, color: '#34D399' },
    { icon: 'calendar', label: 'Daily XP', value: stats?.averageDailyXP || 0, color: colors.primary },
  ]

  const availableThemes: { id: ThemeName; label: string }[] = [
    { id: 'obsidian', label: 'Obsidian' },
    { id: 'midnight', label: 'Midnight' },
    { id: 'forest', label: 'Forest' },
    { id: 'crimson', label: 'Crimson' },
  ]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>HUNTER PROFILE</Text>
        </View>

        {/* Identity Card */}
        <View style={[styles.identityCard, { backgroundColor: colors.cardBg, borderColor: `${colors.primary}25` }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="person" size={36} color={colors.background} />
          </View>
          <Text style={[styles.hunterName, { color: colors.text }]}>{profile?.name || auth?.name || 'Unknown Hunter'}</Text>
          <View style={[styles.levelBadge, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
            <Text style={[styles.levelText, { color: colors.primary }]}>LEVEL {profile?.level || auth?.level || 1}</Text>
          </View>
          <Text style={[styles.emailText, { color: colors.muted }]}>{profile?.email || auth?.email || ''}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.gridContainer}>
          {statGrid.map((stat, idx) => (
            <View key={idx} style={styles.gridItem}>
              <View style={[styles.gridIconBg, { backgroundColor: `${stat.color}20` }]}>
                <Ionicons name={stat.icon as any} size={18} color={stat.color} />
              </View>
              <Text style={[styles.gridValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.gridLabel, { color: colors.muted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Theme Selector */}
        <View style={styles.themeSection}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>CHOOSE YOUR PATH (THEME)</Text>
          <View style={styles.themeRow}>
            {availableThemes.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.themeButton,
                  currentTheme === t.id && { borderColor: colors.primary, backgroundColor: `${colors.primary}20` }
                ]}
                onPress={() => setTheme(t.id)}
              >
                <Text style={[
                  styles.themeButtonText,
                  { color: currentTheme === t.id ? colors.primary : colors.muted }
                ]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={20} color={colors.muted} />
            <Text style={[styles.actionText, { color: colors.text }]}>Settings</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
            <Ionicons name="help-circle-outline" size={20} color={colors.muted} />
            <Text style={[styles.actionText, { color: colors.text }]}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>LOGOUT SYSTEM</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>FocusArena Mobile v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060913',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    color: '#3b82f6',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // --- Identity Card ---
  identityCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  hunterName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
  },
  levelText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  emailText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
  },

  // --- Stats Grid ---
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  gridItem: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  gridIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  gridLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.5,
  },

  // --- Actions ---
  actionsContainer: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 24,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    minHeight: 52,
  },
  actionText: {
    flex: 1,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontWeight: '600',
  },

  // --- Logout ---
  logoutButton: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  versionText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.15)',
    fontSize: 11,
    marginBottom: 20,
  },
  themeSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  themeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  themeButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },
})
