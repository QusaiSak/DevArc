import { ThemeProvider } from "@/components/theme-provider"
import { Home } from "./components/home"
import { Dashboard } from "./components/project"
import Dashboard1  from "./pages/Dashboard"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AuthCallback } from "./components/AuthCallback"
import { Navbar } from "./components/navbar"
import RepositoryDetailsPage from "./pages/RepositoryDetails"
import { Toaster } from "sonner"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/ProtectedRoute"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Navbar/>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={
              <ProtectedRoute>
                <Dashboard1 />
              </ProtectedRoute>
            } />
            <Route path="/repository/:owner/:repo" element={<RepositoryDetailsPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App