"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Header } from "@/components/insurance/header";
import { StatsCards } from "@/components/insurance/stats-cards";
import { ReminderList } from "@/components/insurance/reminder-list";
import {
  REMINDER_FILTER_OPTIONS,
  getRemindersForFilter,
  mockClients,
  mockPolicies,
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

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(currentUser));
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

  const policies = mockPolicies;
  const clients = mockClients;
  const reminders = getRemindersForFilter(policies, clients, reminderFilter);

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

  return (
    <div className="min-h-screen bg-background">
      <Header
        agentName={user.name}
        onSettingsClick={() => {}}
        pendingReminders={stats.urgentReminders}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Logout Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Stats */}
        <StatsCards
          totalClients={stats.totalClients}
          totalPolicies={stats.totalPolicies}
          urgentReminders={stats.urgentReminders}
          dueThisWeek={stats.dueThisWeek}
        />

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
    </div>
  );
}
