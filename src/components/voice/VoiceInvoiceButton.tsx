import React, { useState } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VoiceInvoiceButtonProps {
  className?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  tooltip?: string;
}

const VoiceInvoiceButton = ({
  className = "",
  position = "bottom-right",
  tooltip = "Create invoice with voice",
}: VoiceInvoiceButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-background">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleOpenModal}
              size="lg"
              className={`fixed ${positionClasses[position]} h-14 w-14 rounded-full shadow-lg ${className} transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95`}
            >
              <Mic className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* The modal will be handled by the parent component */}
      {/* We're not importing VoiceInvoiceModal directly */}
    </div>
  );
};

export default VoiceInvoiceButton;
