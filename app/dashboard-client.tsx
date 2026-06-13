'use client'

import { useState, useEffect } from 'react'
import { Plus, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Header } from '@/components/insurance/header'
import { StatsCards } from '@/components/insurance/stats-cards'
import { ReminderList } from '@/components/insurance/reminder-list'
import { AddClientDialog } from '@/components/insurance/add-client-dialog'
import { AddPolicyDialog } from '@/components/insurance/add-policy-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, RotateCcw } from 'lucide-react'
import {
  REMINDER_FILTER_OPTIONS,
  getRemindersForFilter,
} from '@/lib/insurance-data'
import {
  getClients,
  getPolicies,
  createClient,
  createPolicy,
  logReminderSent,
  logPaymentReceived,
  saveAgentSettings,
  getAgentSettings,
} from '@/app/actions/insurance'
import { authClient } from '@/lib/auth-client'

export default function DashboardClient() {
  const [clients, setClients] = useState([])
  const [policies, setPolicies] = useState([])
  const [reminderFilter, setReminderFilter] = useState('7days')
  const [agentName, setAgentName] = useState('Your Name')
  const [agentPhone, setAgentPhone] = useState('+91 XXXXX XXXXX')
  const [tempAgentName, setTempAgentName] = useState(agentName)
  const [tempAgentPhone, setTempAgentPhone] = useState(agentPhone)

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [addClientOpen, setAddClientOpen] = useState(false)
  const [addPolicyOpen, setAddPolicyOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [clientsData, policiesData, settingsData] = await Promise.all([
          getClients(),
          getPolicies(),
          getAgentSettings(),
        ])
        setClients(clientsData || [])
        setPolicies(policiesData || [])
        if (settingsData) {
          setAgentName(settingsData.agentName || 'Your Name')
          setAgentPhone(settingsData.agentPhone || '+91 XXXXX XXXXX')
          setTempAgentName(settingsData.agentName || 'Your Name')
          setTempAgentPhone(settingsData.agentPhone || '+91 XXXXX XXXXX')
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const reminders = getRemindersForFilter(policies, clients, reminderFilter)

  const stats = {
    totalClients: clients.length,
    totalPolicies: policies.filter((p) => p.status !== 'expired').length,
    urgentReminders: getRemindersForFilter(policies, clients, '3days').length,
    dueThisWeek: getRemindersForFilter(policies, clients, '7days').length,
  }

  const handleAddClient = async (clientData) => {
    try {
      await createClient(clientData)
      const updatedClients = await getClients()
      setClients(updatedClients || [])
      setAddClientOpen(false)
    } catch (error) {
      console.error('Failed to create client:', error)
    }
  }

  const handleAddPolicy = async (policyData) => {
    try {
      await createPolicy(policyData)
      const updatedPolicies = await getPolicies()
      setPolicies(updatedPolicies || [])
      setAddPolicyOpen(false)
    } catch (error) {
      console.error('Failed to create policy:', error)
    }
  }

  const handleSaveSettings = async () => {
    try {
      await saveAgentSettings({
        agentName: tempAgentName,
        agentPhone: tempAgentPhone,
      })
      setAgentName(tempAgentName)
      setAgentPhone(tempAgentPhone)
      setSettingsOpen(false)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const handleLogout = async () => {
    await authClient.signOut()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        agentName={agentName}
        onSettingsClick={() => {
          setTempAgentName(agentName)
          setTempAgentPhone(agentPhone)
          setSettingsOpen(true)
        }}
        pendingReminders={stats.urgentReminders}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Insurance Reminder Hub</h1>
            <p className="text-muted-foreground">
              Manage client reminders and track policy renewals
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setAddClientOpen(true)} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Client
            </Button>
            <Button onClick={() => setAddPolicyOpen(true)} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Policy
            </Button>
          </div>
        </div>

        <StatsCards stats={stats} />

        <div className="mt-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium text-foreground mb-2 block">Filter by Due Date</Label>
              <Select value={reminderFilter} onValueChange={setReminderFilter}>
                <SelectTrigger className="w-full md:w-64">
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
          </div>

          {reminders.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center">
                {clients.length === 0 ? (
                  <div className="space-y-2">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground font-medium">No clients added yet</p>
                    <p className="text-sm text-muted-foreground">Add your first client to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-muted-foreground font-medium">No reminders for this period</p>
                    <p className="text-sm text-muted-foreground">All policies are up to date</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <ReminderList
              reminders={reminders}
              agentName={agentName}
              agentPhone={agentPhone}
              onReminderSent={async (policyId, sentVia, reminderType, dueDate, message) => {
                try {
                  await logReminderSent({
                    policyId,
                    clientId: reminders.find((r) => r.policy.id === policyId)?.client.id || '',
                    sentVia,
                    reminderType,
                    dueDate,
                    message,
                  })
                  const updatedPolicies = await getPolicies()
                  setPolicies(updatedPolicies || [])
                } catch (error) {
                  console.error('Failed to log reminder:', error)
                }
              }}
              onPaymentReceived={async (policyId, newDueDate, previousDueDate, amount, notes) => {
                try {
                  await logPaymentReceived({
                    policyId,
                    clientId: reminders.find((r) => r.policy.id === policyId)?.client.id || '',
                    amount,
                    previousDueDate,
                    newDueDate,
                    notes,
                  })
                  const updatedPolicies = await getPolicies()
                  setPolicies(updatedPolicies || [])
                } catch (error) {
                  console.error('Failed to log payment:', error)
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Manage your profile and account settings</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="agentName">Your Name</Label>
              <Input
                id="agentName"
                value={tempAgentName}
                onChange={(e) => setTempAgentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agentPhone">Your Phone</Label>
              <Input
                id="agentPhone"
                value={tempAgentPhone}
                onChange={(e) => setTempAgentPhone(e.target.value)}
              />
            </div>

            <div className="border-t pt-4 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
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
  )
}

import { Card, CardContent } from '@/components/ui/card'
