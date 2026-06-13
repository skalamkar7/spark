"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Heart, Car, Home, Shield, Plane, Building2, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  InsurancePolicy, 
  Client, 
  getClientById, 
  formatCurrency, 
  formatDate,
  InsuranceType,
  mockClients,
  mockPolicies,
} from "@/lib/insurance-data";

const typeIcons: Record<InsuranceType, React.ComponentType> = {
  health: Heart,
  auto: Car,
  home: Home,
  life: Shield,
  travel: Plane,
  business: Building2,
};

export default function PoliciesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(currentUser));

    const storedPolicies = localStorage.getItem("policies");
    const storedClients = localStorage.getItem("clients");

    // Use mock data as fallback
    setPolicies(storedPolicies ? JSON.parse(storedPolicies) : mockPolicies);
    setClients(storedClients ? JSON.parse(storedClients) : mockClients);
  }, [router]);

  const selectedClient = selectedPolicy ? getClientById(clients, selectedPolicy.clientId) : null;
  const TypeIcon = selectedPolicy ? typeIcons[selectedPolicy.type] : null;

  const statusColor: Record<string, string> = {
    active: "bg-success/10 text-success border-success/20",
    "expiring-soon": "bg-warning/10 text-warning border-warning/20",
    expired: "bg-destructive/10 text-destructive border-destructive/20",
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
            <h1 className="text-3xl font-bold text-foreground">All Policies</h1>
            <span className="ml-auto text-muted-foreground">
              {policies.length} policies total
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Policies List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Policies ({policies.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {policies.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No policies yet
                  </p>
                ) : (
                  policies.map((policy) => {
                    const Icon = typeIcons[policy.type];
                    return (
                      <button
                        key={policy.id}
                        onClick={() => setSelectedPolicy(policy)}
                        className={`w-full text-left p-3 rounded-lg transition-colors border flex gap-3 items-start ${
                          selectedPolicy?.id === policy.id
                            ? "bg-primary/10 border-primary"
                            : "border-border hover:bg-accent/50"
                        }`}
                      >
                        {Icon && <Icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">
                            {policy.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {policy.policyNumber}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Policy Details */}
          <div className="lg:col-span-2">
            {selectedPolicy ? (
              <div className="space-y-6">
                {/* Policy Header */}
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div className="flex items-start gap-4">
                      {TypeIcon && (
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <TypeIcon className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <CardTitle>{selectedPolicy.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedPolicy.policyNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Provider</p>
                        <p className="font-medium">{selectedPolicy.provider}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium border ${statusColor[selectedPolicy.status]}`}>
                          {selectedPolicy.status.charAt(0).toUpperCase() + selectedPolicy.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Client Info */}
                {selectedClient && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Client Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedClient.name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="font-medium text-sm">{selectedClient.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium text-sm">{selectedClient.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Coverage Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Coverage & Premium</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Premium Amount</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(selectedPolicy.premium)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Frequency</p>
                        <p className="font-medium capitalize">{selectedPolicy.premiumFrequency}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Coverage Amount</p>
                      <p className="text-xl font-semibold text-chart-2">
                        {formatCurrency(selectedPolicy.coverageAmount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Policy Dates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Policy Dates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="font-medium">{formatDate(selectedPolicy.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">End Date</p>
                      <p className="font-medium">{formatDate(selectedPolicy.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Next Payment Due</p>
                      <p className="font-medium text-primary">{formatDate(selectedPolicy.nextPaymentDate)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {selectedPolicy.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedPolicy.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <p className="text-muted-foreground">Select a policy to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
