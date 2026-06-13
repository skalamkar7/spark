"use client";

import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DemoPage() {
  const [reminderFilter, setReminderFilter] = useState("7days");
  const [agentName] = useState("Demo Agent");
  const [agentPhone] = useState("+91 XXXXX XXXXX");

  const policies = mockPolicies;
  const clients = mockClients;

  const reminders = getRemindersForFilter(policies, clients, reminderFilter);

  const stats = {
    totalClients: clients.length,
    totalPolicies: policies.filter((p) => p.status !== "expired").length,
    urgentReminders: getRemindersForFilter(policies, clients, "3days").length,
    dueThisWeek: getRemindersForFilter(policies, clients, "7days").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        agentName={agentName}
        onSettingsClick={() => {}}
        pendingReminders={stats.urgentReminders}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Demo Banner */}
        <Card className="border-accent bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground mb-2">Demo Mode Active</h2>
                <p className="text-sm text-muted-foreground">
                  You are viewing demo data. Use the credentials below to test the app with real authentication.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Credentials for Testing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Email:</p>
                  <code className="text-sm bg-background p-2 rounded block font-mono">demo@example.com</code>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Password:</p>
                  <code className="text-sm bg-background p-2 rounded block font-mono">Demo@12345</code>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Alternative Email:</p>
                  <code className="text-sm bg-background p-2 rounded block font-mono">agent@insurance.com</code>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Password:</p>
                  <code className="text-sm bg-background p-2 rounded block font-mono">Agent@2024</code>
                </div>
              </div>
              <Button className="w-full" onClick={() => window.location.href = '/sign-in'}>
                Go to Sign In Page
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Reminders Filter and List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">Reminders Hub</h2>
            <select
              value={reminderFilter}
              onChange={(e) => setReminderFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              {REMINDER_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <ReminderList
            reminders={reminders}
            agentName={agentName}
            agentPhone={agentPhone}
            onMarkSent={() => {}}
            onMarkPaymentReceived={() => {}}
          />
        </div>

        {/* Feature Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ View all client policies and upcoming due dates</li>
              <li>✓ Filter reminders by 1 day, 3 days, 7 days, 2 weeks, 30 days, 60 days</li>
              <li>✓ Copy ready-made WhatsApp and Email messages</li>
              <li>✓ Mark reminders as sent</li>
              <li>✓ Track payment receipts and update due dates</li>
              <li>✓ Persistent data storage with Neon PostgreSQL</li>
              <li>✓ Multi-user support with secure authentication</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
