"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Sparkles } from "lucide-react";

interface AIChatBoxProps {
  onGenerateInvoice?: (data: any) => void;
  className?: string;
}

const AIChatBox = ({
  onGenerateInvoice = () => {},
  className = "",
}: AIChatBoxProps) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: string; content: string }[]
  >([
    {
      role: "system",
      content:
        "Hello! I can help you create an invoice. Just tell me the client name, services/products, quantities, and prices.",
    },
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message to chat history
    const newChatHistory = [...chatHistory, { role: "user", content: message }];
    setChatHistory(newChatHistory);
    setMessage("");

    // Simulate AI response
    setTimeout(() => {
      let aiResponse =
        "I'll help you create an invoice based on that information. Would you like to add more details or generate the invoice now?";

      // Check if message contains enough invoice information
      if (
        message.toLowerCase().includes("generate") ||
        message.toLowerCase().includes("create invoice")
      ) {
        aiResponse =
          "I've generated an invoice based on your information. You can preview and edit it before sending.";

        // Extract data from message (simplified example)
        const clientName = extractClientName(message) || "New Client";
        const items = extractItems(message) || [
          { description: "Service", quantity: 1, price: 100 },
        ];

        // Generate invoice data
        const invoiceData = {
          client: {
            name: clientName,
            email: `${clientName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
            address: "123 Client Street",
          },
          items: items,
          subtotal: items.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0,
          ),
          tax:
            items.reduce((sum, item) => sum + item.quantity * item.price, 0) *
            0.1,
          total:
            items.reduce((sum, item) => sum + item.quantity * item.price, 0) *
            1.1,
          dueDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toLocaleDateString(),
        };

        // Call the callback to generate the invoice
        setTimeout(() => onGenerateInvoice(invoiceData), 500);
      }

      setChatHistory([
        ...newChatHistory,
        { role: "assistant", content: aiResponse },
      ]);
    }, 1000);
  };

  // Simple extraction functions (would be more sophisticated in a real app)
  const extractClientName = (text: string): string | null => {
    const clientMatch = text.match(/client(?:\s*name)?[:\s]+(\w+(?:\s+\w+)*)/i);
    return clientMatch ? clientMatch[1] : null;
  };

  const extractItems = (
    text: string,
  ): { description: string; quantity: number; price: number }[] | null => {
    // This is a very simplified extraction - a real implementation would be more robust
    const items = [];

    // Try to find product/service patterns
    const productMatches = text.matchAll(
      /(?:product|service|item)[:\s]+(\w+(?:\s+\w+)*)[\s,]+(\d+)[\s,]+(\d+(?:\.\d+)?)/gi,
    );

    for (const match of productMatches) {
      items.push({
        description: match[1],
        quantity: parseInt(match[2], 10),
        price: parseFloat(match[3]),
      });
    }

    return items.length > 0 ? items : null;
  };

  return (
    <Card className={`modern-card bg-background ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-vibrant-yellow" />
          AI Invoice Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="h-[200px] overflow-y-auto p-4 rounded-lg bg-muted/50">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-lg ${msg.role === "user" ? "bg-vibrant-yellow text-black" : "bg-muted"}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Describe invoice details (client, items, quantities, prices)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              className="bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChatBox;
