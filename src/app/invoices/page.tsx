"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreHorizontal, FileText, DollarSign, AlertCircle } from "lucide-react";
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
import { getInvoices } from "@/lib/queries";
import AddInvoiceModal from "@/components/modals/AddInvoiceModal";
import { createInvoice, updateInvoice, deleteInvoice } from "@/lib/queries";
import { useRouter } from "next/navigation";

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  status: string;
  total: number;
  client: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    price: number;
  }>;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [addInvoiceOpen, setAddInvoiceOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      const data = await getInvoices();
      setInvoices(data.invoices);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error loading invoices:', error);
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default: // sent/pending
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateInvoice = async (data: any) => {
    try {
      setLoading(true);
      await createInvoice(data);
      await loadInvoices(); // Reload the invoices list
      setAddInvoiceOpen(false);
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/invoices/${invoiceId}`);
  };

  const handleEditInvoice = (invoiceId: string) => {
    router.push(`/invoices/${invoiceId}/edit`);
  };

  const handleDownloadPDF = async (invoice: any) => {
    // For now, just show an alert
    alert('PDF download functionality coming soon');
  };

  const handleSendToClient = async (invoice: any) => {
    // For now, just show an alert
    alert('Send to client functionality coming soon');
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      setLoading(true);
      await updateInvoice(invoiceId, { status: 'paid' });
      await loadInvoices();
    } catch (error) {
      console.error('Error updating invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      setLoading(true);
      await deleteInvoice(invoiceId);
      await loadInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
  return (
      <DashboardLayout title="Invoices">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Invoices">
          <div className="space-y-6 pb-8">
            <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">Invoices</h1>
                  <p className="text-muted-foreground">
              Manage your invoices and payments
                  </p>
                </div>
                <Button
                  className="gap-2 rounded-full bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90"
                  onClick={() => setAddInvoiceOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create Invoice
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="modern-card bg-vibrant-yellow p-6">
                <div className="rounded-full bg-black/10 p-3 w-fit">
                  <FileText className="h-6 w-6 text-black" />
                </div>
                <div className="mt-4">
              <p className="text-sm text-black/70">Total Invoices</p>
              <h3 className="text-3xl font-bold text-black">{summary.totalInvoices}</h3>
                </div>
              </div>

          <div className="modern-card bg-vibrant-pink p-6">
                <div className="rounded-full bg-black/10 p-3 w-fit">
              <DollarSign className="h-6 w-6 text-black" />
                </div>
                <div className="mt-4">
              <p className="text-sm text-black/70">Total Amount</p>
              <h3 className="text-3xl font-bold text-black">
                {formatCurrency(summary.totalAmount)}
              </h3>
            </div>
          </div>

          <div className="modern-card bg-vibrant-green p-6">
            <div className="rounded-full bg-white/10 p-3 w-fit">
              <AlertCircle className="h-6 w-6 text-white" />
                </div>
            <div className="mt-4">
              <p className="text-sm text-white/70">Overdue</p>
              <h3 className="text-3xl font-bold text-white">{summary.overdueInvoices}</h3>
                </div>
              </div>
            </div>

        <div className="modern-card bg-background">
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Invoice List</h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search invoices..."
                  className="w-[250px] pl-8 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                {searchQuery ? "No invoices found matching your search." : "No invoices yet. Create your first invoice to get started."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.number}</TableCell>
                      <TableCell>{invoice.client.name}</TableCell>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>{formatCurrency(invoice.total)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
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
                            <DropdownMenuItem onClick={() => handleViewInvoice(invoice.id)}>
                              View Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditInvoice(invoice.id)}>
                              Edit Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendToClient(invoice)}>
                              Send to Client
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                              Mark as Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
      {addInvoiceOpen && (
        <AddInvoiceModal
          open={addInvoiceOpen}
          onOpenChange={setAddInvoiceOpen}
          onSubmit={handleCreateInvoice}
        />
      )}
    </DashboardLayout>
  );
}
