"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInvoices, recordPayment } from "@/lib/queries";

interface RecordPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

interface Invoice {
  id: string;
  number: string;
  total: number;
  status: string;
  client: {
    name: string;
  };
}

export default function RecordPaymentModal({
  open,
  onOpenChange,
  onSubmit,
}: RecordPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    invoiceId: "",
    amount: "",
    paymentMethod: "credit_card",
  });

  useEffect(() => {
    if (open) {
      loadInvoices();
    }
  }, [open]);

  const loadInvoices = async () => {
    try {
      setError(null);
      const { invoices } = await getInvoices();
      console.log('All invoices:', invoices); // Debug log
      // Only show unpaid invoices (draft, sent, or overdue)
      const unpaidInvoices = invoices.filter(
        inv => inv.status === 'draft' || inv.status === 'sent' || inv.status === 'overdue'
      );
      console.log('Unpaid invoices:', unpaidInvoices); // Debug log
      
      if (unpaidInvoices.length === 0) {
        setError('No unpaid invoices available');
      }
      
      setInvoices(unpaidInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setError('Failed to load invoices');
    }
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setFormData({
        ...formData,
        invoiceId,
        amount: invoice.total.toString(),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await recordPayment({
        invoiceId: formData.invoiceId,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
      });
      onSubmit();
      onOpenChange(false);
      setFormData({
        invoiceId: "",
        amount: "",
        paymentMethod: "credit_card",
      });
    } catch (error) {
      console.error('Error recording payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for an unpaid invoice.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoice">Invoice</Label>
            {error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : (
              <Select
                value={formData.invoiceId}
                onValueChange={handleInvoiceSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an invoice" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.map((invoice) => (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      {invoice.number} - {invoice.client.name} (${invoice.total})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) =>
                setFormData({ ...formData, paymentMethod: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 