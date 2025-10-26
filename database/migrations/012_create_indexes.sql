-- Helpful indexes
CREATE INDEX IF NOT EXISTS products_vendor_idx ON products(vendor_id);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_status_idx ON products(status);
CREATE INDEX IF NOT EXISTS product_search_idx ON products USING GIN (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(description,'')));

CREATE INDEX IF NOT EXISTS orders_customer_idx ON orders(customer_id);
CREATE INDEX IF NOT EXISTS orders_vendor_idx ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);

CREATE INDEX IF NOT EXISTS reviews_product_idx ON reviews(product_id);

CREATE INDEX IF NOT EXISTS messages_conv_idx ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS cart_items_vendor_idx ON cart_items(vendor_id);
