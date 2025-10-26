CREATE TABLE IF NOT EXISTS order_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       uuid REFERENCES products(id),
  variant_id       uuid REFERENCES product_variants(id),
  name_snapshot    text NOT NULL,
  sku_snapshot     text,
  unit_price_cents int NOT NULL,
  qty              int NOT NULL CHECK (qty > 0),
  line_total_cents int NOT NULL
);
