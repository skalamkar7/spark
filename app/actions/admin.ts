'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user, adminApprovals } from '@/lib/db/schema'
import { eq, ne } from 'drizzle-orm'
import { headers } from 'next/headers'

// Admin email - you should set this in environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'your-email@gmail.com'

async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  
  // Check if user is admin
  const adminUser = await db
    .select()
    .from(user)
    .where(eq(user.email, ADMIN_EMAIL))
  
  if (!adminUser.length || adminUser[0].id !== session.user.id) {
    throw new Error('Admin access required')
  }
  
  return session
}

export async function getPendingApprovals() {
  await getAdminSession()
  
  const pendingUsers = await db
    .select()
    .from(user)
    .where(ne(user.email, ADMIN_EMAIL))
    // Filter for pending status - we'll need to query raw or use a different approach
  
  return pendingUsers
}

export async function approveUser(userId: string, adminId: string) {
  await getAdminSession()
  
  // Update user approval status
  await db
    .update(user)
    .set({
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
  
  // Log the approval
  await db.insert(adminApprovals).values({
    id: crypto.randomUUID().toString(),
    userId,
    adminId,
    action: 'approved',
    createdAt: new Date(),
  })
  
  return { success: true }
}

export async function rejectUser(userId: string, adminId: string, reason: string) {
  await getAdminSession()
  
  // Delete the user
  await db.delete(user).where(eq(user.id, userId))
  
  // Log the rejection
  await db.insert(adminApprovals).values({
    id: crypto.randomUUID().toString(),
    userId,
    adminId,
    action: 'rejected',
    reason,
    createdAt: new Date(),
  })
  
  return { success: true }
}
