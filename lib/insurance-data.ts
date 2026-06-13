export type InsuranceType = "health" | "auto" | "home" | "life" | "travel" | "business";

export type PolicyStatus = "active" | "expiring-soon" | "expired";

export type ReminderInterval = "1day" | "3days" | "1week" | "2weeks" | "1month" | "2months";

export interface InsuranceProvider {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  logo?: string;
  qrCode?: string; // Base64 or URL
  agentQrCode?: string; // QR code for agent's payment link
  createdAt: string;
}

export interface ReminderSettings {
  enabled: boolean;
  intervals: ReminderInterval[];
  notifyVia: ("email" | "sms" | "whatsapp")[];
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
}

export interface ReminderLog {
  id: string;
  policyId: string;
  sentAt: string;
  sentVia: "email" | "sms" | "whatsapp";
  reminderType: "payment" | "expiry";
  dueDate: string;
}

export interface PaymentLog {
  id: string;
  policyId: string;
  amount: number;
  paidAt: string;
  previousDueDate: string;
  newDueDate: string;
  notes?: string;
}

export interface InsurancePolicy {
  id: string;
  clientId: string;
  name: string;
  type: InsuranceType;
  providerId: string; // Changed to providerId to link to provider
  policyNumber: string;
  premium: number;
  premiumFrequency: "monthly" | "quarterly" | "yearly";
  startDate: string;
  endDate: string;
  nextPaymentDate: string;
  status: PolicyStatus;
  coverageAmount: number;
  reminderSettings: ReminderSettings;
  notes?: string;
  lastReminderSent?: string;
  remindersSentCount?: number;
}

export const reminderIntervalLabels: Record<ReminderInterval, string> = {
  "1day": "1 Day Before",
  "3days": "3 Days Before",
  "1week": "1 Week Before",
  "2weeks": "2 Weeks Before",
  "1month": "1 Month Before",
  "2months": "2 Months Before",
};

export const reminderIntervalDays: Record<ReminderInterval, number> = {
  "1day": 1,
  "3days": 3,
  "1week": 7,
  "2weeks": 14,
  "1month": 30,
  "2months": 60,
};

export const defaultReminderSettings: ReminderSettings = {
  enabled: true,
  intervals: ["1day", "1week", "1month"],
  notifyVia: ["email", "sms"],
};

export const mockClients: Client[] = [
  {
    id: "c1",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@email.com",
    phone: "+91 98765 43210",
    address: "123 MG Road, Mumbai, Maharashtra",
    createdAt: "2023-06-15",
  },
  {
    id: "c2",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91 87654 32109",
    address: "456 Park Street, Delhi",
    createdAt: "2023-08-20",
  },
  {
    id: "c3",
    name: "Amit Patel",
    email: "amit.patel@email.com",
    phone: "+91 76543 21098",
    address: "789 Lake View, Bangalore",
    createdAt: "2024-01-10",
  },
  {
    id: "c4",
    name: "Sunita Desai",
    email: "sunita.desai@email.com",
    phone: "+91 65432 10987",
    address: "321 Garden City, Pune",
    createdAt: "2024-03-05",
  },
  {
    id: "c5",
    name: "Vikram Singh",
    email: "vikram.singh@email.com",
    phone: "+91 54321 09876",
    address: "654 Hill Road, Jaipur",
    createdAt: "2024-05-12",
  },
];

// Helper to generate dates relative to today
const getDateFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

export const mockProviders: InsuranceProvider[] = [
  {
    id: "p1",
    name: "HDFC Ergo",
    email: "info@hdfcergo.com",
    phone: "+91 1800 123 0123",
    website: "www.hdfcergo.com",
    createdAt: "2024-01-01",
  },
  {
    id: "p2",
    name: "ICICI Lombard",
    email: "support@icicilombard.com",
    phone: "+91 1860 500 5555",
    website: "www.icicilombard.com",
    createdAt: "2024-01-01",
  },
  {
    id: "p3",
    name: "Bajaj Allianz",
    email: "support@bajajallianz.com",
    phone: "+91 1800 209 0144",
    website: "www.bajajallianz.com",
    createdAt: "2024-01-01",
  },
  {
    id: "p4",
    name: "LIC",
    email: "info@licindia.com",
    phone: "+91 1800 22 5959",
    website: "www.licindia.com",
    createdAt: "2024-01-01",
  },
  {
    id: "p5",
    name: "Tata AIG",
    email: "customercare@tataaig.com",
    phone: "+91 1800 22 9408",
    website: "www.tataaig.com",
    createdAt: "2024-01-01",
  },
  {
    id: "p6",
    name: "Star Health",
    email: "support@starhealth.in",
    phone: "+91 1800 425 2255",
    website: "www.starhealth.in",
    createdAt: "2024-01-01",
  },
  {
    id: "p7",
    name: "New India Assurance",
    email: "customercare@newindia.co.in",
    phone: "+91 1800 11 2378",
    website: "www.newindia.co.in",
    createdAt: "2024-01-01",
  },
  {
    id: "p8",
    name: "Royal Sundaram",
    email: "customersupport@royalsundaram.com",
    phone: "+91 1800 22 0000",
    website: "www.royalsundaram.com",
    createdAt: "2024-01-01",
  },
  {
    id: "p9",
    name: "Max Bupa",
    email: "customercare@maxbupa.com",
    phone: "+91 1800 102 1111",
    website: "www.maxbupa.com",
    createdAt: "2024-01-01",
  },
  {
    id: "p10",
    name: "SBI General",
    email: "support@sbigeneral.com",
    phone: "+91 1800 22 7272",
    website: "www.sbigeneral.com",
    createdAt: "2024-01-01",
  },
];

export const mockPolicies: InsurancePolicy[] = [
  {
    id: "1",
    clientId: "c1",
    name: "Family Health Plan",
    type: "health",
    providerId: "p1",
    policyNumber: "HS-2024-001234",
    premium: 25000,
    premiumFrequency: "yearly",
    startDate: "2024-01-01",
    endDate: getDateFromNow(45),
    nextPaymentDate: getDateFromNow(1),
    status: "active",
    coverageAmount: 500000,
    reminderSettings: {
      enabled: true,
      intervals: ["1day", "3days", "1week", "1month"],
      notifyVia: ["email", "sms", "whatsapp"],
    },
    notes: "Family floater policy covering spouse and 2 children",
  },
  {
    id: "2",
    clientId: "c1",
    name: "Motor Insurance - Honda City",
    type: "auto",
    providerId: "p2",
    policyNumber: "AU-2024-005678",
    premium: 12000,
    premiumFrequency: "yearly",
    startDate: "2024-03-15",
    endDate: getDateFromNow(90),
    nextPaymentDate: getDateFromNow(3),
    status: "active",
    coverageAmount: 800000,
    reminderSettings: {
      enabled: true,
      intervals: ["1day", "1week", "2weeks"],
      notifyVia: ["sms"],
    },
  },
  {
    id: "3",
    clientId: "c2",
    name: "Home Insurance",
    type: "home",
    providerId: "p3",
    policyNumber: "HO-2023-009012",
    premium: 8000,
    premiumFrequency: "yearly",
    startDate: "2023-06-01",
    endDate: getDateFromNow(120),
    nextPaymentDate: getDateFromNow(5),
    status: "active",
    coverageAmount: 3500000,
    reminderSettings: {
      enabled: true,
      intervals: ["3days", "1week", "1month"],
      notifyVia: ["email", "whatsapp"],
    },
  },
  {
    id: "4",
    clientId: "c3",
    name: "Term Life Insurance",
    type: "life",
    providerId: "p4",
    policyNumber: "LF-2022-003456",
    premium: 15000,
    premiumFrequency: "yearly",
    startDate: "2022-01-01",
    endDate: "2032-01-01",
    nextPaymentDate: getDateFromNow(12),
    status: "active",
    coverageAmount: 10000000,
    reminderSettings: {
      enabled: true,
      intervals: ["1week", "2weeks", "1month", "2months"],
      notifyVia: ["email", "sms"],
    },
    notes: "25 year term policy with critical illness rider",
  },
  {
    id: "5",
    clientId: "c4",
    name: "Travel Insurance",
    type: "travel",
    providerId: "p5",
    policyNumber: "TR-2024-007890",
    premium: 5000,
    premiumFrequency: "yearly",
    startDate: "2024-07-01",
    endDate: getDateFromNow(-10),
    nextPaymentDate: getDateFromNow(-10),
    status: "expired",
    coverageAmount: 1000000,
    reminderSettings: {
      enabled: false,
      intervals: ["1week"],
      notifyVia: ["email"],
    },
  },
  {
    id: "6",
    clientId: "c2",
    name: "Health Insurance - Individual",
    type: "health",
    providerId: "p6",
    policyNumber: "HS-2024-002345",
    premium: 18000,
    premiumFrequency: "yearly",
    startDate: "2024-02-15",
    endDate: getDateFromNow(180),
    nextPaymentDate: getDateFromNow(25),
    status: "active",
    coverageAmount: 300000,
    reminderSettings: {
      enabled: true,
      intervals: ["1day", "1week", "1month"],
      notifyVia: ["email", "sms"],
    },
  },
  {
    id: "7",
    clientId: "c5",
    name: "Business Insurance",
    type: "business",
    providerId: "p7",
    policyNumber: "BI-2024-008901",
    premium: 45000,
    premiumFrequency: "yearly",
    startDate: "2024-04-01",
    endDate: getDateFromNow(60),
    nextPaymentDate: getDateFromNow(7),
    status: "active",
    coverageAmount: 5000000,
    reminderSettings: {
      enabled: true,
      intervals: ["1day", "3days", "1week", "2weeks", "1month"],
      notifyVia: ["email", "sms", "whatsapp"],
    },
    notes: "Comprehensive business coverage including fire and theft",
  },
  {
    id: "8",
    clientId: "c3",
    name: "Motor Insurance - Maruti Swift",
    type: "auto",
    providerId: "p8",
    policyNumber: "AU-2024-006789",
    premium: 8500,
    premiumFrequency: "yearly",
    startDate: "2024-05-01",
    endDate: getDateFromNow(100),
    nextPaymentDate: getDateFromNow(45),
    status: "active",
    coverageAmount: 600000,
    reminderSettings: {
      enabled: true,
      intervals: ["1week", "1month"],
      notifyVia: ["sms"],
    },
  },
  {
    id: "9",
    clientId: "c4",
    name: "Critical Illness Cover",
    type: "health",
    providerId: "p9",
    policyNumber: "HS-2024-003456",
    premium: 32000,
    premiumFrequency: "yearly",
    startDate: "2024-06-01",
    endDate: getDateFromNow(75),
    nextPaymentDate: getDateFromNow(0),
    status: "active",
    coverageAmount: 1500000,
    reminderSettings: {
      enabled: true,
      intervals: ["1day", "3days", "1week"],
      notifyVia: ["email", "whatsapp"],
    },
    notes: "Covers 36 critical illnesses",
  },
  {
    id: "10",
    clientId: "c5",
    name: "Personal Accident Cover",
    type: "life",
    providerId: "p10",
    policyNumber: "PA-2024-007890",
    premium: 6000,
    premiumFrequency: "yearly",
    startDate: "2024-04-15",
    endDate: getDateFromNow(55),
    nextPaymentDate: getDateFromNow(14),
    status: "active",
    coverageAmount: 2000000,
    reminderSettings: {
      enabled: true,
      intervals: ["1week", "2weeks", "1month"],
      notifyVia: ["sms"],
    },
  },
];

export const getStatusColor = (status: PolicyStatus) => {
  switch (status) {
    case "active":
      return "bg-success/10 text-success-foreground border-success/20";
    case "expiring-soon":
      return "bg-warning/10 text-warning-foreground border-warning/20";
    case "expired":
      return "bg-destructive/10 text-destructive border-destructive/20";
  }
};

export const getTypeIcon = (type: InsuranceType) => {
  switch (type) {
    case "health":
      return "Heart";
    case "auto":
      return "Car";
    case "home":
      return "Home";
    case "life":
      return "Shield";
    case "travel":
      return "Plane";
    case "business":
      return "Building2";
  }
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const getDaysUntil = (dateString: string) => {
  const today = new Date();
  const date = new Date(dateString);
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getClientById = (clients: Client[], clientId: string) => {
  return clients.find((c) => c.id === clientId);
};

export const getProviderById = (providers: InsuranceProvider[], providerId: string) => {
  return providers.find((p) => p.id === providerId);
};

export const getPoliciesByClient = (policies: InsurancePolicy[], clientId: string) => {
  return policies.filter((p) => p.clientId === clientId);
};

export interface ReminderItem {
  policy: InsurancePolicy;
  client: Client;
  provider?: InsuranceProvider;
  daysUntil: number;
  reminderType: "payment" | "expiry";
  dueDate: string;
}

export const REMINDER_FILTER_OPTIONS = [
  { value: "all", label: "All Upcoming", minDays: 0, maxDays: 90 },
  { value: "1day", label: "Due in 1 Day", minDays: 0, maxDays: 1 },
  { value: "3days", label: "Due in 3 Days", minDays: 0, maxDays: 3 },
  { value: "7days", label: "Due in 7 Days", minDays: 0, maxDays: 7 },
  { value: "14days", label: "Due in 2 Weeks", minDays: 0, maxDays: 14 },
  { value: "30days", label: "Due in 30 Days", minDays: 0, maxDays: 30 },
  { value: "60days", label: "Due in 60 Days", minDays: 0, maxDays: 60 },
];

export const getRemindersForFilter = (
  policies: InsurancePolicy[],
  clients: Client[],
  filterValue: string
): ReminderItem[] => {
  const filter = REMINDER_FILTER_OPTIONS.find(f => f.value === filterValue) || REMINDER_FILTER_OPTIONS[0];
  const reminders: ReminderItem[] = [];

  policies
    .filter((p) => p.status !== "expired")
    .forEach((policy) => {
      const client = getClientById(clients, policy.clientId);
      if (!client) return;

      const daysUntilPayment = getDaysUntil(policy.nextPaymentDate);
      const daysUntilExpiry = getDaysUntil(policy.endDate);

      // Check payment due date
      if (daysUntilPayment >= filter.minDays && daysUntilPayment <= filter.maxDays) {
        reminders.push({
          policy,
          client,
          daysUntil: daysUntilPayment,
          reminderType: "payment",
          dueDate: policy.nextPaymentDate,
        });
      }

      // Check expiry date (only if different from payment date)
      if (
        daysUntilExpiry >= filter.minDays &&
        daysUntilExpiry <= filter.maxDays &&
        policy.endDate !== policy.nextPaymentDate
      ) {
        reminders.push({
          policy,
          client,
          daysUntil: daysUntilExpiry,
          reminderType: "expiry",
          dueDate: policy.endDate,
        });
      }
    });

  return reminders.sort((a, b) => a.daysUntil - b.daysUntil);
};

export const generateWhatsAppMessage = (reminder: ReminderItem, agentName: string = "Your Insurance Advisor", qrCodeUrl?: string): string => {
  const { policy, client, provider, daysUntil, reminderType } = reminder;
  const dueText = daysUntil === 0 ? "today" : daysUntil === 1 ? "tomorrow" : `in ${daysUntil} days`;
  const dueDate = formatDate(reminderType === "payment" ? policy.nextPaymentDate : policy.endDate);
  const providerName = provider?.name || "Insurance Provider";

  if (reminderType === "payment") {
    return `Dear ${client.name},

This is a friendly reminder that your *${policy.name}* premium payment of *${formatCurrency(policy.premium)}* is due ${dueText} (${dueDate}).

*Policy Details:*
• Policy No: ${policy.policyNumber}
• Provider: ${providerName}
• Type: ${policy.type.charAt(0).toUpperCase() + policy.type.slice(1)} Insurance
• Coverage: ${formatCurrency(policy.coverageAmount)}

Please ensure timely payment to keep your policy active and maintain continuous coverage.
${qrCodeUrl ? "\n📱 Scan the QR code below for quick payment" : ""}

For any assistance, feel free to contact me.

Regards,
${agentName}`;
  } else {
    return `Dear ${client.name},

This is a reminder that your *${policy.name}* policy is due for renewal ${dueText} (${dueDate}).

*Policy Details:*
• Policy No: ${policy.policyNumber}
• Provider: ${providerName}
• Type: ${policy.type.charAt(0).toUpperCase() + policy.type.slice(1)} Insurance
• Current Premium: ${formatCurrency(policy.premium)} (${policy.premiumFrequency})
• Coverage: ${formatCurrency(policy.coverageAmount)}

I recommend renewing before expiry to:
✓ Avoid coverage gaps
✓ Maintain no-claim benefits
✓ Ensure continuous protection

Please contact me to discuss renewal options.

Regards,
${agentName}`;
  }
};

export const generateEmailSubject = (reminder: ReminderItem): string => {
  const { policy, daysUntil, reminderType } = reminder;
  const urgency = daysUntil <= 3 ? "URGENT: " : daysUntil <= 7 ? "Reminder: " : "";

  if (reminderType === "payment") {
    return `${urgency}Premium Payment Due - ${policy.name} (${policy.policyNumber})`;
  } else {
    return `${urgency}Policy Renewal Due - ${policy.name} (${policy.policyNumber})`;
  }
};

export const generateEmailBody = (reminder: ReminderItem, agentName: string = "Your Insurance Advisor", agentPhone: string = "", qrCodeUrl?: string): string => {
  const { policy, client, provider, daysUntil, reminderType } = reminder;
  const dueText = daysUntil === 0 ? "today" : daysUntil === 1 ? "tomorrow" : `in ${daysUntil} days`;
  const dueDate = formatDate(reminderType === "payment" ? policy.nextPaymentDate : policy.endDate);
  const providerName = provider?.name || "Insurance Provider";

  if (reminderType === "payment") {
    return `Dear ${client.name},

I hope this email finds you well.

This is a friendly reminder that your insurance premium payment is due ${dueText}.

PAYMENT DETAILS
────────────────────────────────────────
Policy Name:     ${policy.name}
Policy Number:   ${policy.policyNumber}
Insurance Type:  ${policy.type.charAt(0).toUpperCase() + policy.type.slice(1)}
Provider:        ${providerName}
Premium Amount:  ${formatCurrency(policy.premium)}
Due Date:        ${dueDate}
Coverage:        ${formatCurrency(policy.coverageAmount)}
────────────────────────────────────────

Please ensure timely payment to maintain continuous coverage and avoid any policy lapse.
${qrCodeUrl ? "\n📱 [Quick Payment QR Code attached] - Scan to pay instantly" : ""}

If you have already made the payment, please disregard this reminder.

For any questions or assistance, please don't hesitate to reach out.

Best regards,
${agentName}${agentPhone ? `\nPhone: ${agentPhone}` : ""}`;
  } else {
    return `Dear ${client.name},

I hope this email finds you well.

This is a reminder that your insurance policy is due for renewal ${dueText}.

POLICY DETAILS
────────────────────────────────────────
Policy Name:     ${policy.name}
Policy Number:   ${policy.policyNumber}
Insurance Type:  ${policy.type.charAt(0).toUpperCase() + policy.type.slice(1)}
Provider:        ${providerName}
Renewal Date:    ${dueDate}
Current Premium: ${formatCurrency(policy.premium)} (${policy.premiumFrequency})
Coverage:        ${formatCurrency(policy.coverageAmount)}
────────────────────────────────────────

Benefits of timely renewal:
• No gap in coverage protection
• Preserve your no-claim bonus
• Avoid re-underwriting requirements
• Maintain policy continuity

${qrCodeUrl ? "📱 [Quick Payment QR Code attached] - Scan to initiate renewal\n" : ""}I would be happy to assist you with reviewing your current coverage and exploring renewal options.

Please contact me at your earliest convenience to ensure uninterrupted protection.

Best regards,
${agentName}${agentPhone ? `\nPhone: ${agentPhone}` : ""}`;
  }
};

export const getWhatsAppUrl = (phone: string, message: string): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

export const getEmailUrl = (email: string, subject: string, body: string): string => {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
};

export const calculateNextPaymentDate = (
  currentDueDate: string,
  frequency: "monthly" | "quarterly" | "yearly"
): string => {
  const date = new Date(currentDueDate);
  switch (frequency) {
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date.toISOString().split("T")[0];
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
