"use client";

import { useState } from "react";
import {
  ReminderItem,
  generateWhatsAppMessage,
  generateEmailSubject,
  generateEmailBody,
  getWhatsAppUrl,
  getEmailUrl,
  formatCurrency,
  formatDate,
  getTypeIcon,
  calculateNextPaymentDate,
} from "@/lib/insurance-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  Car,
  Home,
  Shield,
  Plane,
  Building2,
  MessageCircle,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Clock,
  CreditCard,
  RefreshCw,
  User,
  Phone,
  MoreVertical,
  CheckCircle2,
  BanknoteIcon,
  Send,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  Car,
  Home,
  Shield,
  Plane,
  Building2,
};

interface ReminderCardProps {
  reminder: ReminderItem;
  agentName: string;
  onMarkReminderSent: (policyId: string, sentVia: "email" | "whatsapp") => void;
  onMarkPaymentReceived: (policyId: string, newDueDate: string) => void;
}

export function ReminderCard({
  reminder,
  agentName,
  onMarkReminderSent,
  onMarkPaymentReceived,
}: ReminderCardProps) {
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"whatsapp" | "email">("whatsapp");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentNotes, setPaymentNotes] = useState("");

  const { policy, client, daysUntil, reminderType } = reminder;
  const IconComponent = iconMap[getTypeIcon(policy.type)] || Shield;

  const whatsappMessage = generateWhatsAppMessage(reminder, agentName);
  const emailSubject = generateEmailSubject(reminder);
  const emailBody = generateEmailBody(reminder, agentName);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSendWhatsApp = () => {
    window.open(getWhatsAppUrl(client.phone, whatsappMessage), "_blank");
    onMarkReminderSent(policy.id, "whatsapp");
    setIsMessageDialogOpen(false);
  };

  const handleSendEmail = () => {
    window.open(getEmailUrl(client.email, emailSubject, emailBody), "_blank");
    onMarkReminderSent(policy.id, "email");
    setIsMessageDialogOpen(false);
  };

  const handlePaymentReceived = () => {
    const newDueDate = calculateNextPaymentDate(policy.nextPaymentDate, policy.premiumFrequency);
    onMarkPaymentReceived(policy.id, newDueDate);
    setIsPaymentDialogOpen(false);
    setPaymentNotes("");
  };

  const getUrgencyColor = () => {
    if (daysUntil <= 1) return "bg-destructive/10 text-destructive border-destructive/30";
    if (daysUntil <= 3) return "bg-orange-500/10 text-orange-600 border-orange-500/30";
    if (daysUntil <= 7) return "bg-warning/10 text-warning-foreground border-warning/30";
    return "bg-muted text-muted-foreground border-border";
  };

  const getDaysLabel = () => {
    if (daysUntil === 0) return "Due Today";
    if (daysUntil === 1) return "Due Tomorrow";
    return `Due in ${daysUntil} days`;
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-primary" />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold text-foreground truncate">{policy.name}</h3>
                  <p className="text-sm text-muted-foreground">{policy.policyNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getUrgencyColor()}>
                    <Clock className="w-3 h-3 mr-1" />
                    {getDaysLabel()}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onMarkReminderSent(policy.id, "whatsapp")}>
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                        Mark Reminder Sent
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {reminderType === "payment" && (
                        <DropdownMenuItem onClick={() => setIsPaymentDialogOpen(true)}>
                          <BanknoteIcon className="w-4 h-4 mr-2 text-primary" />
                          Mark Payment Received
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Client Info */}
              <div className="flex items-center gap-4 mb-3 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="w-3.5 h-3.5" />
                  <span className="font-medium text-foreground">{client.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{client.phone}</span>
                </div>
              </div>

              {/* Reminder Type & Amount */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="secondary" className="gap-1">
                  {reminderType === "payment" ? (
                    <>
                      <CreditCard className="w-3 h-3" />
                      Premium Payment
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3" />
                      Policy Renewal
                    </>
                  )}
                </Badge>
                <span className="font-semibold text-primary">
                  {formatCurrency(policy.premium)}
                </span>
                <span className="text-sm text-muted-foreground">
                  Due: {formatDate(reminder.dueDate)}
                </span>
                {policy.lastReminderSent && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                    <Send className="w-3 h-3" />
                    Sent {formatDate(policy.lastReminderSent)}
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                  onClick={() => {
                    setActiveTab("whatsapp");
                    setIsMessageDialogOpen(true);
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => {
                    setActiveTab("email");
                    setIsMessageDialogOpen(true);
                  }}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                {reminderType === "payment" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-1.5"
                    onClick={() => setIsPaymentDialogOpen(true)}
                  >
                    <BanknoteIcon className="w-4 h-4" />
                    Payment Received
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Reminder to {client.name}</DialogTitle>
            <DialogDescription>
              {reminderType === "payment" ? "Premium payment" : "Policy renewal"} reminder for{" "}
              {policy.name}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "whatsapp" | "email")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="whatsapp" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2">
                <Mail className="w-4 h-4" />
                Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="whatsapp" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Message</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5"
                    onClick={() => handleCopy(whatsappMessage, "whatsapp")}
                  >
                    {copiedField === "whatsapp" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Message
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  readOnly
                  value={whatsappMessage}
                  className="min-h-[300px] font-mono text-sm bg-muted/50"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                  onClick={handleSendWhatsApp}
                >
                  <MessageCircle className="w-4 h-4" />
                  Send via WhatsApp
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCopy(whatsappMessage, "whatsapp")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Subject</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5"
                    onClick={() => handleCopy(emailSubject, "subject")}
                  >
                    {copiedField === "subject" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  readOnly
                  value={emailSubject}
                  className="min-h-[40px] font-mono text-sm bg-muted/50 resize-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Body</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5"
                    onClick={() => handleCopy(emailBody, "body")}
                  >
                    {copiedField === "body" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Body
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  readOnly
                  value={emailBody}
                  className="min-h-[280px] font-mono text-sm bg-muted/50"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  className="flex-1 gap-2"
                  onClick={handleSendEmail}
                >
                  <Mail className="w-4 h-4" />
                  Send via Email
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCopy(`Subject: ${emailSubject}\n\n${emailBody}`, "full-email")}
                >
                  {copiedField === "full-email" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="border-t pt-4 mt-2">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong>Client:</strong> {client.name} | {client.phone} | {client.email}
              </p>
              <p>
                <strong>Policy:</strong> {policy.name} ({policy.policyNumber}) | {policy.provider}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Received Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Mark Payment Received</DialogTitle>
            <DialogDescription>
              Record payment for {policy.name} ({client.name})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Policy</span>
                <span className="font-medium">{policy.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Premium Amount</span>
                <span className="font-semibold text-primary">{formatCurrency(policy.premium)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Due Date</span>
                <span>{formatDate(policy.nextPaymentDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Next Due Date</span>
                <span className="font-medium text-green-600">
                  {formatDate(calculateNextPaymentDate(policy.nextPaymentDate, policy.premiumFrequency))}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentNotes">Notes (Optional)</Label>
              <Textarea
                id="paymentNotes"
                placeholder="Any notes about this payment..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaymentReceived} className="gap-2">
              <Check className="w-4 h-4" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ReminderListProps {
  reminders: ReminderItem[];
  agentName: string;
  onMarkReminderSent: (policyId: string, sentVia: "email" | "whatsapp") => void;
  onMarkPaymentReceived: (policyId: string, newDueDate: string) => void;
}

export function ReminderList({
  reminders,
  agentName,
  onMarkReminderSent,
  onMarkPaymentReceived,
}: ReminderListProps) {
  if (reminders.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Check className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-1">No reminders for this period</h3>
          <p className="text-sm text-muted-foreground">
            All caught up! No payments or renewals due in the selected timeframe.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder, index) => (
        <ReminderCard
          key={`${reminder.policy.id}-${reminder.reminderType}-${index}`}
          reminder={reminder}
          agentName={agentName}
          onMarkReminderSent={onMarkReminderSent}
          onMarkPaymentReceived={onMarkPaymentReceived}
        />
      ))}
    </div>
  );
}
