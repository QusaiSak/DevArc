import type { AuthContextType, User } from '@/types/auth.interface'
import React, { createContext, useContext, useState, useEffect } from 'react'



const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:4000/auth/me', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = () => {
    // Store the current URL to redirect back after login
    localStorage.setItem('returnUrl', window.location.pathname)
    window.location.href = 'http://localhost:4000/auth/github'
  }

  // Add this useEffect to handle redirect after login
  useEffect(() => {
    const returnUrl = localStorage.getItem('returnUrl')
    if (returnUrl && user) {
      localStorage.removeItem('returnUrl')
      // Don't redirect if already on the return URL
      if (window.location.pathname !== returnUrl) {
        window.location.href = returnUrl
      }
    }
  }, [user])

  const logout = async () => {
    try {
      await fetch('http://localhost:4000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
      // Redirect to home page after logout
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if logout request fails, clear user and redirect
      setUser(null)
      window.location.href = '/'
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}