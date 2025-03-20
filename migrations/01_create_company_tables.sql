-- Create companies table
CREATE TABLE companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    tax_number TEXT,
    website TEXT,
    logo_url TEXT,
    default_payment_terms INTEGER DEFAULT 30,
    default_invoice_footer TEXT,
    notification_preferences JSONB DEFAULT '{
        "invoice_created": true,
        "payment_received": true,
        "invoice_overdue": true,
        "marketing_emails": true,
        "browser_notifications": true
    }'::jsonb
);

-- Create company_users table
CREATE TABLE company_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    company_id UUID REFERENCES companies ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'invited')) DEFAULT 'pending',
    invited_by UUID REFERENCES auth.users ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(company_id, user_id)
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY "Users can view their companies"
    ON companies FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = companies.id
        AND company_users.user_id = auth.uid()
        AND company_users.status = 'active'
    ));

CREATE POLICY "Users can create companies"
    ON companies FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Company admins can update their company"
    ON companies FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = companies.id
        AND company_users.user_id = auth.uid()
        AND company_users.role = 'admin'
        AND company_users.status = 'active'
    ));

-- Create RLS policies for company_users
CREATE POLICY "Users can view company users in their companies"
    ON company_users FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM company_users cu
        WHERE cu.company_id = company_users.company_id
        AND cu.user_id = auth.uid()
        AND cu.status = 'active'
    ));

CREATE POLICY "Users can create company users"
    ON company_users FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = company_users.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.role = 'admin'
        AND company_users.status = 'active'
    ));

CREATE POLICY "Company admins can update company users"
    ON company_users FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = company_users.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.role = 'admin'
        AND company_users.status = 'active'
    ));

CREATE POLICY "Company admins can delete company users"
    ON company_users FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM company_users
        WHERE company_users.company_id = company_users.company_id
        AND company_users.user_id = auth.uid()
        AND company_users.role = 'admin'
        AND company_users.status = 'active'
    ));

-- Create indexes
CREATE INDEX idx_company_users_company_id ON company_users(company_id);
CREATE INDEX idx_company_users_user_id ON company_users(user_id);
CREATE INDEX idx_company_users_status ON company_users(status);

-- Create trigger for updated_at
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_company_users_updated_at
    BEFORE UPDATE ON company_users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column(); 