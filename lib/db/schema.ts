import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";

// Better Auth tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// Insurance app tables
export const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const policies = pgTable("policies", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  clientId: text("client_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // health, auto, home, life, travel, business
  provider: text("provider").notNull(),
  policyNumber: text("policy_number").notNull(),
  premium: decimal("premium", { precision: 10, scale: 2 }).notNull(),
  premiumFrequency: text("premium_frequency").notNull(), // monthly, quarterly, yearly
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  nextPaymentDate: text("next_payment_date").notNull(),
  status: text("status").notNull(), // active, expiring-soon, expired
  coverageAmount: decimal("coverage_amount", { precision: 15, scale: 2 }).notNull(),
  notes: text("notes"),
  lastReminderSent: text("last_reminder_sent"),
  remindersSentCount: integer("reminders_sent_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const reminderLogs = pgTable("reminder_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  policyId: text("policy_id").notNull(),
  clientId: text("client_id").notNull(),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  sentVia: text("sent_via").notNull(), // email, sms, whatsapp
  reminderType: text("reminder_type").notNull(), // payment, expiry
  dueDate: text("due_date").notNull(),
  message: text("message"),
  status: text("status").default("sent"), // sent, failed, bounced
});

export const paymentLogs = pgTable("payment_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  policyId: text("policy_id").notNull(),
  clientId: text("client_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paidAt: timestamp("paid_at").notNull().defaultNow(),
  previousDueDate: text("previous_due_date").notNull(),
  newDueDate: text("new_due_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const agentSettings = pgTable("agent_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  agentName: text("agent_name"),
  agentPhone: text("agent_phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Multi-user approval workflow tables
export const agentInfo = pgTable("agent_info", {
  id: text("id").primaryKey().default(() => crypto.randomUUID()),
  userId: text("user_id").notNull().unique(),
  companyName: text("company_name"),
  phone: text("phone"),
  gstNumber: text("gst_number"),
  profilePictureUrl: text("profile_picture_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const adminApprovals = pgTable("admin_approvals", {
  id: text("id").primaryKey().default(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  adminId: text("admin_id"),
  action: text("action").notNull(), // 'approved' or 'rejected'
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dummyDataTracker = pgTable("dummy_data_tracker", {
  id: text("id").primaryKey().default(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  tableName: text("table_name").notNull(),
  recordId: text("record_id").notNull(),
  isDummy: boolean("is_dummy").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
