-- Function: ensure_vendor_profile()
-- Ensures a vendors row exists when a user's role is VENDOR.
-- Safe to call from triggers on INSERT/UPDATE of users.role
CREATE OR REPLACE FUNCTION public.ensure_vendor_profile()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_shop_name text;
  v_slug text;
BEGIN
  -- Only act when the new role is VENDOR
  IF NEW.role <> 'VENDOR' THEN
    RETURN NEW;
  END IF;

  -- Skip if a vendor profile already exists for this user
  IF EXISTS (SELECT 1 FROM public.vendors v WHERE v.user_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Derive a default shop name from full_name or email
  v_shop_name := COALESCE(NULLIF(NEW.full_name, ''), NEW.email, 'Vendor') || '';

  -- Generate a slug from the shop name
  v_slug := regexp_replace(lower(COALESCE(v_shop_name, 'vendor')), '[^a-z0-9]+', '-', 'g');
  v_slug := trim(both '-' from v_slug);
  IF v_slug IS NULL OR v_slug = '' THEN
    v_slug := 'vendor';
  END IF;

  -- Ensure uniqueness by appending a short random suffix if needed
  WHILE EXISTS (SELECT 1 FROM public.vendors WHERE slug = v_slug) LOOP
    v_slug := v_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  END LOOP;

  INSERT INTO public.vendors (user_id, shop_name, slug, status)
  VALUES (NEW.id, v_shop_name, v_slug, 'PENDING');

  RETURN NEW;
END;
$$;

