-- Allow public SELECT of active products
DROP POLICY IF EXISTS public_view_active_products ON products;
CREATE POLICY public_view_active_products ON products
FOR SELECT USING (status = 'ACTIVE');

