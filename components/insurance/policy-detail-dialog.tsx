"use client";

import {
  Heart,
  Car,
  Home,
  Shield,
  Plane,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Bell,
  BellOff,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  InsurancePolicy,
  Client,
  formatCurrency,
  formatDate,
  getDaysUntil,
  getStatusColor,
  getClientById,
  reminderIntervalLabels,
} from "@/lib/insurance-data";

interface PolicyDetailDialogProps {
  policy: InsurancePolicy | null;
  clients: Client[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigureReminders: (policy: InsurancePolicy) => void;
}

const iconMap = {
  health: Heart,
  auto: Car,
  home: Home,
  life: Shield,
  travel: Plane,
  business: Building2,
};

const typeColorMap = {
  health: "bg-chart-1/10 text-chart-1",
  auto: "bg-chart-3/10 text-chart-3",
  home: "bg-chart-4/10 text-chart-4",
  life: "bg-chart-2/10 text-chart-2",
  travel: "bg-chart-5/10 text-chart-5",
  business: "bg-primary/10 text-primary",
};

export function PolicyDetailDialog({
  policy,
  clients,
  open,
  onOpenChange,
  onConfigureReminders,
}: PolicyDetailDialogProps) {
  if (!policy) return null;

  const Icon = iconMap[policy.type];
  const daysUntilExpiry = getDaysUntil(policy.endDate);
  const client = getClientById(clients, policy.clientId);

  const getStatusLabel = () => {
    switch (policy.status) {
      case "active":
        return "Active";
      case "expiring-soon":
        return "Expiring Soon";
      case "expired":
        return "Expired";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${typeColorMap[policy.type]}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl">{policy.name}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {policy.provider}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`${getStatusColor(policy.status)} border`}
            >
              {getStatusLabel()}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Client Information */}
          {client && (
            <div className="rounded-lg border border-border p-4">
              <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Client Information
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-foreground">{client.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-foreground">{client.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-foreground">{client.email}</span>
                </div>
                {client.address && (
                  <div className="flex items-center gap-2 text-sm col-span-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-foreground">{client.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Premium & Coverage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">Premium</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">
                {formatCurrency(policy.premium)}
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                {policy.premiumFrequency}
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Coverage</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">
                {formatCurrency(policy.coverageAmount)}
              </p>
              <p className="text-sm text-muted-foreground">Maximum benefit</p>
            </div>
          </div>

          {/* Policy Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              Policy Details
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">Policy Number</span>
                </div>
                <span className="text-sm font-mono text-foreground">
                  {policy.policyNumber}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span className="text-sm">Provider</span>
                </div>
                <span className="text-sm text-foreground">
                  {policy.provider}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Start Date</span>
                </div>
                <span className="text-sm text-foreground">
                  {formatDate(policy.startDate)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">End Date</span>
                </div>
                <span className="text-sm text-foreground">
                  {formatDate(policy.endDate)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Next Payment</span>
                </div>
                <span className="text-sm text-foreground">
                  {formatDate(policy.nextPaymentDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {policy.notes && (
            <div className="rounded-lg bg-secondary/50 p-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground">{policy.notes}</p>
            </div>
          )}

          {/* Reminder Settings */}
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                {policy.reminderSettings.enabled ? (
                  <Bell className="h-4 w-4 text-primary" />
                ) : (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                )}
                Reminder Settings
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onConfigureReminders(policy);
                }}
              >
                Configure
              </Button>
            </div>
            {policy.reminderSettings.enabled ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {policy.reminderSettings.intervals.map((interval) => (
                    <Badge key={interval} variant="secondary" className="text-xs">
                      {reminderIntervalLabels[interval]}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Via:{" "}
                  {policy.reminderSettings.notifyVia
                    .map((v) => v.charAt(0).toUpperCase() + v.slice(1))
                    .join(", ")}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Reminders are disabled for this policy
              </p>
            )}
          </div>

          {policy.status === "expiring-soon" && (
            <div className="rounded-lg bg-warning/10 p-4 border border-warning/20">
              <p className="text-sm text-warning-foreground">
                This policy expires in{" "}
                <span className="font-semibold">{daysUntilExpiry} days</span>.
                Contact the client to discuss renewal.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button className="flex-1">Contact Client</Button>
            <Button variant="outline" className="flex-1">
              Send Reminder Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
