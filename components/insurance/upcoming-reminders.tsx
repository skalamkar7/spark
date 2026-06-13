"use client";

import { Bell, ChevronRight, Mail, MessageSquare, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  InsurancePolicy,
  Client,
  formatDate,
  getDaysUntil,
  getClientById,
  reminderIntervalLabels,
} from "@/lib/insurance-data";

interface UpcomingRemindersProps {
  policies: InsurancePolicy[];
  clients: Client[];
}

export function UpcomingReminders({ policies, clients }: UpcomingRemindersProps) {
  const reminders = policies
    .filter((p) => p.status !== "expired" && p.reminderSettings.enabled)
    .map((policy) => {
      const client = getClientById(clients, policy.clientId);
      return {
        policy,
        client,
        daysUntilPayment: getDaysUntil(policy.nextPaymentDate),
        daysUntilExpiry: getDaysUntil(policy.endDate),
      };
    })
    .filter((r) => r.client && (r.daysUntilPayment <= 30 || r.daysUntilExpiry <= 30))
    .sort((a, b) => Math.min(a.daysUntilPayment, a.daysUntilExpiry) - Math.min(b.daysUntilPayment, b.daysUntilExpiry))
    .slice(0, 6);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">
          Upcoming Reminders
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          View all
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming reminders
          </p>
        ) : (
          reminders.map(({ policy, client, daysUntilPayment, daysUntilExpiry }) => {
            const daysUntil = Math.min(daysUntilPayment, daysUntilExpiry);
            const isExpiry = daysUntilExpiry <= daysUntilPayment;
            
            return (
              <div
                key={policy.id}
                className="rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      daysUntil <= 3
                        ? "bg-destructive/10 text-destructive"
                        : daysUntil <= 7
                          ? "bg-warning/10 text-warning-foreground"
                          : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {client?.name}
                      </p>
                      <span
                        className={`text-xs font-semibold whitespace-nowrap ${
                          daysUntil <= 3
                            ? "text-destructive"
                            : daysUntil <= 7
                              ? "text-warning-foreground"
                              : "text-foreground"
                        }`}
                      >
                        {daysUntil > 0 ? `${daysUntil} days` : "Today"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {policy.name}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${
                          isExpiry
                            ? "border-warning/30 text-warning-foreground bg-warning/10"
                            : "border-primary/30 text-primary bg-primary/10"
                        }`}
                      >
                        {isExpiry ? "Expiry" : "Payment"}: {formatDate(isExpiry ? policy.endDate : policy.nextPaymentDate)}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {policy.reminderSettings.notifyVia.includes("email") && (
                          <Mail className="h-3 w-3 text-muted-foreground" />
                        )}
                        {policy.reminderSettings.notifyVia.includes("sms") && (
                          <Phone className="h-3 w-3 text-muted-foreground" />
                        )}
                        {policy.reminderSettings.notifyVia.includes("whatsapp") && (
                          <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {policy.reminderSettings.intervals.slice(0, 3).map((interval) => (
                        <span
                          key={interval}
                          className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
                        >
                          {reminderIntervalLabels[interval]}
                        </span>
                      ))}
                      {policy.reminderSettings.intervals.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{policy.reminderSettings.intervals.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
