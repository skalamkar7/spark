"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InsurancePolicy, PaymentLog } from "@/lib/insurance-data";

interface PaymentRecorderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: InsurancePolicy | null;
  clientName: string;
  onRecordPayment: (payment: PaymentLog) => void;
}

export function PaymentRecorder({
  open,
  onOpenChange,
  policy,
  clientName,
  onRecordPayment,
}: PaymentRecorderProps) {
  const [formData, setFormData] = useState({
    amount: policy?.premium.toString() || "",
    paidDate: new Date().toISOString().split("T")[0],
    paymentMethod: "transfer" as "cash" | "check" | "transfer" | "card" | "upi",
    notes: "",
  });

  const calculateDaysLate = () => {
    if (!policy || !formData.paidDate) return 0;
    const dueDate = new Date(policy.nextPaymentDate);
    const paidDate = new Date(formData.paidDate);
    const diffTime = paidDate.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysLate = calculateDaysLate();
  const paymentStatus = daysLate === 0 ? "on-time" : daysLate < 0 ? "on-time" : "late";

  const handleSubmit = () => {
    if (!policy || !formData.amount) return;

    const payment: PaymentLog = {
      id: Date.now().toString(),
      policyId: policy.id,
      clientId: policy.clientId,
      amount: parseFloat(formData.amount),
      paidAt: formData.paidDate,
      previousDueDate: policy.nextPaymentDate,
      newDueDate: new Date(new Date(formData.paidDate).getTime() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      daysLate: Math.max(0, daysLate),
      paymentStatus: daysLate <= 0 ? "on-time" : daysLate > 0 ? "late" : "on-time",
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
    };

    onRecordPayment(payment);
    onOpenChange(false);

    // Reset form
    setFormData({
      amount: policy?.premium.toString() || "",
      paidDate: new Date().toISOString().split("T")[0],
      paymentMethod: "transfer",
      notes: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Log a payment received from {clientName} for {policy?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Policy</Label>
            <Input value={policy?.policyNumber || ""} disabled className="bg-muted" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount Received *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidDate">Payment Date *</Label>
              <Input
                id="paidDate"
                type="date"
                value={formData.paidDate}
                onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as any })}>
              <SelectTrigger id="method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="text-sm">
              <div className="font-semibold text-amber-900">Due Date: {new Date(policy?.nextPaymentDate || "").toLocaleDateString()}</div>
              <div className={`text-sm ${daysLate === 0 ? "text-green-700" : daysLate > 0 ? "text-red-700" : "text-gray-700"}`}>
                <span className="font-medium">
                  {daysLate === 0
                    ? "On-time payment"
                    : daysLate > 0
                    ? `${daysLate} day${daysLate === 1 ? "" : "s"} late`
                    : "Early payment"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional details about this payment..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.amount}>
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
