-- Decrease inventory after an order item is inserted
CREATE OR REPLACE FUNCTION update_product_stock(p_product_id uuid, p_variant_id uuid, p_qty int)
RETURNS void AS $$
BEGIN
  IF p_variant_id IS NOT NULL THEN
    UPDATE inventory SET qty_available = GREATEST(qty_available - p_qty, 0)
    WHERE variant_id = p_variant_id;
  ELSE
    UPDATE inventory SET qty_available = GREATEST(qty_available - p_qty, 0)
    WHERE product_id = p_product_id AND variant_id IS NULL;
  END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;
