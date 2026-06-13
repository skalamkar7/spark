"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client } from "@/lib/insurance-data";

interface ClientSelectorProps {
  clients: Client[];
  value: string;
  onChange: (clientId: string) => void;
  required?: boolean;
}

export function ClientSelector({
  clients,
  value,
  onChange,
  required = true,
}: ClientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    
    const term = searchTerm.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) ||
        client.phone.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  return (
    <div className="grid gap-2">
      <Label htmlFor="client">Select Client *</Label>
      
      {/* Search Input */}
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Client Selector */}
      <Select value={value} onValueChange={onChange} required={required}>
        <SelectTrigger id="client" className="w-full">
          <SelectValue placeholder="Choose a client..." />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {filteredClients.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground text-center">
              {clients.length === 0 
                ? "No clients added yet. Add a client first." 
                : "No matching clients found"}
            </div>
          ) : (
            filteredClients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{client.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {client.phone}
                  </span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {/* Display selected client info */}
      {value && clients.find((c) => c.id === value) && (
        <div className="mt-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
          {(() => {
            const selectedClient = clients.find((c) => c.id === value);
            return (
              <div className="text-sm space-y-1">
                <p className="font-medium">{selectedClient?.name}</p>
                <p className="text-muted-foreground">{selectedClient?.phone}</p>
                <p className="text-muted-foreground text-xs">{selectedClient?.email}</p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
