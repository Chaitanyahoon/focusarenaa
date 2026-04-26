import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import { StyleSheet, View, ActivityIndicator } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import RootNavigator from './src/navigation/RootNavigator'
import { useAppStore } from './src/stores/appStore'

export default function App() {
  const { init, booting } = useAppStore()

  useEffect(() => {
    init()
  }, [init])

  if (booting) {
    return (
      <View style={styles.bootScreen}>
        <ActivityIndicator color="#F4F7FB" size="large" />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  bootScreen: {
    flex: 1,
    backgroundColor: '#060913',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
