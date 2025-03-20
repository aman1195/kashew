import React, { useState, useEffect } from "react";
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
  defaultValues?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxNumber?: string;
    notes?: string;
    contactName?: string;
  };
}

const AddClientForm = ({
  onSubmit = () => {},
  onCancel = () => {},
  defaultValues,
}: AddClientFormProps) => {
  // Parse address into components if provided
  const parseAddress = (address?: string) => {
    if (!address) return { address: '', city: '', state: '', zip: '', country: '' };
    
    const parts = address.split(', ');
    let result = { address: '', city: '', state: '', zip: '', country: '' };
    
    if (parts.length >= 1) result.address = parts[0];
    if (parts.length >= 2) result.city = parts[1];
    if (parts.length >= 3) result.state = parts[2];
    if (parts.length >= 4) result.zip = parts[3];
    if (parts.length >= 5) result.country = parts[4];
    
    return result;
  };
  
  // Parse payment terms from notes if provided
  const parsePaymentTerms = (notes?: string) => {
    if (!notes) return '30';
    const match = notes.match(/Payment Terms: Net (\d+)/);
    return match ? match[1] : '30';
  };
  
  const addressParts = parseAddress(defaultValues?.address);
  
  const [formData, setFormData] = useState({
    name: defaultValues?.name || "",
    email: defaultValues?.email || "",
    phone: defaultValues?.phone || "",
    address: addressParts.address,
    city: addressParts.city,
    state: addressParts.state,
    zip: addressParts.zip,
    country: addressParts.country,
    contactName: defaultValues?.contactName || "",
    contactEmail: "",
    contactPhone: "",
    position: "",
    taxNumber: defaultValues?.taxNumber || "",
    paymentTerms: parsePaymentTerms(defaultValues?.notes),
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
                <SelectItem value="Italy">Italy</SelectItem>
                <SelectItem value="Spain">Spain</SelectItem>
                <SelectItem value="Netherlands">Netherlands</SelectItem>
                <SelectItem value="Belgium">Belgium</SelectItem>
                <SelectItem value="Switzerland">Switzerland</SelectItem>
                <SelectItem value="Sweden">Sweden</SelectItem>
                <SelectItem value="Norway">Norway</SelectItem>
                <SelectItem value="Denmark">Denmark</SelectItem>
                <SelectItem value="Finland">Finland</SelectItem>
                <SelectItem value="Ireland">Ireland</SelectItem>
                <SelectItem value="Austria">Austria</SelectItem>
                <SelectItem value="Portugal">Portugal</SelectItem>
                <SelectItem value="Greece">Greece</SelectItem>
                <SelectItem value="Poland">Poland</SelectItem>
                <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                <SelectItem value="Hungary">Hungary</SelectItem>
                <SelectItem value="Slovakia">Slovakia</SelectItem>
                <SelectItem value="Romania">Romania</SelectItem>
                <SelectItem value="Bulgaria">Bulgaria</SelectItem>
                <SelectItem value="Croatia">Croatia</SelectItem>
                <SelectItem value="Slovenia">Slovenia</SelectItem>
                <SelectItem value="Estonia">Estonia</SelectItem>
                <SelectItem value="Latvia">Latvia</SelectItem>
                <SelectItem value="Lithuania">Lithuania</SelectItem>
                <SelectItem value="Cyprus">Cyprus</SelectItem>
                <SelectItem value="Malta">Malta</SelectItem>
                <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                <SelectItem value="Iceland">Iceland</SelectItem>
                <SelectItem value="New Zealand">New Zealand</SelectItem>
                <SelectItem value="Japan">Japan</SelectItem>
                <SelectItem value="South Korea">South Korea</SelectItem>
                <SelectItem value="Singapore">Singapore</SelectItem>
                <SelectItem value="Hong Kong">Hong Kong</SelectItem>
                <SelectItem value="India">India</SelectItem>
                <SelectItem value="China">China</SelectItem>
                <SelectItem value="Brazil">Brazil</SelectItem>
                <SelectItem value="Mexico">Mexico</SelectItem>
                <SelectItem value="Argentina">Argentina</SelectItem>
                <SelectItem value="Chile">Chile</SelectItem>
                <SelectItem value="Colombia">Colombia</SelectItem>
                <SelectItem value="Peru">Peru</SelectItem>
                <SelectItem value="Venezuela">Venezuela</SelectItem>
                <SelectItem value="South Africa">South Africa</SelectItem>
                <SelectItem value="Egypt">Egypt</SelectItem>
                <SelectItem value="Morocco">Morocco</SelectItem>
                <SelectItem value="Nigeria">Nigeria</SelectItem>
                <SelectItem value="Kenya">Kenya</SelectItem>
                <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                <SelectItem value="Israel">Israel</SelectItem>
                <SelectItem value="Turkey">Turkey</SelectItem>
                <SelectItem value="Russia">Russia</SelectItem>
                <SelectItem value="Ukraine">Ukraine</SelectItem>
                <SelectItem value="Kazakhstan">Kazakhstan</SelectItem>
                <SelectItem value="Thailand">Thailand</SelectItem>
                <SelectItem value="Malaysia">Malaysia</SelectItem>
                <SelectItem value="Indonesia">Indonesia</SelectItem>
                <SelectItem value="Philippines">Philippines</SelectItem>
                <SelectItem value="Vietnam">Vietnam</SelectItem>
                <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                <SelectItem value="Pakistan">Pakistan</SelectItem>
                <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                <SelectItem value="Nepal">Nepal</SelectItem>
                <SelectItem value="Myanmar">Myanmar</SelectItem>
                <SelectItem value="Cambodia">Cambodia</SelectItem>
                <SelectItem value="Laos">Laos</SelectItem>
                <SelectItem value="Mongolia">Mongolia</SelectItem>
                <SelectItem value="Brunei">Brunei</SelectItem>
                <SelectItem value="Timor-Leste">Timor-Leste</SelectItem>
                <SelectItem value="Afghanistan">Afghanistan</SelectItem>
                <SelectItem value="Iraq">Iraq</SelectItem>
                <SelectItem value="Iran">Iran</SelectItem>
                <SelectItem value="Syria">Syria</SelectItem>
                <SelectItem value="Lebanon">Lebanon</SelectItem>
                <SelectItem value="Jordan">Jordan</SelectItem>
                <SelectItem value="Yemen">Yemen</SelectItem>
                <SelectItem value="Oman">Oman</SelectItem>
                <SelectItem value="Qatar">Qatar</SelectItem>
                <SelectItem value="Bahrain">Bahrain</SelectItem>
                <SelectItem value="Kuwait">Kuwait</SelectItem>
                <SelectItem value="Tajikistan">Tajikistan</SelectItem>
                <SelectItem value="Turkmenistan">Turkmenistan</SelectItem>
                <SelectItem value="Uzbekistan">Uzbekistan</SelectItem>
                <SelectItem value="Kyrgyzstan">Kyrgyzstan</SelectItem>
                <SelectItem value="Azerbaijan">Azerbaijan</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Armenia">Armenia</SelectItem>
                <SelectItem value="Moldova">Moldova</SelectItem>
                <SelectItem value="Belarus">Belarus</SelectItem>
                <SelectItem value="Albania">Albania</SelectItem>
                <SelectItem value="Bosnia and Herzegovina">Bosnia and Herzegovina</SelectItem>
                <SelectItem value="Montenegro">Montenegro</SelectItem>
                <SelectItem value="Serbia">Serbia</SelectItem>
                <SelectItem value="North Macedonia">North Macedonia</SelectItem>
                <SelectItem value="Kosovo">Kosovo</SelectItem>
                <SelectItem value="Andorra">Andorra</SelectItem>
                <SelectItem value="Liechtenstein">Liechtenstein</SelectItem>
                <SelectItem value="Monaco">Monaco</SelectItem>
                <SelectItem value="San Marino">San Marino</SelectItem>
                <SelectItem value="Vatican City">Vatican City</SelectItem>
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
