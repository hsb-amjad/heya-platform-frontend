import { useState } from 'react'
import { useRouter } from 'next/router'

interface SignupData {
  // Step 1 - Personal & Credentials
  full_name: string
  date_of_birth: string
  email: string
  password: string
  mobile_number: string

  // Step 2 - Professional Overview
  about_me: string
  profile_picture: string
  ideal_job_industry: string
  ideal_job_title: string
  experience_level: string
  contract_type: string
  skills: string[]
  interview_availability: {
    time_slot: string
    days: string[]
  }

  // Step 3 - Portfolio Section
  portfolio_link: string
  portfolio_file: File | null

  // Step 4 - Professional Network
  network_contacts: Array<{
    full_name: string
    email: string
    position: string
  }>

  // Step 5 - Personal CV Resume
  cv_file: File | null

  // Step 6 - AI Recruitment Assessment
  ai_assessment_enabled: boolean
  openai_enabled: boolean
  ai_assistant_enabled: boolean
}

const STEPS = [
  'PERSONAL & CREDENTIAL',
  'PROFESSIONAL OVERVIEW',
  'PORTFOLIO SECTION',
  'PROFESSIONAL NETWORK',
  'PERSONAL CV CREATION',
  'AI RECRUITMENT ASSISTANT'
]

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [newContact, setNewContact] = useState({
    full_name: '',
    email: '',
    position: ''
  })
  const router = useRouter()

  const [signupData, setSignupData] = useState<SignupData>({
    full_name: '',
    date_of_birth: '',
    email: '',
    password: '',
    mobile_number: '',
    about_me: '',
    profile_picture: '',
    ideal_job_industry: '',
    ideal_job_title: '',
    experience_level: '',
    contract_type: '',
    skills: ['JavaScript', 'Data Analysis', 'UI Design'],
    interview_availability: {
      time_slot: '9 AM - 5 PM',
      days: []
    },
    portfolio_link: '',
    portfolio_file: null,
    network_contacts: [],
    cv_file: null,
    ai_assessment_enabled: false,
    openai_enabled: false,
    ai_assistant_enabled: false,
  })

  const updateSignupData = (field: string, value: any) => {
    setSignupData(prev => ({ ...prev, [field]: value }))
  }

  // Skills management functions
  const addSkill = () => {
    if (newSkill.trim() && !signupData.skills.includes(newSkill.trim())) {
      setSignupData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSignupData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  // Interview availability functions
  const toggleDay = (day: string) => {
    setSignupData(prev => ({
      ...prev,
      interview_availability: {
        ...prev.interview_availability,
        days: prev.interview_availability.days.includes(day)
          ? prev.interview_availability.days.filter(d => d !== day)
          : [...prev.interview_availability.days, day]
      }
    }))
  }

  // File upload functions
  const handleFileUpload = (field: 'portfolio_file' | 'cv_file', file: File | null) => {
    setSignupData(prev => ({ ...prev, [field]: file }))
  }

  // Network contact functions
  const addNetworkContact = () => {
    if (newContact.full_name && newContact.email && newContact.position) {
      setSignupData(prev => ({
        ...prev,
        network_contacts: [...prev.network_contacts, { ...newContact }]
      }))
      setNewContact({ full_name: '', email: '', position: '' })
    }
  }

  const removeNetworkContact = (index: number) => {
    setSignupData(prev => ({
      ...prev,
      network_contacts: prev.network_contacts.filter((_, i) => i !== index)
    }))
  }

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Final step - complete signup
      setIsLoading(true)
      try {
        // Create FormData for file uploads
        const formData = new FormData()
        
        // Add all text data
        Object.entries(signupData).forEach(([key, value]) => {
          if (key === 'skills' || key === 'network_contacts' || key === 'interview_availability') {
            formData.append(key, JSON.stringify(value))
          } else if (key === 'portfolio_file' || key === 'cv_file') {
            if (value) {
              formData.append(key, value as File)
            }
          } else {
            formData.append(key, value as string)
          }
        })

        // Send to backend API
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          console.log('Signup successful:', result)
          router.push('/dashboard/talent')
        } else {
          const errorData = await response.json()
          setError(errorData.message || 'Signup failed. Please try again.')
        }
      } catch (err) {
        console.error('Signup error:', err)
        setError('Network error. Please check your connection and try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderProgressBar = () => (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div
            className={`progress-step ${
              index < currentStep
                ? 'completed'
                : index === currentStep
                ? 'active'
                : 'inactive'
            }`}
          >
            {index < currentStep ? '✓' : index + 1}
          </div>
          <span className="text-xs text-gray-400 mt-2 text-center max-w-20">
            {step}
          </span>
          {index < STEPS.length - 1 && (
            <div
              className={`h-0.5 w-full mt-4 ${
                index < currentStep ? 'bg-green-600' : 'bg-gray-600'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white mb-6">Personal & Credentials</h2>
      
      <div>
        <label className="form-label">FULL NAME</label>
        <input
          type="text"
          value={signupData.full_name}
          onChange={(e) => updateSignupData('full_name', e.target.value)}
          placeholder="Enter full name"
          className="form-input"
          required
        />
      </div>

      <div>
        <label className="form-label">BIRTH DATE</label>
        <div className="flex space-x-2">
          <select 
            className="form-input flex-1"
            onChange={(e) => {
              const currentDate = signupData.date_of_birth.split('-')
              const month = e.target.value.padStart(2, '0')
              const day = currentDate[2] || '01'
              const year = currentDate[0] || '2000'
              updateSignupData('date_of_birth', `${year}-${month}-${day}`)
            }}
          >
            <option value="">Month</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select 
            className="form-input flex-1"
            onChange={(e) => {
              const currentDate = signupData.date_of_birth.split('-')
              const day = e.target.value.padStart(2, '0')
              const month = currentDate[1] || '01'
              const year = currentDate[0] || '2000'
              updateSignupData('date_of_birth', `${year}-${month}-${day}`)
            }}
          >
            <option value="">Day</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          <select 
            className="form-input flex-1"
            onChange={(e) => {
              const currentDate = signupData.date_of_birth.split('-')
              const year = e.target.value
              const month = currentDate[1] || '01'
              const day = currentDate[2] || '01'
              updateSignupData('date_of_birth', `${year}-${month}-${day}`)
            }}
          >
            <option value="">Year</option>
            {Array.from({ length: 50 }, (_, i) => (
              <option key={2024 - i} value={2024 - i}>
                {2024 - i}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="form-label">EMAIL ADDRESS</label>
        <input
          type="email"
          value={signupData.email}
          onChange={(e) => updateSignupData('email', e.target.value)}
          placeholder="Enter your email address"
          className="form-input"
          required
        />
      </div>

      <div>
        <label className="form-label">CREATE PASSWORD</label>
        <input
          type="password"
          value={signupData.password}
          onChange={(e) => updateSignupData('password', e.target.value)}
          placeholder="Enter password"
          className="form-input"
          required
        />
      </div>

      <div>
        <label className="form-label">MOBILE NUMBER</label>
        <input
          type="tel"
          value={signupData.mobile_number}
          onChange={(e) => updateSignupData('mobile_number', e.target.value)}
          placeholder="Enter mobile number"
          className="form-input"
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white mb-6">Professional Overview</h2>
      
      <div>
        <label className="form-label">ABOUT ME</label>
        <textarea
          value={signupData.about_me}
          onChange={(e) => updateSignupData('about_me', e.target.value)}
          placeholder="Write a short bio..."
          className="form-input h-24 resize-none"
        />
      </div>

      <div>
        <label className="form-label">IDEAL JOB</label>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Industry"
            className="form-input"
            value={signupData.ideal_job_industry}
            onChange={(e) => updateSignupData('ideal_job_industry', e.target.value)}
          />
          <input
            type="text"
            placeholder="Job Title"
            className="form-input"
            value={signupData.ideal_job_title}
            onChange={(e) => updateSignupData('ideal_job_title', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">EXPERIENCE LEVEL</label>
          <select
            className="form-input"
            value={signupData.experience_level}
            onChange={(e) => updateSignupData('experience_level', e.target.value)}
          >
            <option value="">Select level</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
            <option value="executive">Executive</option>
          </select>
        </div>
        <div>
          <label className="form-label">CONTRACT TYPE</label>
          <select
            className="form-input"
            value={signupData.contract_type}
            onChange={(e) => updateSignupData('contract_type', e.target.value)}
          >
            <option value="">Select type</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>
      </div>

      <div>
        <label className="form-label">SKILLS</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {signupData.skills.map((skill, index) => (
            <span key={index} className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm flex items-center gap-2">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-white hover:text-red-300 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill"
            className="form-input flex-1"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      <div>
        <label className="form-label">INTERVIEW AVAILABILITY</label>
        <div className="space-y-3">
          <select 
            className="form-input"
            value={signupData.interview_availability.time_slot}
            onChange={(e) => updateSignupData('interview_availability', {
              ...signupData.interview_availability,
              time_slot: e.target.value
            })}
          >
            <option value="9 AM - 5 PM">9 AM - 5 PM</option>
            <option value="10 AM - 6 PM">10 AM - 6 PM</option>
            <option value="11 AM - 7 PM">11 AM - 7 PM</option>
            <option value="Flexible">Flexible</option>
          </select>
          <div className="flex space-x-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => toggleDay(day)}
                className={`w-12 h-8 rounded-lg text-sm transition-colors ${
                  signupData.interview_availability.days.includes(day)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {day.charAt(0)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white mb-6">Portfolio Section</h2>
      
      <div>
        <label className="form-label">PORTFOLIO LINK</label>
        <input
          type="url"
          value={signupData.portfolio_link}
          onChange={(e) => updateSignupData('portfolio_link', e.target.value)}
          placeholder="https://your-portfolio.com"
          className="form-input"
        />
      </div>

      <div>
        <label className="form-label">UPLOAD PORTFOLIO FILE</label>
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-2">📁</div>
          {signupData.portfolio_file ? (
            <div className="space-y-2">
              <p className="text-green-400">File selected: {signupData.portfolio_file.name}</p>
              <button
                type="button"
                onClick={() => handleFileUpload('portfolio_file', null)}
                className="text-red-400 hover:text-red-300"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                id="portfolio-file"
                accept=".pdf,.doc,.docx,.zip"
                onChange={(e) => handleFileUpload('portfolio_file', e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="portfolio-file" className="btn-secondary cursor-pointer">
                UPLOAD FILE
              </label>
              <p className="text-gray-400 text-sm mt-2">PDF, DOC, DOCX, ZIP files only</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white mb-6">Professional Network</h2>
      
      {/* Existing contacts */}
      {signupData.network_contacts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-white">Added Contacts</h3>
          {signupData.network_contacts.map((contact, index) => (
            <div key={index} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-white font-medium">{contact.full_name}</p>
                <p className="text-gray-300 text-sm">{contact.email}</p>
                <p className="text-gray-400 text-sm">{contact.position}</p>
              </div>
              <button
                type="button"
                onClick={() => removeNetworkContact(index)}
                className="text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Add new contact form */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Add New Contact</h3>
        <div>
          <label className="form-label">FULL NAME</label>
          <input
            type="text"
            value={newContact.full_name}
            onChange={(e) => setNewContact(prev => ({ ...prev, full_name: e.target.value }))}
            placeholder="Enter full name"
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">EMAIL ADDRESS</label>
          <input
            type="email"
            value={newContact.email}
            onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter email address"
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label">POSITION/ROLE RELATION</label>
          <select 
            className="form-input"
            value={newContact.position}
            onChange={(e) => setNewContact(prev => ({ ...prev, position: e.target.value }))}
          >
            <option value="">Select option</option>
            <option value="Manager">Manager</option>
            <option value="Colleague">Colleague</option>
            <option value="Client">Client</option>
            <option value="Mentor">Mentor</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <button 
        type="button"
        onClick={addNetworkContact}
        disabled={!newContact.full_name || !newContact.email || !newContact.position}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ADD NETWORK CONTACT
      </button>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white mb-6">Personal CV Creation</h2>
      
      <div className="card bg-gray-700">
        <h3 className="text-lg font-medium text-white mb-2">CREATE A PERSONAL CV WEBSITE</h3>
        <p className="text-gray-300 text-sm">
          Aggregate your profiles and portfolio in a single, personalized website.
        </p>
      </div>

      <div>
        <label className="form-label">UPLOAD CV/RESUME</label>
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-2">📄</div>
          {signupData.cv_file ? (
            <div className="space-y-2">
              <p className="text-green-400">CV uploaded: {signupData.cv_file.name}</p>
              <button
                type="button"
                onClick={() => handleFileUpload('cv_file', null)}
                className="text-red-400 hover:text-red-300"
              >
                Remove CV
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-300 mb-4">Upload your CV/Resume</p>
              <input
                type="file"
                id="cv-file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileUpload('cv_file', e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="cv-file" className="btn-secondary cursor-pointer">
                UPLOAD FILE
              </label>
              <p className="text-gray-400 text-sm mt-2">PDF, DOC, DOCX files only</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep6 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white mb-6">AI Recruitment Assistant</h2>
      
      <div className="space-y-4">
        <div className="card bg-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">ENABLE APPROVE + RECRUITEER AI</h3>
              <p className="text-gray-300 text-sm">
                Let our AI assistant answer questions about your profile and assist in job matches.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={signupData.ai_assistant_enabled}
                onChange={(e) => updateSignupData('ai_assistant_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="card bg-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">OpenAI</h3>
              <p className="text-gray-300 text-sm">
                Enable OpenAI integration for enhanced AI capabilities.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={signupData.openai_enabled}
                onChange={(e) => updateSignupData('openai_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderStep1()
      case 1: return renderStep2()
      case 2: return renderStep3()
      case 3: return renderStep4()
      case 4: return renderStep5()
      case 5: return renderStep6()
      default: return renderStep1()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Main Content */}
        <div className="card">
          {renderCurrentStep()}

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm text-center mt-4 p-3 bg-red-900/20 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              BACK
            </button>
            
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? 'PROCESSING...'
                : currentStep === STEPS.length - 1
                ? 'SAVE AND CREATE ACCOUNT'
                : 'NEXT'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
