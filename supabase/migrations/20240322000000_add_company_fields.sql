-- Add company-related fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS company_email TEXT,
ADD COLUMN IF NOT EXISTS company_phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS default_payment_terms INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS default_invoice_footer TEXT;

-- Update existing profiles to set default values
UPDATE profiles
SET 
    company_email = email,
    company_phone = phone,
    default_payment_terms = 30,
    default_invoice_footer = 'Thank you for your business!'
WHERE company_email IS NULL;

-- Add notification preferences JSONB column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
    "invoice_created": true,
    "payment_received": true,
    "invoice_overdue": true,
    "marketing_emails": true,
    "browser_notifications": true
}'::jsonb;

-- Create function to handle company information updates
CREATE OR REPLACE FUNCTION handle_company_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure company email is not null
    IF NEW.company_email IS NULL THEN
        NEW.company_email = NEW.email;
    END IF;
    
    -- Ensure default payment terms is not null
    IF NEW.default_payment_terms IS NULL THEN
        NEW.default_payment_terms = 30;
    END IF;
    
    -- Ensure notification preferences is not null
    IF NEW.notification_preferences IS NULL THEN
        NEW.notification_preferences = '{
            "invoice_created": true,
            "payment_received": true,
            "invoice_overdue": true,
            "marketing_emails": true,
            "browser_notifications": true
        }'::jsonb;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for company information updates
CREATE TRIGGER on_company_update
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_company_update(); 