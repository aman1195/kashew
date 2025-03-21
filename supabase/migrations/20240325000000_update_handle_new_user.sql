-- Drop the trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS handle_new_user();

-- Create the updated function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    company_name,
    company_email,
    company_phone,
    billing_address,
    tax_number,
    default_payment_terms,
    default_invoice_footer,
    notification_preferences
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    NEW.email,
    NULL,
    NULL,
    NULL,
    30,
    'Thank you for your business!',
    '{
      "invoice_created": true,
      "payment_received": true,
      "invoice_overdue": true,
      "marketing_emails": true,
      "browser_notifications": true
    }'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user(); 