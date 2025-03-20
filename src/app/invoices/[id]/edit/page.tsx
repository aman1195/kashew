"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getInvoices, updateInvoice } from "@/lib/queries";
import AddInvoiceModal from "@/components/modals/AddInvoiceModal";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  status: string;
  subtotal: number;
  total: number;
  tax: {
    rate: number;
    type: string;
    amount: number;
  };
  notes: string;
  terms: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  items: InvoiceItem[];
}

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvoice();
  }, []);

  async function loadInvoice() {
    try {
      const data = await getInvoices();
      const foundInvoice = data.invoices.find((inv: Invoice) => inv.id === params.id);
      if (!foundInvoice) {
        setError("Invoice not found");
        return;
      }
      setInvoice(foundInvoice);
    } catch (error) {
      console.error('Error loading invoice:', error);
      setError("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateInvoice = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update the invoice
      await updateInvoice(params.id as string, {
        date: data.date,
        dueDate: data.dueDate,
        items: data.items,
        tax: data.tax,
        notes: data.notes,
        terms: data.terms,
      });

      // Navigate back to invoice details
      router.push(`/invoices/${params.id}`);
      router.refresh(); // Refresh the page to show updated data
    } catch (error) {
      console.error('Error updating invoice:', error);
      setError("Failed to update invoice");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Invoice">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Error">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <h1 className="text-2xl font-bold mb-4 text-red-600">{error}</h1>
          <Button onClick={() => router.push("/invoices")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout title="Invoice Not Found">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <h1 className="text-2xl font-bold mb-4">Invoice Not Found</h1>
          <Button onClick={() => router.push("/invoices")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Edit Invoice ${invoice.number}`}>
      <div className="space-y-6 pb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/invoices/${invoice.id}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Invoice #{invoice.number}</h1>
              <p className="text-muted-foreground">
                {invoice.client.name}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {editModalOpen && (
          <AddInvoiceModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onSubmit={handleUpdateInvoice}
            defaultValues={{
              number: invoice.number,
              date: invoice.date,
              dueDate: invoice.dueDate,
              clientId: invoice.client.id,
              items: invoice.items,
              tax: invoice.tax,
              notes: invoice.notes,
              terms: invoice.terms,
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
} 