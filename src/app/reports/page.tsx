"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInvoices } from "@/lib/queries";
import { downloadReport } from '@/lib/exportReports';

interface ReportData {
  revenueByMonth: {
    [key: string]: number;
  };
  invoicesByStatus: {
    [key: string]: number;
  };
  topClients: Array<{
    name: string;
    total: number;
    paid: number;
    outstanding: number;
  }>;
}

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("year");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData>({
    revenueByMonth: {},
    invoicesByStatus: {},
    topClients: [],
  });

  useEffect(() => {
    loadReportData();
  }, []);

  async function loadReportData() {
    try {
      setLoading(true);
      const { invoices } = await getInvoices();
      
      // Process revenue by month
      const revenueByMonth: { [key: string]: number } = {};
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
      
      // Initialize all months with 0
      months.forEach(month => {
        revenueByMonth[month] = 0;
      });

      // Fill in actual data
      invoices.forEach(invoice => {
        if (invoice.status === 'paid') {
          const month = new Date(invoice.date).toLocaleString('default', { month: 'long' });
          revenueByMonth[month] = (revenueByMonth[month] || 0) + invoice.total;
        }
      });

      // Process invoices by status
      const invoicesByStatus: { [key: string]: number } = {
        paid: 0,
        pending: 0,
        overdue: 0,
        draft: 0
      };
      
      invoices.forEach(invoice => {
        invoicesByStatus[invoice.status] = (invoicesByStatus[invoice.status] || 0) + 1;
      });

      // Process top clients
      const clientTotals: { [key: string]: { total: number, paid: number } } = {};
      invoices.forEach(invoice => {
        if (!clientTotals[invoice.client.name]) {
          clientTotals[invoice.client.name] = { total: 0, paid: 0 };
        }
        clientTotals[invoice.client.name].total += invoice.total;
        if (invoice.status === 'paid') {
          clientTotals[invoice.client.name].paid += invoice.total;
        }
      });

      const topClients = Object.entries(clientTotals)
        .map(([name, { total, paid }]) => ({ 
          name, 
          total,
          paid,
          outstanding: total - paid
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setReportData({
        revenueByMonth,
        invoicesByStatus,
        topClients,
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleExport = () => {
    downloadReport(reportData, timeRange);
  };

  if (loading) {
    return (
      <DashboardLayout title="Reports">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6 pb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-muted-foreground">
              View your business analytics and reports
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] rounded-full">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="gap-2 rounded-full"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 rounded-full h-12 p-1">
            <TabsTrigger
              value="revenue"
              className="rounded-full data-[state=active]:bg-vibrant-yellow data-[state=active]:text-black"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Revenue
            </TabsTrigger>
            <TabsTrigger
              value="invoices"
              className="rounded-full data-[state=active]:bg-vibrant-yellow data-[state=active]:text-black"
            >
              <LineChart className="mr-2 h-4 w-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger
              value="clients"
              className="rounded-full data-[state=active]:bg-vibrant-yellow data-[state=active]:text-black"
            >
              <PieChart className="mr-2 h-4 w-4" />
              Clients
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="modern-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Revenue</CardTitle>
                  <CardDescription>Year to date</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatCurrency(Object.values(reportData.revenueByMonth).reduce((a, b) => a + b, 0))}
                  </div>
                </CardContent>
              </Card>
              <Card className="modern-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Average Monthly Revenue</CardTitle>
                  <CardDescription>Year to date</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatCurrency(
                      Object.values(reportData.revenueByMonth).reduce((a, b) => a + b, 0) / 
                      Object.keys(reportData.revenueByMonth).length || 1
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="modern-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Invoices</CardTitle>
                  <CardDescription>Year to date</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Object.values(reportData.invoicesByStatus).reduce((a, b) => a + b, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Monthly revenue for {timeRange}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-end justify-between gap-2">
                  {Object.entries(reportData.revenueByMonth).map(([month, revenue]) => {
                    const height = (revenue / Math.max(...Object.values(reportData.revenueByMonth))) * 100;
                    return (
                      <div key={month} className="flex flex-col items-center gap-2 w-full">
                        <div 
                          className="w-full bg-vibrant-yellow rounded-t-lg"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-sm font-medium -rotate-45 origin-top-left">
                          {month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="modern-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Invoices</CardTitle>
                  <CardDescription>All statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Object.values(reportData.invoicesByStatus).reduce((a, b) => a + b, 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="modern-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Paid Invoices</CardTitle>
                  <CardDescription>Total amount collected</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(reportData.invoicesByStatus.paid || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="modern-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Overdue Invoices</CardTitle>
                  <CardDescription>Requires attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {reportData.invoicesByStatus.overdue || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Invoice Status Distribution</CardTitle>
                <CardDescription>Overview of invoice statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(reportData.invoicesByStatus).map(([status, count]) => {
                    const total = Object.values(reportData.invoicesByStatus).reduce((a, b) => a + b, 0);
                    const percentage = total === 0 ? 0 : (count / total) * 100;
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{status}</span>
                          <span>{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              status === 'paid' ? 'bg-green-500' :
                              status === 'overdue' ? 'bg-red-500' :
                              status === 'pending' ? 'bg-yellow-500' :
                              'bg-gray-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {reportData.topClients.map((client, index) => (
                <Card key={index} className="modern-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex justify-between">
                      <span>{client.name}</span>
                      <span>{formatCurrency(client.total)}</span>
                    </CardTitle>
                    <CardDescription className="flex justify-between">
                      <span>Paid: {formatCurrency(client.paid)}</span>
                      <span>Outstanding: {formatCurrency(client.outstanding)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${(client.paid / client.total) * 100}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
