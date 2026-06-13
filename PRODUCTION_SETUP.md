# Insurance Reminder App - Production Setup Complete

## ✅ Status: Production-Ready with Database Persistence

Your Insurance Reminder App now has **enterprise-grade data persistence** using **Neon PostgreSQL + Better Auth + Drizzle ORM**.

---

## 📊 Architecture Overview

### Database (Neon PostgreSQL)
- **Location**: Managed by Neon (auto-provisioned)
- **Tables Created**:
  - `users`, `session`, `account`, `verification` (Better Auth)
  - `clients` - Store client information
  - `policies` - Store insurance policies
  - `reminder_logs` - Track sent reminders
  - `payment_logs` - Track received payments
  - `agent_settings` - Store agent profile info

### Authentication (Better Auth)
- **Method**: Email + Password (secure, standard)
- **Environment**: `BETTER_AUTH_SECRET` is set
- **Session**: Secure HTTP-only cookies
- **Database**: Better Auth uses same Neon connection

### Application Framework
- **Frontend**: Next.js 16 + React (client-side UI)
- **Backend**: Next.js Server Actions + Drizzle ORM
- **API**: `/api/auth/[...all]` handles all authentication
- **Security**: Per-user data scoping (all queries filter by userId)

---

## 🔐 Data Persistence Features

### ✅ What Persists
- ✓ All client data (name, email, phone, address)
- ✓ All policy data (dates, premiums, coverage, etc.)
- ✓ Reminder history (what was sent, when, via which channel)
- ✓ Payment history (who paid, when, new due dates)
- ✓ Agent settings (name, phone)
- ✓ User authentication (email, password, sessions)

### ✅ Data Survival
- **Page refresh**: ✓ All data persists
- **Browser close**: ✓ Session saved in database
- **New device**: ✓ Can login from any device
- **Multiple users**: ✓ Each user sees only their data (per-user security)
- **Data backup**: Automatic by Neon (point-in-time restore available)

---

## 📱 Multi-Device Access

1. **Deploy to Vercel** (click "Publish" button)
2. Get public URL: `https://your-app.vercel.app`
3. **Share URL** with anyone who needs access
4. Users **sign up** with email and password
5. Access from **any device** - data syncs from database

---

## 🚀 Deployment Instructions

### For Vercel (Recommended)

1. **Click "Publish"** in v0 (top-right button)
2. Choose **Vercel** as deployment target
3. Vercel automatically:
   - Builds your Next.js app
   - Sets up environment variables (DATABASE_URL, BETTER_AUTH_SECRET)
   - Deploys to edge network
   - Provides custom domain option

### Manual Deployment

```bash
# 1. Clone the repo
git clone https://github.com/skalamkar7/spark.git
cd spark

# 2. Install dependencies
pnpm install

# 3. Set environment variables in .env.local
DATABASE_URL=<from-Neon-integration>
BETTER_AUTH_SECRET=<your-secret>

# 4. Deploy to Vercel
vercel --scope team_S5StEkPfE80crFhuvwTfMaeS
```

---

## 📖 How It Works

### Adding a Client
1. Click "+ Add" → "Client"
2. Fill in name, email, phone, address
3. Click "Save"
4. **Data saved to database** ✓

### Adding a Policy
1. Click "+ Add" → "Policy"
2. Select client
3. Fill in policy details (premium, dates, etc.)
4. Click "Save"
5. **Data saved to database** ✓

### Sending Reminders
1. Filter by due date (1 day, 3 days, 7 days, etc.)
2. Click "Send Reminder" on any policy
3. Copy message for WhatsApp or Email
4. Send via your preferred channel
5. Click "Mark as Sent"
6. **Reminder tracked in database** ✓

### Recording Payments
1. Click "Mark Payment Received"
2. Enter new due date
3. Click "Save"
4. **Payment logged, next payment date updated** ✓

---

## 🔒 Security Features

- **Authentication**: Email + password with secure hashing (Better Auth)
- **Encryption**: All data in transit uses HTTPS
- **Per-User Isolation**: Each query scoped by userId (no cross-user data leaks)
- **Session Management**: Secure HTTP-only cookies
- **Password Security**: Salted and hashed (Better Auth handles this)

---

## 📊 Database Schema

### Clients Table
```
- id (unique identifier)
- user_id (owner of the data)
- name, email, phone, address
- created_at, updated_at
```

### Policies Table
```
- id (unique identifier)
- user_id (owner)
- client_id (linked client)
- name, type, provider, policy_number
- premium, coverage_amount
- dates: start_date, end_date, next_payment_date
- status (active, expiring-soon, expired)
- reminder tracking: last_reminder_sent, reminders_sent_count
```

### Reminder Logs Table
```
- id, user_id, policy_id, client_id
- sent_at (timestamp)
- sent_via (email, sms, whatsapp)
- reminder_type (payment, expiry)
- message (text of reminder sent)
- status (sent, failed, bounced)
```

### Payment Logs Table
```
- id, user_id, policy_id, client_id
- amount, paid_at
- previous_due_date, new_due_date
- notes
```

---

## 🛠️ Environment Variables

All required variables are **automatically set**:

- **DATABASE_URL** ← Neon (auto-provisioned)
- **BETTER_AUTH_SECRET** ← You added this
- **BETTER_AUTH_URL** ← Auto-detected in production

---

## ✨ Key Differences from Demo Version

| Feature | Demo | Production |
|---------|------|------------|
| Data Storage | Browser localStorage | Neon PostgreSQL |
| Persistence | Lost on cache clear | Permanent |
| Multi-Device | No (data per browser) | Yes (shared database) |
| Authentication | None | Email + Password |
| Users | Single browser | Multi-user |
| Scalability | Limited to browser memory | Unlimited |
| Backup | Manual | Automatic by Neon |
| Data Encryption | No | Yes (HTTPS + encryption) |

---

## 📞 Support & Troubleshooting

### App won't load after deployment?
1. Check environment variables are set in Vercel
2. Verify DATABASE_URL and BETTER_AUTH_SECRET exist
3. Check Neon dashboard for database status

### Can't sign up?
1. Use a valid email address
2. Check password meets requirements
3. Verify BETTER_AUTH_SECRET is set

### Data not showing?
1. Make sure you're logged in with correct account
2. Check that data belongs to your user_id
3. Try refreshing the page

### Forgot password?
Currently not implemented. To reset:
1. Contact support or use Neon dashboard to reset user record
2. Future: Add password reset flow

---

## 🎯 Next Steps

1. **Deploy to Vercel** - Click "Publish" button
2. **Share the public URL** with users
3. **Users sign up** with email and password
4. **Start managing policies** - all data automatically persists
5. **Monitor in Neon dashboard** if needed (optional)

---

## 💡 Pro Tips

- **Backup data**: Use Neon's point-in-time restore feature
- **Monitor usage**: Check Neon dashboard for query performance
- **Scale up**: As you add more policies, Neon handles it automatically
- **Team access**: Each user gets their own secure session
- **API Access**: Your data is in a real PostgreSQL database (can build additional tools)

---

## 🔗 Resources

- **Neon Dashboard**: https://console.neon.tech
- **Better Auth Docs**: https://www.better-auth.com
- **Drizzle Docs**: https://orm.drizzle.team
- **Next.js Docs**: https://nextjs.org

---

**Your app is production-ready and fully operational!** 🎉
