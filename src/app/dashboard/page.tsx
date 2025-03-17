"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, LayoutDashboard } from "lucide-react";
import dynamic from "next/dynamic";
import { getDashboardData } from "@/lib/queries";

const ProtectedRoute = dynamic(
  () => import("@/components/layout/ProtectedRoute"),
  { ssr: false },
);
import AnalyticsSummary from "@/components/dashboard/AnalyticsSummary";
import RecentInvoices from "@/components/dashboard/RecentInvoices";
import RevenueChart from "@/components/dashboard/RevenueChart";
import InvoiceStatusChart from "@/components/dashboard/InvoiceStatusChart";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";

interface DashboardData {
  analytics: {
    totalRevenue: number;
    outstandingInvoices: number;
    paidInvoices: number;
    overdueInvoices: number;
  };
  recentInvoices: any[];
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
  growth: number;
  statusDistribution: {
    paid: number;
    pending: number;
    overdue: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleSwitchToAI = () => {
    router.push("/ai");
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Dashboard">
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Dashboard">
        <div className="space-y-6 pb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-vibrant-yellow p-2">
                <LayoutDashboard className="h-6 w-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                  Overview of your business performance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="gap-2 rounded-full"
                onClick={handleSwitchToAI}
              >
                <Sparkles className="h-4 w-4" />
                Switch to AI Mode
              </Button>
            </div>
          </div>

          {/* Analytics Summary */}
          <AnalyticsSummary data={dashboardData?.analytics} />

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RevenueChart 
              className="lg:col-span-2" 
              data={dashboardData?.revenueByMonth}
              growth={dashboardData?.growth}
            />
            <InvoiceStatusChart data={dashboardData?.statusDistribution} />
          </div>

          {/* Recent Invoices */}
          <RecentInvoices invoices={dashboardData?.recentInvoices} />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
