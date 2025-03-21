-- First, drop the existing trigger and function to start fresh
DROP TRIGGER IF EXISTS update_invoice_status_on_payment ON payments;
DROP FUNCTION IF EXISTS trigger_update_invoice_status();
DROP FUNCTION IF EXISTS update_invoice_status(UUID);

-- Create the update_invoice_status function with explicit table references
CREATE OR REPLACE FUNCTION update_invoice_status(p_invoice_id UUID)
RETURNS void AS $$
DECLARE
    v_total_amount DECIMAL;
    v_paid_amount DECIMAL;
BEGIN
    -- Get total amount from invoices table
    SELECT i.total INTO v_total_amount
    FROM invoices i
    WHERE i.id = p_invoice_id;

    -- Get total paid amount from payments table
    SELECT COALESCE(SUM(p.amount), 0) INTO v_paid_amount
    FROM payments p
    WHERE p.invoice_id = p_invoice_id
    AND p.status = 'completed';

    -- Update invoice status based on payment amount
    IF v_paid_amount >= v_total_amount THEN
        UPDATE invoices i
        SET status = 'paid'
        WHERE i.id = p_invoice_id;
    ELSIF v_paid_amount > 0 THEN
        UPDATE invoices i
        SET status = 'sent'
        WHERE i.id = p_invoice_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger function with explicit table references
CREATE OR REPLACE FUNCTION trigger_update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_invoice_status(NEW.invoice_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_invoice_status_on_payment
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_invoice_status();

-- Create the insert_payment function with explicit table references
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