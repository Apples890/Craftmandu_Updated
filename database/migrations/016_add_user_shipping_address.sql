ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS shipping_address_json jsonb;

