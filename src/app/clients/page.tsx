"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreHorizontal, Users } from "lucide-react";
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
import AddClientModal from "@/components/modals/AddClientModal";
import { getClients, createClient, updateClient, deleteClient } from "@/lib/queries";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  totalInvoices: number;
  totalSpent: number;
}

export default function ClientsPage() {
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [summary, setSummary] = useState({
    totalClients: 0,
    activeClients: 0,
    totalRevenue: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching clients...');
      const data = await getClients();
      console.log('Fetched clients:', data);
      setClients(data.clients);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error loading clients:', error);
      setError('Failed to load clients. Please try again.');
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

  const handleAddClient = async (data: any) => {
    try {
      setSubmitting(true);
      setError(null);
      console.log('Creating client with data:', data);
      await createClient(data);
      await loadClients(); // Reload the clients list
      setAddClientOpen(false);
    } catch (error) {
      console.error('Error creating client:', error);
      setError('Failed to create client. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClient = async (clientId: string, data: any) => {
    try {
      setSubmitting(true);
      setError(null);
      await updateClient(clientId, data);
      await loadClients(); // Reload the clients list
    } catch (error) {
      console.error('Error updating client:', error);
      setError('Failed to update client. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
      setSubmitting(true);
      setError(null);
      await deleteClient(clientId);
      await loadClients(); // Reload the clients list
    } catch (error) {
      console.error('Error deleting client:', error);
      setError('Failed to delete client. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.phone && client.phone.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <DashboardLayout title="Clients">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Clients">
      <div className="space-y-6 pb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Clients</h1>
            <p className="text-muted-foreground">
              Manage your client relationships
            </p>
          </div>
          <Button
            className="gap-2 rounded-full bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90"
            onClick={() => setAddClientOpen(true)}
            disabled={submitting}
          >
            <Plus className="h-4 w-4" />
            {submitting ? "Adding..." : "Add Client"}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="modern-card bg-vibrant-yellow p-6">
            <div className="rounded-full bg-black/10 p-3 w-fit">
              <Users className="h-6 w-6 text-black" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-black/70">Total Clients</p>
              <h3 className="text-3xl font-bold text-black">{summary.totalClients}</h3>
            </div>
          </div>

          <div className="modern-card bg-vibrant-pink p-6">
            <div className="rounded-full bg-black/10 p-3 w-fit">
              <Users className="h-6 w-6 text-black" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-black/70">Active Clients</p>
              <h3 className="text-3xl font-bold text-black">{summary.activeClients}</h3>
            </div>
          </div>

          <div className="modern-card bg-vibrant-green p-6">
            <div className="rounded-full bg-white/10 p-3 w-fit">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-white/70">Total Revenue</p>
              <h3 className="text-3xl font-bold text-white">
                {formatCurrency(summary.totalRevenue)}
              </h3>
            </div>
          </div>
        </div>

        <div className="modern-card bg-background">
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Client List</h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search clients..."
                  className="w-[250px] pl-8 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            {filteredClients.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                {searchQuery ? "No clients found matching your search." : "No clients yet. Add your first client to get started."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Invoices</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.contactName}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{client.totalInvoices}</TableCell>
                      <TableCell>{formatCurrency(client.totalSpent)}</TableCell>
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
                            <DropdownMenuItem onClick={() => router.push(`/clients/${client.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/clients/${client.id}/edit`)}>
                              Edit Client
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/invoices/new?clientId=${client.id}`)}>
                              Create Invoice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClient(client.id)}
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

        {/* Add Client Modal */}
        <AddClientModal
          open={addClientOpen}
          onOpenChange={setAddClientOpen}
          onSubmit={handleAddClient}
        />
      </div>
    </DashboardLayout>
  );
}
