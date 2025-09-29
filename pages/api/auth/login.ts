import { NextApiRequest, NextApiResponse } from 'next'

interface LoginRequest {
  email: string
  password: string
  user_type: 'talent' | 'employee'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password, user_type }: LoginRequest = req.body

    // Validate input
    if (!email || !password || !user_type) {
      return res.status(400).json({ 
        message: 'Email, password, and user type are required' 
      })
    }

    // Connect to your FastAPI backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    
    console.log('Attempting login with backend:', backendUrl)
    
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        user_type
      }),
    })

    const data = await response.json()

    if (response.ok) {
      // Login successful
      console.log('Backend login successful:', data)
      
      res.status(200).json({
        message: 'Login successful',
        user: data.user,
        token: data.access_token,
        user_type: data.user_type || user_type
      })
    } else {
      // Login failed
      console.log('Backend login failed:', data)
      
      res.status(response.status).json({
        message: data.detail || data.message || 'Login failed'
      })
    }

  } catch (error) {
    console.error('Login API error:', error)
    
    // If backend is not running, provide helpful error
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return res.status(503).json({
        message: 'Backend server is not running. Please start the FastAPI backend server on port 8000.'
      })
    }
    
    res.status(500).json({ 
      message: 'Internal server error. Please try again later.' 
    })
  }
}
