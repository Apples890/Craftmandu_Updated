-- Enable RLS on sensitive tables
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;

-- Customers can see their orders
DROP POLICY IF EXISTS customers_view_own_orders ON orders;
CREATE POLICY customers_view_own_orders ON orders
FOR SELECT USING (auth.uid() = customer_id);

-- Vendors can see orders for their shop
DROP POLICY IF EXISTS vendors_view_own_orders ON orders;
CREATE POLICY vendors_view_own_orders ON orders
FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM vendors v WHERE v.id = orders.vendor_id)
);

-- Vendors manage only their products
DROP POLICY IF EXISTS vendors_manage_own_products ON products;
CREATE POLICY vendors_manage_own_products ON products
FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM vendors v WHERE v.id = products.vendor_id)
);

-- Users view only the messages in conversations they participate in
DROP POLICY IF EXISTS users_view_own_messages ON messages;
CREATE POLICY users_view_own_messages ON messages
FOR SELECT USING (
  auth.uid() IN (
    SELECT customer_id FROM conversations c WHERE c.id = messages.conversation_id
  )
  OR auth.uid() IN (
    SELECT v.user_id FROM conversations c
    JOIN vendors v ON v.id = c.vendor_id
    WHERE c.id = messages.conversation_id
  )
);
