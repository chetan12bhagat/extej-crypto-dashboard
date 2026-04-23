import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configureAmplify } from '@/amplify/amplifyConfig'
import { AppRouter } from '@/router/AppRouter'
import { useAuthStore } from '@/store/authStore'

// Configure Amplify on startup
configureAmplify()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30 * 1000,
    },
  },
})

// Add global CSS animation for spinner
const globalStyle = document.createElement('style')
globalStyle.textContent = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`
document.head.appendChild(globalStyle)

function AppContent() {
  const { setLoading } = useAuthStore()

  useEffect(() => {
    // Mark loading done on mount
    setLoading(false)
  }, [setLoading])

  return <AppRouter />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
