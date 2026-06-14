'use server'

import { generateTemporaryPassword, generateResetToken } from './password-generators'

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  appUrl: string
) {
  const resetLink = `${appUrl}/reset-password?token=${resetToken}`
  
  try {
    // Using Resend for email
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.SENDER_EMAIL || 'noreply@insurgeagent.com',
        to: email,
        subject: 'Reset Your Password - InsureAgent',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You requested a password reset for your InsureAgent account.</p>
            <p>Click the link below to reset your password. This link will expire in 24 hours.</p>
            <p style="margin: 20px 0;">
              <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Reset Password
              </a>
            </p>
            <p>Or copy this link: <code>${resetLink}</code></p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              If you didn't request this password reset, please ignore this email.
            </p>
          </div>
        `,
      }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to send email')
    }
    
    return { success: true }
  } catch (error) {
    console.error('[v0] Error sending password reset email:', error)
    throw error
  }
}

/**
 * Send temporary password email (admin reset)
 */
export async function sendTemporaryPasswordEmail(
  email: string,
  temporaryPassword: string,
  agentName: string,
  appUrl: string
) {
  const loginLink = `${appUrl}/sign-in`
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.SENDER_EMAIL || 'noreply@insurgeagent.com',
        to: email,
        subject: 'Your Temporary Password - InsureAgent',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Your Temporary Password</h2>
            <p>Hello ${agentName},</p>
            <p>Your password has been reset. Use the temporary password below to log in. You will be required to change it on your first login.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0; font-family: monospace; font-size: 14px;">
              <strong>Temporary Password:</strong><br>
              ${temporaryPassword}
            </div>
            <p style="margin: 20px 0;">
              <a href="${loginLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Log In to InsureAgent
              </a>
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              Please keep this email safe and do not share this password with anyone.
            </p>
          </div>
        `,
      }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to send email')
    }
    
    return { success: true }
  } catch (error) {
    console.error('[v0] Error sending temporary password email:', error)
    throw error
  }
}
