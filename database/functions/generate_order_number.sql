-- Generates human readable order numbers like 20251020-000123
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  ymd text := to_char(now(), 'YYYYMMDD');
  seq int;
BEGIN
  -- derive a day-scoped sequence using orders count; replace with a real sequence for concurrency at scale
  SELECT COALESCE(count(*),0)+1 INTO seq FROM orders WHERE to_char(placed_at,'YYYYMMDD') = ymd;
  RETURN ymd || '-' || lpad(seq::text, 6, '0');
END;
$$ LANGUAGE plpgsql VOLATILE;
