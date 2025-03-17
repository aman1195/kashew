"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  MoreHorizontal,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getPayments, deletePayment, updatePayment } from "@/lib/queries";
import RecordPaymentModal from "@/components/modals/RecordPaymentModal";

interface Payment {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  date: string;
  method: string;
  status: string;
}

interface PaymentSummary {
  totalReceived: number;
  pendingAmount: number;
  failedAmount: number;
  changes: {
    receivedChange: number;
    pendingChange: number;
    failedChange: number;
  };
}

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    totalReceived: 0,
    pendingAmount: 0,
    failedAmount: 0,
    changes: {
      receivedChange: 0,
      pendingChange: 0,
      failedChange: 0,
    },
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecordPayment, setShowRecordPayment] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    try {
      const data = await getPayments();
      setPayments(data.payments);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusStyles = {
    completed: {
      variant: "secondary" as const,
      label: "Completed",
      className: "bg-vibrant-green text-white hover:bg-vibrant-green",
    },
    pending: {
      variant: "outline" as const,
      label: "Pending",
      className: "bg-vibrant-yellow text-black hover:bg-vibrant-yellow",
    },
    failed: {
      variant: "destructive" as const,
      label: "Failed",
      className: "bg-vibrant-pink text-black hover:bg-vibrant-pink",
    },
  };

  const filteredPayments = payments.filter(payment =>
    payment.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePaymentRecorded = () => {
    loadPayments();
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    
    try {
      setLoading(true);
      await deletePayment(paymentId);
      await loadPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async (paymentId: string, data: {
    amount?: number;
    payment_method?: string;
    status?: 'completed' | 'pending' | 'failed';
  }) => {
    try {
      setLoading(true);
      await updatePayment(paymentId, data);
      await loadPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Payments">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Payments">
      <div className="space-y-6 pb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Payments</h1>
            <p className="text-muted-foreground">
              Manage and track your payments
            </p>
          </div>
          <Button 
            className="gap-2 rounded-full bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90"
            onClick={() => setShowRecordPayment(true)}
          >
            <Plus className="h-4 w-4" />
            Record Payment
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="modern-card bg-vibrant-green p-6">
            <div className="rounded-full bg-white/10 p-3 w-fit">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-white/70">Total Received</p>
              <h3 className="text-3xl font-bold text-white">
                {formatCurrency(summary.totalReceived)}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                {summary.changes.receivedChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-white/70" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-white/70" />
                )}
                <span className="text-sm text-white/70">
                  {summary.changes.receivedChange >= 0 ? "+" : ""}
                  {summary.changes.receivedChange.toFixed(1)}% from last month
                </span>
              </div>
            </div>
          </div>

          <div className="modern-card bg-vibrant-yellow p-6">
            <div className="rounded-full bg-black/10 p-3 w-fit">
              <CreditCard className="h-6 w-6 text-black" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-black/70">Pending</p>
              <h3 className="text-3xl font-bold text-black">
                {formatCurrency(summary.pendingAmount)}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                {summary.changes.pendingChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-black/70" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-black/70" />
                )}
                <span className="text-sm text-black/70">
                  {summary.changes.pendingChange >= 0 ? "+" : ""}
                  {summary.changes.pendingChange.toFixed(1)}% from last month
                </span>
              </div>
            </div>
          </div>

          <div className="modern-card bg-vibrant-pink p-6">
            <div className="rounded-full bg-black/10 p-3 w-fit">
              <CreditCard className="h-6 w-6 text-black" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-black/70">Failed</p>
              <h3 className="text-3xl font-bold text-black">
                {formatCurrency(summary.failedAmount)}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                {summary.changes.failedChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-black/70" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-black/70" />
                )}
                <span className="text-sm text-black/70">
                  {summary.changes.failedChange >= 0 ? "+" : ""}
                  {summary.changes.failedChange.toFixed(1)}% from last month
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modern-card bg-background">
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Payment History</h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search payments..."
                  className="w-[250px] pl-8 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.invoiceNumber}
                    </TableCell>
                    <TableCell>{payment.clientName}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{formatDate(payment.date)}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>
                      <Badge
                        variant={statusStyles[payment.status].variant}
                        className={
                          statusStyles[payment.status].className +
                          " rounded-full px-3"
                        }
                      >
                        {statusStyles[payment.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Send Receipt</DropdownMenuItem>
                          {payment.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleUpdatePayment(payment.id, { status: 'completed' })}>
                              Mark as Completed
                            </DropdownMenuItem>
                          )}
                          {payment.status === 'failed' && (
                            <DropdownMenuItem onClick={() => handleUpdatePayment(payment.id, { status: 'completed' })}>
                              Mark as Completed
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            Delete Payment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <RecordPaymentModal
        open={showRecordPayment}
        onOpenChange={setShowRecordPayment}
        onSubmit={handlePaymentRecorded}
      />
    </DashboardLayout>
  );
}
