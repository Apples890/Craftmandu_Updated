CREATE TABLE IF NOT EXISTS cart_items (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id            uuid NOT NULL REFERENCES shopping_carts(id) ON DELETE CASCADE,
  vendor_id          uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  product_id         uuid REFERENCES products(id) ON DELETE SET NULL,
  variant_id         uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  qty                int  NOT NULL CHECK (qty > 0),
  unit_price_cents   int NOT NULL CHECK (unit_price_cents >= 0),
  added_at           timestamptz NOT NULL DEFAULT now()
);
