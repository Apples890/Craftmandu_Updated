-- RLS additions to respect user moderation flags for insert actions

-- Helper condition: active ban = is_banned OR (banned_until IS NOT NULL AND banned_until > now())
-- We inline checks in policies to avoid extra function dependency.

-- Orders: allow insert only for non-banned users who can order and are inserting their own rows
DROP POLICY IF EXISTS customers_create_orders ON public.orders;
CREATE POLICY customers_create_orders ON public.orders
FOR INSERT
WITH CHECK (
  auth.uid() = customer_id
  AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.can_order = true
      AND (u.is_banned = false AND (u.banned_until IS NULL OR u.banned_until <= now()))
  )
);

-- Messages: allow insert only if user participates in conversation, not banned, and can_chat
DROP POLICY IF EXISTS users_send_messages ON public.messages;
CREATE POLICY users_send_messages ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.can_chat = true
      AND (u.is_banned = false AND (u.banned_until IS NULL OR u.banned_until <= now()))
  )
  AND (
    -- participant check via conversation
    auth.uid() IN (
      SELECT c.customer_id FROM public.conversations c WHERE c.id = messages.conversation_id
    )
    OR auth.uid() IN (
      SELECT v.user_id FROM public.conversations c
      JOIN public.vendors v ON v.id = c.vendor_id
      WHERE c.id = messages.conversation_id
    )
  )
);

-- Reviews: allow insert only for non-banned users who can review and are the review customer
DROP POLICY IF EXISTS users_create_reviews ON public.reviews;
CREATE POLICY users_create_reviews ON public.reviews
FOR INSERT
WITH CHECK (
  customer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.can_review = true
      AND (u.is_banned = false AND (u.banned_until IS NULL OR u.banned_until <= now()))
  )
);

