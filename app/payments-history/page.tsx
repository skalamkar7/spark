"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PaymentLog,
  InsurancePolicy,
  Client,
  mockClients,
  mockPolicies,
  getClientById,
  formatCurrency,
  formatDate,
} from "@/lib/insurance-data";

export default function PaymentsHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  const filteredPayments = useMemo(() => {
    let filtered = paymentLogs;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((payment) => {
        const client = getClientById(clients, payment.clientId);
        const policy = policies.find((p) => p.id === payment.policyId);
        return (
          client?.name.toLowerCase().includes(term) ||
          policy?.name.toLowerCase().includes(term) ||
          policy?.policyNumber.toLowerCase().includes(term)
        );
      });
    }

    // Filter by payment status
    if (filterStatus !== "all") {
      filtered = filtered.filter((p) => p.paymentStatus === filterStatus);
    }

    // Filter by payment method
    if (filterMethod !== "all") {
      filtered = filtered.filter((p) => p.paymentMethod === filterMethod);
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter((p) => p.paidAt >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter((p) => p.paidAt <= dateTo);
    }

    return filtered.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
  }, [paymentLogs, searchTerm, filterStatus, filterMethod, dateFrom, dateTo, clients, policies]);

  const stats = {
    totalPayments: paymentLogs.length,
    totalAmount: paymentLogs.reduce((sum, p) => sum + p.amount, 0),
    onTimeCount: paymentLogs.filter((p) => p.paymentStatus === "on-time").length,
    lateCount: paymentLogs.filter((p) => p.paymentStatus === "late").length,
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
            <h1 className="text-3xl font-bold text-foreground">Payment History</h1>
            <span className="ml-auto text-muted-foreground">
              {filteredPayments.length} payments
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalPayments}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">On-Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{stats.onTimeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Late</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{stats.lateCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Search</label>
                <Input
                  placeholder="Client name, policy..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="on-time">On-Time</option>
                  <option value="late">Late</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Method</label>
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="all">All Methods</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">From Date</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">To Date</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                    setFilterMethod("all");
                    setDateFrom("");
                    setDateTo("");
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment List */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Records</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No payments found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Client</th>
                      <th className="text-left py-3 px-4 font-medium">Policy</th>
                      <th className="text-left py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Paid Date</th>
                      <th className="text-left py-3 px-4 font-medium">Due Date</th>
                      <th className="text-left py-3 px-4 font-medium">Days Late</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => {
                      const client = getClientById(clients, payment.clientId);
                      const policy = policies.find((p) => p.id === payment.policyId);
                      return (
                        <tr key={payment.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4">{client?.name || "Unknown"}</td>
                          <td className="py-3 px-4 text-muted-foreground">{policy?.name || "Unknown"}</td>
                          <td className="py-3 px-4 font-semibold">{formatCurrency(payment.amount)}</td>
                          <td className="py-3 px-4">{formatDate(payment.paidAt)}</td>
                          <td className="py-3 px-4">{formatDate(payment.previousDueDate)}</td>
                          <td className="py-3 px-4">
                            <span className={payment.daysLate === 0 ? "text-green-600" : payment.daysLate > 0 ? "text-red-600" : ""}>
                              {payment.daysLate} day{payment.daysLate !== 1 ? "s" : ""}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                payment.paymentStatus === "on-time"
                                  ? "bg-green-100 text-green-800"
                                  : payment.paymentStatus === "late"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {payment.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 capitalize">{payment.paymentMethod || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
