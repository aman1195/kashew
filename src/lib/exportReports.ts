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
  }>;
}

export function generateCSV(data: ReportData, timeRange: string): string {
  const rows: string[] = [];

  // Add header
  rows.push(`Report for ${timeRange}`);
  rows.push('');

  // Revenue by Month
  rows.push('Revenue by Month');
  rows.push('Month,Revenue');
  Object.entries(data.revenueByMonth).forEach(([month, revenue]) => {
    rows.push(`${month},${revenue}`);
  });
  rows.push('');

  // Invoice Status Distribution
  rows.push('Invoice Status Distribution');
  rows.push('Status,Count');
  Object.entries(data.invoicesByStatus).forEach(([status, count]) => {
    rows.push(`${status},${count}`);
  });
  rows.push('');

  // Top Clients
  rows.push('Top Clients by Revenue');
  rows.push('Client,Total Revenue');
  data.topClients.forEach(client => {
    rows.push(`${client.name},${client.total}`);
  });

  return rows.join('\n');
}

export function downloadReport(data: ReportData, timeRange: string) {
  const csv = generateCSV(data, timeRange);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `report_${timeRange.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} 