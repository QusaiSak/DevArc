import { ThemeProvider } from "@/components/theme-provider"
import { Home } from "./components/home"
import {BrowserRouter, Route, Routes } from "react-router-dom"
import { AuthCallback } from "./components/AuthCallback"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App