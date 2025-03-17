import React from "react";
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
import { Switch } from "@/components/ui/switch";

interface AddProductFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  type?: "product" | "service";
}

const AddProductForm = ({
  onSubmit = () => {},
  onCancel = () => {},
  type = "product",
}: AddProductFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would collect form data and validate
    onSubmit({
      name: "New Product",
      type: type,
      description: "Product description",
      price: 99.99,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder={`Enter ${type} name`} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder={`Describe your ${type}`}
            className="resize-none h-24"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select defaultValue={type === "product" ? "item" : "hour"}>
              <SelectTrigger id="unit">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {type === "product" ? (
                  <>
                    <SelectItem value="item">Item</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="license">License</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="hour">Hour</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tax">Tax Rate (%)</Label>
            <Input
              id="tax"
              type="number"
              min="0"
              step="0.1"
              defaultValue="10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">
              {type === "product" ? "SKU" : "Service Code"}
            </Label>
            <Input
              id="sku"
              placeholder={`Enter ${type === "product" ? "SKU" : "service code"}`}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="active" defaultChecked />
          <Label htmlFor="active">Active</Label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-full"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="rounded-full bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90"
        >
          {type === "product" ? "Add Product" : "Add Service"}
        </Button>
      </div>
    </form>
  );
};

export default AddProductForm;
