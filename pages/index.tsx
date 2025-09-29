import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>HEYA - Talent Recruitment Platform</title>
        <meta name="description" content="Connect talents with opportunities" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4">
        <div className="card max-w-md w-full text-center fade-in">
          <h1 className="heya-logo mb-8">HEYA</h1>
          <p className="text-gray-300 mb-8 text-lg">
            Welcome to the future of talent recruitment
          </p>
          
          <div className="space-y-4">
            <Link href="/login" className="btn-primary w-full block">
              Login
            </Link>
            <Link href="/signup" className="btn-secondary w-full block">
              Create Account
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-400">
            <p>Connect • Discover • Succeed</p>
          </div>
        </div>
      </div>
    </>
  )
}
