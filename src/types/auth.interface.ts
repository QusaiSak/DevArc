export interface User {
  id: number
  username: string
  email: string
  avatar_url: string
  name?: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: () => void
  logout: () => void
  checkAuthStatus: () => Promise<void>
  isAuthenticated: boolean
}