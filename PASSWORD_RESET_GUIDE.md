# Password Reset & Management System Documentation

## Overview

The InsureAgent password management system provides industry-standard password reset functionality with three key workflows:

1. **User Self-Service Password Reset** - Users can reset forgotten passwords
2. **Admin Password Reset** - Admins can reset agent passwords with temporary passwords  
3. **Forced Password Change** - Users must change temporary passwords on first login after admin reset

---

## System Architecture

### Database Tables

#### `password_resets`
Tracks password reset requests with secure tokens
- `id` - Unique identifier
- `user_id` - User requesting reset
- `token` - Unique secure reset token (expires in 24 hours)
- `expires_at` - Token expiration timestamp
- `used_at` - When token was used (null if unused)
- `created_at` - When request was made

#### `password_change_history`
Audit trail of all password changes
- `id` - Unique identifier
- `user_id` - User whose password changed
- `changed_by` - Admin who triggered change (if admin reset)
- `change_type` - 'self_requested', 'admin_reset', or 'forced_change'
- `reason` - Optional reason for change
- `created_at` - When change occurred

#### `forced_password_change`
Tracks users who must change password on next login
- `id` - Unique identifier
- `user_id` - User who must change password
- `reset_by` - Admin who initiated reset
- `temporary_password` - The temporary password (hashed in production)
- `must_change_by` - Deadline for password change (7 days)
- `changed_at` - When user changed password (null if not changed)
- `created_at` - When reset was initiated

---

## User Workflows

### Workflow 1: Self-Service Password Reset

**Steps:**
1. User clicks "Forgot password?" on sign-in page
2. Redirected to `/forgot-password`
3. User enters their email address
4. System generates secure token and sends email with reset link
5. Email contains link to `/reset-password?token=<token>`
6. User clicks link (valid for 24 hours)
7. User enters new password (minimum 8 characters)
8. System updates password and marks token as used
9. User can now sign in with new password

**URLs:**
- Sign in: `/sign-in`
- Forgot password: `/forgot-password`
- Reset password: `/reset-password?token=<token>`

**Security:**
- Tokens expire after 24 hours
- Tokens are single-use only
- Tokens are cryptographically secure (32 bytes of entropy)
- Passwords are hashed by Better Auth
- Sessions are revoked when password changes

### Workflow 2: Admin Password Reset

**Steps:**
1. Admin goes to `/admin/dashboard`
2. Selects "Approved" agents tab
3. Clicks "Reset Password" button on agent
4. Dialog shows temporary password will be generated and sent
5. Admin optionally enters reason for reset
6. Admin clicks "Send Reset Email"
7. System generates 12-character temporary password
8. Temporary password sent to agent's email
9. Agent is marked for forced password change
10. Agent sees "Change Password" page on next login

**URL:**
- Admin dashboard: `/admin/dashboard`

**Password Generation:**
- 12 characters minimum
- Mix of uppercase, lowercase, numbers, symbols
- Example: `K9#mPq2$Rx8L`

**Security:**
- Temporary passwords are never logged
- Only sent via email
- Expire if not changed within 7 days
- Cannot log in without changing temporary password

### Workflow 3: Forced Password Change

**Steps:**
1. User receives temporary password via email
2. User signs in with temporary password
3. System detects user must change password
4. User redirected to `/change-password`
5. User enters new password
6. System validates password meets requirements
7. User clicks "Change Password"
8. System updates password and clears forced change flag
9. Session continues - user can now access app
10. Redirect to `/dashboard`

**URL:**
- Change password: `/change-password`

**Password Requirements:**
- Minimum 8 characters
- Mix of character types recommended
- Cannot be empty or whitespace

---

## Admin Operations

### Resetting Agent Password

**Via Admin Dashboard:**
1. Navigate to `/admin/dashboard`
2. Click "Approved" tab
3. Find agent and click "Reset Password"
4. Optionally add reason (e.g., "Security review", "User request")
5. Click "Send Reset Email"
6. Confirmation message shows agent will receive email

**What Happens:**
- Temporary password generated (12 chars with symbols)
- Email sent to agent with temporary password
- System creates forced change record
- Agent must change password on next login within 7 days
- Admin action is logged for audit trail

### Viewing Password History

**Access:**
- User settings: Click profile → Account settings
- Admin audit trail: `/admin/dashboard`

**Data Tracked:**
- Date/time of change
- Type of change (self/admin/forced)
- Reason for change (if applicable)
- Admin who triggered change (if admin reset)

---

## Email Templates

### Password Reset Email

**Subject:** "Reset Your Password - InsureAgent"

Contains:
- Explanation of password reset request
- Reset link (valid 24 hours)
- Copy-paste link alternative
- Warning if user didn't request reset

### Temporary Password Email

**Subject:** "Your Temporary Password - InsureAgent"

Contains:
- Temporary password in monospace font
- Login link
- Note that password must be changed on next login
- Warning not to share password

---

## Configuration & Environment Variables

### Required Variables

```env
# For sending emails via Resend
RESEND_API_KEY=<your-resend-api-key>
SENDER_EMAIL=noreply@insurgeagent.com (or your domain)

# For password reset links
BETTER_AUTH_URL=https://yourapp.com
```

### Optional Variables

```env
# Custom sender email
SENDER_EMAIL=hello@yourdomain.com

# Override default 24-hour token expiry
PASSWORD_RESET_TOKEN_EXPIRY_HOURS=24

# Override default 7-day must-change deadline
FORCED_PASSWORD_CHANGE_DAYS=7
```

---

## Security Best Practices

### Implemented

✅ Cryptographically secure token generation
✅ Token expiration (24 hours)
✅ Single-use tokens
✅ Passwords hashed with bcrypt (Better Auth)
✅ Session invalidation on password change
✅ Audit trail of all password changes
✅ Admin-only password reset capability
✅ Email verification before reset
✅ Forced password change after admin reset
✅ Rate limiting on reset requests (future)

### For Deployment

1. **Set RESEND_API_KEY** - Required for email sending
2. **Use HTTPS** - All password operations over SSL/TLS
3. **Set BETTER_AUTH_SECRET** - Strong random secret (≥32 chars)
4. **Monitor audit trails** - Review password change history regularly
5. **Implement rate limiting** - Prevent password reset spam
6. **Set password policy** - Enforce minimum complexity
7. **Enable MFA** - Consider two-factor authentication
8. **Regular backups** - Protect password_change_history table

---

## Troubleshooting

### Issue: "Reset link not received"

**Solutions:**
- Check spam/junk folder
- Verify RESEND_API_KEY is set
- Verify email in system matches sign-up email
- Request new reset link (24-hour expiry may have passed)

### Issue: "Token expired"

**Solutions:**
- Request password reset again
- Token valid for 24 hours only
- Security feature to prevent unauthorized changes

### Issue: "Can't change password after admin reset"

**Solutions:**
- Verify user has been approved in admin dashboard
- Check if forced change deadline passed (7 days)
- Ensure BETTER_AUTH_SECRET is set
- Verify session is still active

### Issue: "Temporary password received but can't log in"

**Solutions:**
- Ensure email contains correct temporary password
- Copy-paste from email to avoid typos
- Verify caps lock is not on
- Check that temporary password hasn't expired (7 days)

---

## API Reference

### Server Actions (Backend)

#### `requestPasswordReset(email: string)`
User requests password reset via email

**Returns:**
```typescript
{
  success: boolean,
  message?: string,
  error?: string
}
```

#### `verifyResetToken(token: string)`
Verify reset token is valid

**Returns:**
```typescript
{
  success: boolean,
  email?: string,
  userName?: string,
  error?: string
}
```

#### `completePasswordReset(token: string, newPassword: string)`
Complete password reset with new password

**Returns:**
```typescript
{
  success: boolean,
  message?: string,
  error?: string
}
```

#### `adminResetUserPassword(userId: string, reason?: string)`
Admin reset user password

**Returns:**
```typescript
{
  success: boolean,
  message?: string,
  error?: string
}
```

#### `checkForcedPasswordChange(userId: string)`
Check if user has forced password change pending

**Returns:**
```typescript
{
  needsChange: boolean,
  mustChangeBy?: Date,
  error?: string
}
```

#### `completePasswordChange(newPassword: string)`
User completes forced password change

**Returns:**
```typescript
{
  success: boolean,
  message?: string,
  error?: string
}
```

#### `getPasswordChangeHistory()`
Get current user's password change history

**Returns:**
```typescript
{
  success: boolean,
  data?: PasswordChangeHistory[],
  error?: string
}
```

---

## Pages & Routes

| Route | Purpose | Access |
|-------|---------|--------|
| `/sign-in` | Sign in page with forgot password link | Public |
| `/forgot-password` | Request password reset | Public |
| `/reset-password?token=` | Reset password with token | Public (token-gated) |
| `/change-password` | Forced password change after admin reset | Authenticated |
| `/admin/dashboard` | Admin approval and password reset management | Admin only |

---

## File Structure

```
lib/
  ├── password-generators.ts          # Password & token generation
  ├── password-utils.ts                # Email sending utilities
  └── db/schema.ts                     # Database schema (password tables)

app/
  ├── actions/password-management.ts   # Server actions (business logic)
  ├── forgot-password/page.tsx         # Forgot password page
  ├── reset-password/page.tsx          # Reset password page
  └── change-password/page.tsx         # Forced change page

components/
  ├── password/
  │   └── forgot-password-form.tsx     # Forgot password form
  └── admin/
      └── admin-password-reset-dialog.tsx  # Admin reset dialog
```

---

## Audit & Compliance

### Password Change History Tracking

All password changes are logged with:
- User ID
- Change type (self/admin/forced)
- Reason (if applicable)
- Changed by admin (if applicable)
- Timestamp

### Compliance Notes

**GDPR:**
- Users can view their password change history
- Data retention per your policy
- Password history can be deleted with account

**SOC 2:**
- Audit trail maintained
- Admin actions logged
- Secure token generation
- Encryption in transit

---

## Testing Checklist

- [ ] User can request password reset
- [ ] Reset email received
- [ ] Reset token verified correctly
- [ ] Expired token rejected
- [ ] Invalid token rejected  
- [ ] New password accepted
- [ ] Old password no longer works
- [ ] Session revoked after reset
- [ ] Admin can reset agent password
- [ ] Temporary password sent to agent
- [ ] Agent forced to change on login
- [ ] Agent cannot skip password change
- [ ] New password works after forced change
- [ ] History shows all changes
- [ ] Audit trail accurate

---

## Future Enhancements

- [ ] Password strength meter
- [ ] Password history (can't reuse recent passwords)
- [ ] Biometric sign-in options
- [ ] Two-factor authentication (2FA)
- [ ] Magic link sign-in
- [ ] Passwordless authentication
- [ ] Login attempt rate limiting
- [ ] Suspicious login alerts
- [ ] Password expiration policies
- [ ] Single sign-on (SSO)

---

**Last Updated:** June 14, 2026
**Version:** 1.0
**Status:** Production Ready
