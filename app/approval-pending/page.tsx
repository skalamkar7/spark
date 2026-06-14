import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { AlertCircle, Clock, CheckCircle } from 'lucide-react'

export default async function ApprovalStatusPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  
  // Get user's approval status
  const userData = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
  
  if (!userData.length) {
    redirect('/sign-in')
  }
  
  const currentUser = userData[0]
  
  // If approved, redirect to dashboard
  if (currentUser.emailVerified) {
    redirect('/dashboard')
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Pending Status */}
        <div className="flex flex-col items-center text-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-pulse opacity-20"></div>
            <Clock className="w-16 h-16 text-yellow-600 relative" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Waiting for Approval
            </h1>
            <p className="text-gray-600 mb-2">
              Welcome, <strong>{currentUser.name || currentUser.email}</strong>!
            </p>
            <p className="text-sm text-gray-500">
              Your account registration is pending approval from the administrator.
            </p>
          </div>
          
          <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>What happens next?</strong><br/>
              The admin will review your details and send you an email once your account is approved. This usually takes 1-2 business days.
            </p>
          </div>
          
          <div className="w-full space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Account created</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-gray-700">Pending admin approval</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4" />
              <span>Access granted (after approval)</span>
            </div>
          </div>
          
          <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  Account Details
                </p>
                <p className="text-xs text-amber-800">
                  <strong>Email:</strong> {currentUser.email}<br/>
                  <strong>Status:</strong> Pending Review<br/>
                  <strong>Registered:</strong> {currentUser.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          <form action={async () => {
            'use server'
            redirect('/sign-in')
          }}>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Return to Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
