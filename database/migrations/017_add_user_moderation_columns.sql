-- User moderation fields: bans and per-action restrictions
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS banned_until timestamptz,
  ADD COLUMN IF NOT EXISTS ban_reason text,
  ADD COLUMN IF NOT EXISTS can_chat boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS can_order boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS can_review boolean NOT NULL DEFAULT true;

-- Helpful index to quickly evaluate active bans
CREATE INDEX IF NOT EXISTS users_ban_status_idx ON public.users (is_banned, banned_until);

