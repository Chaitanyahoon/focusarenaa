import React from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import type { Gate } from '../types'

interface GateCardProps {
  gate: Gate
  onAction: () => void
}

function getRankColor(rank: number) {
  switch (rank) {
    case 5: return ['#F59E0B', '#D97706'] // S - Gold
    case 4: return ['#EC4899', '#BE185D'] // A - Pink/Purple
    case 3: return ['#8B5CF6', '#6D28D9'] // B - Purple
    case 2: return ['#3B82F6', '#1D4ED8'] // C - Blue
    case 1: return ['#10B981', '#047857'] // D - Green
    default: return ['#6B7280', '#374151'] // E - Gray
  }
}

function getRankLabel(rank: number) {
  switch (rank) {
    case 5: return 'S-RANK'
    case 4: return 'A-RANK'
    case 3: return 'B-RANK'
    case 2: return 'C-RANK'
    case 1: return 'D-RANK'
    default: return 'E-RANK'
  }
}

export default function GateCard({ gate, onAction }: GateCardProps) {
  const rankColors = getRankColor(gate.rank)

  return (
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={[...rankColors, '#0A1020'] as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBackground}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>{getRankLabel(gate.rank)}</Text>
          </View>
          <View style={styles.typeBadge}>
            <Ionicons 
              name={gate.type === 2 ? 'warning' : 'skull'} 
              size={12} 
              color="#F4F7FB" 
            />
            <Text style={styles.typeText}>
              {gate.type === 2 ? 'ANOMALY' : 'DUNGEON'}
            </Text>
          </View>
        </View>

        <View style={styles.bossInfo}>
          <Text style={styles.gateName}>{gate.name}</Text>
          <Text style={styles.bossTitle}>Boss: {gate.bossName}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Level Req</Text>
            <Text style={styles.statValue}>Lv.{gate.requiredLevel}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Party Size</Text>
            <Text style={styles.statValue}>{gate.recommendedPartySize}</Text>
          </View>
        </View>

        <Pressable 
          onPress={onAction} 
          style={styles.actionButton}
          hitSlop={8}
        >
          <Text style={styles.actionButtonText}>ENTER GATE</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#060913',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rankText: {
    color: '#F4F7FB',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.2)', // Red tint for danger
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeText: {
    color: '#FCA5A5',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bossInfo: {
    gap: 4,
  },
  gateName: {
    color: '#F4F7FB',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  bossTitle: {
    color: 'rgba(231, 237, 246, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statLabel: {
    color: 'rgba(231, 237, 246, 0.4)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    color: '#F4F7FB',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#F4F7FB',
    borderRadius: 16,
    paddingVertical: 16, // Ensure 48px min height
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: '#08111F',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
})
