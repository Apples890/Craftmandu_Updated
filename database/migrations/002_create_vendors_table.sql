CREATE TABLE IF NOT EXISTS vendors (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shop_name         text NOT NULL,
  slug              citext UNIQUE NOT NULL,
  description       text,
  logo_url          text,
  banner_url        text,
  address_line1     text,
  address_line2     text,
  city              text,
  country           text,
  tax_id            text,
  status            vendor_status NOT NULL DEFAULT 'PENDING',
  verification_notes text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS vendors_slug_idx ON vendors(slug);
