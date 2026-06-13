"use client";

import { Users, FileText, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  totalClients: number;
  totalPolicies: number;
  urgentReminders: number;
  dueThisWeek: number;
}

export function StatsCards({
  totalClients,
  totalPolicies,
  urgentReminders,
  dueThisWeek,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Total Clients",
      value: totalClients,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Active Policies",
      value: totalPolicies,
      icon: FileText,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      label: "Urgent (3 days)",
      value: urgentReminders,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Due This Week",
      value: dueThisWeek,
      icon: Clock,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
