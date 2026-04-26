import * as SecureStore from 'expo-secure-store'
import type { AuthResponse } from '../types'

const TOKEN_KEY = 'focusarena.mobile.token'
const AUTH_KEY = 'focusarena.mobile.auth'

export const storage = {
  async saveAuth(auth: AuthResponse): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, auth.token),
      SecureStore.setItemAsync(AUTH_KEY, JSON.stringify(auth)),
    ])
  },

  async getAuth(): Promise<AuthResponse | null> {
    const [token, authStr] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(AUTH_KEY),
    ])

    if (!token || !authStr) return null

    try {
      const auth = JSON.parse(authStr) as AuthResponse
      // Ensure the token from the response matches the token key
      auth.token = token
      return auth
    } catch {
      return null
    }
  },

  async clearAuth(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(AUTH_KEY),
    ])
  }
}
