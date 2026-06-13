"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  Filter,
  Plus,
  Settings,
  Users,
  FileText,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/insurance/header";
import { StatsCards } from "@/components/insurance/stats-cards";
import { ReminderList } from "@/components/insurance/reminder-list";
import { AddClientDialog } from "@/components/insurance/add-client-dialog";
import { AddPolicyDialog } from "@/components/insurance/add-policy-dialog";
import {
  InsurancePolicy,
  Client,
  mockPolicies,
  mockClients,
  REMINDER_FILTER_OPTIONS,
  getRemindersForFilter,
  formatDate,
  formatCurrency,
  getPoliciesByClient,
} from "@/lib/insurance-data";

export default function InsuranceReminderDashboard() {
  const [policies, setPolicies] = useState<InsurancePolicy[]>(mockPolicies);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [reminderFilter, setReminderFilter] = useState("7days");
  const [activeTab, setActiveTab] = useState("reminders");

  // Dialog states
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [addPolicyOpen, setAddPolicyOpen] = useState(false);

  // Agent settings
  const [agentName, setAgentName] = useState("Rahul Verma");
  const [agentPhone, setAgentPhone] = useState("+91 99999 88888");
  const [tempAgentName, setTempAgentName] = useState(agentName);
  const [tempAgentPhone, setTempAgentPhone] = useState(agentPhone);

  // Get reminders based on selected filter
  const reminders = useMemo(() => {
    return getRemindersForFilter(policies, clients, reminderFilter);
  }, [policies, clients, reminderFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const activePolicies = policies.filter((p) => p.status !== "expired");
    const urgentReminders = getRemindersForFilter(
      policies,
      clients,
      "3days"
    ).length;
    const weekReminders = getRemindersForFilter(
      policies,
      clients,
      "7days"
    ).length;

    return {
      totalClients: clients.length,
      totalPolicies: activePolicies.length,
      urgentReminders,
      dueThisWeek: weekReminders,
    };
  }, [policies, clients]);

  const handleSaveSettings = () => {
    setAgentName(tempAgentName);
    setAgentPhone(tempAgentPhone);
    setSettingsOpen(false);
  };

  const handleAddClient = (client: Client) => {
    setClients((prev) => [...prev, client]);
  };

  const handleAddPolicy = (policy: InsurancePolicy) => {
    setPolicies((prev) => [...prev, policy]);
  };

  const handleMarkReminderSent = (policyId: string) => {
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === policyId
          ? {
              ...p,
              lastReminderSent: new Date().toISOString().split("T")[0],
              remindersSentCount: (p.remindersSentCount || 0) + 1,
            }
          : p
      )
    );
  };

  const handleMarkPaymentReceived = (policyId: string, newDueDate: string) => {
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === policyId
          ? {
              ...p,
              nextPaymentDate: newDueDate,
              lastReminderSent: undefined,
              remindersSentCount: 0,
            }
          : p
      )
    );
  };

  const currentFilter = REMINDER_FILTER_OPTIONS.find(
    (f) => f.value === reminderFilter
  );

  return (
    <div className="min-h-screen bg-background">
      <Header
        agentName={agentName}
        onSettingsClick={() => {
          setTempAgentName(agentName);
          setTempAgentPhone(agentPhone);
          setSettingsOpen(true);
        }}
        pendingReminders={stats.urgentReminders}
      />

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Page Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Insurance Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage clients, policies, and send reminders
            </p>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add New
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setAddClientOpen(true)}>
                  <Users className="w-4 h-4 mr-2" />
                  Add Client
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAddPolicyOpen(true)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Add Policy
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards
          totalClients={stats.totalClients}
          totalPolicies={stats.totalPolicies}
          urgentReminders={stats.urgentReminders}
          dueThisWeek={stats.dueThisWeek}
        />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="reminders" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Reminders</span>
              <span className="sm:hidden">Remind</span>
              {stats.urgentReminders > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                  {stats.urgentReminders}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2">
              <Users className="w-4 h-4" />
              Clients
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                {clients.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="policies" className="gap-2">
              <FileText className="w-4 h-4" />
              Policies
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                {policies.filter((p) => p.status !== "expired").length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Reminders Tab */}
          <TabsContent value="reminders">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Pending Reminders
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {reminders.length} reminder
                      {reminders.length !== 1 ? "s" : ""}{" "}
                      {currentFilter?.label.toLowerCase()}
                    </CardDescription>
                  </div>

                  {/* Filter Dropdown */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Filter className="w-4 h-4" />
                      <span className="hidden sm:inline">Show due in:</span>
                    </div>
                    <Select
                      value={reminderFilter}
                      onValueChange={setReminderFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select period" />
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
                </div>
              </CardHeader>

              <CardContent>
                <ReminderList
                  reminders={reminders}
                  agentName={agentName}
                  onMarkReminderSent={handleMarkReminderSent}
                  onMarkPaymentReceived={handleMarkPaymentReceived}
                />
              </CardContent>
            </Card>

            {/* Quick Stats by Period */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {REMINDER_FILTER_OPTIONS.filter((f) => f.value !== "all").map(
                (option) => {
                  const count = getRemindersForFilter(
                    policies,
                    clients,
                    option.value
                  ).length;
                  const isActive = reminderFilter === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setReminderFilter(option.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        isActive
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <p
                        className={`text-2xl font-bold ${isActive ? "text-primary" : "text-foreground"}`}
                      >
                        {count}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {option.label}
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      All Clients
                    </CardTitle>
                    <CardDescription>
                      {clients.length} registered client
                      {clients.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  <Button onClick={() => setAddClientOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Client
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients.map((client) => {
                    const clientPolicies = getPoliciesByClient(
                      policies,
                      client.id
                    ).filter((p) => p.status !== "expired");
                    return (
                      <div
                        key={client.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {client.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {client.phone} | {client.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">
                            {clientPolicies.length} Polic
                            {clientPolicies.length !== 1 ? "ies" : "y"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Since {formatDate(client.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {clients.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-medium text-foreground mb-1">
                        No clients yet
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add your first client to get started
                      </p>
                      <Button onClick={() => setAddClientOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Client
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      All Policies
                    </CardTitle>
                    <CardDescription>
                      {policies.filter((p) => p.status !== "expired").length}{" "}
                      active polic
                      {policies.filter((p) => p.status !== "expired").length !==
                      1
                        ? "ies"
                        : "y"}
                    </CardDescription>
                  </div>
                  <Button onClick={() => setAddPolicyOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Policy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {policies
                    .filter((p) => p.status !== "expired")
                    .map((policy) => {
                      const client = clients.find(
                        (c) => c.id === policy.clientId
                      );
                      return (
                        <div
                          key={policy.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground truncate">
                                {policy.name}
                              </h4>
                              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full capitalize">
                                {policy.type}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {policy.policyNumber} | {policy.provider}
                            </p>
                            {client && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Client: {client.name}
                              </p>
                            )}
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="font-semibold text-primary">
                              {formatCurrency(policy.premium)}
                              <span className="text-xs text-muted-foreground font-normal ml-1">
                                /{policy.premiumFrequency}
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Next due: {formatDate(policy.nextPaymentDate)}
                            </p>
                            {policy.lastReminderSent && (
                              <p className="text-xs text-green-600 mt-1">
                                Reminder sent:{" "}
                                {formatDate(policy.lastReminderSent)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {policies.filter((p) => p.status !== "expired").length ===
                    0 && (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-medium text-foreground mb-1">
                        No policies yet
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add your first policy to start tracking
                      </p>
                      <Button onClick={() => setAddPolicyOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Policy
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agent Settings</DialogTitle>
            <DialogDescription>
              Configure your profile settings. Your details will appear in
              reminder messages.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="agentName">Your Name</Label>
              <Input
                id="agentName"
                value={tempAgentName}
                onChange={(e) => setTempAgentName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agentPhone">Your Phone</Label>
              <Input
                id="agentPhone"
                value={tempAgentPhone}
                onChange={(e) => setTempAgentPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              These details will be used as the signature in all reminder
              messages.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
