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
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

// Layout
import ProtectedRoute from './components/layout/ProtectedRoute'
import SystemLayout from './components/layout/SystemLayout'

function App() {
    const { isAuthenticated, checkAuth } = useAuthStore()

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
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/gates" element={<GatePage />} />
                    <Route path="/gates/:id" element={<RaidPage />} />
                    <Route path="/guilds" element={<GuildPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
