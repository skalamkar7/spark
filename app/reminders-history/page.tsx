"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, Calendar, Mail, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ReminderHistory,
  InsurancePolicy,
  Client,
  mockClients,
  mockPolicies,
  getClientById,
  formatDate,
} from "@/lib/insurance-data";

const reminderChannelIcons = {
  email: Mail,
  sms: Phone,
  whatsapp: MessageSquare,
};

export default function RemindersHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reminders, setReminders] = useState<ReminderHistory[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(currentUser));

    const storedReminders = localStorage.getItem("reminderHistory");
    const storedClients = localStorage.getItem("clients");
    const storedPolicies = localStorage.getItem("policies");

    setReminders(storedReminders ? JSON.parse(storedReminders) : []);
    setClients(storedClients ? JSON.parse(storedClients) : mockClients);
    setPolicies(storedPolicies ? JSON.parse(storedPolicies) : mockPolicies);
  }, [router]);

  const filteredReminders = useMemo(() => {
    let filtered = reminders;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((reminder) => {
        const client = getClientById(clients, reminder.clientId);
        const policy = policies.find((p) => p.id === reminder.policyId);
        return (
          client?.name.toLowerCase().includes(term) ||
          policy?.name.toLowerCase().includes(term)
        );
      });
    }

    // Filter by reminder type
    if (filterType !== "all") {
      filtered = filtered.filter((r) => r.reminderType === filterType);
    }

    // Filter by channel
    if (filterChannel !== "all") {
      filtered = filtered.filter((r) => r.sentVia === filterChannel);
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter((r) => r.sentAt >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter((r) => r.sentAt <= dateTo);
    }

    return filtered.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }, [reminders, searchTerm, filterType, filterChannel, dateFrom, dateTo, clients, policies]);

  const stats = {
    totalReminders: reminders.length,
    paymentReminders: reminders.filter((r) => r.reminderType === "payment").length,
    expiryReminders: reminders.filter((r) => r.reminderType === "expiry").length,
    earlyReminders: reminders.filter((r) => r.wasEarlyReminder).length,
  };

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Reminders History</h1>
            <span className="ml-auto text-muted-foreground">
              {filteredReminders.length} reminders
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalReminders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Payment Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.paymentReminders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Expiry Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.expiryReminders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Early Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-600">{stats.earlyReminders}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Search</label>
                <Input
                  placeholder="Client name, policy..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="payment">Payment Reminders</option>
                  <option value="expiry">Expiry Reminders</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Channel</label>
                <select
                  value={filterChannel}
                  onChange={(e) => setFilterChannel(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="all">All Channels</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">From Date</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">To Date</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                    setFilterChannel("all");
                    setDateFrom("");
                    setDateTo("");
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reminders List */}
        <Card>
          <CardHeader>
            <CardTitle>Reminder Records</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredReminders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No reminders found</p>
            ) : (
              <div className="space-y-3">
                {filteredReminders.map((reminder) => {
                  const client = getClientById(clients, reminder.clientId);
                  const policy = policies.find((p) => p.id === reminder.policyId);
                  const ChannelIcon = reminderChannelIcons[reminder.sentVia];
                  return (
                    <div
                      key={reminder.id}
                      className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {ChannelIcon && <ChannelIcon className="w-4 h-4 text-muted-foreground" />}
                            <span className="font-semibold">{client?.name || "Unknown Client"}</span>
                            {reminder.wasEarlyReminder && (
                              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                Early Reminder ({reminder.earlyReminderDaysAdvance} days)
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{policy?.name}</p>
                          <p className="text-sm mt-2 line-clamp-2">{reminder.message}</p>
                          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                            <span>Sent: {formatDate(reminder.sentAt)}</span>
                            <span>Due: {formatDate(reminder.dueDate)}</span>
                            <span className="capitalize">
                              {reminder.reminderType === "payment" ? "Payment Due" : "Expiry Due"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm">
                          {ChannelIcon && <ChannelIcon className="w-4 h-4" />}
                          <span className="capitalize">{reminder.sentVia}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
