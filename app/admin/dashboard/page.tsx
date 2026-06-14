import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { user, adminApprovals } from '@/lib/db/schema'
import { ne } from 'drizzle-orm'
import { AdminDashboardClient } from '@/components/admin/admin-dashboard-client'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'your-email@gmail.com'

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/sign-in')
  }
  
  // Check if current user is admin
  if (session.user.email !== ADMIN_EMAIL) {
    redirect('/dashboard')
  }
  
  // Get all pending users
  const allUsers = await db.select().from(user)
  
  // Get approval history
  const approvalHistory = await db.select().from(adminApprovals)
  
  // Separate pending, approved, and rejected
  const pendingUsers = allUsers.filter(u => u.email !== ADMIN_EMAIL)
  const approvedUsers = allUsers.filter(u => 
    u.email !== ADMIN_EMAIL && 
    approvalHistory.some(a => a.userId === u.id && a.action === 'approved')
  )
  const rejectedUsers = approvalHistory.filter(a => a.action === 'rejected')
  
  return (
    <div>
      <AdminDashboardClient 
        pendingUsers={pendingUsers}
        approvedUsers={approvedUsers}
        rejectedUsers={rejectedUsers}
        adminEmail={session.user.email}
      />
    </div>
  )
}
