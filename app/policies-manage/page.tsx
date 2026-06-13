"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Heart, Car, Home, Shield, Plane, Building2, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  InsurancePolicy, 
  Client, 
  getClientById, 
  formatCurrency, 
  formatDate,
  InsuranceType,
  mockClients,
  mockPolicies,
  getProviderById,
  mockProviders,
} from "@/lib/insurance-data";

const typeIcons: Record<InsuranceType, React.ComponentType> = {
  health: Heart,
  auto: Car,
  home: Home,
  life: Shield,
  travel: Plane,
  business: Building2,
};

export default function PoliciesManagePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(currentUser));

    const storedPolicies = localStorage.getItem("policies");
    const storedClients = localStorage.getItem("clients");
    const storedProviders = localStorage.getItem("providers");

    setPolicies(storedPolicies ? JSON.parse(storedPolicies) : mockPolicies);
    setClients(storedClients ? JSON.parse(storedClients) : mockClients);
    setProviders(storedProviders ? JSON.parse(storedProviders) : mockProviders);
  }, [router]);

  // Filter and search policies
  const filteredPolicies = useMemo(() => {
    let filtered = policies;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((p) => p.type === filterType);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (policy) =>
          policy.name.toLowerCase().includes(term) ||
          policy.policyNumber.toLowerCase().includes(term) ||
          getClientById(clients, policy.clientId)?.name.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [policies, searchTerm, filterType, clients]);

  const selectedClient = selectedPolicy ? getClientById(clients, selectedPolicy.clientId) : null;
  const selectedProvider = selectedPolicy ? getProviderById(providers, selectedPolicy.providerId) : null;
  const TypeIcon = selectedPolicy ? typeIcons[selectedPolicy.type] : null;

  const insuranceTypes: InsuranceType[] = ["health", "auto", "home", "life", "travel", "business"];

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
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Policies ({filteredPolicies.length})
                </CardTitle>
                <div className="space-y-2 mt-2">
                  <Input
                    placeholder="Search policy, client, number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="all">All Types</option>
                    {insuranceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPolicies.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    {policies.length === 0 ? "No policies yet" : "No matching policies"}
                  </p>
                ) : (
                  filteredPolicies.map((policy) => {
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
                        <p className="font-medium">{selectedProvider?.name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium border capitalize`}>
                          {selectedPolicy.status}
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
