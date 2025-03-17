"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";

interface RevenueChartProps {
  className?: string;
  data?: {
    month: string;
    revenue: number;
  }[];
  growth?: number;
}

const RevenueChart = ({ className, data = [], growth = 0 }: RevenueChartProps) => {
  const [timeRange, setTimeRange] = useState<string>("year");

  const filteredData = useMemo(() => {
    const now = new Date();
    const filtered = [...data].filter(item => {
      const itemDate = new Date(new Date().getFullYear(), getMonthIndex(item.month));
      
      switch (timeRange) {
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          return itemDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(now.getMonth() - 1);
          return itemDate >= monthAgo;
        case 'quarter':
          const quarterAgo = new Date(now);
          quarterAgo.setMonth(now.getMonth() - 3);
          return itemDate >= quarterAgo;
        default: // year
          return true;
      }
    });

    return filtered;
  }, [data, timeRange]);

  // Calculate total revenue from filtered data
  const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0);
  const isPositiveGrowth = growth > 0;

  function getMonthIndex(monthName: string): number {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName);
  }

  return (
    <div
      className={cn(
        "modern-card w-full h-[350px] bg-vibrant-yellow",
        className,
      )}
    >
      <div className="flex flex-row items-center justify-between p-6 pb-2">
        <h2 className="text-lg font-medium text-black">Revenue Overview</h2>
        <select
          className="bg-black/10 text-black rounded-full px-4 py-1 text-sm"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>
      <div className="p-6 pt-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/70">Total Revenue</p>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-black" />
                <span className="text-3xl font-bold text-black">
                  {totalRevenue.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-black/10 px-3 py-1 rounded-full">
              {isPositiveGrowth ? (
                <ArrowUpRight className="h-4 w-4 text-black" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-black" />
              )}
              <span className="text-sm font-medium text-black">
                {isPositiveGrowth ? "+" : ""}
                {growth.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="h-[220px] w-full relative mt-2">
            {filteredData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-black/70">
                No revenue data available for the selected time range
              </div>
            ) : (
              <div className="absolute inset-0 flex items-end justify-between px-2">
                {filteredData.map((item, index) => {
                  // Calculate height based on revenue relative to max revenue
                  const maxRevenue = Math.max(...filteredData.map((d) => d.revenue));
                  const height = maxRevenue === 0 ? 0 : (item.revenue / maxRevenue) * 180;
                  const delay = index * 30; // Faster staggered animation delay

                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-1 w-full max-w-[40px]"
                    >
                      <div
                        className="relative w-8 rounded-t-md overflow-hidden group will-change-transform"
                        style={{ height: `${height}px` }}
                      >
                        <div
                          className="absolute bottom-0 w-full bg-gradient-to-t from-black/30 to-black/10 hover:from-black/40 hover:to-black/20 transition-all duration-300 animate-in slide-in-from-bottom"
                          style={{
                            height: `${height}px`,
                            animationDelay: `${delay}ms`,
                            animationDuration: "300ms",
                          }}
                        />
                        <div className="absolute top-0 left-0 w-full opacity-0 group-hover:opacity-100 bg-black/10 p-1 text-[10px] text-black font-medium transition-opacity duration-200 text-center truncate">
                          ${item.revenue.toLocaleString()}
                        </div>
                      </div>
                      <span className="text-xs text-black/70 font-medium">
                        {item.month.substring(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
