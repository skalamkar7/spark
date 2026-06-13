'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Settings,
  Users,
  FileText,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/insurance/header';
import { StatsCards } from '@/components/insurance/stats-cards';
import { ReminderList } from '@/components/insurance/reminder-list';
import { AddClientDialog } from '@/components/insurance/add-client-dialog';
import { AddPolicyDialog } from '@/components/insurance/add-policy-dialog';
import {
  InsurancePolicy,
  Client,
  mockPolicies,
  mockClients,
  REMINDER_FILTER_OPTIONS,
  getRemindersForFilter,
} from '@/lib/insurance-data';
import { useLocalStorage } from '@/lib/storage';

export default function InsuranceReminderDashboard() {
  const storage = useLocalStorage();
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [reminderFilter, setReminderFilter] = useState('7days');
  const [activeTab, setActiveTab] = useState('reminders');
  const [isLoading, setIsLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [addPolicyOpen, setAddPolicyOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [agentName, setAgentName] = useState('Your Name');
  const [agentPhone, setAgentPhone] = useState('+91 XXXXX XXXXX');
  const [tempAgentName, setTempAgentName] = useState(agentName);
  const [tempAgentPhone, setTempAgentPhone] = useState(agentPhone);

  useEffect(() => {
    const savedPolicies = storage.getPolicies();
    const savedClients = storage.getClients();
    setPolicies(savedPolicies);
    setClients(savedClients);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      storage.savePolicies(policies);
    }
  }, [policies]);

  useEffect(() => {
    if (!isLoading) {
      storage.saveClients(clients);
    }
  }, [clients]);

  const reminders = useMemo(
    () => getRemindersForFilter(policies, clients, reminderFilter),
    [policies, clients, reminderFilter]
  );

  const stats = useMemo(() => {
    const activePolicies = policies.filter((p) => p.status !== 'expired');
    const urgentReminders = getRemindersForFilter(policies, clients, '3days')
      .length;
    const weekReminders = getRemindersForFilter(policies, clients, '7days')
      .length;
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
              lastReminderSent: new Date().toISOString().split('T')[0],
              remindersSentCount: (p.remindersSentCount || 0) + 1,
            }
          : p
      )
    );
  };

  const handleMarkPaymentReceived = (
    policyId: string,
    newDueDate: string
  ) => {
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

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Reminder Hub
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage client policy reminders and track notifications
              </p>
            </div>
            <DropdownMenu>
              <Button asChild>
                <span className="cursor-pointer flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add
                </span>
              </Button>
            </DropdownMenu>
          </div>

          <StatsCards
            totalClients={stats.totalClients}
            totalPolicies={stats.totalPolicies}
            urgentReminders={stats.urgentReminders}
            dueThisWeek={stats.dueThisWeek}
          />

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Reminders</CardTitle>
                  <CardDescription>
                    View and send reminders to clients
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Select value={reminderFilter} onValueChange={setReminderFilter}>
                    <SelectTrigger className="w-full sm:w-48">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddClientOpen(true)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Client
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddPolicyOpen(true)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Policy
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {reminders.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    {clients.length === 0
                      ? 'No clients added yet. Add your first client to get started.'
                      : 'No reminders for this period. Great job staying on top of things!'}
                  </p>
                  {clients.length === 0 && (
                    <Button onClick={() => setAddClientOpen(true)}>
                      Add First Client
                    </Button>
                  )}
                </div>
              ) : (
                <ReminderList
                  reminders={reminders}
                  agentName={agentName}
                  agentPhone={agentPhone}
                  onMarkSent={handleMarkReminderSent}
                  onMarkPaymentReceived={handleMarkPaymentReceived}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>

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

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agent Settings</DialogTitle>
            <DialogDescription>
              Configure your profile settings
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
              <Label htmlFor="agentPhone">Phone Number</Label>
              <Input
                id="agentPhone"
                value={tempAgentPhone}
                onChange={(e) => setTempAgentPhone(e.target.value)}
                placeholder="Enter your phone"
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-3">Data Management</h4>
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
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Data Management</DialogTitle>
            <DialogDescription>Choose how to manage your data</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <Button
              className="w-full justify-start gap-2 h-auto p-3 flex-col items-start"
              variant="outline"
              onClick={handleLoadDemoData}
            >
              <span className="font-semibold text-sm">Load Demo Data</span>
              <span className="text-xs text-muted-foreground">
                See sample clients and policies
              </span>
            </Button>

            {(policies.length > 0 || clients.length > 0) && (
              <Button
                className="w-full justify-start gap-2 h-auto p-3 flex-col items-start border-destructive"
                variant="outline"
                onClick={handleResetAllData}
              >
                <span className="font-semibold text-sm text-destructive">
                  Clear All Data
                </span>
                <span className="text-xs text-muted-foreground">
                  Delete all clients and policies
                </span>
              </Button>
            )}

            <div className="bg-accent/10 p-3 rounded-lg flex gap-2">
              <AlertCircle className="w-4 h-4 text-accent-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-accent-foreground">
                Data is saved locally in your browser
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
