"use client";

import {
  Heart,
  Car,
  Home,
  Shield,
  Plane,
  Building2,
  MoreHorizontal,
  Calendar,
  CreditCard,
  User,
  Bell,
  BellOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InsurancePolicy,
  Client,
  formatCurrency,
  formatDate,
  getDaysUntil,
  getStatusColor,
  reminderIntervalLabels,
} from "@/lib/insurance-data";

interface PolicyCardProps {
  policy: InsurancePolicy;
  client: Client | undefined;
  onEdit: (policy: InsurancePolicy) => void;
  onDelete: (policy: InsurancePolicy) => void;
  onViewDetails: (policy: InsurancePolicy) => void;
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

export function PolicyCard({
  policy,
  client,
  onEdit,
  onDelete,
  onViewDetails,
  onConfigureReminders,
}: PolicyCardProps) {
  const Icon = iconMap[policy.type];
  const daysUntilPayment = getDaysUntil(policy.nextPaymentDate);
  const daysUntilExpiry = getDaysUntil(policy.endDate);

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
    <Card className="group border-border bg-card transition-all hover:shadow-lg hover:border-primary/20">
      <CardContent className="p-5">
        {/* Client Info Header */}
        {client && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{client.name}</span>
            <span className="text-xs text-muted-foreground">({client.phone})</span>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${typeColorMap[policy.type]}`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{policy.name}</h3>
              <p className="text-sm text-muted-foreground">{policy.provider}</p>
              <p className="mt-1 text-xs text-muted-foreground font-mono">
                {policy.policyNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${getStatusColor(policy.status)} border`}
            >
              {getStatusLabel()}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(policy)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(policy)}>
                  Edit Policy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onConfigureReminders(policy)}>
                  Configure Reminders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(policy)}
                  className="text-destructive"
                >
                  Delete Policy
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5" />
              <span className="text-xs">Premium</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(policy.premium)}
              <span className="text-xs font-normal text-muted-foreground">
                /{policy.premiumFrequency === "monthly"
                  ? "mo"
                  : policy.premiumFrequency === "quarterly"
                    ? "qtr"
                    : "yr"}
              </span>
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              <span className="text-xs">Coverage</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(policy.coverageAmount)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {policy.status === "expired" ? "Expired on" : "Next payment"}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {formatDate(
                policy.status === "expired"
                  ? policy.endDate
                  : policy.nextPaymentDate
              )}
            </p>
            {policy.status !== "expired" && (
              <p
                className={`text-xs ${daysUntilPayment <= 7 ? "text-destructive" : "text-muted-foreground"}`}
              >
                {daysUntilPayment > 0
                  ? `${daysUntilPayment} days away`
                  : "Due today"}
              </p>
            )}
          </div>
        </div>

        {/* Reminder Status */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {policy.reminderSettings.enabled ? (
              <Bell className="h-3.5 w-3.5 text-primary" />
            ) : (
              <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">
              {policy.reminderSettings.enabled
                ? `Reminders: ${policy.reminderSettings.intervals.length} intervals`
                : "Reminders disabled"}
            </span>
          </div>
          {policy.reminderSettings.enabled && (
            <div className="flex gap-1">
              {policy.reminderSettings.intervals.slice(0, 2).map((interval) => (
                <Badge
                  key={interval}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0"
                >
                  {reminderIntervalLabels[interval].replace(" Before", "")}
                </Badge>
              ))}
              {policy.reminderSettings.intervals.length > 2 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  +{policy.reminderSettings.intervals.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        {policy.status === "expiring-soon" && (
          <div className="mt-3 rounded-lg bg-warning/10 px-3 py-2 border border-warning/20">
            <p className="text-xs text-warning-foreground">
              Policy expires in {daysUntilExpiry} days. Contact client for renewal.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
