-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', false);

-- Set up storage policies
-- Avatars policies
CREATE POLICY "Avatar images are publicly accessible"
 ON storage.objects FOR SELECT
 USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
 ON storage.objects FOR INSERT
 WITH CHECK (
   bucket_id = 'avatars' AND
   auth.uid() = owner
 );

CREATE POLICY "Users can update their own avatar"
 ON storage.objects FOR UPDATE
 USING (
   bucket_id = 'avatars' AND
   auth.uid() = owner
 );

CREATE POLICY "Users can delete their own avatar"
 ON storage.objects FOR DELETE
 USING (
   bucket_id = 'avatars' AND
   auth.uid() = owner
 );

-- Invoice documents policies
CREATE POLICY "Users can access their own invoices"
 ON storage.objects FOR SELECT
 USING (
   bucket_id = 'invoices' AND
   auth.uid() = owner
 );

CREATE POLICY "Users can upload their own invoices"
 ON storage.objects FOR INSERT
 WITH CHECK (
   bucket_id = 'invoices' AND
   auth.uid() = owner
 );

CREATE POLICY "Users can update their own invoices"
 ON storage.objects FOR UPDATE
 USING (
   bucket_id = 'invoices' AND
   auth.uid() = owner
 );

CREATE POLICY "Users can delete their own invoices"
 ON storage.objects FOR DELETE
 USING (
   bucket_id = 'invoices' AND
   auth.uid() = owner
 );

-- Company logos policies
CREATE POLICY "Company logos are publicly accessible"
 ON storage.objects FOR SELECT
 USING (bucket_id = 'company-logos');

CREATE POLICY "Users can upload their company logo"
 ON storage.objects FOR INSERT
 WITH CHECK (
   bucket_id = 'company-logos' AND
   auth.uid() = owner
 );

CREATE POLICY "Users can update their company logo"
 ON storage.objects FOR UPDATE
 USING (
   bucket_id = 'company-logos' AND
   auth.uid() = owner
 );

CREATE POLICY "Users can delete their company logo"
 ON storage.objects FOR DELETE
 USING (
   bucket_id = 'company-logos' AND
   auth.uid() = owner
 );

-- Create profiles table
CREATE TABLE profiles (
   id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
   full_name TEXT,
   company_name TEXT,
   email TEXT NOT NULL,
   avatar_url TEXT,
   company_logo_url TEXT,
   billing_address TEXT,
   tax_number TEXT,
   phone TEXT,
   website TEXT,
   default_payment_terms INTEGER DEFAULT 30,
   default_invoice_footer TEXT,
   company_email TEXT,
   company_phone TEXT,
   notification_preferences JSONB DEFAULT '{
       "invoice_created": true,
       "payment_received": true,
       "invoice_overdue": true,
       "marketing_emails": true,
       "browser_notifications": true
   }'::jsonb
);

-- Create clients table
CREATE TABLE clients (
   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
   name TEXT NOT NULL,
   email TEXT NOT NULL,
   phone TEXT,
   address TEXT,
   tax_number TEXT,
   notes TEXT,
   user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL
);

-- Create products table
CREATE TABLE products (
   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
   name TEXT NOT NULL,
   description TEXT,
   price DECIMAL(10,2) NOT NULL,
   type TEXT NOT NULL DEFAULT 'Product',
   unit TEXT NOT NULL DEFAULT 'item',
   tax_rate DECIMAL(5,2) DEFAULT 0,
   archived BOOLEAN DEFAULT false,
   user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL
);

-- Create invoices table
CREATE TABLE invoices (
   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
   number TEXT NOT NULL,
   date DATE NOT NULL,
   due_date DATE NOT NULL,
   status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
   total DECIMAL(10,2) NOT NULL,
   subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
   tax_rate DECIMAL(5,2) DEFAULT 0,
   tax_amount DECIMAL(10,2) DEFAULT 0,
   tax_type TEXT DEFAULT 'vat',
   notes TEXT,
   terms TEXT,
   client_id UUID REFERENCES clients ON DELETE CASCADE NOT NULL,
   user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL
);

-- Create invoice items table
CREATE TABLE invoice_items (
   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
   description TEXT NOT NULL,
   quantity INTEGER NOT NULL,
   price DECIMAL(10,2) NOT NULL,
   invoice_id UUID REFERENCES invoices ON DELETE CASCADE NOT NULL
);

-- Create payments table
CREATE TABLE payments (
   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
   invoice_id UUID REFERENCES invoices ON DELETE CASCADE NOT NULL,
   amount DECIMAL(10,2) NOT NULL,
   payment_method TEXT NOT NULL,
   status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'failed')),
   user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view own profile"
   ON profiles FOR SELECT
   USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
   ON profiles FOR UPDATE
   USING (auth.uid() = id);

-- Clients policies
CREATE POLICY "Users can view own clients"
   ON clients FOR SELECT
   USING (auth.uid() = user_id);

CREATE POLICY "Users can create clients"
   ON clients FOR INSERT
   WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
   ON clients FOR UPDATE
   USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
   ON clients FOR DELETE
   USING (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Users can view own products"
   ON products FOR SELECT
   USING (auth.uid() = user_id);

CREATE POLICY "Users can create products"
   ON products FOR INSERT
   WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
   ON products FOR UPDATE
   USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
   ON products FOR DELETE
   USING (auth.uid() = user_id);

-- Invoices policies
CREATE POLICY "Users can view own invoices"
   ON invoices FOR SELECT
   USING (auth.uid() = user_id);

CREATE POLICY "Users can create invoices"
   ON invoices FOR INSERT
   WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices"
   ON invoices FOR UPDATE
   USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices"
   ON invoices FOR DELETE
   USING (auth.uid() = user_id);

-- Invoice items policies
CREATE POLICY "Users can view own invoice items"
   ON invoice_items FOR SELECT
   USING (EXISTS (
       SELECT 1 FROM invoices
       WHERE invoices.id = invoice_items.invoice_id
       AND invoices.user_id = auth.uid()
   ));

CREATE POLICY "Users can create invoice items"
   ON invoice_items FOR INSERT
   WITH CHECK (EXISTS (
       SELECT 1 FROM invoices
       WHERE invoices.id = invoice_items.invoice_id
       AND invoices.user_id = auth.uid()
   ));

CREATE POLICY "Users can update own invoice items"
   ON invoice_items FOR UPDATE
   USING (EXISTS (
       SELECT 1 FROM invoices
       WHERE invoices.id = invoice_items.invoice_id
       AND invoices.user_id = auth.uid()
   ));

CREATE POLICY "Users can delete own invoice items"
   ON invoice_items FOR DELETE
   USING (EXISTS (
       SELECT 1 FROM invoices
       WHERE invoices.id = invoice_items.invoice_id
       AND invoices.user_id = auth.uid()
   ));

-- Payments policies
CREATE POLICY "Users can view own payments"
   ON payments FOR SELECT
   USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments"
   ON payments FOR INSERT
   WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments"
   ON payments FOR UPDATE
   USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payments"
   ON payments FOR DELETE
   USING (auth.uid() = user_id);

-- Create functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
 INSERT INTO public.profiles (id, full_name, email, company_name, company_email)
 VALUES (
   NEW.id,
   COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
   NEW.email,
   COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
   NEW.email
 );
 RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = TIMEZONE('utc'::text, NOW());
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION calculate_invoice_total(invoice_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total DECIMAL;
BEGIN
    SELECT COALESCE(SUM(quantity * price), 0)
    INTO total
    FROM invoice_items
    WHERE invoice_id = $1;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_invoice_status(invoice_id UUID)
RETURNS void AS $$
DECLARE
    total_amount DECIMAL;
    paid_amount DECIMAL;
BEGIN
    SELECT total INTO total_amount
    FROM invoices
    WHERE id = invoice_id;

    SELECT COALESCE(SUM(amount), 0) INTO paid_amount
    FROM payments
    WHERE invoice_id = $1
    AND status = 'completed';

    IF paid_amount >= total_amount THEN
        UPDATE invoices
        SET status = 'paid'
        WHERE id = invoice_id;
    ELSIF paid_amount > 0 THEN
        UPDATE invoices
        SET status = 'sent'
        WHERE id = invoice_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_invoice_number(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    last_number INTEGER;
    new_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM '[0-9]+') AS INTEGER)), 0)
    INTO last_number
    FROM invoices
    WHERE user_id = $1;

    new_number := 'INV-' || LPAD((last_number + 1)::TEXT, 6, '0');

    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_overdue_invoices()
RETURNS void AS $$
BEGIN
    UPDATE invoices
    SET status = 'overdue'
    WHERE status = 'sent'
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_payment_summary(user_id UUID)
RETURNS TABLE (
    total_received DECIMAL,
    pending_amount DECIMAL,
    failed_amount DECIMAL,
    received_change DECIMAL,
    pending_change DECIMAL,
    failed_change DECIMAL
) AS $$
DECLARE
    last_month_start DATE;
    last_month_end DATE;
    current_month_start DATE;
    current_month_end DATE;
BEGIN
    current_month_start := DATE_TRUNC('month', CURRENT_DATE);
    current_month_end := CURRENT_DATE;
    last_month_start := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');
    last_month_end := current_month_start - INTERVAL '1 day';

    RETURN QUERY
    WITH current_month AS (
        SELECT
            COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_received,
            COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
            COALESCE(SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END), 0) as failed_amount
        FROM payments
        WHERE user_id = $1
        AND created_at >= current_month_start
        AND created_at <= current_month_end
    ),
    last_month AS (
        SELECT
            COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_received,
            COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
            COALESCE(SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END), 0) as failed_amount
        FROM payments
        WHERE user_id = $1
        AND created_at >= last_month_start
        AND created_at <= last_month_end
    )
    SELECT
        cm.total_received,
        cm.pending_amount,
        cm.failed_amount,
        CASE 
            WHEN lm.total_received = 0 THEN 0
            ELSE ROUND(((cm.total_received - lm.total_received) / lm.total_received * 100)::numeric, 1)
        END as received_change,
        CASE 
            WHEN lm.pending_amount = 0 THEN 0
            ELSE ROUND(((cm.pending_amount - lm.pending_amount) / lm.pending_amount * 100)::numeric, 1)
        END as pending_change,
        CASE 
            WHEN lm.failed_amount = 0 THEN 0
            ELSE ROUND(((cm.failed_amount - lm.failed_amount) / lm.failed_amount * 100)::numeric, 1)
        END as failed_change
    FROM current_month cm
    CROSS JOIN last_month lm;
END;
$$ LANGUAGE plpgsql;

-- Add the missing trigger function
CREATE OR REPLACE FUNCTION trigger_update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_invoice_status(NEW.invoice_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER on_auth_user_created
 AFTER INSERT ON auth.users
 FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_profiles_updated_at
   BEFORE UPDATE ON profiles
   FOR EACH ROW
   EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
   BEFORE UPDATE ON clients
   FOR EACH ROW
   EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_products_updated_at
   BEFORE UPDATE ON products
   FOR EACH ROW
   EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
   BEFORE UPDATE ON invoices
   FOR EACH ROW
   EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_invoice_items_updated_at
   BEFORE UPDATE ON invoice_items
   FOR EACH ROW
   EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
   BEFORE UPDATE ON payments
   FOR EACH ROW
   EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_invoice_status_on_payment
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_invoice_status();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);

-- Update existing profiles with default values
UPDATE profiles
SET
   company_email = email,
   company_phone = phone,
   default_payment_terms = 30,
   default_invoice_footer = 'Thank you for your business!'
WHERE company_email IS NULL;

-- Create stored procedure for inserting payments
CREATE OR REPLACE FUNCTION insert_payment(
  p_invoice_id UUID,
  p_amount DECIMAL,
  p_payment_method TEXT,
  p_user_id UUID,
  p_status TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO payments (
    invoice_id,
    amount,
    payment_method,
    user_id,
    status
  ) VALUES (
    p_invoice_id,
    p_amount,
    p_payment_method,
    p_user_id,
    p_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 