"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Plus, Users, FileText, AlertTriangle, Clock, Settings, BarChart3, History } from "lucide-react";
import { Header } from "@/components/insurance/header";
import { InteractiveStats } from "@/components/insurance/interactive-stats";
import { ReminderList } from "@/components/insurance/reminder-list";
import { AddClientDialog } from "@/components/insurance/add-client-dialog";
import { AddPolicyDialog } from "@/components/insurance/add-policy-dialog";
import {
  REMINDER_FILTER_OPTIONS,
  getRemindersForFilter,
  mockClients,
  mockPolicies,
  InsurancePolicy,
  Client,
  PaymentLog,
  calculateClientRiskLevel,
} from "@/lib/insurance-data";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reminderFilter, setReminderFilter] = useState("7days");
  const [policies, setPolicies] = useState<InsurancePolicy[]>(mockPolicies);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [addPolicyOpen, setAddPolicyOpen] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(currentUser));

    // Load from localStorage or use mock data
    const storedPolicies = localStorage.getItem("policies");
    const storedClients = localStorage.getItem("clients");
    const storedPayments = localStorage.getItem("paymentLogs");

    if (storedPolicies) setPolicies(JSON.parse(storedPolicies));
    if (storedClients) setClients(JSON.parse(storedClients));
    if (storedPayments) setPaymentLogs(JSON.parse(storedPayments));
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const reminders = getRemindersForFilter(policies, clients, reminderFilter);

  // Calculate high-risk clients
  const highRiskClients = clients.filter(
    (client) => calculateClientRiskLevel(paymentLogs, client.id) === "high"
  );

  const stats = {
    totalClients: clients.length,
    totalPolicies: policies.filter((p) => p.status !== "expired").length,
    urgentReminders: getRemindersForFilter(policies, clients, "3days").length,
    dueThisWeek: getRemindersForFilter(policies, clients, "7days").length,
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  const handleAddClient = (client: Client) => {
    setClients((prev) => {
      const updated = [...prev, client];
      localStorage.setItem("clients", JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddPolicy = (policy: InsurancePolicy) => {
    setPolicies((prev) => {
      const updated = [...prev, policy];
      localStorage.setItem("policies", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        agentName={user.name}
        onSettingsClick={() => {}}
        pendingReminders={stats.urgentReminders}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Action Bar */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <div className="flex gap-3">
            <Button 
              onClick={() => setAddClientOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
            <Button 
              onClick={() => setAddPolicyOpen(true)}
              variant="secondary"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Policy
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/providers")}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Providers
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/analytics")}
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/payments-history")}
              className="gap-2"
            >
              <History className="w-4 h-4" />
              Payments
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <InteractiveStats
          totalClients={stats.totalClients}
          totalPolicies={stats.totalPolicies}
          urgentReminders={stats.urgentReminders}
          dueThisWeek={stats.dueThisWeek}
          onClientClick={() => router.push("/clients-manage")}
          onPoliciesClick={() => router.push("/policies-manage")}
          onUrgentClick={() => setReminderFilter("3days")}
          onDueWeekClick={() => setReminderFilter("7days")}
        />

        {/* Smart Recommendations */}
        {highRiskClients.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Payment Risk Alert</h3>
                <p className="text-sm text-red-800 mt-1">
                  {highRiskClients.length} client{highRiskClients.length !== 1 ? "s" : ""} have consistent late payment patterns.
                  Consider sending early reminders to prevent future delays.
                </p>
                <Button
                  size="sm"
                  className="mt-3 bg-red-600 hover:bg-red-700"
                  onClick={() => router.push("/analytics")}
                >
                  View Payment Analytics
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reminders */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">Reminders Hub</h2>
            <Select value={reminderFilter} onValueChange={setReminderFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ReminderList
            reminders={reminders}
            agentName={user.name}
            agentPhone="+91 XXXXX XXXXX"
            onMarkSent={() => {}}
            onMarkPaymentReceived={() => {}}
          />
        </div>
      </main>

      {/* Add Client Dialog */}
      <AddClientDialog
        open={addClientOpen}
        onOpenChange={setAddClientOpen}
        onAddClient={handleAddClient}
      />

      {/* Add Policy Dialog */}
      <AddPolicyDialog
        open={addPolicyOpen}
        onOpenChange={setAddPolicyOpen}
        onAddPolicy={handleAddPolicy}
        clients={clients}
      />
    </div>
  );
}
