"use client";

import React, { useState } from "react";
import { Mic, MicOff, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

interface VoiceInvoiceModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onComplete?: (invoiceData: any) => void;
}

const VoiceInvoiceModal = ({
  open = true,
  onOpenChange = () => {},
  onComplete = () => {},
}: VoiceInvoiceModalProps) => {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);

  const startRecording = () => {
    setRecording(true);
    // Simulate progress increase
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 500);

    // Simulate recording for 5 seconds
    setTimeout(() => {
      stopRecording();
      clearInterval(interval);
    }, 5000);
  };

  const stopRecording = () => {
    setRecording(false);
    setProgress(100);
    setTranscript(
      "Create an invoice for client Acme Corp for web design services. Include 3 items: website redesign for $2,500, logo design for $800, and SEO optimization for $1,200. Set the due date for 30 days from today.",
    );
    processVoiceToInvoice();
  };

  const processVoiceToInvoice = () => {
    setProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const mockInvoice = {
        client: {
          name: "Acme Corp",
          email: "billing@acmecorp.com",
          address: "123 Business St, Suite 100",
        },
        items: [
          { description: "Website Redesign", quantity: 1, price: 2500 },
          { description: "Logo Design", quantity: 1, price: 800 },
          { description: "SEO Optimization", quantity: 1, price: 1200 },
        ],
        subtotal: 4500,
        tax: 450,
        total: 4950,
        dueDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toLocaleDateString(),
      };

      setGeneratedInvoice(mockInvoice);
      setProcessing(false);
      setCompleted(true);
    }, 3000);
  };

  const handleComplete = () => {
    onComplete(generatedInvoice);
    onOpenChange(false);

    // Reset state for next time
    setTimeout(() => {
      setRecording(false);
      setProcessing(false);
      setCompleted(false);
      setProgress(0);
      setTranscript("");
      setGeneratedInvoice(null);
    }, 300);
  };

  const handleCancel = () => {
    onOpenChange(false);

    // Reset state for next time
    setTimeout(() => {
      setRecording(false);
      setProcessing(false);
      setCompleted(false);
      setProgress(0);
      setTranscript("");
      setGeneratedInvoice(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background">
        <DialogHeader>
          <DialogTitle>
            {completed
              ? "AI-Generated Invoice"
              : processing
                ? "Processing Voice Input"
                : "Voice to Invoice"}
          </DialogTitle>
          <DialogDescription>
            {completed
              ? "Review the AI-generated invoice based on your voice input."
              : processing
                ? "Our AI is analyzing your voice input and creating an invoice..."
                : "Speak clearly to describe the invoice details including client, items, and due date."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!completed && !processing && (
            <div className="flex flex-col items-center justify-center space-y-6">
              <div
                className={`h-24 w-24 rounded-full flex items-center justify-center transition-all duration-300 ${recording ? "bg-red-100 animate-pulse scale-110" : "bg-muted"}`}
              >
                <Button
                  variant={recording ? "destructive" : "default"}
                  size="icon"
                  className="h-16 w-16 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                  onClick={recording ? stopRecording : startRecording}
                >
                  {recording ? (
                    <MicOff className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>
              </div>
              {recording && (
                <div className="w-full space-y-2">
                  <Progress value={progress} className="h-2 w-full" />
                  <p className="text-center text-sm text-muted-foreground">
                    Listening... {progress}%
                  </p>
                </div>
              )}
              {transcript && (
                <div className="w-full">
                  <p className="text-sm font-medium mb-2">Transcript:</p>
                  <Textarea
                    value={transcript}
                    readOnly
                    className="resize-none h-24"
                  />
                </div>
              )}
            </div>
          )}

          {processing && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-center text-sm">
                Processing your voice input...
              </p>
            </div>
          )}

          {completed && generatedInvoice && (
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-2">Client Information</h3>
                <p>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  {generatedInvoice.client.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  {generatedInvoice.client.email}
                </p>
                <p>
                  <span className="text-muted-foreground">Address:</span>{" "}
                  {generatedInvoice.client.address}
                </p>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-2">Invoice Items</h3>
                <div className="space-y-2">
                  {generatedInvoice.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.description}</span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${generatedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span>${generatedInvoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${generatedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-2">Payment Details</h3>
                <p>
                  <span className="text-muted-foreground">Due Date:</span>{" "}
                  {generatedInvoice.dueDate}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {completed ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleComplete} className="gap-2">
                <Check className="h-4 w-4" /> Use This Invoice
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceInvoiceModal;
