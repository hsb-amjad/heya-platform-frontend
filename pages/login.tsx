import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function LoginPage() {
  const [userType, setUserType] = useState<'talent' | 'employee'>('talent')
  const [emailOrMobile, setEmailOrMobile] = useState('')
  const [password, setPassword] = useState('')
  const [rememberPassword, setRememberPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Login attempt:', { emailOrMobile, password, userType })
      
      // Call the real backend API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailOrMobile,
          password: password,
          user_type: userType
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Login successful
        console.log('Login successful:', data)
        
        // Store user data and token (in a real app, you'd use proper auth context)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        localStorage.setItem('userType', data.user_type)
        
        // Redirect based on user type
        if (data.user_type === 'talent') {
          router.push('/dashboard/talent')
        } else {
          router.push('/dashboard/employee')
        }
      } else {
        // Login failed
        setError(data.message || 'Login failed. Please check your credentials.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Network error. Please check if the backend server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-md w-full mx-4">
        {/* HEYA Logo */}
        <div className="text-center mb-8">
          <h1 className="heya-logo">HEYA</h1>
        </div>

        {/* Login Card */}
        <div className="card">
          {/* User Type Toggle */}
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => setUserType('talent')}
              className={`flex-1 py-2 px-4 rounded-l-lg font-medium transition-all duration-200 ${
                userType === 'talent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              TALENT
            </button>
            <button
              type="button"
              onClick={() => setUserType('employee')}
              className={`flex-1 py-2 px-4 rounded-r-lg font-medium transition-all duration-200 ${
                userType === 'employee'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              EMPLOYER
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email/Mobile Input */}
            <div>
              <label className="form-label">EMAIL / MOBILE</label>
              <input
                type="text"
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
                placeholder="Enter email address or mobile number"
                className="form-input"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="form-label">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="form-input"
                required
              />
            </div>

            {/* Remember Password & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-300">
                <input
                  type="checkbox"
                  checked={rememberPassword}
                  onChange={(e) => setRememberPassword(e.target.checked)}
                  className="mr-2 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                REMEMBER PASSWORD
              </label>
              <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300">
                FORGOT PASSWORD
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'LOGGING IN...' : 'LOG IN'}
            </button>

            {/* Social Login */}
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">SIGN IN WITH</p>
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <span className="text-blue-400">G</span>
                </button>
                <button
                  type="button"
                  className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <span className="text-blue-400">f</span>
                </button>
                <button
                  type="button"
                  className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <span className="text-blue-400">in</span>
                </button>
              </div>
            </div>

            {/* Create Account */}
            <div className="text-center pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm mb-2">DON'T HAVE AN ACCOUNT YET?</p>
              <Link
                href="/signup"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                CREATE ACCOUNT
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
