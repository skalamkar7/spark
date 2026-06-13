'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { clients, policies, reminderLogs, paymentLogs, agentSettings } from '@/lib/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

// Client operations
export async function createClient(clientData: { name: string; email: string; phone: string; address?: string }) {
  const userId = await getUserId()
  const id = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  await db.insert(clients).values({
    id,
    userId,
    ...clientData,
  })
  
  revalidatePath('/')
  return id
}

export async function getClients() {
  const userId = await getUserId()
  return db.select().from(clients).where(eq(clients.userId, userId))
}

export async function deleteClient(clientId: string) {
  const userId = await getUserId()
  await db.delete(clients).where(and(eq(clients.id, clientId), eq(clients.userId, userId)))
  revalidatePath('/')
}

// Policy operations
export async function createPolicy(policyData: any) {
  const userId = await getUserId()
  const id = `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  await db.insert(policies).values({
    id,
    userId,
    ...policyData,
  })
  
  revalidatePath('/')
  return id
}

export async function getPolicies() {
  const userId = await getUserId()
  return db.select().from(policies).where(eq(policies.userId, userId))
}

export async function getPoliciesByClient(clientId: string) {
  const userId = await getUserId()
  return db.select().from(policies).where(and(eq(policies.userId, userId), eq(policies.clientId, clientId)))
}

export async function updatePolicy(policyId: string, data: any) {
  const userId = await getUserId()
  await db.update(policies).set(data).where(and(eq(policies.id, policyId), eq(policies.userId, userId)))
  revalidatePath('/')
}

export async function deletePolicy(policyId: string) {
  const userId = await getUserId()
  await db.delete(policies).where(and(eq(policies.id, policyId), eq(policies.userId, userId)))
  revalidatePath('/')
}

// Reminder log operations
export async function logReminderSent(reminderData: {
  policyId: string
  clientId: string
  sentVia: 'email' | 'sms' | 'whatsapp'
  reminderType: 'payment' | 'expiry'
  dueDate: string
  message?: string
}) {
  const userId = await getUserId()
  const id = `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  await db.insert(reminderLogs).values({
    id,
    userId,
    ...reminderData,
  })
  
  // Update policy last reminder sent
  await db.update(policies).set({
    lastReminderSent: new Date().toISOString().split('T')[0],
    remindersSentCount: (p) => (p.remindersSentCount || 0) + 1,
  }).where(eq(policies.id, reminderData.policyId))
  
  revalidatePath('/')
}

export async function getReminderLogs() {
  const userId = await getUserId()
  return db.select().from(reminderLogs).where(eq(reminderLogs.userId, userId))
}

// Payment log operations
export async function logPaymentReceived(paymentData: {
  policyId: string
  clientId: string
  amount: number
  previousDueDate: string
  newDueDate: string
  notes?: string
}) {
  const userId = await getUserId()
  const id = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  await db.insert(paymentLogs).values({
    id,
    userId,
    ...paymentData,
  })
  
  // Update policy next payment date
  await db.update(policies).set({
    nextPaymentDate: paymentData.newDueDate,
    lastReminderSent: undefined,
    remindersSentCount: 0,
  }).where(eq(policies.id, paymentData.policyId))
  
  revalidatePath('/')
}

export async function getPaymentLogs() {
  const userId = await getUserId()
  return db.select().from(paymentLogs).where(eq(paymentLogs.userId, userId))
}

// Agent settings
export async function saveAgentSettings(data: { agentName: string; agentPhone: string }) {
  const userId = await getUserId()
  
  // Check if settings already exist
  const existing = await db.select().from(agentSettings).where(eq(agentSettings.userId, userId))
  
  if (existing.length > 0) {
    await db.update(agentSettings).set(data).where(eq(agentSettings.userId, userId))
  } else {
    const id = `settings_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await db.insert(agentSettings).values({
      id,
      userId,
      ...data,
    })
  }
  
  revalidatePath('/')
}

export async function getAgentSettings() {
  const userId = await getUserId()
  const result = await db.select().from(agentSettings).where(eq(agentSettings.userId, userId))
  return result[0] || null
}
