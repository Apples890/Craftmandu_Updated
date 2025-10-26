CREATE OR REPLACE FUNCTION calculate_average_rating(p_product_id uuid)
RETURNS numeric AS $$
DECLARE avg_rating numeric;
BEGIN
  SELECT ROUND(AVG(rating)::numeric, 2) INTO avg_rating
  FROM reviews
  WHERE product_id = p_product_id;
  RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql STABLE;
