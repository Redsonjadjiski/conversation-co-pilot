ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS webhook_limit bigint NOT NULL DEFAULT 10000,
  ADD COLUMN IF NOT EXISTS webhook_used bigint NOT NULL DEFAULT 0;