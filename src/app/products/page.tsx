"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  MoreHorizontal,
  ShoppingBag,
  Package2,
  Archive,
  Coins,
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
import AddProductModal from "@/components/modals/AddProductModal";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/queries";
import { useRouter } from "next/navigation";

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

export default function ProductsPage() {
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalValue: 0,
    activeProducts: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(data.products);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error loading products:', error);
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

  const handleAddProduct = async (data: any) => {
    try {
      setAddProductOpen(false);
      await loadProducts(); // Reload the products list
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleAddService = async (data: any) => {
    try {
      setAddServiceOpen(false);
      await loadProducts(); // Reload the products list
    } catch (error) {
      console.error('Error creating service:', error);
    }
  };

  const handleArchiveProduct = async (productId: string, archived: boolean) => {
    try {
      await updateProduct(productId, { archived });
      await loadProducts(); // Reload the products list
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await deleteProduct(productId);
      await loadProducts(); // Reload the products list
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout title="Products">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Products & Services">
      <div className="space-y-6 pb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Products & Services</h1>
            <p className="text-muted-foreground">
              Manage your products and services catalog
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="gap-2 rounded-full"
              onClick={() => setAddProductOpen(true)}
            >
              <Package2 className="h-4 w-4" />
              Add Product
            </Button>
            <Button
              className="gap-2 rounded-full bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90"
              onClick={() => setAddServiceOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="modern-card bg-vibrant-yellow p-6">
            <div className="rounded-full bg-black/10 p-3 w-fit">
              <Package2 className="h-6 w-6 text-black" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-black/70">Total Products</p>
              <h3 className="text-3xl font-bold text-black">{summary.totalProducts}</h3>
            </div>
          </div>

          <div className="modern-card bg-vibrant-pink p-6">
            <div className="rounded-full bg-black/10 p-3 w-fit">
              <Archive className="h-6 w-6 text-black" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-black/70">Active Products</p>
              <h3 className="text-3xl font-bold text-black">{summary.activeProducts}</h3>
            </div>
          </div>

          <div className="modern-card bg-vibrant-green p-6">
            <div className="rounded-full bg-white/10 p-3 w-fit">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-white/70">Total Value</p>
              <h3 className="text-3xl font-bold text-white">
                {formatCurrency(summary.totalValue)}
              </h3>
            </div>
          </div>
        </div>

        <div className="modern-card bg-background">
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Product List</h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-[250px] pl-8 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                {searchQuery ? "No products found matching your search." : "No products yet. Add your first product to get started."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Tax Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`rounded-full px-3 ${product.type === "Service" ? "bg-vibrant-pink text-black" : "bg-vibrant-yellow text-black"}`}
                        >
                          {product.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{product.description}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>Per {product.unit}</TableCell>
                      <TableCell>{product.taxRate}%</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          product.archived 
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.archived ? 'Archived' : 'Active'}
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
                            <DropdownMenuItem onClick={() => router.push(`/products/${product.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/products/${product.id}/edit`)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={async () => {
                                if (confirm('Are you sure you want to archive this product?')) {
                                  await updateProduct(product.id, {
                                    ...product,
                                    archived: !product.archived,
                                  });
                                  loadProducts();
                                }
                              }}
                            >
                              {product.archived ? 'Unarchive' : 'Archive'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this product?')) {
                                  await deleteProduct(product.id);
                                  loadProducts();
                                }
                              }}
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

        {/* Add Product Modal */}
        <AddProductModal
          open={addProductOpen}
          onOpenChange={setAddProductOpen}
          onSubmit={handleAddProduct}
          type="product"
        />

        {/* Add Service Modal */}
        <AddProductModal
          open={addServiceOpen}
          onOpenChange={setAddServiceOpen}
          onSubmit={handleAddService}
          type="service"
        />
      </div>
    </DashboardLayout>
  );
}
