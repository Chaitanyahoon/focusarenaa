import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#09090b] text-white gap-4 app-drag-region">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/40"></div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Focus Arena</span>
          <span className="text-[9px] text-white/15 uppercase tracking-widest">Connecting to Arena...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-transparent text-white overflow-hidden select-none">
      {isAuthenticated ? <Dashboard /> : <Login />}
    </div>
  )
}

export default App
