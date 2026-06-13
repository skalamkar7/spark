"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Filter,
  Plus,
  Settings,
  Users,
  FileText,
  ChevronDown,
  RotateCcw,
  AlertCircle,
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
import { useLocalStorage } from "@/lib/storage";

export default function InsuranceReminderDashboard() {
  const storage = useLocalStorage();
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [reminderFilter, setReminderFilter] = useState("7days");
  const [activeTab, setActiveTab] = useState("reminders");
  const [isLoading, setIsLoading] = useState(true);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [addPolicyOpen, setAddPolicyOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const [agentName, setAgentName] = useState("Your Name");
  const [agentPhone, setAgentPhone] = useState("+91 XXXXX XXXXX");
  const [tempAgentName, setTempAgentName] = useState(agentName);
  const [tempAgentPhone, setTempAgentPhone] = useState(agentPhone);

  useEffect(() => {
    const savedPolicies = storage.getPolicies();
    const savedClients = storage.getClients();
    setPolicies(savedPolicies);
    setClients(savedClients);
    setIsLoading(false);
  }, [storage]);

  useEffect(() => {
    if (!isLoading) {
      storage.savePolicies(policies);
    }
  }, [policies, isLoading, storage]);

  useEffect(() => {
    if (!isLoading) {
      storage.saveClients(clients);
    }
  }, [clients, isLoading, storage]);

  const reminders = useMemo(() => {
    return getRemindersForFilter(policies, clients, reminderFilter);
  }, [policies, clients, reminderFilter]);

  const stats = useMemo(() => {
    const activePolicies = policies.filter((p) => p.status !== "expired");
    const urgentReminders = getRemindersForFilter(policies, clients, "3days").length;
    const weekReminders = getRemindersForFilter(policies, clients, "7days").length;

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

  const handleLoadDemoData = () => {
    setPolicies(mockPolicies);
    setClients(mockClients);
    setResetDialogOpen(false);
  };

  const handleResetAllData = () => {
    setPolicies([]);
    setClients([]);
    storage.clearAll();
    setResetDialogOpen(false);
  };

  const currentFilter = REMINDER_FILTER_OPTIONS.find((f) => f.value === reminderFilter);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your data...</p>
        </div>
      </div>
    );
  }

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Insurance Dashboard</h1>
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

        <StatsCards
          totalClients={stats.totalClients}
          totalPolicies={stats.totalPolicies}
          urgentReminders={stats.urgentReminders}
          dueThisWeek={stats.dueThisWeek}
        />

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
                      {reminders.length} reminder{reminders.length !== 1 ? "s" : ""}{" "}
                      {currentFilter?.label.toLowerCase()}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Filter className="w-4 h-4" />
                      <span className="hidden sm:inline">Show due in:</span>
                    </div>
                    <Select value={reminderFilter} onValueChange={setReminderFilter}>
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

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {REMINDER_FILTER_OPTIONS.filter((f) => f.value !== "all").map((option) => {
                const count = getRemindersForFilter(policies, clients, option.value).length;
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
                    <p className={`text-2xl font-bold ${isActive ? "text-primary" : "text-foreground"}`}>
                      {count}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{option.label}</p>
                  </button>
                );
              })}
            </div>
          </TabsContent>

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
                      {clients.length} registered client{clients.length !== 1 ? "s" : ""}
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
                    const clientPolicies = getPoliciesByClient(policies, client.id).filter(
                      (p) => p.status !== "expired"
                    );
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
                            <h4 className="font-semibold text-foreground">{client.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {client.phone} | {client.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">
                            {clientPolicies.length} Polic{clientPolicies.length !== 1 ? "ies" : "y"}
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
                      <h3 className="font-medium text-foreground mb-1">No clients yet</h3>
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
                      {policies.filter((p) => p.status !== "expired").length} active polic
                      {policies.filter((p) => p.status !== "expired").length !== 1 ? "ies" : "y"}
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
                      const client = clients.find((c) => c.id === policy.clientId);
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
                                Reminder sent: {formatDate(policy.lastReminderSent)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {policies.filter((p) => p.status !== "expired").length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-medium text-foreground mb-1">No policies yet</h3>
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

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agent Settings</DialogTitle>
            <DialogDescription>
              Configure your profile settings. Your details will appear in reminder messages.
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
              These details will be used as the signature in all reminder messages.
            </p>

            <div className="border-t pt-4 mt-6">
              <h4 className="font-semibold text-sm mb-3 text-foreground">Data Management</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setSettingsOpen(false);
                    setResetDialogOpen(true);
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Manage Data
                </Button>
                <p className="text-xs text-muted-foreground">
                  Load demo data, clear all data, or start fresh
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddClientDialog
        open={addClientOpen}
        onOpenChange={setAddClientOpen}
        onAddClient={handleAddClient}
      />

      <AddPolicyDialog
        open={addPolicyOpen}
        onOpenChange={setAddPolicyOpen}
        onAddPolicy={handleAddPolicy}
        clients={clients}
      />

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Data Management</DialogTitle>
            <DialogDescription>Choose how you want to manage your data</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <Button
              className="w-full justify-start gap-2 h-auto p-3 flex-col items-start"
              variant="outline"
              onClick={handleLoadDemoData}
            >
              <span className="font-semibold text-sm">Load Demo Data</span>
              <span className="text-xs text-muted-foreground">
                Reset to sample clients and policies to see the app in action
              </span>
            </Button>

            {(policies.length > 0 || clients.length > 0) && (
              <Button
                className="w-full justify-start gap-2 h-auto p-3 flex-col items-start border-destructive"
                variant="outline"
                onClick={handleResetAllData}
              >
                <span className="font-semibold text-sm text-destructive">Clear All Data</span>
                <span className="text-xs text-muted-foreground">
                  Delete all clients and policies (cannot be undone)
                </span>
              </Button>
            )}

            <div className="bg-accent/10 p-3 rounded-lg flex gap-2">
              <AlertCircle className="w-4 h-4 text-accent-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-accent-foreground">
                {policies.length === 0 && clients.length === 0
                  ? "Start fresh by adding clients and policies, or load demo data to explore features."
                  : "Your data is automatically saved to your browser. Clear data if you want to start fresh."}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
