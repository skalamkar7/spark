# Production Readiness Checklist

## Phase 1: Environment Setup (5 minutes)

### Required Environment Variables
- [ ] RESEND_API_KEY - From https://resend.com (get free API key)
- [ ] SENDER_EMAIL - Email address for sending password resets (e.g., noreply@yourdomain.com)
- [ ] BETTER_AUTH_SECRET - Already set (for authentication)
- [ ] DATABASE_URL - Already set (Neon connection)
- [ ] ADMIN_EMAIL - Your Gmail for approvals (already configured)

### Optional Environment Variables
- [ ] BETTER_AUTH_URL - Set if using custom domain (optional)
- [ ] LOG_LEVEL - 'debug' for troubleshooting, 'info' for production

## Phase 2: Database Verification (5 minutes)

### Database Tables Created
- [x] user (Better Auth table)
- [x] session (Better Auth table)
- [x] account (Better Auth table)
- [x] verification (Better Auth table)
- [x] clients
- [x] policies
- [x] payments
- [x] admin_approvals (for user approval workflow)
- [x] agent_info (for agent profiles)
- [x] dummy_data_tracker (for cleanup)
- [x] password_resets (for password reset flow)
- [x] password_change_history (for audit trail)
- [x] forced_password_change (for forced password changes)

### Data Cleanup
- [ ] Remove all dummy test data from clients table
- [ ] Remove all dummy test data from policies table
- [ ] Remove all dummy test data from payments table
- [ ] Run cleanup script: `/app/data-cleanup`
- [ ] Verify no test data remains

## Phase 3: Feature Testing (15 minutes)

### Authentication & Approval Workflow
- [ ] User signup works correctly
- [ ] New user shows "pending approval" screen
- [ ] Admin can see pending users in `/admin/dashboard`
- [ ] Admin can approve users (one-click)
- [ ] Admin can reject users with reason
- [ ] Approved user receives email confirmation
- [ ] User can immediately log in after approval

### Password Management (5 minutes)
- [ ] "Forgot password?" link shows on /sign-in
- [ ] User can request password reset via /forgot-password
- [ ] Reset email is sent with valid link
- [ ] Reset link works and allows password change
- [ ] Admin can reset agent password from admin dashboard
- [ ] Agent receives temporary password via email
- [ ] Agent forced to change password on next login
- [ ] Audit trail shows all password changes

### Data Management
- [ ] Admin can add clients successfully
- [ ] Dashboard client count updates immediately
- [ ] Admin can add policies with valid dates
- [ ] Dashboard policy count updates immediately
- [ ] Admin can record payments
- [ ] Payment history shows all payments
- [ ] Analytics page shows correct statistics
- [ ] Data cleanup tool works correctly
- [ ] Test data can be removed safely

### Multi-User Isolation
- [ ] Agent A cannot see Agent B's data
- [ ] Each agent sees only their own clients
- [ ] Each agent sees only their own policies
- [ ] Each agent sees only their own payments
- [ ] Dashboard shows correct per-agent statistics

### Admin Features
- [ ] Admin dashboard loads correctly
- [ ] Admin can see all pending users
- [ ] Admin can see all approved users
- [ ] Admin can see rejected users with reasons
- [ ] Admin password reset sends temporary password
- [ ] Password reset audit trail is recorded

## Phase 4: Security Verification (10 minutes)

### Authentication Security
- [x] Passwords hashed with bcrypt
- [x] Sessions use secure cookies
- [x] CSRF protection enabled
- [x] Rate limiting ready (can be enhanced)
- [x] Session timeout configured

### Data Security
- [x] All queries filtered by userId
- [x] Cross-user data access impossible
- [x] Admin-only routes protected
- [x] Approval endpoints protected
- [x] Password reset tokens secure (256-bit)
- [x] Token expiration enforced (24 hours)

### Email Security
- [ ] Email service (Resend) configured
- [ ] Sender email verified in Resend
- [ ] Test email can be sent successfully
- [ ] Email contains no sensitive data
- [ ] Email links use secure tokens

## Phase 5: Performance Verification (5 minutes)

### Build & Deployment
- [x] TypeScript build succeeds with no errors
- [x] No console warnings or errors
- [x] All pages load correctly
- [x] No broken imports or dependencies
- [x] Database queries optimized

### Page Load Performance
- [ ] /sign-in loads in < 2 seconds
- [ ] /dashboard loads in < 2 seconds
- [ ] /admin/dashboard loads in < 3 seconds
- [ ] Password reset pages load in < 2 seconds

## Phase 6: Deployment (10 minutes)

### Pre-Deployment
- [ ] All code committed to git
- [ ] All tests passing
- [ ] No uncommitted changes
- [ ] Database migrations applied
- [ ] Environment variables set in Vercel

### Deployment Steps
1. [ ] Add RESEND_API_KEY to Vercel environment variables
2. [ ] Add SENDER_EMAIL to Vercel environment variables
3. [ ] Run: `vercel deploy --prod` (or use Vercel dashboard)
4. [ ] Wait for deployment to complete (5-10 minutes)
5. [ ] Check deployment logs for errors

### Post-Deployment Verification
- [ ] Visit production URL
- [ ] Sign-in page loads correctly
- [ ] "Forgot password?" link visible
- [ ] Can request password reset
- [ ] Admin dashboard accessible
- [ ] Can approve users
- [ ] Can reset passwords
- [ ] Data displays correctly

## Phase 7: Production Monitoring

### Daily Checks
- [ ] Monitor application logs for errors
- [ ] Check failed login attempts
- [ ] Verify email delivery success
- [ ] Monitor database performance
- [ ] Check approval queue daily

### Weekly Checks
- [ ] Review user feedback
- [ ] Check data integrity
- [ ] Verify backup systems
- [ ] Test disaster recovery
- [ ] Review security logs

## Troubleshooting Common Issues

### Issue: "Forgot password?" link not showing
**Solution**: 
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check browser console for errors
4. Verify deployment completed

### Issue: Password reset email not received
**Solution**:
1. Check spam/junk folder
2. Verify RESEND_API_KEY is set
3. Verify SENDER_EMAIL is correct
4. Check email service dashboard (resend.com)
5. Test with different email address

### Issue: Admin dashboard not loading
**Solution**:
1. Verify you're logged in as admin
2. Check ADMIN_EMAIL in environment
3. Clear session cookies
4. Hard refresh browser
5. Check browser console for errors

### Issue: User can see another user's data
**Solution** (CRITICAL - SECURITY ISSUE):
1. Check userId filtering in queries
2. Verify database user assignment
3. Check session management
4. Review audit logs
5. Contact support immediately

## Sign-Off

- [ ] All checklist items completed
- [ ] All tests passed
- [ ] No critical issues found
- [ ] Security verified
- [ ] Ready for production
- [ ] Deployment date: ___________
- [ ] Deployed by: ___________
- [ ] Verified by: ___________

## Emergency Rollback

If critical issues occur after deployment:
1. Go to Vercel Dashboard
2. Click "Deployments"
3. Click "Rollback" on previous stable version
4. Confirm rollback
5. Notify team and users

For support: Contact your development team or reach out to Vercel support.
