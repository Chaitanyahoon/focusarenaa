import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SystemToaster } from './components/ui/SystemToast'
import { useAuthStore } from './stores/authStore'
import { signalRService } from './services/signalr'

// Pages
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Quests = lazy(() => import('./pages/Quests'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Analytics = lazy(() => import('./pages/Analytics'))
const ShopPage = lazy(() => import('./pages/ShopPage'))
const GatePage = lazy(() => import('./pages/GatePage'))
const RaidPage = lazy(() => import('./pages/RaidPage'))
const GuildPage = lazy(() => import('./pages/GuildPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))

// Layout
import ProtectedRoute from './components/layout/ProtectedRoute'
import SystemLayout from './components/layout/SystemLayout'

function RouteFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#020408] p-4">
            <div className="system-card rounded-2xl px-8 py-6 text-center">
                <div className="mx-auto mb-4 h-10 w-10 rounded-full border border-system-blue/30 bg-system-blue/10 shadow-[0_0_24px_rgb(var(--color-system-blue-rgb)/0.18)] animate-pulse" />
                <div className="text-sm font-mono uppercase tracking-[0.24em] text-system-blue">Loading system module</div>
            </div>
        </div>
    )
}

function App() {
    const { isAuthenticated, checkAuth, user } = useAuthStore()

    // Initialize SignalR on auth
    useEffect(() => {
        checkAuth() // Restore session on load
    }, [])

    useEffect(() => {
        if (isAuthenticated) {
            signalRService.startConnection()
        } else {
            signalRService.stopConnection()
        }

        return () => {
            signalRService.stopConnection()
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
            } else if (theme === 'teal') {
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

            <Suspense fallback={<RouteFallback />}>
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
                        <Route path="/chat" element={<ChatPage />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default App

// aria-label
