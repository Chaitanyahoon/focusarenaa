import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import DashboardScreen from '../screens/DashboardScreen'
import QuestsScreen from '../screens/QuestsScreen'

const Tab = createBottomTabNavigator()

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#060913',
          borderTopWidth: 1,
          borderTopColor: 'rgba(231, 237, 246, 0.08)',
          height: 60, // Ensure thumb-zone height
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#B7F7D3',
        tabBarInactiveTintColor: 'rgba(231, 237, 246, 0.3)',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === 'Dashboard') {
            iconName = focused ? 'compass' : 'compass-outline'
          } else {
            iconName = focused ? 'list' : 'list-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Quests" component={QuestsScreen} />
    </Tab.Navigator>
  )
}
