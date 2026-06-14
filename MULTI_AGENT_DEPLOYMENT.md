# Multi-Agent InsureAgent Deployment Guide

## Overview

This guide explains how to deploy InsureAgent to 2-3 insurance agents with proper data isolation and admin approval workflows.

## Architecture

- **Single Application Instance**: One Neon database shared by all agents
- **Data Isolation**: Row-Level Security via application-level filtering on `user_id`
- **Admin Approval**: New signups are pending until you (admin) approve them
- **Dummy Data Management**: Clean test data before sharing with other agents

## Prerequisites

1. Your Gmail account email (admin email)
2. Deployed application on Vercel
3. Neon database connected
4. Environment variables set

## Setup Instructions

### 1. Set Environment Variables

In your Vercel project settings, add:

```
ADMIN_EMAIL=your-email@gmail.com
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
```

**Important**: The admin must first sign up and approve themselves before other users can use the system.

### 2. Initial Setup (First Time Admin)

1. Go to `/sign-up`
2. Sign up with your Gmail account
3. Your account will show a "Waiting for Approval" message
4. Manually update your user record in the database to mark yourself as approved:
   - Go to Neon console or use their query interface
   - Run: `UPDATE "user" SET "email_verified" = true WHERE "email" = 'your-email@gmail.com'`
5. Log out and log back in
6. You'll now have access to the admin dashboard at `/admin/dashboard`

### 3. Data Cleanup Before Deployment

Before giving access to other agents, remove the dummy/test data:

1. As admin, go to `/data-cleanup`
2. Review the data summary showing:
   - Total clients and policies
   - Which are real vs dummy data
3. Click "Remove All Dummy Data"
4. Verify that all dummy data is removed

### 4. Inviting Other Agents

Share the application URL with your agents:

```
https://your-deployed-app.com/sign-up
```

Each agent should:
1. Click the sign-up link
2. Create account with their email and password
3. See "Waiting for Approval" message
4. Wait for your approval

### 5. Approving New Agents

As admin:

1. Go to `/admin/dashboard`
2. Click the "Pending" tab
3. Review pending agent details
4. Click "Approve" or "Reject" for each agent
5. Approved agents will receive an email confirmation and can start using the app

## Data Access & Security

### How Data Isolation Works

Each data table has a `user_id` field:

```sql
-- Example: clients table
CREATE TABLE clients (
  id text PRIMARY KEY,
  user_id text NOT NULL,  -- This isolates data by user
  name text NOT NULL,
  ...
);
```

At the application level, all queries filter by `user_id`:

```typescript
// In server actions - only returns current user's data
const userId = await getUserId()
const myClients = await db
  .select()
  .from(clients)
  .where(eq(clients.userId, userId))  // ← Security filter
```

**Result**: 
- Agent A sees only their clients and policies
- Agent B sees only their clients and policies
- Admin can see all data but cannot edit individual agent data

### Multi-User Tables

| Table | user_id | Purpose |
|-------|---------|---------|
| clients | ✓ | Customer/policyholder data |
| policies | ✓ | Insurance policy details |
| payment_logs | ✓ | Payment history |
| reminder_logs | ✓ | Reminder history |
| agent_settings | ✓ | Agent preferences |

**Shared Tables** (visible to all users):
- providers (list of insurance companies)
- admin_approvals (approval audit trail)

## Deployment Checklist

- [ ] Set ADMIN_EMAIL environment variable
- [ ] Set BETTER_AUTH_SECRET environment variable
- [ ] Admin (you) creates account and verifies it in database
- [ ] Verify you can access `/admin/dashboard`
- [ ] Clean up dummy data via `/data-cleanup`
- [ ] Test data isolation:
  - [ ] Sign in as Agent A, create a client
  - [ ] Sign in as Agent B, verify Agent A's client is NOT visible
  - [ ] Admin can see all clients from all agents
- [ ] Share signup URL with agents
- [ ] Approve each agent as they sign up

## Common Tasks

### Admin Approves a New Agent

1. Go to `/admin/dashboard`
2. In "Pending" tab, find the agent email
3. Click "Approve"
4. Agent receives notification (implement email notifications for production)

### Admin Rejects a New Agent

1. Go to `/admin/dashboard`
2. In "Pending" tab, find the agent email
3. Click "Reject"
4. Optional: Enter rejection reason
5. Agent account is deleted

### Agent Views Own Data

1. Log in as agent
2. Go to `/dashboard`
3. See their own clients and policies only
4. Cannot view other agents' data

### Remove Dummy Data

1. As admin, go to `/data-cleanup`
2. See summary of dummy vs real data
3. Click "Remove All Dummy Data"
4. Confirm deletion

## Scaling to More Agents

This setup can scale to many agents:

1. Repeat "Inviting Other Agents" step for each new agent
2. Each agent gets isolated data automatically
3. Database grows but queries remain fast (indexed by user_id)

## Troubleshooting

### Admin Can't Access Admin Dashboard

**Solution**: Verify that:
1. Your email matches ADMIN_EMAIL environment variable exactly
2. Your account email is verified in the database
3. Your `emailVerified` column is set to `true`

### Agent Sees Other Agent's Data

**Solution**: This should NOT happen. If it does, it's a security issue. Check:
1. Verify server actions are filtering by `getUserId()`
2. Verify `userId` column exists on all data tables
3. Check that no raw SQL bypasses the user_id filter

### Agent Cannot Sign Up

**Solution**:
1. Verify BETTER_AUTH_SECRET is set (not empty)
2. Verify DATABASE_URL is configured
3. Check that Better Auth tables exist in database

### Admin Dashboard Shows No Users

**Solution**: 
1. Verify you're logged in as admin (email matches ADMIN_EMAIL)
2. Verify other agents have signed up
3. Check database directly: `SELECT * FROM "user"`

## Next Steps

### For Production:

1. **Email Notifications**: Send approval/rejection emails
2. **Dashboard Analytics**: Show per-agent statistics to admin
3. **Backup Strategy**: Regular database backups
4. **Monitoring**: Set up alerts for failed approvals
5. **Two-Factor Auth**: Add for admin account security
6. **SSO**: Consider Google/Microsoft OAuth for easier login

### For Enhanced Security:

1. Add IP whitelisting for admin dashboard
2. Implement audit logging for all admin actions
3. Add approval timeout (auto-reject after 30 days)
4. Require password change on first login
5. Add session monitoring

## Database Schema Reference

```sql
-- User approval fields (added to standard Better Auth user table)
ALTER TABLE "user" ADD COLUMN "approval_status" text DEFAULT 'pending';
ALTER TABLE "user" ADD COLUMN "approved_at" timestamp;
ALTER TABLE "user" ADD COLUMN "approved_by" text;

-- Admin approval audit trail
CREATE TABLE admin_approvals (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  admin_id text,
  action text NOT NULL,  -- 'approved' or 'rejected'
  reason text,
  created_at timestamp DEFAULT now()
);

-- Track dummy data for cleanup
CREATE TABLE dummy_data_tracker (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  table_name text NOT NULL,
  record_id text NOT NULL,
  is_dummy boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);
```

## Support

For issues or questions about multi-agent setup, contact: your-email@gmail.com
