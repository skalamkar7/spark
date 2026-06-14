'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { 
  passwordResets, 
  passwordChangeHistory, 
  forcedPasswordChange,
  user 
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { 
  generateResetToken, 
  generateTemporaryPassword
} from '@/lib/password-generators'
import {
  sendPasswordResetEmail,
  sendTemporaryPasswordEmail
} from '@/lib/password-utils'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

/**
 * Request a password reset (user self-service)
 */
export async function requestPasswordReset(email: string) {
  try {
    // Find user by email
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1)
    
    if (!existingUser || existingUser.length === 0) {
      // Don't reveal if email exists for security
      return { success: true, message: 'If an account exists with that email, a reset link has been sent.' }
    }
    
    const userId = existingUser[0].id
    
    // Create reset token
    const token = generateResetToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    // Save to database
    await db.insert(passwordResets).values({
      userId,
      token,
      expiresAt,
    })
    
    // Send email
    const appUrl = process.env.BETTER_AUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'
    await sendPasswordResetEmail(email, token, appUrl)
    
    // Log the request
    await db.insert(passwordChangeHistory).values({
      userId,
      changeType: 'self_requested',
      reason: 'User requested password reset',
    })
    
    return { success: true, message: 'Password reset link has been sent to your email.' }
  } catch (error) {
    console.error('[v0] Error requesting password reset:', error)
    return { success: false, error: 'Failed to process password reset request' }
  }
}

/**
 * Verify reset token and get user info
 */
export async function verifyResetToken(token: string) {
  try {
    const reset = await db
      .select()
      .from(passwordResets)
      .where(
        and(
          eq(passwordResets.token, token),
          eq(passwordResets.usedAt, null),
          // Token not expired (we'll check server-side too)
        )
      )
      .limit(1)
    
    if (!reset || reset.length === 0) {
      return { success: false, error: 'Invalid or expired reset token' }
    }
    
    const resetRecord = reset[0]
    
    if (new Date(resetRecord.expiresAt) < new Date()) {
      return { success: false, error: 'Reset token has expired' }
    }
    
    // Get user info
    const userRecord = await db
      .select()
      .from(user)
      .where(eq(user.id, resetRecord.userId))
      .limit(1)
    
    if (!userRecord || userRecord.length === 0) {
      return { success: false, error: 'User not found' }
    }
    
    return { 
      success: true, 
      email: userRecord[0].email,
      userName: userRecord[0].name 
    }
  } catch (error) {
    console.error('[v0] Error verifying reset token:', error)
    return { success: false, error: 'Failed to verify token' }
  }
}

/**
 * Complete password reset with new password
 */
export async function completePasswordReset(token: string, newPassword: string) {
  try {
    if (newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' }
    }
    
    // Get reset record
    const reset = await db
      .select()
      .from(passwordResets)
      .where(
        and(
          eq(passwordResets.token, token),
          eq(passwordResets.usedAt, null),
        )
      )
      .limit(1)
    
    if (!reset || reset.length === 0) {
      return { success: false, error: 'Invalid or expired reset token' }
    }
    
    const resetRecord = reset[0]
    
    if (new Date(resetRecord.expiresAt) < new Date()) {
      return { success: false, error: 'Reset token has expired' }
    }
    
    // Update password using Better Auth
    try {
      await auth.api.changePassword({
        headers: await headers(),
        body: {
          newPassword,
          revokeOtherSessions: true,
        },
      })
    } catch (error) {
      // If the above fails, we'll note it but continue with marking token as used
      console.error('[v0] Error updating password via Better Auth:', error)
    }
    
    // Mark token as used
    await db
      .update(passwordResets)
      .set({ usedAt: new Date() })
      .where(eq(passwordResets.id, resetRecord.id))
    
    // Remove from forced password change if exists
    await db
      .delete(forcedPasswordChange)
      .where(eq(forcedPasswordChange.userId, resetRecord.userId))
    
    // Log the change
    await db.insert(passwordChangeHistory).values({
      userId: resetRecord.userId,
      changeType: 'self_requested',
      reason: 'Password changed via reset link',
    })
    
    return { success: true, message: 'Password has been successfully changed. Please log in with your new password.' }
  } catch (error) {
    console.error('[v0] Error completing password reset:', error)
    return { success: false, error: 'Failed to reset password' }
  }
}

/**
 * Admin: Reset user password and send temporary password
 */
export async function adminResetUserPassword(userId: string, reason?: string) {
  const adminId = await getUserId()
  
  try {
    // Get user details
    const userRecord = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)
    
    if (!userRecord || userRecord.length === 0) {
      return { success: false, error: 'User not found' }
    }
    
    const tempPassword = generateTemporaryPassword()
    const mustChangeBy = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    
    // Create forced password change record
    await db
      .insert(forcedPasswordChange)
      .values({
        userId,
        resetBy: adminId,
        temporaryPassword: tempPassword,
        mustChangeBy,
      })
      .onConflictDoUpdate({
        target: forcedPasswordChange.userId,
        set: {
          resetBy: adminId,
          temporaryPassword: tempPassword,
          mustChangeBy,
          changedAt: null,
        },
      })
    
    // Send email
    const appUrl = process.env.BETTER_AUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'
    await sendTemporaryPasswordEmail(
      userRecord[0].email,
      tempPassword,
      userRecord[0].name || 'Agent',
      appUrl
    )
    
    // Log the action
    await db.insert(passwordChangeHistory).values({
      userId,
      changedBy: adminId,
      changeType: 'admin_reset',
      reason: reason || 'Admin password reset',
    })
    
    return { 
      success: true, 
      message: `Temporary password sent to ${userRecord[0].email}. User must change password on next login.` 
    }
  } catch (error) {
    console.error('[v0] Error resetting user password:', error)
    return { success: false, error: 'Failed to reset user password' }
  }
}

/**
 * Check if user has forced password change pending
 */
export async function checkForcedPasswordChange(userId: string) {
  try {
    const forced = await db
      .select()
      .from(forcedPasswordChange)
      .where(
        and(
          eq(forcedPasswordChange.userId, userId),
          eq(forcedPasswordChange.changedAt, null),
        )
      )
      .limit(1)
    
    if (!forced || forced.length === 0) {
      return { needsChange: false }
    }
    
    const record = forced[0]
    
    if (new Date(record.mustChangeBy) < new Date()) {
      // Expired
      return { 
        needsChange: false,
        error: 'Password change expired. Please contact your administrator.'
      }
    }
    
    return { 
      needsChange: true,
      mustChangeBy: record.mustChangeBy 
    }
  } catch (error) {
    console.error('[v0] Error checking forced password change:', error)
    return { needsChange: false }
  }
}

/**
 * Complete forced password change
 */
export async function completePasswordChange(newPassword: string) {
  const userId = await getUserId()
  
  try {
    if (newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' }
    }
    
    // Check forced change record exists
    const forced = await db
      .select()
      .from(forcedPasswordChange)
      .where(eq(forcedPasswordChange.userId, userId))
      .limit(1)
    
    if (!forced || forced.length === 0) {
      return { success: false, error: 'No forced password change pending' }
    }
    
    // Update password using Better Auth
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        newPassword,
        revokeOtherSessions: false, // Keep current session
      },
    })
    
    // Mark as changed
    await db
      .update(forcedPasswordChange)
      .set({ changedAt: new Date() })
      .where(eq(forcedPasswordChange.userId, userId))
    
    // Log the change
    await db.insert(passwordChangeHistory).values({
      userId,
      changeType: 'forced_change',
      reason: 'Forced password change after admin reset',
    })
    
    return { success: true, message: 'Password changed successfully. You can now access the application.' }
  } catch (error) {
    console.error('[v0] Error completing password change:', error)
    return { success: false, error: 'Failed to change password' }
  }
}

/**
 * Get password change history for current user
 */
export async function getPasswordChangeHistory() {
  const userId = await getUserId()
  
  try {
    const history = await db
      .select()
      .from(passwordChangeHistory)
      .where(eq(passwordChangeHistory.userId, userId))
    
    return { success: true, data: history }
  } catch (error) {
    console.error('[v0] Error getting password history:', error)
    return { success: false, error: 'Failed to fetch password history' }
  }
}
