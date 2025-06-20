import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        console.error('GitHub OAuth error:', error)
        navigate('/?error=auth_failed')
        return
      }

      if (code) {
        try {
          const response = await fetch('http://localhost:4000/auth/github/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ code }),
          })

          const data = await response.json()

          if (data.success) {
            // Redirect to home page and refresh auth context
            window.location.href = '/'
          } else {
            console.error('Auth callback failed:', data)
            navigate('/?error=auth_failed')
          }
        } catch (error) {
          console.error('Authentication failed:', error)
          navigate('/?error=auth_failed')
        }
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Completing authentication...</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Please wait while we sign you in...</p>
      </div>
    </div>
  )
}