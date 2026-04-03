
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS token_limit bigint NOT NULL DEFAULT 5000000,
  ADD COLUMN IF NOT EXISTS token_used bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS token_extras bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cycle_reset_at timestamp with time zone;
