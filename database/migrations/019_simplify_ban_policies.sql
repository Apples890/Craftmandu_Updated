-- Simplify moderation: enforce only is_banned

-- Orders insert policy: user must be not banned and insert own rows
DROP POLICY IF EXISTS customers_create_orders ON public.orders;
CREATE POLICY customers_create_orders ON public.orders
FOR INSERT
WITH CHECK (
  auth.uid() = customer_id
  AND EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_banned = false
  )
);

-- Messages insert policy: sender must participate and be not banned
DROP POLICY IF EXISTS users_send_messages ON public.messages;
CREATE POLICY users_send_messages ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_banned = false
  )
  AND (
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

-- Reviews insert policy: not banned and author is customer_id
DROP POLICY IF EXISTS users_create_reviews ON public.reviews;
CREATE POLICY users_create_reviews ON public.reviews
FOR INSERT
WITH CHECK (
  customer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_banned = false
  )
);

