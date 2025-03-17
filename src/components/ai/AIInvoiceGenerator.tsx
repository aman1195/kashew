"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";

interface AIInvoiceGeneratorProps {
  onGenerate: (data: any) => void;
  className?: string;
}

const AIInvoiceGenerator = ({
  onGenerate,
  className = "",
}: AIInvoiceGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      // Simulate API call to OpenAI
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Extract client information
      const clientMatch = prompt.match(/client[:\s]+([\w\s]+)[,\.\n]?/i);
      const clientName = clientMatch ? clientMatch[1].trim() : "Sample Client";

      // Extract items (simplified)
      const items = [];
      const itemMatches = prompt.matchAll(
        /item[:\s]+([\w\s]+)[\s,]+(?:qty|quantity)?[:\s]*(\d+)[\s,]+(?:price)?[:\s]*\$?(\d+(?:\.\d+)?)/gi,
      );

      for (const match of Array.from(itemMatches)) {
        items.push({
          description: match[1].trim(),
          quantity: parseInt(match[2], 10),
          price: parseFloat(match[3]),
        });
      }

      // If no items were extracted, add default items based on the prompt
      if (items.length === 0) {
        if (prompt.toLowerCase().includes("website")) {
          items.push({
            description: "Website Development",
            quantity: 1,
            price: 2500,
          });
        } else if (prompt.toLowerCase().includes("logo")) {
          items.push({ description: "Logo Design", quantity: 1, price: 800 });
        } else if (prompt.toLowerCase().includes("consulting")) {
          items.push({
            description: "Consulting Services",
            quantity: 5,
            price: 150,
          });
        } else {
          items.push({
            description: "Professional Services",
            quantity: 1,
            price: 1000,
          });
        }
      }

      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
      );
      const tax = subtotal * 0.1; // 10% tax

      const invoiceData = {
        client: {
          name: clientName,
          email: `${clientName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
          address: "123 Client Street, City",
        },
        items: items,
        subtotal: subtotal,
        tax: tax,
        total: subtotal + tax,
        dueDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toLocaleDateString(),
      };

      onGenerate(invoiceData);
    } catch (error) {
      console.error("Error generating invoice:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className={`modern-card ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-vibrant-yellow" />
          AI Invoice Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder="Describe the invoice you want to create. For example: 'Create an invoice for client Acme Corp for website design services. Include 3 items: website redesign for $2,500, logo design for $800, and SEO optimization for $1,200. Set the due date for 30 days from today.'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px]"
          />
          <Button
            onClick={handleGenerate}
            className="w-full bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90"
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Invoice
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInvoiceGenerator;
