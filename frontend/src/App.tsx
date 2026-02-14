import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SystemToaster } from './components/ui/SystemToast'
import { useAuthStore } from './stores/authStore'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Quests from './pages/Quests'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Analytics from './pages/Analytics'
import ShopPage from './pages/ShopPage'
import GatePage from './pages/GatePage'
import RaidPage from './pages/RaidPage'
import GuildPage from './pages/GuildPage'
import ChatPage from './pages/ChatPage'
import AdminDashboard from './pages/AdminDashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

// Layout
import ProtectedRoute from './components/layout/ProtectedRoute'
import SystemLayout from './components/layout/SystemLayout'

function App() {
    const { isAuthenticated, checkAuth, user } = useAuthStore()

    // Initialize SignalR on auth
    useEffect(() => {
        checkAuth() // Restore session on load
    }, [])

    useEffect(() => {
        if (isAuthenticated) {
            import('./services/signalr').then(({ signalRService }) => {
                signalRService.startConnection()
            })
        }
    }, [isAuthenticated])

    // Global Theme Listener
    useEffect(() => {
        if (user?.theme) {
            const root = document.documentElement;
            const theme = user.theme;

            if (theme === 'blue') {
                root.style.setProperty('--color-system-blue', '#00EAFF');
                root.style.setProperty('--color-system-blue-rgb', '0 234 255');
                root.style.setProperty('--color-system-red', '#FF003C');
                root.style.setProperty('--color-system-red-rgb', '255 0 60');
            } else if (theme === 'red') {
                root.style.setProperty('--color-system-blue', '#FF003C');
                root.style.setProperty('--color-system-blue-rgb', '255 0 60');
                root.style.setProperty('--color-system-red', '#FF5E00');
                root.style.setProperty('--color-system-red-rgb', '255 94 0');
            } else if (theme === 'purple') {
                root.style.setProperty('--color-system-blue', '#9D00FF');
                root.style.setProperty('--color-system-blue-rgb', '157 0 255');
                root.style.setProperty('--color-system-red', '#FF00EA');
                root.style.setProperty('--color-system-red-rgb', '255 0 234');
            } else if (theme === 'gold') {
                root.style.setProperty('--color-system-blue', '#FFD700');
                root.style.setProperty('--color-system-blue-rgb', '255 215 0');
                root.style.setProperty('--color-system-red', '#FFA500');
                root.style.setProperty('--color-system-red-rgb', '255 165 0');
            } else if (theme === 'green') {
                root.style.setProperty('--color-system-blue', '#00FF9D'); // Neon Necromancer Green
                root.style.setProperty('--color-system-blue-rgb', '0 255 157');
                root.style.setProperty('--color-system-red', '#008F58'); // Darker Green for accents
                root.style.setProperty('--color-system-red-rgb', '0 143 88');
            } else if (theme === 'orange') {
                root.style.setProperty('--color-system-blue', '#FF5E00'); // Blaze Orange
                root.style.setProperty('--color-system-blue-rgb', '255 94 0');
                root.style.setProperty('--color-system-red', '#FF003C');
                root.style.setProperty('--color-system-red-rgb', '255 0 60');
            } else if (theme === 'pink') {
                root.style.setProperty('--color-system-blue', '#FF00EA'); // Cyber Pink
                root.style.setProperty('--color-system-blue-rgb', '255 0 234');
                root.style.setProperty('--color-system-red', '#00EAFF'); // Cyan accent
                root.style.setProperty('--color-system-red-rgb', '0 234 255');
            } else if (theme === 'monochrome') {
                root.style.setProperty('--color-system-blue', '#FFFFFF'); // Pure White
                root.style.setProperty('--color-system-blue-rgb', '255 255 255');
                root.style.setProperty('--color-system-red', '#808080'); // Grey
                root.style.setProperty('--color-system-red-rgb', '128 128 128');
            }
        }
    }, [user?.theme])

    return (
        <BrowserRouter>
            <SystemToaster />

            <Routes>
                {/* Public Routes */}
                <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />
                <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
                <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
                <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ResetPassword />} />

                {/* Protected Routes */}
                <Route element={
                    <ProtectedRoute>
                        <SystemLayout />
                    </ProtectedRoute>
                }>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/quests" element={<Quests />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:id" element={<Profile />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/gates" element={<GatePage />} />
                    <Route path="/gates/:id" element={<RaidPage />} />
                    <Route path="/guilds" element={<GuildPage />} />
                    <Route path="/guilds" element={<GuildPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
