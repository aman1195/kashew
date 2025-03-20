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
    company_phone TEXT,
    website TEXT,
    default_payment_terms INTEGER DEFAULT 30,
    default_invoice_footer TEXT
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

-- Create RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

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

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
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

-- Create a function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();