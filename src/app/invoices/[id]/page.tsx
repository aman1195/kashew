"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { getInvoices } from "@/lib/queries";
import InvoicePreview from "@/components/invoices/InvoicePreview";

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  client: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  items: {
    description: string;
    quantity: number;
    price: number;
  }[];
  tax: {
    rate: number;
    type: 'vat' | 'gst' | 'sales_tax';
    amount: number;
  };
  status: string;
  total: number;
}

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvoice();
  }, []);

  async function loadInvoice() {
    try {
      const { invoices } = await getInvoices();
      const foundInvoice = invoices.find((inv: Invoice) => inv.id === params.id);
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

  const handleDownload = () => {
    // Create a new window with the invoice preview
    const printWindow = window.open('', '_blank');
    if (printWindow && invoice) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.number}</title>
            <style>
              body { font-family: Arial, sans-serif; }
              .invoice { max-width: 800px; margin: 0 auto; padding: 20px; }
            </style>
          </head>
          <body>
            <div class="invoice">
              ${document.querySelector('.invoice-preview')?.innerHTML}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Invoice Details">
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
    <DashboardLayout title={`Invoice ${invoice.number}`}>
      <div className="space-y-6 pb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/invoices")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Invoice {invoice.number}</h1>
              <p className="text-muted-foreground">
                {new Date(invoice.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>

        <div className="invoice-preview">
          <InvoicePreview
            invoiceNumber={invoice.number}
            issueDate={invoice.date}
            dueDate={invoice.dueDate}
            billTo={invoice.client}
            billFrom={{
              name: "Your Company",
              address: "123 Company Street, City, Country",
              email: "company@example.com",
              phone: "(123) 456-7890",
            }}
            items={invoice.items}
            tax={invoice.tax}
            notes="Thank you for your business!"
            terms="Payment due within 30 days"
          />
        </div>
      </div>
    </DashboardLayout>
  );
} 