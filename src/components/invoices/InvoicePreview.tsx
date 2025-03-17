import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

interface InvoicePreviewProps {
  templateId: number;
  invoiceData: {
    client: {
      name: string;
      email: string;
      address: string;
    };
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    dueDate: string;
  };
  className?: string;
  customization?: {
    colors: {
      primary: string;
      secondary: string;
      text: string;
    };
    typography: {
      font: string;
      size: number;
    };
    logo: {
      enabled: boolean;
      url: string;
    };
  };
}

const InvoicePreview = ({
  templateId = 1,
  invoiceData,
  className = "",
  customization,
}: InvoicePreviewProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Template styles based on templateId and customization
  const getTemplateStyles = () => {
    // Default styles based on template
    let baseStyles = {
      mainColor: "bg-vibrant-yellow",
      textColor: "text-black",
      accentColor: "bg-black/10",
      headerStyle: "rounded-t-xl p-6",
      contentStyle: "p-6 bg-white",
    };

    // Apply template-specific styles
    switch (templateId) {
      case 1: // Modern (Yellow)
        baseStyles = {
          mainColor: "bg-vibrant-yellow",
          textColor: "text-black",
          accentColor: "bg-black/10",
          headerStyle: "rounded-t-xl p-6",
          contentStyle: "p-6 bg-white",
        };
        break;
      case 2: // Professional (Green)
        baseStyles = {
          mainColor: "bg-vibrant-green",
          textColor: "text-white",
          accentColor: "bg-white/20",
          headerStyle: "rounded-t-xl p-6",
          contentStyle: "p-6 bg-white",
        };
        break;
      case 3: // Minimal (Black)
        baseStyles = {
          mainColor: "bg-vibrant-black",
          textColor: "text-white",
          accentColor: "bg-white/20",
          headerStyle: "rounded-t-xl p-6",
          contentStyle: "p-6 bg-white",
        };
        break;
      case 4: // Creative (Pink)
        baseStyles = {
          mainColor: "bg-vibrant-pink",
          textColor: "text-black",
          accentColor: "bg-black/10",
          headerStyle: "rounded-t-xl p-6",
          contentStyle: "p-6 bg-white",
        };
        break;
      case 5: // Classic (White)
        baseStyles = {
          mainColor: "bg-white border-t border-x border-gray-200",
          textColor: "text-black",
          accentColor: "bg-gray-100",
          headerStyle: "rounded-t-xl p-6",
          contentStyle: "p-6 bg-white border-x border-b border-gray-200",
        };
        break;
    }

    // Apply customizations if provided
    if (customization) {
      // Override with custom styles
      return {
        ...baseStyles,
        mainColorStyle: { backgroundColor: customization.colors.primary },
        textColorStyle: { color: customization.colors.text },
        accentColorStyle: { backgroundColor: customization.colors.secondary },
        fontStyle: {
          fontFamily: customization.typography.font,
          fontSize: `${customization.typography.size}px`,
        },
      };
    }

    return baseStyles;
  };

  const styles = getTemplateStyles();

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <Card className="modern-card overflow-hidden shadow-lg">
        {/* Logo */}
        {customization?.logo.enabled && customization.logo.url && (
          <div className="absolute top-6 right-6 h-16 w-auto">
            <img
              src={customization.logo.url}
              alt="Company Logo"
              className="h-full object-contain"
            />
          </div>
        )}

        {/* Invoice Header */}
        <div
          className={cn(
            customization ? "" : styles.mainColor,
            styles.headerStyle,
          )}
          style={customization ? styles.mainColorStyle : {}}
        >
          <div className="flex justify-between items-start">
            <div>
              <h2
                className={cn(
                  "text-2xl font-bold",
                  customization ? "" : styles.textColor,
                )}
                style={
                  customization
                    ? { ...styles.textColorStyle, ...styles.fontStyle }
                    : {}
                }
              >
                INVOICE
              </h2>
              <p
                className={cn(
                  "opacity-80 mt-1",
                  customization ? "" : styles.textColor,
                )}
                style={
                  customization
                    ? { ...styles.textColorStyle, ...styles.fontStyle }
                    : {}
                }
              >
                #
                {Math.floor(Math.random() * 10000)
                  .toString()
                  .padStart(4, "0")}
              </p>
            </div>
            <div
              className={cn(
                "text-right",
                customization ? "" : styles.textColor,
              )}
              style={
                customization
                  ? { ...styles.textColorStyle, ...styles.fontStyle }
                  : {}
              }
            >
              <div className="font-bold text-lg">Kashew</div>
              <div className="opacity-80">Modern Invoicing</div>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div
          className={styles.contentStyle}
          style={customization ? styles.fontStyle : {}}
        >
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Bill To:
              </h3>
              <div className="font-medium">{invoiceData.client.name}</div>
              <div className="text-sm text-muted-foreground">
                {invoiceData.client.email}
              </div>
              <div className="text-sm text-muted-foreground">
                {invoiceData.client.address}
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Invoice Details:
              </h3>
              <div className="text-sm">
                <span className="text-muted-foreground">Date: </span>
                {new Date().toLocaleDateString()}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Due Date: </span>
                {invoiceData.dueDate}
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Description</th>
                  <th className="text-center py-2">Qty</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{item.description}</td>
                    <td className="text-center py-2">{item.quantity}</td>
                    <td className="text-right py-2">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="text-right py-2">
                      {formatCurrency(item.quantity * item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Summary */}
          <div className="flex justify-end">
            <div className="w-1/2">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(invoiceData.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Tax (10%):</span>
                <span>{formatCurrency(invoiceData.tax)}</span>
              </div>
              <div className="flex justify-between py-1 border-t font-medium text-lg mt-2 pt-2">
                <span>Total:</span>
                <span>{formatCurrency(invoiceData.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InvoicePreview;
