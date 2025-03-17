"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { PieChart } from "lucide-react";

interface InvoiceStatusChartProps {
  className?: string;
  data?: {
    paid: number;
    pending: number;
    overdue: number;
  };
}

const InvoiceStatusChart = ({ className, data }: InvoiceStatusChartProps) => {
  if (!data) {
    return (
      <div
        className={cn(
          "modern-card w-full h-[350px] bg-background flex items-center justify-center",
          className,
        )}
      >
        <span className="text-muted-foreground">No invoice data available</span>
      </div>
    );
  }

  const total = data.paid + data.pending + data.overdue;
  const calculatePercentage = (value: number) => ((value / total) * 100).toFixed(1);

  return (
    <div
      className={cn(
        "modern-card w-full h-[350px] bg-background",
        className,
      )}
    >
      <div className="flex flex-row items-center justify-between p-6 pb-2">
        <h2 className="text-lg font-medium">Invoice Status</h2>
        <div className="rounded-full bg-vibrant-yellow/10 p-2">
          <PieChart className="h-4 w-4 text-vibrant-yellow" />
        </div>
      </div>
      <div className="p-6 pt-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>Paid</span>
              </div>
              <span className="font-medium">
                {data.paid} ({calculatePercentage(data.paid)}%)
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${(data.paid / total) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span>Pending</span>
              </div>
              <span className="font-medium">
                {data.pending} ({calculatePercentage(data.pending)}%)
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500"
                style={{ width: `${(data.pending / total) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>Overdue</span>
              </div>
              <span className="font-medium">
                {data.overdue} ({calculatePercentage(data.overdue)}%)
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500"
                style={{ width: `${(data.overdue / total) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Invoices</span>
            <span className="font-medium">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceStatusChart;
