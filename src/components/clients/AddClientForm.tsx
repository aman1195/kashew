import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddClientFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

const AddClientForm = ({
  onSubmit = () => {},
  onCancel = () => {},
}: AddClientFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    position: "",
    taxNumber: "",
    paymentTerms: "30",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Format the address string
    const formattedAddress = [
      formData.address,
      formData.city,
      formData.state,
      formData.zip,
      formData.country
    ].filter(Boolean).join(', ');

    onSubmit({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      address: formattedAddress || null,
      contact_name: formData.contactName || null,
      tax_number: formData.taxNumber || null,
      notes: formData.paymentTerms ? `Payment Terms: Net ${formData.paymentTerms}` : null
    });
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Company Information</h3>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input 
              id="companyName" 
              placeholder="Enter company name" 
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="company@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Enter company address"
              className="resize-none h-20"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input 
                id="state" 
                placeholder="State/Province"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">Zip/Postal Code</Label>
              <Input 
                id="zip" 
                placeholder="Zip/Postal Code"
                value={formData.zip}
                onChange={(e) => handleChange('zip', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={formData.country} onValueChange={(value) => handleChange('country', value)}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
                <SelectItem value="Germany">Germany</SelectItem>
                <SelectItem value="France">France</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Primary Contact</h3>
          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input 
              id="contactName" 
              placeholder="Full name" 
              value={formData.contactName}
              onChange={(e) => handleChange('contactName', e.target.value)}
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="contact@example.com"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone</Label>
              <Input 
                id="contactPhone" 
                type="tel" 
                placeholder="(555) 123-4567"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input 
              id="position" 
              placeholder="Job title"
              value={formData.position}
              onChange={(e) => handleChange('position', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Billing Information</h3>
          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID / VAT Number</Label>
            <Input 
              id="taxId" 
              placeholder="Enter tax ID or VAT number"
              value={formData.taxNumber}
              onChange={(e) => handleChange('taxNumber', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Select value={formData.paymentTerms} onValueChange={(value) => handleChange('paymentTerms', value)}>
              <SelectTrigger id="paymentTerms">
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Net 7 - Due in 7 days</SelectItem>
                <SelectItem value="15">Net 15 - Due in 15 days</SelectItem>
                <SelectItem value="30">Net 30 - Due in 30 days</SelectItem>
                <SelectItem value="60">Net 60 - Due in 60 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button onClick={(e) => handleSubmit(e as any)}>Add Client</Button>
      </div>
    </div>
  );
};

export default AddClientForm;
