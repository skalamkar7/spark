import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDataSummary, getDummyData } from '@/app/actions/data-management'
import { DataCleanupClient } from '@/components/admin/data-cleanup-client'

export default async function DataCleanupPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/sign-in')
  }
  
  const dataSummary = await getDataSummary()
  const dummyData = await getDummyData()
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Data Management
          </h1>
          <p className="text-gray-600">
            View and remove dummy/test data before sharing with other agents
          </p>
        </div>
        
        <DataCleanupClient
          dataSummary={dataSummary}
          dummyData={dummyData}
          agentEmail={session.user.email || ''}
        />
      </div>
    </div>
  )
}
