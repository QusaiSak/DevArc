import { ThemeProvider } from "@/components/theme-provider"
import { Home } from "./components/home"
import { Dashboard } from "./components/project"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AuthCallback } from "./components/AuthCallback"
import { Navbar } from "./components/navbar"
import RepositoryDetailsPage from "./pages/RepositoryDetails"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
      <Navbar/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/repository/:owner/:repo" element={<RepositoryDetailsPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App