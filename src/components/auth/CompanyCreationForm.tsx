"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCompany } from "@/contexts/CompanyContext";

interface CompanyCreationFormProps {
  className?: string;
}

const CompanyCreationForm = ({ className = "" }: CompanyCreationFormProps) => {
  const router = useRouter();
  const { updateCompany } = useCompany();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    tax_id: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await updateCompany(formData);
      router.push("/dashboard");
    } catch (err) {
      console.error('Company creation error:', err);
      setError(err instanceof Error ? err.message : "Failed to create company. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Card className={`w-full max-w-md mx-auto modern-card ${className}`}>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center gap-2">
          <div className="rounded-md bg-vibrant-yellow p-2">
            <Building2 className="h-6 w-6 text-black" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Your Company</CardTitle>
        </div>
        <CardDescription className="text-center">
          Set up your company profile to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Your Company Name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Company Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contact@company.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Company Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Billing Address</Label>
            <Input
              id="address"
              name="address"
              placeholder="123 Business Ave, Suite 100, City, State ZIP"
              value={formData.address}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax_id">Tax ID / VAT Number</Label>
            <Input
              id="tax_id"
              name="tax_id"
              placeholder="US123456789"
              value={formData.tax_id}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Company...
              </>
            ) : (
              "Create Company"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm text-muted-foreground">
        This information will be used for your invoices and business documents.
      </CardFooter>
    </Card>
  );
};

export default CompanyCreationForm; 