"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClients, getProducts, createInvoice, getProfile } from "@/lib/queries";
import { Plus, Trash2 } from "lucide-react";
import InvoicePreview from "@/components/invoices/InvoicePreview";

interface AddInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  defaultValues?: {
    number?: string;
    date?: string;
    due_date?: string;
    client_id?: string;
    items?: InvoiceItem[];
    tax?: {
      rate?: number;
      type?: 'vat' | 'gst' | 'sales_tax';
      amount?: number;
    };
    notes?: string;
    terms?: string;
  };
}

interface Client {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  productId?: string;
}

interface TaxInfo {
  rate: number;
  amount: number;
  type: 'vat' | 'gst' | 'sales_tax';
  country: string;
}

export default function AddInvoiceModal({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: AddInvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
  });
  const [formData, setFormData] = useState({
    client_id: defaultValues?.client_id || "",
    date: defaultValues?.date || new Date().toISOString().split('T')[0],
    due_date: defaultValues?.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: defaultValues?.items || [] as InvoiceItem[],
    tax: {
      rate: defaultValues?.tax?.rate || 0,
      type: defaultValues?.tax?.type || 'vat' as const,
      country: '',
      amount: defaultValues?.tax?.amount || 0,
    } as TaxInfo,
  });

  const [isEditMode] = useState(!!defaultValues);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (open) {
      loadClients();
      loadProducts();
      loadCompanyInfo();
    }
  }, [open]);

  useEffect(() => {
    if (formData.client_id) {
      const client = clients.find(c => c.id === formData.client_id);
      if (client) {
        setSelectedClient(client);
      }
    }
  }, [formData.client_id, clients]);

  useEffect(() => {
    // Set product IDs for existing items when products are loaded
    if (isEditMode && products.length > 0 && formData.items.length > 0) {
      const itemsWithProductIds = formData.items.map(item => {
        // Try to find the product by name/description
        const product = products.find(p => 
          p.name === item.description || 
          p.description === item.description
        );
        return {
          ...item,
          productId: product?.id || item.productId || "",
        };
      });
      
      setFormData(prev => ({
        ...prev,
        items: itemsWithProductIds
      }));
    }
  }, [isEditMode, products, formData.items.length]);

  const loadClients = async () => {
    try {
      const { clients } = await getClients();
      setClients(clients.map(client => ({
        ...client,
        address: client.address || '',
        email: client.email || '',
        phone: client.phone || '',
      })));
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const { products } = await getProducts();
      setProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCompanyInfo = async () => {
    try {
      const profile = await getProfile();
      setCompanyInfo({
        name: profile.company_name || "",
        address: profile.billing_address || "",
        email: profile.company_email || profile.email,
        phone: profile.company_phone || profile.phone || "",
      });
    } catch (error) {
      console.error('Error loading company info:', error);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: "", quantity: 1, price: 0, productId: "" },
      ],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'quantity' || field === 'price' ? Number(value) : value,
    };
    setFormData({ ...formData, items: newItems });
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newItems = [...formData.items];
      newItems[index] = {
        description: product.name,
        quantity: 1,
        price: product.price,
        productId: product.id,
      };
      setFormData({ ...formData, items: newItems });
    }
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (formData.tax.rate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'date') {
      // When issue date changes, ensure due date is not before it
      const issueDate = new Date(value);
      const currentDueDate = new Date(formData.due_date);
      if (currentDueDate < issueDate) {
        // Set due date to issue date + 30 days
        const newDueDate = new Date(issueDate);
        newDueDate.setDate(newDueDate.getDate() + 30);
        setFormData({
          ...formData,
          date: value,
          due_date: newDueDate.toISOString().split('T')[0],
        });
        return;
      }
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const dueDate = new Date(value);
    const issueDate = new Date(formData.date);
    
    if (dueDate < issueDate) {
      alert('Due date cannot be before the issue date');
      return;
    }
    
    setFormData({ ...formData, due_date: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const subtotal = calculateSubtotal();
      const tax = calculateTax();
      const total = calculateTotal();

      const invoiceData = {
        clientId: formData.client_id,
        date: formData.date,
        dueDate: formData.due_date,
        items: formData.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          price: item.price,
        })),
        tax: {
          rate: formData.tax.rate,
          type: formData.tax.type,
          amount: tax,
        },
        subtotal,
        total,
        notes: "Thank you for your business!",
        terms: "Payment due within 30 days",
      };

      await onSubmit(invoiceData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{isEditMode ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col lg:flex-row h-[calc(90vh-80px)] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Issue Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleDateChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  name="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={handleDueDateChange}
                  min={formData.date}
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-5">
                      <Select
                        value={item.productId || ''}
                        onValueChange={(value) => handleProductSelect(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxType">Tax Type</Label>
                    <Select
                      value={formData.tax.type}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        tax: { ...formData.tax, type: value as 'vat' | 'gst' | 'sales_tax' }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tax type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vat">VAT</SelectItem>
                        <SelectItem value="gst">GST</SelectItem>
                        <SelectItem value="sales_tax">Sales Tax</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.tax.rate}
                      onChange={(e) => setFormData({
                        ...formData,
                        tax: { ...formData.tax, rate: Number(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Subtotal: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateSubtotal())}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tax ({formData.tax.type.toUpperCase()}): {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTax())}
                  </div>
                  <div className="text-lg font-semibold">
                    Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calculateTotal())}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || formData.items.length === 0}>
                    {loading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Invoice" : "Create Invoice")}
                  </Button>
                </div>
              </div>
            </form>
          </div>
          <div className="lg:w-1/2 border-t lg:border-t-0 lg:border-l overflow-y-auto bg-gray-50">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
              <div className="overflow-y-auto">
                <InvoicePreview
                  invoiceNumber={`INV-${Date.now().toString().slice(-6)}`}
                  issueDate={formData.date}
                  dueDate={formData.due_date}
                  billTo={{
                    name: selectedClient?.name || "Select a client",
                    address: selectedClient?.address || "",
                    email: selectedClient?.email || "",
                    phone: selectedClient?.phone || "",
                  }}
                  billFrom={companyInfo}
                  items={formData.items}
                  tax={{
                    rate: formData.tax.rate,
                    type: formData.tax.type,
                    amount: calculateTax(),
                  }}
                  notes="Thank you for your business!"
                  terms="Payment due within 30 days"
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
