ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stripe_refund_id TEXT;

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'accepted', 'out_for_delivery', 'completed', 'canceled'));

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
