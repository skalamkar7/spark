import { InsurancePolicy, Client, generateId } from "@/lib/insurance-data";

const STORAGE_KEY_POLICIES = "insurance_policies";
const STORAGE_KEY_CLIENTS = "insurance_clients";

export const useLocalStorage = () => {
  const getPolicies = (): InsurancePolicy[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY_POLICIES);
    return stored ? JSON.parse(stored) : [];
  };

  const getClients = (): Client[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY_CLIENTS);
    return stored ? JSON.parse(stored) : [];
  };

  const savePolicies = (policies: InsurancePolicy[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_POLICIES, JSON.stringify(policies));
    }
  };

  const saveClients = (clients: Client[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
    }
  };

  const clearAll = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_POLICIES);
      localStorage.removeItem(STORAGE_KEY_CLIENTS);
    }
  };

  return {
    getPolicies,
    getClients,
    savePolicies,
    saveClients,
    clearAll,
  };
};
