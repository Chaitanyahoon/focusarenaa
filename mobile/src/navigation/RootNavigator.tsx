import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import LoginScreen from '../screens/LoginScreen'
import MainTabs from './MainTabs'
import { useAppStore } from '../stores/appStore'

const Stack = createNativeStackNavigator()

const ArenaTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#060913',
  },
}

export default function RootNavigator() {
  const { auth } = useAppStore()

  return (
    <NavigationContainer theme={ArenaTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {auth ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
