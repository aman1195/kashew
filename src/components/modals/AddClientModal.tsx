import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import AddClientForm from "@/components/clients/AddClientForm";

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: any) => void;
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

const AddClientModal = ({
  open,
  onOpenChange,
  onSubmit = () => {},
  defaultValues,
}: AddClientModalProps) => {
  const isEditMode = !!defaultValues;
  
  const handleSubmit = (data: any) => {
    onSubmit(data);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 gap-0">
        <div className="p-6 border-b">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Client" : "Add New Client"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update client information." : "Add a new client to your client list."}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="max-h-[calc(85vh-8rem)] overflow-y-auto p-6">
          <AddClientForm 
            onSubmit={handleSubmit} 
            onCancel={handleCancel} 
            defaultValues={defaultValues}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientModal;
