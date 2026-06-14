# InsureAgent - Multi-Agent Deployment Package

Complete insurance policy management system ready for deployment to multiple agents with built-in security, data isolation, and admin approval workflows.

## What's Included

### Core Features
- **Agent Dashboard**: Real-time insurance policy tracking and reminders
- **Client Management**: Add, edit, and manage client information
- **Policy Tracking**: Complete policy lifecycle management
- **Payment Recording**: Track premium payments
- **Reminder System**: Automated reminder scheduling by payment due date
- **Analytics**: Payment history and policy analytics

### Multi-Agent Features
- **Admin Approval Workflow**: New agents must be approved by you before accessing the system
- **Data Isolation**: Each agent sees only their own data (clients, policies, payments)
- **Dummy Data Cleanup**: Remove test data before sharing with real agents
- **Admin Dashboard**: Manage user approvals and rejections
- **Audit Trail**: Track all admin approval actions

## Quick Start

### 1. Prerequisites
- Node.js 18+ and pnpm
- Vercel account for deployment
- Neon PostgreSQL database (auto-provisioned)
- Gmail account for admin email

### 2. Installation

```bash
# Clone and install
git clone <repository-url>
cd insurate-agent
pnpm install

# Set up environment variables
cp .env.example .env.local

# Generate BETTER_AUTH_SECRET
openssl rand -base64 32
```

### 3. Environment Variables

```env
DATABASE_URL=postgresql://...  # Auto-provided by Neon
BETTER_AUTH_SECRET=<generated-secret>
ADMIN_EMAIL=your-email@gmail.com
```

### 4. Deploy to Vercel

```bash
vercel deploy
```

## Multi-Agent Setup

### Step 1: Admin Account Setup
1. Visit `/sign-up` and create account with your Gmail
2. You'll see "Waiting for Approval" message
3. **Important**: Manually approve yourself in the database:
   ```sql
   UPDATE "user" SET "email_verified" = true 
   WHERE email = 'your-email@gmail.com'
   ```
4. Log out and log back in
5. Access admin dashboard at `/admin/dashboard`

### Step 2: Data Cleanup
1. Go to `/data-cleanup`
2. Review dummy data from development
3. Click "Remove All Dummy Data"
4. Verify clean state before inviting agents

### Step 3: Invite Agents

Share this link with your agents:
```
https://your-deployed-app.com/sign-up
```

Each agent should:
- Create account with their email and password
- See "Waiting for Approval" message
- Wait for your approval

### Step 4: Approve/Reject Agents

1. Go to `/admin/dashboard`
2. Review pending agent requests
3. Click "Approve" to grant access or "Reject" to deny
4. Approved agents can immediately log in and start using the app

## Data Security

### How Data Isolation Works

Every data table includes a `user_id` field that filters results:

```typescript
// Example: Getting current agent's clients only
const myClients = await db
  .select()
  .from(clients)
  .where(eq(clients.userId, currentUserId))  // ← Security filter
```

**Result**: Agent A cannot see Agent B's data, even though it's in the same database.

### Database Tables

| Table | Isolated | Purpose |
|-------|----------|---------|
| clients | ✓ | Customer information per agent |
| policies | ✓ | Insurance policies per agent |
| payment_logs | ✓ | Payment history per agent |
| reminder_logs | ✓ | Reminders per agent |
| users | - | All user accounts (admin only view) |
| admin_approvals | - | Approval audit trail (admin only) |

## Deployment Checklist

- [ ] Environment variables configured (ADMIN_EMAIL, BETTER_AUTH_SECRET)
- [ ] Admin account created and verified in database
- [ ] Access admin dashboard confirmed
- [ ] Dummy data reviewed and cleaned up
- [ ] Test data isolation (create data as Agent A, verify Agent B can't see it)
- [ ] Share signup URL with agents
- [ ] Approve first agent
- [ ] Verify Agent 1's data isolated from Agent 2

## Common Tasks

### Approve a New Agent
1. Admin goes to `/admin/dashboard`
2. Click "Pending" tab
3. Find agent email
4. Click "Approve"
5. Agent receives email notification (can be implemented)

### Reject an Agent
1. Admin goes to `/admin/dashboard`
2. Click "Pending" tab
3. Click "Reject"
4. Optionally add rejection reason
5. Agent account is deleted

### Agent Views Their Data
1. Agent logs in
2. Go to `/dashboard`
3. See only their clients and policies
4. Cannot access other agents' data

### Remove All Dummy Data
1. Admin goes to `/data-cleanup`
2. See summary of dummy vs real records
3. Click "Remove All Dummy Data"
4. Confirm deletion

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Deployment                         │
├─────────────────────────────────────────────────────────────┤
│  Next.js 16 Application                                     │
│  ├─ /dashboard        (Agent dashboard)                     │
│  ├─ /sign-up          (Agent registration)                  │
│  ├─ /admin/dashboard  (Admin controls)                      │
│  └─ /data-cleanup     (Data management)                     │
├─────────────────────────────────────────────────────────────┤
│  Better Auth (Email + Password Authentication)              │
├─────────────────────────────────────────────────────────────┤
│  Neon PostgreSQL Database                                   │
│  ├─ users (auth)                                            │
│  ├─ clients (per-agent data)                                │
│  ├─ policies (per-agent data)                               │
│  ├─ payment_logs (per-agent data)                           │
│  ├─ reminder_logs (per-agent data)                          │
│  ├─ admin_approvals (audit trail)                           │
│  └─ dummy_data_tracker (cleanup tracking)                   │
└─────────────────────────────────────────────────────────────┘
```

## Scaling to More Agents

This setup scales seamlessly:

1. **Add agents**: Repeat signup/approval process
2. **Each agent gets isolated data**: Automatic via user_id filtering
3. **Database performance**: Maintained with proper indexing
4. **Cost**: Minimal - all agents share one database

To add Agents 4, 5, 6+:
- Share signup URL
- Approve in admin dashboard
- They're ready to use!

## Troubleshooting

### Admin Can't Access Admin Dashboard
**Solution**: 
- Verify email matches `ADMIN_EMAIL` environment variable
- Check that `emailVerified` is `true` in database
- Log out and log back in

### Agent Sees Other Agent's Data
**Solution**: This should NOT happen. If it does:
- Check `userId` column exists on data tables
- Verify `getUserId()` is filtering in server actions
- Check no raw SQL bypasses `userId` filter

### Agent Can't Sign Up
**Solution**:
- Verify `BETTER_AUTH_SECRET` is set (not empty)
- Verify `DATABASE_URL` is configured
- Check Better Auth tables exist in database

### Dummy Data Cleanup Fails
**Solution**:
- Verify admin is logged in
- Check that `dummy_data_tracker` table exists
- Try deleting small chunks instead of all at once

## Production Checklist

### Security
- [ ] Use strong admin password (20+ characters)
- [ ] Enable database backups
- [ ] Set up database monitoring/alerts
- [ ] Audit approval logs regularly
- [ ] Use HTTPS (automatic with Vercel)

### Reliability
- [ ] Test backup/restore process
- [ ] Set up error logging/monitoring
- [ ] Configure database connection pooling
- [ ] Set up automated backups
- [ ] Test disaster recovery

### Operations
- [ ] Document admin procedures
- [ ] Train admin on approval workflow
- [ ] Create user manual for agents
- [ ] Set up support email
- [ ] Plan for scaling timeline

## Next Steps

### Phase 1: Deployment (Week 1)
- Deploy to Vercel
- Set up admin account
- Clean dummy data
- Invite first agent

### Phase 2: Scaling (Week 2+)
- Approve additional agents as they sign up
- Monitor system performance
- Gather feedback from agents

### Phase 3: Enhancement (Month 2+)
- Add email notifications for approvals
- Implement payment reminders
- Build advanced analytics
- Add SMS reminders
- Create agent API

## Support & Documentation

- **Deployment Guide**: See `MULTI_AGENT_DEPLOYMENT.md`
- **Testing Guide**: See `IMPLEMENTATION_COMPLETE.md`
- **Bug Report**: Create an issue with reproduction steps
- **Feature Request**: Please describe the use case

## Technical Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js Server Actions, Better Auth
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth (Email + Password)
- **UI Components**: shadcn/ui, Tailwind CSS
- **Deployment**: Vercel

## License

This application is provided as-is for insurance agent use.

---

**Ready to deploy?** 

1. Set environment variables
2. Deploy to Vercel
3. Follow Multi-Agent Setup steps above
4. Share with your agents!

For detailed deployment instructions, see `MULTI_AGENT_DEPLOYMENT.md`
