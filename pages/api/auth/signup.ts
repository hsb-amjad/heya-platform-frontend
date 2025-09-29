import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

interface SignupData {
  full_name: string
  date_of_birth: string
  email: string
  password: string
  mobile_number: string
  about_me: string
  ideal_job_industry: string
  ideal_job_title: string
  experience_level: string
  contract_type: string
  skills: string[]
  interview_availability: {
    time_slot: string
    days: string[]
  }
  portfolio_link: string
  network_contacts: Array<{
    full_name: string
    email: string
    position: string
  }>
  ai_assessment_enabled: boolean
  openai_enabled: boolean
  ai_assistant_enabled: boolean
  [key: string]: any // Allow additional properties
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Parse form data including files
    const form = formidable({
      uploadDir: uploadsDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    })

    const [fields, files] = await form.parse(req)

    // Extract and validate form data
    const signupData: Partial<SignupData> = {}
    
    // Process text fields
    Object.entries(fields).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (key === 'skills' || key === 'network_contacts' || key === 'interview_availability') {
          try {
            signupData[key as keyof SignupData] = JSON.parse(value[0]) as any
          } catch (e) {
            console.error(`Error parsing ${key}:`, e)
          }
        } else {
          signupData[key as keyof SignupData] = value[0] as any
        }
      }
    })

    // Process uploaded files
    const portfolioFile = files.portfolio_file?.[0]
    const cvFile = files.cv_file?.[0]

    // Validate required fields
    if (!signupData.full_name || !signupData.email || !signupData.password) {
      return res.status(400).json({ 
        message: 'Missing required fields: full_name, email, and password are required' 
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(signupData.email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    // Validate password strength
    if (signupData.password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' })
    }

    // Here you would typically:
    // 1. Hash the password
    // 2. Save user data to database
    // 3. Save file paths to database
    // 4. Send confirmation email
    // 5. Create user session/token

    // For now, we'll simulate a successful signup
    const userData = {
      id: Date.now(), // In real app, this would be from database
      full_name: signupData.full_name,
      email: signupData.email,
      date_of_birth: signupData.date_of_birth,
      mobile_number: signupData.mobile_number,
      about_me: signupData.about_me,
      ideal_job_industry: signupData.ideal_job_industry,
      ideal_job_title: signupData.ideal_job_title,
      experience_level: signupData.experience_level,
      contract_type: signupData.contract_type,
      skills: signupData.skills || [],
      interview_availability: signupData.interview_availability || { time_slot: '', days: [] },
      portfolio_link: signupData.portfolio_link,
      network_contacts: signupData.network_contacts || [],
      portfolio_file: portfolioFile ? portfolioFile.filepath : null,
      cv_file: cvFile ? cvFile.filepath : null,
      ai_assessment_enabled: signupData.ai_assessment_enabled || false,
      openai_enabled: signupData.openai_enabled || false,
      ai_assistant_enabled: signupData.ai_assistant_enabled || false,
      created_at: new Date().toISOString(),
    }

    // Log the signup data for debugging
    console.log('New user signup:', {
      ...userData,
      password: '[REDACTED]',
      portfolio_file: portfolioFile ? portfolioFile.originalFilename : null,
      cv_file: cvFile ? cvFile.originalFilename : null,
    })

    // Connect to FastAPI backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    
    try {
      // For now, send as JSON (files will be handled separately)
      const requestData = {
        full_name: signupData.full_name,
        email: signupData.email,
        password: signupData.password,
        date_of_birth: signupData.date_of_birth,
        mobile_number: signupData.mobile_number,
        about_me: signupData.about_me,
        ideal_job_industry: signupData.ideal_job_industry,
        ideal_job_title: signupData.ideal_job_title,
        experience_level: signupData.experience_level,
        contract_type: signupData.contract_type,
        skills: signupData.skills,
        interview_availability: signupData.interview_availability,
        portfolio_link: signupData.portfolio_link,
        network_contacts: signupData.network_contacts,
        ai_assessment_enabled: signupData.ai_assessment_enabled,
        openai_enabled: signupData.openai_enabled,
        ai_assistant_enabled: signupData.ai_assistant_enabled,
        // File paths will be handled separately
        portfolio_file: portfolioFile ? portfolioFile.originalFilename : null,
        cv_file: cvFile ? cvFile.originalFilename : null,
      }
      
      // Send to backend API
      const response = await fetch(`${backendUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const backendResponse = await response.json()

      if (response.ok) {
        // Success response from backend
        res.status(201).json({
          message: 'Account created successfully!',
          user: backendResponse.user || {
            id: userData.id,
            full_name: userData.full_name,
            email: userData.email,
            skills: userData.skills,
            experience_level: userData.experience_level,
          },
          files: {
            portfolio_uploaded: !!portfolioFile,
            cv_uploaded: !!cvFile,
          },
          backend_response: backendResponse
        })
      } else {
        // Backend returned error
        res.status(response.status).json({
          message: backendResponse.detail || backendResponse.message || 'Signup failed'
        })
      }
    } catch (backendError) {
      console.error('Backend connection error:', backendError)
      
      // If backend is not available, still create account locally for demo
      res.status(201).json({
        message: 'Account created successfully! (Backend not connected)',
        user: {
          id: userData.id,
          full_name: userData.full_name,
          email: userData.email,
          skills: userData.skills,
          experience_level: userData.experience_level,
        },
        files: {
          portfolio_uploaded: !!portfolioFile,
          cv_uploaded: !!cvFile,
        },
        note: 'Backend server not running - using local simulation'
      })
    }

  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ 
      message: 'Internal server error. Please try again later.' 
    })
  }
}
