CREATE TABLE IF NOT EXISTS orders (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number         text UNIQUE, -- can be filled from generate_order_number()
  customer_id          uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  vendor_id            uuid NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  status               order_status NOT NULL DEFAULT 'PENDING',
  subtotal_cents       int NOT NULL DEFAULT 0,
  shipping_cents       int NOT NULL DEFAULT 0,
  tax_cents            int NOT NULL DEFAULT 0,
  total_cents          int GENERATED ALWAYS AS (subtotal_cents + shipping_cents + tax_cents) STORED,
  currency             text NOT NULL DEFAULT 'USD',
  shipping_address_json jsonb,
  billing_address_json  jsonb,
  placed_at            timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  tracking_number      text
);

-- Payments table (lightweight and gateway-agnostic)
CREATE TABLE IF NOT EXISTS payments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider      text NOT NULL,
  provider_ref  text,
  amount_cents  int NOT NULL CHECK (amount_cents >= 0),
  status        payment_status NOT NULL DEFAULT 'PENDING',
  paid_at       timestamptz
);

-- Shipments (optional per order)
CREATE TABLE IF NOT EXISTS shipments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  carrier       text,
  service       text,
  tracking_number text,
  shipped_at    timestamptz
);
