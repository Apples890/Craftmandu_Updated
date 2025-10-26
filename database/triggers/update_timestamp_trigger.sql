-- Generic trigger to keep updated_at current
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

-- Attach to common tables
DROP TRIGGER IF EXISTS trg_set_updated_at_users ON users;
CREATE TRIGGER trg_set_updated_at_users BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_vendors ON vendors;
CREATE TRIGGER trg_set_updated_at_vendors BEFORE UPDATE ON vendors
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_categories ON categories;
CREATE TRIGGER trg_set_updated_at_categories BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_products ON products;
CREATE TRIGGER trg_set_updated_at_products BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_orders ON orders;
CREATE TRIGGER trg_set_updated_at_orders BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_carts ON shopping_carts;
CREATE TRIGGER trg_set_updated_at_carts BEFORE UPDATE ON shopping_carts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
