"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InsurancePolicy,
  InsuranceType,
  Client,
  ReminderInterval,
  reminderIntervalLabels,
  defaultReminderSettings,
} from "@/lib/insurance-data";

interface AddPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPolicy: (policy: InsurancePolicy) => void;
  clients: Client[];
}

const allReminderIntervals: ReminderInterval[] = [
  "1day",
  "3days",
  "1week",
  "2weeks",
  "1month",
  "2months",
];

export function AddPolicyDialog({
  open,
  onOpenChange,
  onAddPolicy,
  clients,
}: AddPolicyDialogProps) {
  const [formData, setFormData] = useState({
    clientId: "",
    name: "",
    type: "health" as InsuranceType,
    provider: "",
    policyNumber: "",
    premium: "",
    premiumFrequency: "yearly" as "monthly" | "quarterly" | "yearly",
    startDate: "",
    endDate: "",
    nextPaymentDate: "",
    coverageAmount: "",
    notes: "",
    reminderEnabled: true,
    reminderIntervals: defaultReminderSettings.intervals as ReminderInterval[],
    notifyEmail: true,
    notifySms: true,
    notifyWhatsapp: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const notifyVia: ("email" | "sms" | "whatsapp")[] = [];
    if (formData.notifyEmail) notifyVia.push("email");
    if (formData.notifySms) notifyVia.push("sms");
    if (formData.notifyWhatsapp) notifyVia.push("whatsapp");

    const newPolicy: InsurancePolicy = {
      id: Date.now().toString(),
      clientId: formData.clientId,
      name: formData.name,
      type: formData.type,
      provider: formData.provider,
      policyNumber: formData.policyNumber,
      premium: parseFloat(formData.premium),
      premiumFrequency: formData.premiumFrequency,
      startDate: formData.startDate,
      endDate: formData.endDate,
      nextPaymentDate: formData.nextPaymentDate || formData.endDate,
      status: "active",
      coverageAmount: parseFloat(formData.coverageAmount),
      notes: formData.notes,
      reminderSettings: {
        enabled: formData.reminderEnabled,
        intervals: formData.reminderIntervals,
        notifyVia,
      },
    };

    onAddPolicy(newPolicy);
    onOpenChange(false);
    setFormData({
      clientId: "",
      name: "",
      type: "health",
      provider: "",
      policyNumber: "",
      premium: "",
      premiumFrequency: "yearly",
      startDate: "",
      endDate: "",
      nextPaymentDate: "",
      coverageAmount: "",
      notes: "",
      reminderEnabled: true,
      reminderIntervals: defaultReminderSettings.intervals as ReminderInterval[],
      notifyEmail: true,
      notifySms: true,
      notifyWhatsapp: false,
    });
  };

  const toggleReminderInterval = (interval: ReminderInterval) => {
    setFormData((prev) => ({
      ...prev,
      reminderIntervals: prev.reminderIntervals.includes(interval)
        ? prev.reminderIntervals.filter((i) => i !== interval)
        : [...prev.reminderIntervals, interval],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Policy</DialogTitle>
          <DialogDescription>
            Enter the client&apos;s policy details and configure reminder settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Client Selection */}
            <div className="grid gap-2">
              <Label htmlFor="client">Select Client *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) =>
                  setFormData({ ...formData, clientId: value })
                }
                required
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Policy Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Family Health Plan"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Insurance Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: InsuranceType) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="auto">Auto / Motor</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="life">Life</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="provider">Insurance Provider *</Label>
                <Input
                  id="provider"
                  placeholder="e.g., HDFC Ergo"
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({ ...formData, provider: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="policyNumber">Policy Number *</Label>
              <Input
                id="policyNumber"
                placeholder="e.g., HS-2024-001234"
                value={formData.policyNumber}
                onChange={(e) =>
                  setFormData({ ...formData, policyNumber: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="premium">Premium Amount (INR) *</Label>
                <Input
                  id="premium"
                  type="number"
                  placeholder="25000"
                  value={formData.premium}
                  onChange={(e) =>
                    setFormData({ ...formData, premium: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="frequency">Payment Frequency *</Label>
                <Select
                  value={formData.premiumFrequency}
                  onValueChange={(value: "monthly" | "quarterly" | "yearly") =>
                    setFormData({ ...formData, premiumFrequency: value })
                  }
                >
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Expiry Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nextPaymentDate">Next Payment Due</Label>
                <Input
                  id="nextPaymentDate"
                  type="date"
                  value={formData.nextPaymentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, nextPaymentDate: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="coverage">Coverage Amount (INR) *</Label>
                <Input
                  id="coverage"
                  type="number"
                  placeholder="500000"
                  value={formData.coverageAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, coverageAmount: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about the policy..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={2}
              />
            </div>

            {/* Reminder Settings Section */}
            <div className="border-t border-border pt-4 mt-2">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Reminder Settings</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reminderEnabled"
                    checked={formData.reminderEnabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, reminderEnabled: checked as boolean })
                    }
                  />
                  <Label htmlFor="reminderEnabled" className="text-sm font-normal">
                    Enable Reminders
                  </Label>
                </div>
              </div>

              {formData.reminderEnabled && (
                <>
                  <div className="grid gap-3">
                    <Label className="text-sm text-muted-foreground">
                      Send reminders before due date:
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {allReminderIntervals.map((interval) => (
                        <div
                          key={interval}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={interval}
                            checked={formData.reminderIntervals.includes(interval)}
                            onCheckedChange={() => toggleReminderInterval(interval)}
                          />
                          <Label
                            htmlFor={interval}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {reminderIntervalLabels[interval]}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 mt-4">
                    <Label className="text-sm text-muted-foreground">
                      Notification channels:
                    </Label>
                    <div className="flex gap-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="notifyEmail"
                          checked={formData.notifyEmail}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, notifyEmail: checked as boolean })
                          }
                        />
                        <Label htmlFor="notifyEmail" className="text-sm font-normal">
                          Email
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="notifySms"
                          checked={formData.notifySms}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, notifySms: checked as boolean })
                          }
                        />
                        <Label htmlFor="notifySms" className="text-sm font-normal">
                          SMS
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="notifyWhatsapp"
                          checked={formData.notifyWhatsapp}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, notifyWhatsapp: checked as boolean })
                          }
                        />
                        <Label htmlFor="notifyWhatsapp" className="text-sm font-normal">
                          WhatsApp
                        </Label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Policy</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
