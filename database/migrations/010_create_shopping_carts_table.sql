CREATE TABLE IF NOT EXISTS shopping_carts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  updated_at   timestamptz NOT NULL DEFAULT now()
);
