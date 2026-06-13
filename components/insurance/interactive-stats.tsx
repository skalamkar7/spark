"use client";

import { Users, FileText, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface InteractiveStatsProps {
  totalClients: number;
  totalPolicies: number;
  urgentReminders: number;
  dueThisWeek: number;
  onClientClick?: () => void;
  onPoliciesClick?: () => void;
  onUrgentClick?: () => void;
  onDueWeekClick?: () => void;
}

export function InteractiveStats({
  totalClients,
  totalPolicies,
  urgentReminders,
  dueThisWeek,
  onClientClick,
  onPoliciesClick,
  onUrgentClick,
  onDueWeekClick,
}: InteractiveStatsProps) {
  const stats = [
    {
      label: "Total Clients",
      value: totalClients,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      hoverColor: "hover:bg-primary/20",
      onClick: onClientClick,
    },
    {
      label: "Active Policies",
      value: totalPolicies,
      icon: FileText,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      hoverColor: "hover:bg-chart-2/20",
      onClick: onPoliciesClick,
    },
    {
      label: "Urgent (3 days)",
      value: urgentReminders,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      hoverColor: "hover:bg-destructive/20",
      onClick: onUrgentClick,
    },
    {
      label: "Due This Week",
      value: dueThisWeek,
      icon: Clock,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      hoverColor: "hover:bg-chart-3/20",
      onClick: onDueWeekClick,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className={`cursor-pointer transition-all duration-300 ${stat.hoverColor} ${
            stat.onClick ? "hover:shadow-lg" : ""
          }`}
          onClick={stat.onClick}
        >
          <CardContent className="p-6">
            <div className="space-y-3">
              <div
                className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center transition-colors`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
              {stat.onClick && (
                <p className="text-xs text-primary font-medium mt-2">Click to view details →</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
