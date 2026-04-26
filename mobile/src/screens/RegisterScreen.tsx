import React, { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppStore } from '../stores/appStore'

export default function RegisterScreen({ navigation }: any) {
  const { register, authLoading, error, setError } = useAppStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleRegister = async () => {
    if (!email || !password || !name) {
      setError('Enter name, email, and password.')
      return
    }
    await register({ email, password, name })
  }

  return (
    <LinearGradient colors={['#060913', '#0A1020', '#060913']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.loginWrapper}
      >
        <View style={styles.loginCard}>
          <Text style={styles.eyebrow}>Mobile command center</Text>
          <Text style={styles.heroTitle}>Join the Arena</Text>
          <Text style={styles.loginSubtitle}>
            Create your account and start clearing tasks to earn XP.
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholder="Hunter Name"
            placeholderTextColor="rgba(231, 237, 246, 0.28)"
            style={styles.input}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email address"
            placeholderTextColor="rgba(231, 237, 246, 0.28)"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor="rgba(231, 237, 246, 0.28)"
            style={styles.input}
          />

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable onPress={handleRegister} disabled={authLoading} style={styles.loginButton}>
            {authLoading ? (
              <ActivityIndicator color="#08111F" />
            ) : (
              <Text style={styles.loginButtonLabel}>Register</Text>
            )}
          </Pressable>

          <Pressable onPress={() => navigation.goBack()} style={styles.switchModeButton}>
            <Text style={styles.switchModeText}>Already have an account? Login</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loginWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  loginCard: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(231, 237, 246, 0.08)',
    backgroundColor: 'rgba(10, 14, 26, 0.82)',
    padding: 22,
    gap: 14,
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
  loginSubtitle: {
    color: 'rgba(231, 237, 246, 0.52)',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 16,
    paddingVertical: 14, // Minimum 48px touch target essentially
    color: '#F4F7FB',
    fontSize: 15,
    fontWeight: '600',
    minHeight: 48,
  },
  errorBanner: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.24)',
    backgroundColor: 'rgba(127, 29, 29, 0.28)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    color: '#FECDD3',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  loginButton: {
    marginTop: 6,
    borderRadius: 18,
    backgroundColor: '#F4F7FB',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52, // Mobile touch target best practices
  },
  loginButtonLabel: {
    color: '#08111F',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  switchModeButton: {
    marginTop: 8,
    alignItems: 'center',
    padding: 10,
  },
  switchModeText: {
    color: 'rgba(231, 237, 246, 0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
})
