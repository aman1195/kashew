"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getClients, updateClient } from "@/lib/queries";
import AddClientModal from "@/components/modals/AddClientModal";

interface Client {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  notes: string;
  totalInvoices: number;
  totalSpent: number;
}

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClient();
  }, []);

  async function loadClient() {
    try {
      const data = await getClients();
      const foundClient = data.clients.find((c: Client) => c.id === params.id);
      if (!foundClient) {
        setError("Client not found");
        return;
      }
      setClient(foundClient);
    } catch (error) {
      console.error('Error loading client:', error);
      setError("Failed to load client");
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateClient = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      await updateClient(params.id as string, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        tax_number: data.tax_number,
        notes: data.notes,
        contact_name: data.contact_name,
      });

      router.push(`/clients/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating client:', error);
      setError("Failed to update client");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Client">
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
          <Button onClick={() => router.push("/clients")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout title="Client Not Found">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <h1 className="text-2xl font-bold mb-4">Client Not Found</h1>
          <Button onClick={() => router.push("/clients")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Edit ${client.name}`}>
      <div className="space-y-6 pb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/clients/${client.id}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit {client.name}</h1>
              <p className="text-muted-foreground">
                Update client information
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
          <AddClientModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onSubmit={handleUpdateClient}
            defaultValues={{
              name: client.name,
              email: client.email,
              phone: client.phone || '',
              address: client.address || '',
              taxNumber: client.taxNumber || '',
              notes: client.notes || '',
              contactName: client.contactName || '',
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
} 