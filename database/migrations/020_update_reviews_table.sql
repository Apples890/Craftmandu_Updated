ALTER TABLE IF EXISTS reviews
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS vendor_reply text,
  ADD COLUMN IF NOT EXISTS vendor_reply_at timestamptz,
  ALTER COLUMN rating SET DEFAULT 5;
