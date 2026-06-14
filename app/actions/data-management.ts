'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { 
  clients, 
  policies, 
  paymentLogs, 
  reminderLogs,
  dummyDataTracker,
  user 
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'your-email@gmail.com'

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return false
  
  const adminUser = await db
    .select()
    .from(user)
    .where(eq(user.email, ADMIN_EMAIL))
  
  return adminUser.length > 0 && adminUser[0].id === session.user.id
}

// Get all dummy data for current user
export async function getDummyData() {
  const userId = await getUserId()
  
  return await db
    .select()
    .from(dummyDataTracker)
    .where(eq(dummyDataTracker.userId, userId))
}

// Mark a record as dummy data
export async function markAsDummy(tableName: string, recordId: string) {
  const userId = await getUserId()
  
  await db.insert(dummyDataTracker).values({
    id: crypto.randomUUID().toString(),
    userId,
    tableName,
    recordId,
    isDummy: true,
    createdAt: new Date(),
  })
  
  return { success: true }
}

// Get user-specific data summary (excluding dummy data)
export async function getDataSummary() {
  const userId = await getUserId()
  
  // Get dummy record IDs for this user
  const dummyRecords = await db
    .select()
    .from(dummyDataTracker)
    .where(eq(dummyDataTracker.userId, userId))
  
  const dummyClientIds = dummyRecords
    .filter(d => d.tableName === 'clients')
    .map(d => d.recordId)
  
  const dummyPolicyIds = dummyRecords
    .filter(d => d.tableName === 'policies')
    .map(d => d.recordId)
  
  // Count real clients (excluding dummy)
  const realClients = await db
    .select()
    .from(clients)
    .where(eq(clients.userId, userId))
  
  const realClientCount = realClients.filter(c => !dummyClientIds.includes(c.id)).length
  
  // Count real policies (excluding dummy)
  const realPolicies = await db
    .select()
    .from(policies)
    .where(eq(policies.userId, userId))
  
  const realPolicyCount = realPolicies.filter(p => !dummyPolicyIds.includes(p.id)).length
  
  return {
    totalClients: realClients.length,
    realClients: realClientCount,
    dummyClients: dummyClientIds.length,
    totalPolicies: realPolicies.length,
    realPolicies: realPolicyCount,
    dummyPolicies: dummyPolicyIds.length,
  }
}

// Admin function: Get all users and their data statistics
export async function getAllUsersDataSummary() {
  if (!await isAdmin()) {
    throw new Error('Admin access required')
  }
  
  const allUsers = await db.select().from(user)
  
  const userStats = await Promise.all(
    allUsers.map(async (u) => {
      const userClients = await db
        .select()
        .from(clients)
        .where(eq(clients.userId, u.id))
      
      const userPolicies = await db
        .select()
        .from(policies)
        .where(eq(policies.userId, u.id))
      
      return {
        userId: u.id,
        email: u.email,
        name: u.name,
        clientCount: userClients.length,
        policyCount: userPolicies.length,
      }
    })
  )
  
  return userStats
}

// Admin function: Remove all dummy data for a user or globally
export async function removeDummyData(userId?: string) {
  if (!await isAdmin()) {
    throw new Error('Admin access required')
  }
  
  // Get all dummy data
  let dummyRecords
  if (userId) {
    dummyRecords = await db
      .select()
      .from(dummyDataTracker)
      .where(eq(dummyDataTracker.userId, userId))
  } else {
    dummyRecords = await db.select().from(dummyDataTracker)
  }
  
  // Group by table and record ID
  const clientsToDelete = dummyRecords
    .filter(d => d.tableName === 'clients')
    .map(d => d.recordId)
  
  const policiesToDelete = dummyRecords
    .filter(d => d.tableName === 'policies')
    .map(d => d.recordId)
  
  const paymentLogsToDelete = dummyRecords
    .filter(d => d.tableName === 'payment_logs')
    .map(d => d.recordId)
  
  const reminderLogsToDelete = dummyRecords
    .filter(d => d.tableName === 'reminder_logs')
    .map(d => d.recordId)
  
  // Delete records
  for (const clientId of clientsToDelete) {
    await db.delete(clients).where(eq(clients.id, clientId))
  }
  
  for (const policyId of policiesToDelete) {
    await db.delete(policies).where(eq(policies.id, policyId))
  }
  
  for (const paymentLogId of paymentLogsToDelete) {
    await db.delete(paymentLogs).where(eq(paymentLogs.id, paymentLogId))
  }
  
  for (const reminderLogId of reminderLogsToDelete) {
    await db.delete(reminderLogs).where(eq(reminderLogs.id, reminderLogId))
  }
  
  // Clear the tracker
  if (userId) {
    await db.delete(dummyDataTracker).where(eq(dummyDataTracker.userId, userId))
  } else {
    await db.delete(dummyDataTracker)
  }
  
  return { success: true, deleted: dummyRecords.length }
}
