"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Edit, Trash2, Phone, Mail, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InsuranceProvider, mockProviders } from "@/lib/insurance-data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProvidersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<InsuranceProvider | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteProviderId, setDeleteProviderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
  });

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(currentUser));

    const storedProviders = localStorage.getItem("providers");
    setProviders(storedProviders ? JSON.parse(storedProviders) : mockProviders);
  }, [router]);

  const handleAddProvider = (e: React.FormEvent) => {
    e.preventDefault();

    const newProvider: InsuranceProvider = {
      id: `p${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      website: formData.website,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updated = [...providers, newProvider];
    setProviders(updated);
    localStorage.setItem("providers", JSON.stringify(updated));
    setFormData({ name: "", email: "", phone: "", website: "" });
    setAddDialogOpen(false);
  };

  const handleDeleteProvider = (providerId: string) => {
    const updated = providers.filter((p) => p.id !== providerId);
    setProviders(updated);
    setSelectedProvider(null);
    localStorage.setItem("providers", JSON.stringify(updated));
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard")}
                className="rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-3xl font-bold text-foreground">Insurance Providers</h1>
            </div>
            <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Provider
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Providers List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>All Providers ({providers.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {providers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No providers yet
                  </p>
                ) : (
                  providers.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider)}
                      className={`w-full text-left p-3 rounded-lg transition-colors border ${
                        selectedProvider?.id === provider.id
                          ? "bg-primary/10 border-primary"
                          : "border-border hover:bg-accent/50"
                      }`}
                    >
                      <p className="font-medium text-foreground">{provider.name}</p>
                      <p className="text-xs text-muted-foreground">{provider.phone}</p>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Provider Details */}
          <div className="lg:col-span-2">
            {selectedProvider ? (
              <div className="space-y-6">
                {/* Provider Info */}
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle>{selectedProvider.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Added on {new Date(selectedProvider.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDeleteProviderId(selectedProvider.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedProvider.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm font-medium">{selectedProvider.phone}</p>
                        </div>
                      </div>
                    )}
                    {selectedProvider.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm font-medium">{selectedProvider.email}</p>
                        </div>
                      </div>
                    )}
                    {selectedProvider.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Website</p>
                          <a
                            href={`https://${selectedProvider.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {selectedProvider.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* QR Codes Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">QR Codes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <div className="text-muted-foreground mb-2">Company QR Code</div>
                      {selectedProvider.qrCode ? (
                        <div className="inline-block">
                          <img
                            src={selectedProvider.qrCode}
                            alt="Company QR Code"
                            className="w-32 h-32 object-cover rounded"
                          />
                          <p className="text-xs text-muted-foreground mt-2">Uploaded</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No QR code uploaded</p>
                      )}
                    </div>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <div className="text-muted-foreground mb-2">Agent's Payment QR Code</div>
                      {selectedProvider.agentQrCode ? (
                        <div className="inline-block">
                          <img
                            src={selectedProvider.agentQrCode}
                            alt="Agent QR Code"
                            className="w-32 h-32 object-cover rounded"
                          />
                          <p className="text-xs text-muted-foreground mt-2">Uploaded</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No QR code uploaded</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Usage Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Usage Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="p-3 bg-accent/10 rounded border border-accent/20">
                      <p className="font-medium text-foreground">How This is Used:</p>
                      <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                        <li>• When adding policies, select this provider from dropdown</li>
                        <li>• QR codes are sent in WhatsApp/Email reminders</li>
                        <li>• Clients can scan QR code for quick payment</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <p className="text-muted-foreground">Select a provider to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Add Provider Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Insurance Provider</DialogTitle>
            <DialogDescription>
              Add a new insurance provider to your system
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddProvider} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Provider Name *</Label>
              <Input
                id="name"
                placeholder="e.g., HDFC Ergo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+91 1800 123 4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="support@provider.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="www.provider.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Provider</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProviderId} onOpenChange={() => setDeleteProviderId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Provider</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this provider? Existing policies using this provider will need to be updated.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteProviderId) handleDeleteProvider(deleteProviderId);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
