"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Archive, Trash } from "lucide-react";
import { getProducts, deleteProduct, updateProduct } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";

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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      setLoading(true);
      await deleteProduct(params.id as string);
      router.push('/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      setError("Failed to delete product");
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!product) return;
    
    try {
      setLoading(true);
      await updateProduct(product.id, {
        ...product,
        archived: !product.archived
      });
      await loadProduct();
    } catch (error) {
      console.error('Error archiving product:', error);
      setError("Failed to archive product");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Product Details">
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
    <DashboardLayout title={product.name}>
      <div className="space-y-6 pb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/products")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground">
                {product.type} Details
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/products/${product.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleArchive}
            >
              <Archive className="mr-2 h-4 w-4" />
              {product.archived ? 'Unarchive' : 'Archive'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="modern-card bg-background p-6">
            <h2 className="text-lg font-semibold mb-4">Product Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge variant={product.type === 'Product' ? 'default' : 'secondary'}>
                  {product.type}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{product.description || 'No description provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={product.archived ? 'destructive' : 'success'}>
                  {product.archived ? 'Archived' : 'Active'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="modern-card bg-background p-6">
            <h2 className="text-lg font-semibold mb-4">Pricing Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(product.price)}
                  {product.unit ? ` per ${product.unit}` : ''}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tax Rate</p>
                <p className="font-medium">{product.taxRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 