-- Drop existing objects
DROP TRIGGER IF EXISTS update_company_memberships_updated_at ON company_memberships;
DROP FUNCTION IF EXISTS handle_user_invitation(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS accept_invitation(UUID, UUID);
DROP FUNCTION IF EXISTS remove_company_member(UUID, UUID);
DROP POLICY IF EXISTS "Users can view their own company memberships" ON company_memberships;
DROP POLICY IF EXISTS "Company owners can manage memberships" ON company_memberships;
DROP TABLE IF EXISTS company_memberships;

-- Create the table
CREATE TABLE company_memberships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(company_id, user_id)
);

-- Enable RLS
ALTER TABLE company_memberships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own company memberships"
    ON company_memberships FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = company_id);

CREATE POLICY "Company owners can insert memberships"
    ON company_memberships FOR INSERT
    WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Company owners can update memberships"
    ON company_memberships FOR UPDATE
    USING (auth.uid() = company_id)
    WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Company owners can delete memberships"
    ON company_memberships FOR DELETE
    USING (auth.uid() = company_id);

-- Enable PostgREST features
COMMENT ON TABLE company_memberships IS 'Company memberships for multi-tenant support';
COMMENT ON COLUMN company_memberships.company_id IS 'The ID of the company (references auth.users)';
COMMENT ON COLUMN company_memberships.user_id IS 'The ID of the user (references auth.users)';

-- Create function to handle user invitation with temporary user_id for non-existent users
CREATE OR REPLACE FUNCTION handle_user_invitation(
    p_company_id UUID,
    p_email TEXT,
    p_role TEXT DEFAULT 'member'
) RETURNS void AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Check if user exists in auth.users
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = p_email;

    -- If user exists, create membership
    IF v_user_id IS NOT NULL THEN
        INSERT INTO company_memberships (company_id, user_id, role, status)
        VALUES (p_company_id, v_user_id, p_role, 'active')
        ON CONFLICT (company_id, user_id) DO UPDATE
        SET role = EXCLUDED.role,
            status = 'active',
            updated_at = NOW();
    ELSE
        -- If user doesn't exist, create a temporary user_id
        -- This is a UUID that we'll use as a placeholder
        v_user_id := gen_random_uuid();
        
        -- Create a pending invitation with the temporary user_id
        INSERT INTO company_memberships (company_id, user_id, role, status)
        VALUES (p_company_id, v_user_id, p_role, 'pending')
        ON CONFLICT (company_id, user_id) DO UPDATE
        SET role = EXCLUDED.role,
            status = 'pending',
            updated_at = NOW();
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to accept invitation
CREATE OR REPLACE FUNCTION accept_invitation(
    p_company_id UUID,
    p_user_id UUID
) RETURNS void AS $$
BEGIN
    UPDATE company_memberships
    SET status = 'active',
        updated_at = NOW()
    WHERE company_id = p_company_id
    AND user_id = p_user_id
    AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to remove company member
CREATE OR REPLACE FUNCTION remove_company_member(
    p_company_id UUID,
    p_user_id UUID
) RETURNS void AS $$
BEGIN
    DELETE FROM company_memberships
    WHERE company_id = p_company_id
    AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger
CREATE TRIGGER update_company_memberships_updated_at
    BEFORE UPDATE ON company_memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add initial owner membership for existing companies
INSERT INTO company_memberships (company_id, user_id, role, status)
SELECT id, id, 'owner', 'active'
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM company_memberships
    WHERE company_id = auth.users.id
); 