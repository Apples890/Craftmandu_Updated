-- Triggers to auto-create vendor profile when a user becomes a VENDOR

-- AFTER INSERT: if a new user is created with role = VENDOR
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_vendor_autocreate_ins'
  ) THEN
    CREATE TRIGGER trg_vendor_autocreate_ins
    AFTER INSERT ON public.users
    FOR EACH ROW
    WHEN (NEW.role = 'VENDOR')
    EXECUTE FUNCTION public.ensure_vendor_profile();
  END IF;
END $$;

-- AFTER UPDATE OF role: when role changes to VENDOR
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_vendor_autocreate_upd_role'
  ) THEN
    CREATE TRIGGER trg_vendor_autocreate_upd_role
    AFTER UPDATE OF role ON public.users
    FOR EACH ROW
    WHEN (NEW.role = 'VENDOR' AND (OLD.role IS DISTINCT FROM NEW.role))
    EXECUTE FUNCTION public.ensure_vendor_profile();
  END IF;
END $$;

