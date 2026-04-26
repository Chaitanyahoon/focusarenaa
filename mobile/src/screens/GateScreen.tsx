import React, { useEffect } from 'react'
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAppStore } from '../stores/appStore'
import GateCard from '../components/GateCard'

export default function GateScreen() {
  const { gate, gateLoading, fetchGate, scanAnomaly, error } = useAppStore()

  useEffect(() => {
    fetchGate()
  }, [fetchGate])

  const handleScan = async () => {
    await scanAnomaly()
  }

  const handleEnterGate = () => {
    // In a real app, this would navigate to a combat/dungeon view
    console.log('Entering gate:', gate?.id)
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={gateLoading && !!gate} onRefresh={fetchGate} tintColor="#F4F7FB" />
      }
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Procedural Engine</Text>
        <Text style={styles.title}>The Gates</Text>
        <Text style={styles.subtitle}>
          Face manifestations of your procrastination. Clear them to earn rare badges and massive XP.
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {!gate && !gateLoading && (
        <View style={styles.emptyState}>
          <View style={styles.radarCircle}>
            <Ionicons name="scan-outline" size={48} color="rgba(231, 237, 246, 0.4)" />
          </View>
          <Text style={styles.emptyTitle}>All clear.</Text>
          <Text style={styles.emptyBody}>
            There are no active anomalies detected in your sector.
          </Text>
          <Pressable onPress={handleScan} style={styles.scanButton}>
            <Ionicons name="search" size={16} color="#08111F" />
            <Text style={styles.scanButtonText}>SCAN FOR ANOMALIES</Text>
          </Pressable>
        </View>
      )}

      {!gate && gateLoading && (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#F4F7FB" />
          <Text style={styles.loadingText}>Analyzing recent tasks...</Text>
          <Text style={styles.loadingSubtext}>Generating procedural anomaly</Text>
        </View>
      )}

      {gate && (
        <View style={styles.gateWrapper}>
          <Text style={styles.sectionLabel}>Active Threat</Text>
          <GateCard gate={gate} onAction={handleEnterGate} />
          
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={16} color="#FCA5A5" />
            <Text style={styles.warningText}>
              Entering a gate locks your focus. Ensure you have the time to clear it.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1020',
  },
  content: {
    padding: 18,
    paddingTop: 60, // Top padding since this won't have the custom App.tsx header inside the tab
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    color: 'rgba(231, 237, 246, 0.42)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F4F7FB',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(231, 237, 246, 0.54)',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
    marginTop: 4,
  },
  errorBanner: {
    borderRadius: 16,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    gap: 12,
  },
  radarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    color: '#F4F7FB',
    fontSize: 20,
    fontWeight: '800',
  },
  emptyBody: {
    color: 'rgba(231, 237, 246, 0.5)',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F4F7FB',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14, // 48px touch target
    marginTop: 16,
  },
  scanButtonText: {
    color: '#08111F',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    color: '#F4F7FB',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingSubtext: {
    color: 'rgba(231, 237, 246, 0.5)',
    fontSize: 13,
  },
  gateWrapper: {
    gap: 12,
  },
  sectionLabel: {
    color: 'rgba(231, 237, 246, 0.42)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  warningText: {
    flex: 1,
    color: '#FCA5A5',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
})
