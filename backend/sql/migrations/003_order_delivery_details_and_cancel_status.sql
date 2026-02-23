ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_name TEXT;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_phone TEXT;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_address TEXT;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_instructions TEXT;

UPDATE orders
SET
  delivery_name = COALESCE(delivery_name, 'Campus Cravings Customer'),
  delivery_phone = COALESCE(delivery_phone, '000-000-0000'),
  delivery_address = COALESCE(delivery_address, 'UConn Campus');

ALTER TABLE orders
  ALTER COLUMN delivery_name SET NOT NULL;

ALTER TABLE orders
  ALTER COLUMN delivery_phone SET NOT NULL;

ALTER TABLE orders
  ALTER COLUMN delivery_address SET NOT NULL;

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'accepted', 'completed', 'canceled'));
