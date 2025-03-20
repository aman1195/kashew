-- Add company_id to profiles table
ALTER TABLE profiles
ADD COLUMN company_id UUID REFERENCES companies ON DELETE SET NULL;

-- Add company_id to clients table
ALTER TABLE clients
ADD COLUMN company_id UUID REFERENCES companies ON DELETE CASCADE;

-- Add company_id to products table
ALTER TABLE products
ADD COLUMN company_id UUID REFERENCES companies ON DELETE CASCADE;

-- Add company_id to invoices table
ALTER TABLE invoices
ADD COLUMN company_id UUID REFERENCES companies ON DELETE CASCADE;

-- Add company_id to payments table
ALTER TABLE payments
ADD COLUMN company_id UUID REFERENCES companies ON DELETE CASCADE;

-- Create indexes for company_id columns
CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_clients_company_id ON clients(company_id);
CREATE INDEX idx_products_company_id ON products(company_id);
CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_payments_company_id ON payments(company_id);

-- Update RLS policies to include company_id checks
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can create clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;
DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can create products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can create payments" ON payments;
DROP POLICY IF EXISTS "Users can update own payments" ON payments;
DROP POLICY IF EXISTS "Users can delete own payments" ON payments;

-- Create new RLS policies with company_id checks
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (
        auth.uid() = id AND
        (company_id IS NULL OR EXISTS (
            SELECT 1 FROM company_users
            WHERE company_users.company_id = profiles.company_id
            AND company_users.user_id = auth.uid()
            AND company_users.status = 'active'
        ))
    );

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (
        auth.uid() = id AND
        (company_id IS NULL OR EXISTS (
            SELECT 1 FROM company_users
            WHERE company_users.company_id = profiles.company_id
            AND company_users.user_id = auth.uid()
            AND company_users.status = 'active'
        ))
    );

CREATE POLICY "Users can view company clients"
    ON clients FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = clients.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.status = 'active'
    ));

CREATE POLICY "Users can create company clients"
    ON clients FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = clients.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.status = 'active'
    ));

CREATE POLICY "Users can update company clients"
    ON clients FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = clients.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.status = 'active'
    ));

CREATE POLICY "Users can delete company clients"
    ON clients FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = clients.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.status = 'active'
    ));

CREATE POLICY "Users can view company products"
    ON products FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = products.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.status = 'active'
    ));

CREATE POLICY "Users can create company products"
    ON products FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = products.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.status = 'active'
    ));

CREATE POLICY "Users can update company products"
    ON products FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = products.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.status = 'active'
    ));

CREATE POLICY "Users can delete company products"
    ON products FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = products.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.status = 'active'
    ));

CREATE POLICY "Users can view company invoices"
    ON invoices FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = invoices.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.status = 'active'
    ));

CREATE POLICY "Users can create company invoices"
    ON invoices FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = invoices.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.status = 'active'
    ));

CREATE POLICY "Users can update company invoices"
    ON invoices FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = invoices.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.status = 'active'
    ));

CREATE POLICY "Users can delete company invoices"
    ON invoices FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = invoices.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.status = 'active'
    ));

CREATE POLICY "Users can view company payments"
    ON payments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = payments.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.status = 'active'
    ));

CREATE POLICY "Users can create company payments"
    ON payments FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = payments.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.status = 'active'
    ));

CREATE POLICY "Users can update company payments"
    ON payments FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = payments.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.status = 'active'
    ));

CREATE POLICY "Users can delete company payments"
    ON payments FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = payments.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.status = 'active'
    )); 