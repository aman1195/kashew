"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getProducts, updateProduct } from "@/lib/queries";
import AddProductModal from "@/components/modals/AddProductModal";

interface Product {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  unit: string;
  taxRate: number;
  archived: boolean;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProduct();
  }, []);

  async function loadProduct() {
    try {
      const data = await getProducts();
      const foundProduct = data.products.find((p: Product) => p.id === params.id);
      if (!foundProduct) {
        setError("Product not found");
        return;
      }
      setProduct(foundProduct);
    } catch (error) {
      console.error('Error loading product:', error);
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateProduct = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      await updateProduct(params.id as string, data);

      router.push(`/products/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating product:', error);
      setError("Failed to update product");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Product">
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
          <Button onClick={() => router.push("/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!product) {
    return (
      <DashboardLayout title="Product Not Found">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => router.push("/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Edit ${product.name}`}>
      <div className="space-y-6 pb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/products/${product.id}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit {product.name}</h1>
              <p className="text-muted-foreground">
                Update product information
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
          <AddProductModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onSubmit={handleUpdateProduct}
            type={product.type.toLowerCase() === 'service' ? 'service' : 'product'}
            editData={{
              id: product.id,
              name: product.name,
              description: product.description || '',
              price: product.price,
              unit: product.unit || '',
              taxRate: product.taxRate || 0,
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
} 