INSERT INTO categories (id, parent_id, name, slug)
VALUES
  (gen_random_uuid(), NULL, 'Electronics', 'electronics'),
  (gen_random_uuid(), NULL, 'Fashion', 'fashion'),
  (gen_random_uuid(), NULL, 'Home & Kitchen', 'home-kitchen'),
  (gen_random_uuid(), NULL, 'Beauty & Health', 'beauty-health'),
  (gen_random_uuid(), NULL, 'Sports & Outdoors', 'sports-outdoors')
ON CONFLICT (slug) DO NOTHING;
