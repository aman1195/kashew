import React from "react";
import { FileText, MoreHorizontal, Eye, Trash, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
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

type InvoiceStatus = "paid" | "pending" | "overdue";

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
}

interface RecentInvoicesProps {
  invoices?: Invoice[];
  className?: string;
}

const statusStyles: Record<InvoiceStatus, {
  variant: "default" | "outline" | "destructive";
  label: string;
  className: string;
}> = {
  paid: {
    variant: "default",
    label: "Paid",
    className: "bg-vibrant-green text-white hover:bg-vibrant-green",
  },
  pending: {
    variant: "outline",
    label: "Pending",
    className: "bg-vibrant-yellow text-black hover:bg-vibrant-yellow",
  },
  overdue: {
    variant: "destructive",
    label: "Overdue",
    className: "bg-vibrant-pink text-black hover:bg-vibrant-pink",
  },
};

const getStatusStyle = (status: string) => {
  if (status in statusStyles) {
    return statusStyles[status as InvoiceStatus];
  }
  return {
    variant: "default" as const,
    label: status.charAt(0).toUpperCase() + status.slice(1),
    className: "bg-gray-500 text-white",
  };
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const RecentInvoices = ({ invoices = [], className }: RecentInvoicesProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!invoices.length) {
    return (
      <div className={cn("modern-card w-full bg-background p-6", className)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Invoices</h2>
          <Button variant="outline" size="sm" className="rounded-full">
            View All
          </Button>
        </div>
        <div className="text-center py-6 text-muted-foreground">
          No invoices found. Create your first invoice to get started.
        </div>
      </div>
    );
  }

  return (
    <div className={cn("modern-card w-full bg-background", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Invoices</h2>
          <Button variant="outline" size="sm" className="rounded-full">
            View All
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell>{invoice.clientName}</TableCell>
                <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                <TableCell>{formatDate(invoice.date)}</TableCell>
                <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusStyle(invoice.status).variant}
                    className={cn(
                      getStatusStyle(invoice.status).className,
                      "rounded-full px-3"
                    )}
                  >
                    {getStatusStyle(invoice.status).label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Send className="mr-2 h-4 w-4" />
                        Send Invoice
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
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
  );
};

export default RecentInvoices;
