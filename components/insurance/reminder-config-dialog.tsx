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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  InsurancePolicy,
  Client,
  ReminderInterval,
  reminderIntervalLabels,
  getClientById,
} from "@/lib/insurance-data";

interface ReminderConfigDialogProps {
  policy: InsurancePolicy | null;
  clients: Client[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (policy: InsurancePolicy) => void;
}

const allReminderIntervals: ReminderInterval[] = [
  "1day",
  "3days",
  "1week",
  "2weeks",
  "1month",
  "2months",
];

export function ReminderConfigDialog({
  policy,
  clients,
  open,
  onOpenChange,
  onSave,
}: ReminderConfigDialogProps) {
  const [enabled, setEnabled] = useState(policy?.reminderSettings.enabled ?? true);
  const [intervals, setIntervals] = useState<ReminderInterval[]>(
    policy?.reminderSettings.intervals ?? ["1day", "1week", "1month"]
  );
  const [notifyEmail, setNotifyEmail] = useState(
    policy?.reminderSettings.notifyVia.includes("email") ?? true
  );
  const [notifySms, setNotifySms] = useState(
    policy?.reminderSettings.notifyVia.includes("sms") ?? true
  );
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(
    policy?.reminderSettings.notifyVia.includes("whatsapp") ?? false
  );

  // Reset form when policy changes
  useState(() => {
    if (policy) {
      setEnabled(policy.reminderSettings.enabled);
      setIntervals(policy.reminderSettings.intervals);
      setNotifyEmail(policy.reminderSettings.notifyVia.includes("email"));
      setNotifySms(policy.reminderSettings.notifyVia.includes("sms"));
      setNotifyWhatsapp(policy.reminderSettings.notifyVia.includes("whatsapp"));
    }
  });

  if (!policy) return null;

  const client = getClientById(clients, policy.clientId);

  const toggleInterval = (interval: ReminderInterval) => {
    setIntervals((prev) =>
      prev.includes(interval)
        ? prev.filter((i) => i !== interval)
        : [...prev, interval]
    );
  };

  const handleSave = () => {
    const notifyVia: ("email" | "sms" | "whatsapp")[] = [];
    if (notifyEmail) notifyVia.push("email");
    if (notifySms) notifyVia.push("sms");
    if (notifyWhatsapp) notifyVia.push("whatsapp");

    onSave({
      ...policy,
      reminderSettings: {
        enabled,
        intervals,
        notifyVia,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure Reminders</DialogTitle>
          <DialogDescription>
            Set up reminder schedule for {client?.name}&apos;s policy: {policy.name}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Enable Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Send automatic reminders before due dates
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {enabled && (
            <>
              {/* Reminder Intervals */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Send reminders before due date:
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {allReminderIntervals.map((interval) => (
                    <div
                      key={interval}
                      className={`flex items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                        intervals.includes(interval)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-secondary/50"
                      }`}
                      onClick={() => toggleInterval(interval)}
                    >
                      <Checkbox
                        id={`config-${interval}`}
                        checked={intervals.includes(interval)}
                        onCheckedChange={() => toggleInterval(interval)}
                      />
                      <Label
                        htmlFor={`config-${interval}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {reminderIntervalLabels[interval]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification Channels */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Notification channels for {client?.name}:
                </Label>
                <div className="space-y-2">
                  <div
                    className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                      notifyEmail
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary/50"
                    }`}
                    onClick={() => setNotifyEmail(!notifyEmail)}
                  >
                    <div>
                      <Label className="text-sm font-normal cursor-pointer">Email</Label>
                      <p className="text-xs text-muted-foreground">{client?.email}</p>
                    </div>
                    <Checkbox
                      checked={notifyEmail}
                      onCheckedChange={(checked) => setNotifyEmail(checked as boolean)}
                    />
                  </div>

                  <div
                    className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                      notifySms
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary/50"
                    }`}
                    onClick={() => setNotifySms(!notifySms)}
                  >
                    <div>
                      <Label className="text-sm font-normal cursor-pointer">SMS</Label>
                      <p className="text-xs text-muted-foreground">{client?.phone}</p>
                    </div>
                    <Checkbox
                      checked={notifySms}
                      onCheckedChange={(checked) => setNotifySms(checked as boolean)}
                    />
                  </div>

                  <div
                    className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                      notifyWhatsapp
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary/50"
                    }`}
                    onClick={() => setNotifyWhatsapp(!notifyWhatsapp)}
                  >
                    <div>
                      <Label className="text-sm font-normal cursor-pointer">WhatsApp</Label>
                      <p className="text-xs text-muted-foreground">{client?.phone}</p>
                    </div>
                    <Checkbox
                      checked={notifyWhatsapp}
                      onCheckedChange={(checked) => setNotifyWhatsapp(checked as boolean)}
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              {intervals.length > 0 && (
                <div className="rounded-lg bg-secondary/50 p-4">
                  <Label className="text-sm font-medium">Reminder Preview</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {client?.name} will receive {intervals.length} reminder(s) via{" "}
                    {[
                      notifyEmail && "Email",
                      notifySms && "SMS",
                      notifyWhatsapp && "WhatsApp",
                    ]
                      .filter(Boolean)
                      .join(", ")}{" "}
                    at: {intervals.map((i) => reminderIntervalLabels[i]).join(", ")} before
                    the due date.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
