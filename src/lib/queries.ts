import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getDashboardData() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get all invoices for the current user
  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(name)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Calculate total revenue (sum of paid invoices)
  const totalRevenue = invoices
    ?.filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.total), 0) || 0;

  // Calculate outstanding invoices (sum of pending and overdue)
  const outstandingInvoices = invoices
    ?.filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + Number(inv.total), 0) || 0;

  // Calculate paid invoices total
  const paidInvoices = invoices
    ?.filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.total), 0) || 0;

  // Calculate overdue invoices total
  const overdueInvoices = invoices
    ?.filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + Number(inv.total), 0) || 0;

  // Calculate revenue by month
  const revenueByMonth = new Array(12).fill(0).map((_, index) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (11 - index));
    const monthName = month.toLocaleString('default', { month: 'short' });
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const monthRevenue = invoices
      ?.filter(inv => {
        const invDate = new Date(inv.date);
        return invDate >= monthStart && 
               invDate <= monthEnd && 
               inv.status === 'paid';
      })
      .reduce((sum, inv) => sum + Number(inv.total), 0) || 0;

    return {
      month: monthName,
      revenue: monthRevenue,
    };
  });

  // Calculate month-over-month growth
  const currentMonthRevenue = revenueByMonth[11].revenue;
  const lastMonthRevenue = revenueByMonth[10].revenue;
  const growth = lastMonthRevenue === 0 ? 0 : 
    ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

  // Calculate invoice status distribution
  const totalInvoices = invoices?.length || 0;
  const statusDistribution = {
    paid: (invoices?.filter(inv => inv.status === 'paid').length || 0) / totalInvoices * 100,
    pending: (invoices?.filter(inv => inv.status === 'sent').length || 0) / totalInvoices * 100,
    overdue: (invoices?.filter(inv => inv.status === 'overdue').length || 0) / totalInvoices * 100,
  };

  // Get recent invoices (last 5)
  const recentInvoices = (invoices || [])
    .slice(0, 5)
    .map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.number,
      clientName: invoice.client?.name || 'Unknown Client',
      amount: Number(invoice.total),
      date: invoice.date,
      dueDate: invoice.due_date,
      status: invoice.status === 'sent' ? 'pending' : invoice.status,
    }));

  return {
    analytics: {
      totalRevenue,
      outstandingInvoices,
      paidInvoices,
      overdueInvoices,
    },
    recentInvoices,
    revenueByMonth,
    growth,
    statusDistribution,
  };
}

export async function getClients() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get all clients for the current user
  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      *,
      invoices:invoices(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Process clients data
  const processedClients = clients.map(client => {
    const totalInvoices = client.invoices?.length || 0;
    const totalSpent = client.invoices?.reduce((sum, inv) => {
      if (inv.status === 'paid') {
        return sum + Number(inv.total);
      }
      return sum;
    }, 0) || 0;

    return {
      id: client.id,
      name: client.name,
      contactName: client.contact_name || client.name,
      email: client.email,
      phone: client.phone || 'N/A',
      totalInvoices,
      totalSpent,
    };
  });

  // Calculate summary data
  const totalClients = processedClients.length;
  const activeClients = processedClients.filter(client => 
    client.totalInvoices > 0
  ).length;
  const totalRevenue = processedClients.reduce((sum, client) => 
    sum + client.totalSpent, 0
  );

  return {
    clients: processedClients,
    summary: {
      totalClients,
      activeClients,
      totalRevenue,
    }
  };
}

export async function getProducts() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Calculate summary data
  const totalProducts = products?.length || 0;
  const totalValue = products?.reduce((sum, product) => sum + Number(product.price), 0) || 0;
  const activeProducts = products?.filter(product => !product.archived).length || 0;

  return {
    products: products?.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      type: product.type || 'Product',
      unit: product.unit || 'item',
      taxRate: Number(product.tax_rate) || 0,
      archived: product.archived || false,
      createdAt: product.created_at,
    })) || [],
    summary: {
      totalProducts,
      totalValue,
      activeProducts,
    }
  };
}

export async function createClient(clientData: {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  tax_number?: string | null;
  notes?: string | null;
  contact_name?: string | null;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  console.log('Creating client with data:', { ...clientData, user_id: user.id });

  const { data, error } = await supabase
    .from('clients')
    .insert([
      {
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone || null,
        address: clientData.address || null,
        tax_number: clientData.tax_number || null,
        notes: clientData.notes || null,
        user_id: user.id
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating client:', error);
    throw error;
  }

  console.log('Client created successfully:', data);
  return data;
}

export async function createProduct(productData: {
  name: string;
  description?: string;
  price: number;
  type: string;
  unit: string;
  taxRate: number;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        type: productData.type,
        unit: productData.unit,
        tax_rate: productData.taxRate,
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }
  return data;
}

export async function updateProduct(
  productId: string,
  productData: {
    name?: string;
    description?: string;
    price?: number;
    archived?: boolean;
  }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', productId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(productId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function getInvoices() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      *,
      client:clients(
        id,
        name,
        email
      ),
      items:invoice_items(
        id,
        description,
        quantity,
        price
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Calculate summary data
  const totalInvoices = invoices?.length || 0;
  const totalAmount = invoices?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
  const paidInvoices = invoices?.filter(inv => inv.status === 'paid').length || 0;
  const overdueInvoices = invoices?.filter(inv => inv.status === 'overdue').length || 0;

  return {
    invoices: invoices?.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      date: invoice.date,
      dueDate: invoice.due_date,
      status: invoice.status,
      total: Number(invoice.total),
      client: invoice.client,
      items: invoice.items,
    })) || [],
    summary: {
      totalInvoices,
      totalAmount,
      paidInvoices,
      overdueInvoices,
    }
  };
}

export async function createInvoice(invoiceData: {
  number: string;
  date: string;
  dueDate: string;
  clientId: string;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Calculate total
  const total = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  // Start a transaction
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert([
      {
        number: invoiceData.number,
        date: invoiceData.date,
        due_date: invoiceData.dueDate,
        client_id: invoiceData.clientId,
        total,
        status: 'draft',
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (invoiceError) throw invoiceError;

  // Insert invoice items
  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(
      invoiceData.items.map(item => ({
        invoice_id: invoice.id,
        ...item,
      }))
    );

  if (itemsError) throw itemsError;

  return invoice;
}

export async function getPayments() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: payments, error } = await supabase
    .from('payments')
    .select(`
      *,
      invoice:invoices(
        number,
        total,
        client:clients(name)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Calculate summary data
  const totalReceived = payments
    ?.filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

  const pendingAmount = payments
    ?.filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

  const failedAmount = payments
    ?.filter(payment => payment.status === 'failed')
    .reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

  // Calculate month-over-month changes
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const thisMonthPayments = payments?.filter(payment => 
    new Date(payment.created_at) > lastMonth
  ) || [];
  
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  
  const lastMonthPayments = payments?.filter(payment => 
    new Date(payment.created_at) > twoMonthsAgo && 
    new Date(payment.created_at) <= lastMonth
  ) || [];

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const thisMonthReceived = thisMonthPayments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const lastMonthReceived = lastMonthPayments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const receivedChange = calculateChange(thisMonthReceived, lastMonthReceived);

  const thisMonthPending = thisMonthPayments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const lastMonthPending = lastMonthPayments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const pendingChange = calculateChange(thisMonthPending, lastMonthPending);

  const thisMonthFailed = thisMonthPayments
    .filter(payment => payment.status === 'failed')
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const lastMonthFailed = lastMonthPayments
    .filter(payment => payment.status === 'failed')
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const failedChange = calculateChange(thisMonthFailed, lastMonthFailed);

  return {
    payments: payments?.map(payment => ({
      id: payment.id,
      invoiceNumber: payment.invoice?.number,
      clientName: payment.invoice?.client?.name,
      amount: Number(payment.amount),
      date: payment.created_at,
      method: payment.payment_method,
      status: payment.status,
    })) || [],
    summary: {
      totalReceived,
      pendingAmount,
      failedAmount,
      changes: {
        receivedChange,
        pendingChange,
        failedChange,
      }
    }
  };
}

export async function recordPayment(paymentData: {
  invoiceId: string;
  amount: number;
  paymentMethod: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('payments')
    .insert([
      {
        invoice_id: paymentData.invoiceId,
        amount: paymentData.amount,
        payment_method: paymentData.paymentMethod,
        user_id: user.id,
        status: 'completed',
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // Update invoice status to paid
  await supabase
    .from('invoices')
    .update({ status: 'paid' })
    .eq('id', paymentData.invoiceId)
    .eq('user_id', user.id);

  return data;
}

export async function deleteInvoice(invoiceId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function updateInvoice(
  invoiceId: string,
  invoiceData: {
    number?: string;
    date?: string;
    dueDate?: string;
    status?: 'draft' | 'sent' | 'paid' | 'overdue';
    items?: Array<{
      description: string;
      quantity: number;
      price: number;
    }>;
  }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // If items are provided, calculate new total
  let total;
  if (invoiceData.items) {
    total = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }

  // Update invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .update({
      ...invoiceData,
      ...(total !== undefined ? { total } : {}),
    })
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (invoiceError) throw invoiceError;

  // If items are provided, update invoice items
  if (invoiceData.items) {
    // First delete existing items
    await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', invoiceId);

    // Then insert new items
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(
        invoiceData.items.map(item => ({
          invoice_id: invoiceId,
          ...item,
        }))
      );

    if (itemsError) throw itemsError;
  }

  return invoice;
}

export async function updateClient(
  clientId: string,
  clientData: {
    name?: string;
    email?: string;
    phone?: string | null;
    address?: string | null;
    tax_number?: string | null;
    notes?: string | null;
    contact_name?: string | null;
  }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('clients')
    .update(clientData)
    .eq('id', clientId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClient(clientId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function deletePayment(paymentId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function updatePayment(
  paymentId: string,
  paymentData: {
    amount?: number;
    payment_method?: string;
    status?: 'completed' | 'pending' | 'failed';
  }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: payment, error } = await supabase
    .from('payments')
    .update(paymentData)
    .eq('id', paymentId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return payment;
}

export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(profileData: {
  full_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCompany(companyData: {
  company_name?: string;
  company_email?: string;
  phone?: string;
  billing_address?: string;
  tax_number?: string;
  company_logo_url?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(companyData)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
  return true;
}

export async function updateNotificationPreferences(preferences: {
  invoice_created?: boolean;
  payment_received?: boolean;
  invoice_overdue?: boolean;
  marketing_emails?: boolean;
  browser_notifications?: boolean;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update({
      notification_preferences: preferences
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
} 