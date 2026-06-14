"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, TrendingUp, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PaymentLog,
  PaymentPattern,
  InsurancePolicy,
  Client,
  calculatePaymentPattern,
  calculateClientRiskLevel,
  mockClients,
  mockPolicies,
  getClientById,
  formatCurrency,
  getPoliciesByClient,
} from "@/lib/insurance-data";

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("all");

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(currentUser));

    const storedPayments = localStorage.getItem("paymentLogs");
    const storedClients = localStorage.getItem("clients");
    const storedPolicies = localStorage.getItem("policies");

    setPaymentLogs(storedPayments ? JSON.parse(storedPayments) : []);
    setClients(storedClients ? JSON.parse(storedClients) : mockClients);
    setPolicies(storedPolicies ? JSON.parse(storedPolicies) : mockPolicies);
  }, [router]);

  // Calculate payment patterns for all policies
  const paymentPatterns = useMemo(() => {
    return policies.map((policy) => calculatePaymentPattern(paymentLogs, policy.id));
  }, [policies, paymentLogs]);

  // Calculate client-level statistics
  const clientStats = useMemo(() => {
    return clients.map((client) => {
      const clientPolicies = getPoliciesByClient(policies, client.id);
      const clientPayments = paymentLogs.filter((p) => p.clientId === client.id);
      const riskLevel = calculateClientRiskLevel(paymentLogs, client.id);

      const avgDaysLate =
        clientPayments.length > 0
          ? Math.round(clientPayments.slice(-3).reduce((sum, p) => sum + p.daysLate, 0) / Math.min(3, clientPayments.length))
          : 0;

      const onTimeCount = clientPayments.filter((p) => p.paymentStatus === "on-time").length;
      const lateCount = clientPayments.filter((p) => p.paymentStatus === "late").length;
      const onTimeRate =
        clientPayments.length > 0 ? Math.round((onTimeCount / clientPayments.length) * 100) : 0;

      return {
        client,
        clientPolicies,
        paymentCount: clientPayments.length,
        avgDaysLate,
        riskLevel,
        onTimeRate,
        onTimeCount,
        lateCount,
      };
    });
  }, [clients, policies, paymentLogs]);

  // Filter client stats
  const filteredClientStats = useMemo(() => {
    let filtered = clientStats;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((stat) =>
        stat.client.name.toLowerCase().includes(term)
      );
    }

    if (filterRisk !== "all") {
      filtered = filtered.filter((stat) => stat.riskLevel === filterRisk);
    }

    return filtered.sort((a, b) => {
      if (filterRisk === "all") {
        // Sort by risk level first
        const riskOrder = { high: 0, medium: 1, low: 2 };
        const riskDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        if (riskDiff !== 0) return riskDiff;
      }
      return b.avgDaysLate - a.avgDaysLate;
    });
  }, [clientStats, searchTerm, filterRisk]);

  // Overall statistics
  const overallStats = {
    totalPayments: paymentLogs.length,
    totalClients: clients.length,
    highRiskClients: clientStats.filter((c) => c.riskLevel === "high").length,
    mediumRiskClients: clientStats.filter((c) => c.riskLevel === "medium").length,
    avgOnTimeRate: clientStats.length > 0
      ? Math.round(
          clientStats.reduce((sum, c) => sum + c.onTimeRate, 0) / clientStats.length
        )
      : 0,
    avgDaysLate: paymentLogs.length > 0
      ? Math.round(paymentLogs.reduce((sum, p) => sum + p.daysLate, 0) / Math.min(paymentLogs.length, 50))
      : 0,
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Payment Analytics</h1>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{overallStats.totalPayments}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{overallStats.totalClients}</p>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-700">High Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{overallStats.highRiskClients}</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-amber-700">Medium Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-600">{overallStats.mediumRiskClients}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Avg On-Time Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{overallStats.avgOnTimeRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Avg Days Late</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{overallStats.avgDaysLate} days</p>
            </CardContent>
          </Card>
        </div>

        {/* Client Analysis */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Client Payment Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Input
                placeholder="Search client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterRisk("all");
                }}
              >
                Reset Filters
              </Button>
            </div>

            {filteredClientStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No clients found</p>
            ) : (
              <div className="space-y-3">
                {filteredClientStats.map((stat) => (
                  <div
                    key={stat.client.id}
                    className={`border rounded-lg p-4 transition-all ${
                      stat.riskLevel === "high"
                        ? "border-red-200 bg-red-50"
                        : stat.riskLevel === "medium"
                        ? "border-amber-200 bg-amber-50"
                        : "border-green-200 bg-green-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {stat.riskLevel === "high" && (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          )}
                          {stat.riskLevel === "medium" && (
                            <Clock className="w-5 h-5 text-amber-600" />
                          )}
                          {stat.riskLevel === "low" && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                          <span className="font-semibold">{stat.client.name}</span>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              stat.riskLevel === "high"
                                ? "bg-red-100 text-red-800"
                                : stat.riskLevel === "medium"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {stat.riskLevel.toUpperCase()} RISK
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Policies</p>
                            <p className="font-semibold">{stat.clientPolicies.length}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Payments</p>
                            <p className="font-semibold">{stat.paymentCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">On-Time Rate</p>
                            <p className="font-semibold text-green-600">{stat.onTimeRate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Avg Days Late</p>
                            <p className={`font-semibold ${stat.avgDaysLate > 0 ? "text-red-600" : "text-green-600"}`}>
                              {stat.avgDaysLate} days
                            </p>
                          </div>
                        </div>

                        {stat.riskLevel !== "low" && (
                          <div className="mt-3 p-2 bg-white/50 rounded text-xs">
                            <p className="font-medium mb-1">Recommendation:</p>
                            {stat.riskLevel === "high" && (
                              <p>Send early reminders 7 days in advance. Consider monthly payment follow-ups.</p>
                            )}
                            {stat.riskLevel === "medium" && (
                              <p>Send early reminders 3-5 days in advance. Monitor closely for patterns.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Policy Payment Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Policy Payment Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentPatterns.filter((p) => p.totalPaymentsRecorded > 0).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No payment data available yet</p>
            ) : (
              <div className="space-y-3">
                {paymentPatterns
                  .filter((p) => p.totalPaymentsRecorded > 0)
                  .sort((a, b) => {
                    const riskOrder = { high: 0, medium: 1, low: 2 };
                    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
                  })
                  .slice(0, 10)
                  .map((pattern) => {
                    const policy = policies.find((p) => p.id === pattern.policyId);
                    const client = getClientById(clients, pattern.clientId);
                    return (
                      <div key={pattern.policyId} className="border border-border rounded-lg p-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{policy?.name}</p>
                            <p className="text-sm text-muted-foreground">{client?.name}</p>
                            <div className="flex gap-3 mt-2 text-sm">
                              <span>Avg Late: {pattern.averageDaysLate} days</span>
                              <span>Payments: {pattern.totalPaymentsRecorded}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
                                pattern.riskLevel === "high"
                                  ? "bg-red-100 text-red-800"
                                  : pattern.riskLevel === "medium"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {pattern.riskLevel.toUpperCase()}
                            </span>
                            {pattern.recommendedEarlyReminderDays > 0 && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Send {pattern.recommendedEarlyReminderDays} days early
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
