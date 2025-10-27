-- Seed a demo vendor user, vendor record, and some products with images and inventory
-- Safe to run multiple times (uses ON CONFLICT / WHERE NOT EXISTS).

-- Create demo vendor user if not exists
WITH u AS (
  INSERT INTO users (email, full_name, role, password_hash)
  VALUES ('demo.vendor@example.com', 'Demo Vendor', 'VENDOR', 'seeded_bcrypt_placeholder')
  ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
  RETURNING id
), user_row AS (
  SELECT id FROM u
  UNION ALL
  SELECT id FROM users WHERE email = 'demo.vendor@example.com' LIMIT 1
)
INSERT INTO vendors (user_id, shop_name, slug, description)
SELECT id, 'Demo Crafts Shop', 'demo-crafts-shop', 'Handmade demo items'
FROM user_row
ON CONFLICT (user_id) DO UPDATE SET shop_name = EXCLUDED.shop_name;
-- Ensure a category exists
INSERT INTO categories (id, parent_id, name, slug)
SELECT gen_random_uuid(), NULL, 'Home & Kitchen', 'home-kitchen'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'home-kitchen');

-- Upsert products
WITH vend AS (
  SELECT id AS vendor_id FROM vendors WHERE slug = 'demo-crafts-shop'
), cat AS (
  SELECT id AS category_id FROM categories WHERE slug = 'home-kitchen'
)
INSERT INTO products (vendor_id, category_id, name, slug, description, price_cents, currency, status)
SELECT vend.vendor_id, cat.category_id, p.name, p.slug, p.description, p.price_cents, 'USD', 'ACTIVE'
FROM vend CROSS JOIN cat,
  (VALUES
    ('Handwoven Table Runner','handwoven-table-runner','Beautiful handwoven cotton table runner.',3499),
    ('Carved Wooden Bowl','carved-wooden-bowl','Sustainably sourced carved wooden bowl.',2599),
    ('Ceramic Mug Set','ceramic-mug-set','Set of two hand-glazed ceramic mugs.',2999)
  ) AS p(name,slug,description,price_cents)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  status = 'ACTIVE';

-- Insert images and inventory for each product
DO $$
DECLARE pid uuid;
BEGIN
  FOR pid IN SELECT id FROM products WHERE slug IN ('handwoven-table-runner','carved-wooden-bowl','ceramic-mug-set') LOOP
    DELETE FROM product_images WHERE product_id = pid;
    IF (SELECT slug FROM products WHERE id = pid) = 'handwoven-table-runner' THEN
      INSERT INTO product_images (product_id, image_url, sort_order)
      VALUES
        (pid, 'https://images.unsplash.com/photo-1523419409543-a6d49002b6aa?q=80&w=800&auto=format&fit=crop', 0);
    ELSIF (SELECT slug FROM products WHERE id = pid) = 'carved-wooden-bowl' THEN
      INSERT INTO product_images (product_id, image_url, sort_order)
      VALUES
        (pid, 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=800&auto=format&fit=crop', 0);
    ELSE
      INSERT INTO product_images (product_id, image_url, sort_order)
      VALUES
        (pid, 'https://images.unsplash.com/photo-1519165431625-342a8d1bf8d2?q=80&w=800&auto=format&fit=crop', 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM inventory WHERE product_id = pid) THEN
      INSERT INTO inventory (product_id, qty_available) VALUES (pid, 25);
    END IF;
  END LOOP;
END $$;
