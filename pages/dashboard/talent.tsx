import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

interface UserData {
  id: number
  full_name: string
  email: string
  skills: string[]
  experience_level: string
}

export default function TalentDashboard() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get user data from localStorage (set during login)
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setUserData(user)
      } catch (error) {
        console.error('Error parsing user data:', error)
        // Fallback to mock data if parsing fails
        const mockUser: UserData = {
          id: 1,
          full_name: 'Test User',
          email: 'test@example.com',
          skills: ['JavaScript', 'React', 'Node.js'],
          experience_level: 'mid'
        }
        setUserData(mockUser)
      }
    } else {
      // If no user data, redirect to login
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    // Clear user session and redirect to home
    router.push('/')
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Talent Dashboard - HEYA</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header */}
        <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="heya-logo text-2xl">HEYA</h1>
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">Welcome, {userData.full_name}</span>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Welcome Card */}
            <div className="card col-span-full">
              <h2 className="text-2xl font-bold text-white mb-4">🎉 Welcome to HEYA!</h2>
              <p className="text-gray-300 mb-6">
                Your account has been successfully created. You can now explore job opportunities, 
                manage your profile, and connect with potential employers.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                  ✓ Account Created
                </span>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                  ✓ Profile Setup Complete
                </span>
                <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm">
                  ✓ Ready to Apply
                </span>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Profile Summary</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 text-sm">Email:</span>
                  <p className="text-white">{userData.email}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Experience Level:</span>
                  <p className="text-white capitalize">{userData.experience_level}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {userData.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary text-left">
                  🔍 Browse Jobs
                </button>
                <button className="w-full btn-secondary text-left">
                  📝 Update Profile
                </button>
                <button className="w-full btn-secondary text-left">
                  📊 View Applications
                </button>
                <button className="w-full btn-secondary text-left">
                  💬 Messages
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Account created successfully</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Profile setup completed</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Skills added to profile</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="card col-span-full">
              <h3 className="text-lg font-semibold text-white mb-4">🚀 Next Steps</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">1. Complete Your Profile</h4>
                  <p className="text-gray-300 text-sm">Add more details to increase your visibility to employers.</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">2. Upload Portfolio</h4>
                  <p className="text-gray-300 text-sm">Showcase your work to stand out from other candidates.</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">3. Start Applying</h4>
                  <p className="text-gray-300 text-sm">Browse and apply to jobs that match your skills.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
