"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Send,
  Sparkles,
  FileText,
  RotateCcw,
  PieChart,
  BarChart3,
} from "lucide-react";
import dynamic from "next/dynamic";

const InvoicePreview = dynamic(
  () => import("@/components/invoices/InvoicePreview"),
  {
    ssr: false,
  },
);
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AIPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: string; content: string }[]
  >([
    {
      role: "system",
      content:
        "Hello! I'm your AI assistant. I can help you manage clients, products, invoices, and reports. Just tell me what you need.",
    },
  ]);

  const [previewType, setPreviewType] = useState<
    "none" | "client" | "product" | "invoice" | "report" | "chart"
  >("none");
  const [previewData, setPreviewData] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(1);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message to chat history
    const newChatHistory = [...chatHistory, { role: "user", content: message }];
    setChatHistory(newChatHistory);

    // Process the message to determine intent
    const lowerMessage = message.toLowerCase();
    let aiResponse = "";
    let newPreviewType:
      | "none"
      | "client"
      | "product"
      | "invoice"
      | "report"
      | "chart" = "none";
    let newPreviewData = null;

    // Check for client creation intent
    if (
      lowerMessage.includes("add client") ||
      lowerMessage.includes("new client") ||
      lowerMessage.includes("create client")
    ) {
      aiResponse =
        "I've prepared a new client based on the information you provided. Please review the details and confirm if everything looks correct.";
      newPreviewType = "client";

      // Extract client information (simplified example)
      const nameMatch = message.match(/name[:\s]+([\w\s]+)[,\.\n]?/i);
      const emailMatch = message.match(/email[:\s]+([\w@\.]+)[,\.\n]?/i);
      const phoneMatch = message.match(/phone[:\s]+([\d\-\(\)\s]+)[,\.\n]?/i);

      newPreviewData = {
        name: nameMatch ? nameMatch[1].trim() : "New Client",
        email: emailMatch ? emailMatch[1].trim() : "client@example.com",
        phone: phoneMatch ? phoneMatch[1].trim() : "(555) 123-4567",
        address: "123 Business St, City",
        contactName: nameMatch ? nameMatch[1].trim().split(" ")[0] : "Contact",
      };
    }
    // Check for product/service creation intent
    else if (
      lowerMessage.includes("add product") ||
      lowerMessage.includes("new product") ||
      lowerMessage.includes("add service") ||
      lowerMessage.includes("new service")
    ) {
      aiResponse =
        "I've prepared a new product/service based on the information you provided. Please review the details and confirm if everything looks correct.";
      newPreviewType = "product";

      const isService = lowerMessage.includes("service");
      const nameMatch = message.match(/name[:\s]+([\w\s]+)[,\.\n]?/i);
      const priceMatch = message.match(/price[:\s]+(\$?[\d\.]+)[,\.\n]?/i);
      const descriptionMatch = message.match(
        /description[:\s]+([\w\s,\.]+)[,\.\n]?/i,
      );

      newPreviewData = {
        name: nameMatch
          ? nameMatch[1].trim()
          : isService
            ? "New Service"
            : "New Product",
        type: isService ? "Service" : "Product",
        price: priceMatch ? parseFloat(priceMatch[1].replace("$", "")) : 99.99,
        description: descriptionMatch
          ? descriptionMatch[1].trim()
          : "Description not provided",
        unit: isService ? "Hour" : "Item",
        taxRate: 10,
      };
    }
    // Check for invoice creation intent
    else if (
      lowerMessage.includes("create invoice") ||
      lowerMessage.includes("new invoice") ||
      lowerMessage.includes("generate invoice")
    ) {
      aiResponse =
        "I've prepared an invoice based on the information you provided. Please review the details and confirm if everything looks correct.";
      newPreviewType = "invoice";

      const clientMatch = message.match(/client[:\s]+([\w\s]+)[,\.\n]?/i);
      const clientName = clientMatch ? clientMatch[1].trim() : "Sample Client";

      // Try to extract items (very simplified)
      const items = [];
      const itemMatches = message.matchAll(
        /item[:\s]+([\w\s]+)[\s,]+(?:qty|quantity)?[:\s]*(\d+)[\s,]+(?:price)?[:\s]*\$?(\d+(?:\.\d+)?)/gi,
      );

      for (const match of Array.from(itemMatches)) {
        items.push({
          description: match[1].trim(),
          quantity: parseInt(match[2], 10),
          price: parseFloat(match[3]),
        });
      }

      // If no items were extracted, add a default item
      if (items.length === 0) {
        items.push({
          description: "Professional Services",
          quantity: 1,
          price: 100,
        });
      }

      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
      );
      const tax = subtotal * 0.1; // 10% tax

      newPreviewData = {
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
    }
    // Check for chart/graph creation intent
    else if (
      lowerMessage.includes("chart") ||
      lowerMessage.includes("graph") ||
      lowerMessage.includes("visualization")
    ) {
      aiResponse =
        "I've created a custom chart based on your request. You can view it in the preview panel.";
      newPreviewType = "chart";

      // Determine chart type
      const isPieChart = lowerMessage.includes("pie");
      const chartType = isPieChart ? "pie" : "bar";

      // Determine data to visualize
      const showPaid = lowerMessage.includes("paid");
      const showOverdue = lowerMessage.includes("overdue");
      const showPending =
        lowerMessage.includes("pending") || lowerMessage.includes("due");

      // Default to showing all if none specified
      const showAll = !showPaid && !showOverdue && !showPending;

      // Create chart data
      const chartData = {
        type: chartType,
        title: `Invoice ${chartType === "pie" ? "Distribution" : "Summary"}`,
        data: [
          showPaid || showAll
            ? { label: "Paid", value: 32910, color: "#1e9f6e" }
            : null,
          showPending || showAll
            ? { label: "Pending", value: 12340, color: "#f5d742" }
            : null,
          showOverdue || showAll
            ? { label: "Overdue", value: 5670, color: "#f472b6" }
            : null,
        ].filter(Boolean),
      };

      newPreviewData = chartData;
    }
    // Check for report generation intent
    else if (
      lowerMessage.includes("report") ||
      lowerMessage.includes("analytics") ||
      lowerMessage.includes("summary")
    ) {
      aiResponse =
        "I've generated a report based on your request. Please review the summary below.";
      newPreviewType = "report";

      const reportType = lowerMessage.includes("revenue")
        ? "revenue"
        : lowerMessage.includes("client")
          ? "clients"
          : lowerMessage.includes("invoice")
            ? "invoices"
            : "general";

      newPreviewData = {
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        period: lowerMessage.includes("month")
          ? "Monthly"
          : lowerMessage.includes("year")
            ? "Yearly"
            : lowerMessage.includes("week")
              ? "Weekly"
              : "Custom",
        summary:
          "This is an AI-generated report summary based on your request.",
        metrics: [
          { name: "Total Revenue", value: "$45,250", change: "+12.5%" },
          { name: "Average Invoice", value: "$2,850", change: "+5.2%" },
          { name: "Active Clients", value: "18", change: "+4" },
          { name: "Outstanding Invoices", value: "$12,340", change: "-3.1%" },
        ],
        chartData: "Chart visualization would appear here",
      };
    } else {
      aiResponse =
        "I'm here to help you manage clients, products, invoices, and reports. You can ask me to create a new client, add a product or service, generate an invoice, create a chart, or create a report.";
    }

    // Update preview state
    setPreviewType(newPreviewType);
    setPreviewData(newPreviewData);

    // Add AI response to chat history
    setTimeout(() => {
      setChatHistory([
        ...newChatHistory,
        { role: "assistant", content: aiResponse },
      ]);
    }, 500);

    // Clear message after processing
    setMessage("");
  };

  const handleConfirm = () => {
    // In a real app, this would save the data to the database
    const confirmationMessage = `I've saved the ${previewType}. Is there anything else you'd like to do?`;
    setChatHistory([
      ...chatHistory,
      { role: "assistant", content: confirmationMessage },
    ]);
    setPreviewType("none");
    setPreviewData(null);
  };

  const handleSwitchToRetro = () => {
    router.push("/dashboard");
  };

  // Real-time preview update as user types
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    // Process message in real-time for preview
    const lowerMessage = newMessage.toLowerCase();

    // Check for chart/graph creation intent
    if (
      lowerMessage.includes("chart") ||
      lowerMessage.includes("graph") ||
      lowerMessage.includes("visualization")
    ) {
      setPreviewType("chart");

      // Determine chart type
      const isPieChart = lowerMessage.includes("pie");
      const chartType = isPieChart ? "pie" : "bar";

      // Determine data to visualize
      const showPaid = lowerMessage.includes("paid");
      const showOverdue = lowerMessage.includes("overdue");
      const showPending =
        lowerMessage.includes("pending") || lowerMessage.includes("due");

      // Default to showing all if none specified
      const showAll = !showPaid && !showOverdue && !showPending;

      // Create chart data
      const chartData = {
        type: chartType,
        title: `Invoice ${chartType === "pie" ? "Distribution" : "Summary"}`,
        data: [
          showPaid || showAll
            ? { label: "Paid", value: 32910, color: "#1e9f6e" }
            : null,
          showPending || showAll
            ? { label: "Pending", value: 12340, color: "#f5d742" }
            : null,
          showOverdue || showAll
            ? { label: "Overdue", value: 5670, color: "#f472b6" }
            : null,
        ].filter(Boolean),
      };

      setPreviewData(chartData);
    }
    // Check for client creation intent
    else if (lowerMessage.includes("client")) {
      setPreviewType("client");

      // Extract client information in real-time
      const nameMatch = newMessage.match(/name[:\s]+([\w\s]+)[,\.\n]?/i);
      const emailMatch = newMessage.match(/email[:\s]+([\w@\.]+)[,\.\n]?/i);
      const phoneMatch = newMessage.match(
        /phone[:\s]+([\d\-\(\)\s]+)[,\.\n]?/i,
      );

      setPreviewData({
        name: nameMatch ? nameMatch[1].trim() : "New Client",
        email: emailMatch ? emailMatch[1].trim() : "client@example.com",
        phone: phoneMatch ? phoneMatch[1].trim() : "(555) 123-4567",
        address: "123 Business St, City",
        contactName: nameMatch ? nameMatch[1].trim().split(" ")[0] : "Contact",
      });
    }
    // Check for product/service creation intent
    else if (
      lowerMessage.includes("product") ||
      lowerMessage.includes("service")
    ) {
      setPreviewType("product");

      const isService = lowerMessage.includes("service");
      const nameMatch = newMessage.match(/name[:\s]+([\w\s]+)[,\.\n]?/i);
      const priceMatch = newMessage.match(/price[:\s]+(\$?[\d\.]+)[,\.\n]?/i);
      const descriptionMatch = newMessage.match(
        /description[:\s]+([\w\s,\.]+)[,\.\n]?/i,
      );

      setPreviewData({
        name: nameMatch
          ? nameMatch[1].trim()
          : isService
            ? "New Service"
            : "New Product",
        type: isService ? "Service" : "Product",
        price: priceMatch ? parseFloat(priceMatch[1].replace("$", "")) : 99.99,
        description: descriptionMatch
          ? descriptionMatch[1].trim()
          : "Description not provided",
        unit: isService ? "Hour" : "Item",
        taxRate: 10,
      });
    }
    // Check for invoice creation intent
    else if (lowerMessage.includes("invoice")) {
      setPreviewType("invoice");

      const clientMatch = newMessage.match(/client[:\s]+([\w\s]+)[,\.\n]?/i);
      const clientName = clientMatch ? clientMatch[1].trim() : "Sample Client";

      // Try to extract items in real-time
      const items = [];
      const itemMatches = newMessage.matchAll(
        /item[:\s]+([\w\s]+)[\s,]+(?:qty|quantity)?[:\s]*(\d+)[\s,]+(?:price)?[:\s]*\$?(\d+(?:\.\d+)?)/gi,
      );

      for (const match of Array.from(itemMatches)) {
        items.push({
          description: match[1].trim(),
          quantity: parseInt(match[2], 10),
          price: parseFloat(match[3]),
        });
      }

      // If no items were extracted, add a default item
      if (items.length === 0) {
        items.push({
          description: "Professional Services",
          quantity: 1,
          price: 100,
        });
      }

      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
      );
      const tax = subtotal * 0.1; // 10% tax

      setPreviewData({
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
      });
    }
    // Check for report generation intent
    else if (
      lowerMessage.includes("report") ||
      lowerMessage.includes("analytics") ||
      lowerMessage.includes("summary")
    ) {
      setPreviewType("report");

      const reportType = lowerMessage.includes("revenue")
        ? "revenue"
        : lowerMessage.includes("client")
          ? "clients"
          : lowerMessage.includes("invoice")
            ? "invoices"
            : "general";

      setPreviewData({
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        period: lowerMessage.includes("month")
          ? "Monthly"
          : lowerMessage.includes("year")
            ? "Yearly"
            : lowerMessage.includes("week")
              ? "Weekly"
              : "Custom",
        summary:
          "This is an AI-generated report summary based on your request.",
        metrics: [
          { name: "Total Revenue", value: "$45,250", change: "+12.5%" },
          { name: "Average Invoice", value: "$2,850", change: "+5.2%" },
          { name: "Active Clients", value: "18", change: "+4" },
          { name: "Outstanding Invoices", value: "$12,340", change: "-3.1%" },
        ],
        chartData: "Chart visualization would appear here",
      });
    } else if (newMessage.trim() === "") {
      // Clear preview if message is empty
      setPreviewType("none");
      setPreviewData(null);
    }
  };

  const handleEdit = () => {
    // In a real app, this would open an edit form
    const editMessage = `What would you like to change about the ${previewType}?`;
    setChatHistory([
      ...chatHistory,
      { role: "assistant", content: editMessage },
    ]);
  };

  const renderPreview = () => {
    if (previewType === "none" || !previewData) {
      return (
        <div className="flex items-center justify-center h-full bg-muted/30 rounded-xl p-8 text-center">
          <div>
            <Sparkles className="h-12 w-12 text-vibrant-yellow mx-auto mb-4" />
            <h3 className="text-lg font-medium">AI Assistant</h3>
            <p className="text-muted-foreground mt-2">
              Ask me to create clients, products, invoices, or generate reports.
            </p>
          </div>
        </div>
      );
    }

    switch (previewType) {
      case "chart":
        return (
          <Card className="modern-card overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold">{previewData.title}</h3>
                  <p className="text-muted-foreground">Custom visualization</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    className="rounded-full"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="rounded-full bg-vibrant-green text-white hover:bg-vibrant-green/90"
                  >
                    Save Chart
                  </Button>
                </div>
              </div>

              {previewData.type === "pie" ? (
                <div className="h-[300px] flex items-center justify-center relative">
                  <div className="w-[250px] h-[250px] rounded-full relative overflow-hidden">
                    {previewData.data.map((item: any, index: number) => {
                      const total = previewData.data.reduce(
                        (sum: number, d: any) => sum + d.value,
                        0,
                      );
                      const startAngle = previewData.data
                        .slice(0, index)
                        .reduce(
                          (sum: number, d: any) =>
                            sum + (d.value / total) * 360,
                          0,
                        );
                      const angle = (item.value / total) * 360;

                      return (
                        <div
                          key={index}
                          className="absolute top-0 left-0 w-full h-full origin-center"
                          style={{
                            transform: `rotate(${startAngle}deg)`,
                            clipPath: `polygon(50% 50%, 50% 0%, ${angle <= 180 ? "100% 0%" : "100% 0%, 100% 100%"}, ${angle <= 90 ? "50% 50%" : angle <= 180 ? "100% 100%, 50% 50%" : angle <= 270 ? "100% 100%, 0% 100%, 50% 50%" : "100% 100%, 0% 100%, 0% 0%, 50% 50%"})`,
                          }}
                        >
                          <div
                            className="w-full h-full"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      );
                    })}
                    <div className="absolute inset-[25%] rounded-full bg-background flex items-center justify-center">
                      <span className="text-xl font-bold">Total</span>
                    </div>
                  </div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 space-y-2">
                    {previewData.data.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-sm"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>
                          {item.label}: ${item.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[300px] w-full pt-6">
                  <div className="flex h-full items-end justify-between gap-4 border-b border-l">
                    {previewData.data.map((item: any, index: number) => {
                      const maxValue = Math.max(
                        ...previewData.data.map((d: any) => d.value),
                      );
                      const height = (item.value / maxValue) * 100;

                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center gap-2 w-full"
                        >
                          <div
                            className="w-full max-w-[80px] rounded-t-md transition-all duration-500 animate-in slide-in-from-bottom-4"
                            style={{
                              height: `${height * 2}px`,
                              backgroundColor: item.color,
                              animationDelay: `${index * 150}ms`,
                            }}
                          />
                          <div className="text-sm font-medium">
                            {item.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${item.value.toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "client":
        return (
          <Card className="modern-card overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Client Preview</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Company Name
                    </p>
                    <p className="font-medium">{previewData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Contact Name
                    </p>
                    <p className="font-medium">{previewData.contactName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{previewData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{previewData.phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{previewData.address}</p>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    className="rounded-full"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="rounded-full bg-vibrant-green text-white hover:bg-vibrant-green/90"
                  >
                    Confirm & Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "product":
        return (
          <Card className="modern-card overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {previewData.type} Preview
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{previewData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{previewData.type}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{previewData.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium">
                      ${previewData.price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unit</p>
                    <p className="font-medium">{previewData.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tax Rate</p>
                    <p className="font-medium">{previewData.taxRate}%</p>
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    className="rounded-full"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="rounded-full bg-vibrant-green text-white hover:bg-vibrant-green/90"
                  >
                    Confirm & Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "invoice":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Invoice Preview</h3>
              <div className="flex gap-3">
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="rounded-full"
                >
                  Edit
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="rounded-full bg-vibrant-green text-white hover:bg-vibrant-green/90"
                >
                  Confirm & Save
                </Button>
              </div>
            </div>
            <Tabs
              value={selectedTemplate.toString()}
              onValueChange={(v) => setSelectedTemplate(parseInt(v))}
            >
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="1">Modern</TabsTrigger>
                <TabsTrigger value="2">Professional</TabsTrigger>
                <TabsTrigger value="3">Minimal</TabsTrigger>
                <TabsTrigger value="4">Creative</TabsTrigger>
                <TabsTrigger value="5">Classic</TabsTrigger>
              </TabsList>
            </Tabs>
            <InvoicePreview
              templateId={selectedTemplate}
              invoiceData={previewData}
            />
          </div>
        );

      case "report":
        return (
          <Card className="modern-card overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold">{previewData.title}</h3>
                  <p className="text-muted-foreground">
                    {previewData.period} Report
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    className="rounded-full"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="rounded-full bg-vibrant-green text-white hover:bg-vibrant-green/90"
                  >
                    Confirm & Save
                  </Button>
                </div>
              </div>

              <p className="mb-6">{previewData.summary}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {previewData.metrics.map((metric: any, index: number) => (
                  <div key={index} className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {metric.name}
                    </p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p
                      className={`text-sm ${metric.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}
                    >
                      {metric.change}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-muted/30 p-6 rounded-lg text-center">
                <p className="text-muted-foreground">{previewData.chartData}</p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-[100px] py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">AI Assistant</h1>
            <p className="text-muted-foreground">
              Your intelligent business companion
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2 rounded-full"
            onClick={handleSwitchToRetro}
          >
            <RotateCcw className="h-4 w-4" />
            Switch to Retro Mode
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-220px)]">
          {/* Chat Section */}
          <Card className="modern-card bg-background h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-xl ${msg.role === "user" ? "bg-vibrant-yellow text-black" : "bg-muted"}`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Ask me to create clients, products, invoices, charts, or generate reports..."
                  value={message}
                  onChange={handleMessageChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <div className="h-full flex flex-col">{renderPreview()}</div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>
            Kashew by{" "}
            <a
              href="https://ampvc.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-vibrant-yellow hover:underline"
            >
              Ampersand
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
