-- RPC: promote_to_vendor(p_user_id uuid, p_shop_name text default null, p_status vendor_status default 'PENDING')
-- Atomically sets users.role = 'VENDOR' and ensures a vendors row exists.
CREATE OR REPLACE FUNCTION public.promote_to_vendor(
  p_user_id uuid,
  p_shop_name text DEFAULT NULL,
  p_status vendor_status DEFAULT 'PENDING'
) RETURNS public.vendors
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vendor public.vendors;
  v_user   public.users;
  v_name   text;
  v_slug   text;
BEGIN
  -- Lock the user row to avoid race conditions
  SELECT * INTO v_user FROM public.users WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found', p_user_id USING ERRCODE = 'P0002';
  END IF;

  -- Update role if needed
  IF v_user.role <> 'VENDOR' THEN
    UPDATE public.users SET role = 'VENDOR', updated_at = now() WHERE id = p_user_id;
  END IF;

  -- If vendor exists, optionally update status/shop_name and return
  SELECT * INTO v_vendor FROM public.vendors WHERE user_id = p_user_id FOR UPDATE;
  IF FOUND THEN
    UPDATE public.vendors
      SET shop_name = COALESCE(NULLIF(p_shop_name, ''), shop_name),
          status = COALESCE(p_status, status),
          updated_at = now()
      WHERE id = v_vendor.id
      RETURNING * INTO v_vendor;
    RETURN v_vendor;
  END IF;

  -- Build default shop name and unique slug
  v_name := COALESCE(NULLIF(p_shop_name, ''), NULLIF(v_user.full_name, ''), v_user.email, 'Vendor');
  v_slug := regexp_replace(lower(COALESCE(v_name, 'vendor')), '[^a-z0-9]+', '-', 'g');
  v_slug := trim(both '-' from v_slug);
  IF v_slug IS NULL OR v_slug = '' THEN v_slug := 'vendor'; END IF;
  WHILE EXISTS (SELECT 1 FROM public.vendors WHERE slug = v_slug) LOOP
    v_slug := v_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  END LOOP;

  INSERT INTO public.vendors (user_id, shop_name, slug, status)
  VALUES (p_user_id, v_name, v_slug, COALESCE(p_status, 'PENDING'))
  RETURNING * INTO v_vendor;

  RETURN v_vendor;
END;
$$;

-- Optional: restrict execution to authenticated server role via a dedicated role policy if desired.

