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
import { InsurancePolicy, ReminderInterval, reminderIntervalLabels } from "@/lib/insurance-data";

interface EditPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: InsurancePolicy | null;
  onSave: (updatedPolicy: InsurancePolicy) => void;
}

export function EditPolicyDialog({
  open,
  onOpenChange,
  policy,
  onSave,
}: EditPolicyDialogProps) {
  const [formData, setFormData] = useState<Partial<InsurancePolicy>>(policy || {});
  const [selectedIntervals, setSelectedIntervals] = useState<ReminderInterval[]>(
    policy?.reminderSettings.intervals || []
  );

  const handleSave = () => {
    if (!policy) return;

    const intervals: ("email" | "sms" | "whatsapp")[] = [];
    if (formData.reminderSettings?.notifyVia) {
      intervals.push(...formData.reminderSettings.notifyVia);
    }

    const updatedPolicy: InsurancePolicy = {
      ...policy,
      premium: parseFloat(formData.premium?.toString() || policy.premium.toString()),
      coverageAmount: parseFloat(formData.coverageAmount?.toString() || policy.coverageAmount.toString()),
      endDate: formData.endDate || policy.endDate,
      notes: formData.notes,
      reminderSettings: {
        ...policy.reminderSettings,
        enabled: formData.reminderSettings?.enabled ?? policy.reminderSettings.enabled,
        intervals: selectedIntervals,
        notifyVia: intervals,
      },
    };

    onSave(updatedPolicy);
    onOpenChange(false);
  };

  const toggleInterval = (interval: ReminderInterval) => {
    setSelectedIntervals((prev) =>
      prev.includes(interval) ? prev.filter((i) => i !== interval) : [...prev, interval]
    );
  };

  const notifyChannels = formData.reminderSettings?.notifyVia || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Policy Details</DialogTitle>
          <DialogDescription>
            Update premium, coverage, dates, and reminder settings. Policy type and number cannot be modified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Policy Number (Cannot modify)</Label>
              <Input value={policy?.policyNumber || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Type (Cannot modify)</Label>
              <Input value={policy?.type || ""} disabled className="bg-muted" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="premium">Premium Amount *</Label>
              <Input
                id="premium"
                type="number"
                placeholder="0"
                value={formData.premium || ""}
                onChange={(e) =>
                  setFormData({ ...formData, premium: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverage">Coverage Amount *</Label>
              <Input
                id="coverage"
                type="number"
                placeholder="0"
                value={formData.coverageAmount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, coverageAmount: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Policy End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate || ""}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional policy information..."
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="border-t pt-4">
            <div className="space-y-3">
              <Label>Reminder Settings</Label>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remindersEnabled"
                  checked={formData.reminderSettings?.enabled ?? true}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      reminderSettings: {
                        ...formData.reminderSettings,
                        enabled: checked as boolean,
                      },
                    })
                  }
                />
                <Label htmlFor="remindersEnabled" className="font-normal cursor-pointer">
                  Enable Reminders
                </Label>
              </div>

              {formData.reminderSettings?.enabled && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm">Reminder Timing</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.entries(reminderIntervalLabels) as [ReminderInterval, string][]).map(
                        ([interval, label]) => (
                          <div key={interval} className="flex items-center space-x-2">
                            <Checkbox
                              id={`interval-${interval}`}
                              checked={selectedIntervals.includes(interval)}
                              onCheckedChange={() => toggleInterval(interval)}
                            />
                            <Label
                              htmlFor={`interval-${interval}`}
                              className="font-normal cursor-pointer text-sm"
                            >
                              {label}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Notify Via</Label>
                    <div className="space-y-2">
                      {(["email", "sms", "whatsapp"] as const).map((channel) => (
                        <div key={channel} className="flex items-center space-x-2">
                          <Checkbox
                            id={`notify-${channel}`}
                            checked={notifyChannels.includes(channel)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  reminderSettings: {
                                    ...formData.reminderSettings,
                                    notifyVia: [...notifyChannels, channel],
                                  },
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  reminderSettings: {
                                    ...formData.reminderSettings,
                                    notifyVia: notifyChannels.filter((c) => c !== channel),
                                  },
                                });
                              }
                            }}
                          />
                          <Label
                            htmlFor={`notify-${channel}`}
                            className="font-normal cursor-pointer text-sm capitalize"
                          >
                            {channel}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.premium || !formData.coverageAmount}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
