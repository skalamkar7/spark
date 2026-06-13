import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

export const metadata = {
  title: 'InsureAgent - Policy Reminder System',
  description: 'Professional insurance agent dashboard to manage client policies, set up automated reminders, and track renewals.',
}

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  return <DashboardClient />
}
