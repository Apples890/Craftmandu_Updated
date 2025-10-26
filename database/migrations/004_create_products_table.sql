-- Base products
CREATE TABLE IF NOT EXISTS products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id     uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  category_id   uuid REFERENCES categories(id) ON DELETE SET NULL,
  name          text NOT NULL,
  slug          citext UNIQUE NOT NULL,
  description   text,
  price_cents   integer NOT NULL CHECK (price_cents >= 0),
  currency      text NOT NULL DEFAULT 'USD',
  status        product_status NOT NULL DEFAULT 'ACTIVE',
  sku           text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Variants (optional per product)
CREATE TABLE IF NOT EXISTS product_variants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name          text NOT NULL,
  sku           text,
  price_cents   integer,
  UNIQUE(product_id, name)
);

-- Inventory, either product-level or variant-level
CREATE TABLE IF NOT EXISTS inventory (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid REFERENCES products(id) ON DELETE CASCADE,
  variant_id    uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  qty_available integer NOT NULL DEFAULT 0,
  CHECK (
    (product_id IS NOT NULL AND variant_id IS NULL)
    OR (product_id IS NULL AND variant_id IS NOT NULL)
  )
);

-- Images
CREATE TABLE IF NOT EXISTS product_images (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url     text NOT NULL,
  sort_order    int NOT NULL DEFAULT 0
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          citext UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS product_tags (
  product_id    uuid REFERENCES products(id) ON DELETE CASCADE,
  tag_id        uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);
