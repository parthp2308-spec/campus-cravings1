ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS subtotal_price NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_subtotal_price_check'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_subtotal_price_check
      CHECK (subtotal_price >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_delivery_fee_check'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_delivery_fee_check
      CHECK (delivery_fee >= 0);
  END IF;
END $$;
