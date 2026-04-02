
-- Add user_id to leads table
ALTER TABLE public.leads ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive public policies
DROP POLICY IF EXISTS "Allow public insert leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public read leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public update leads" ON public.leads;

-- Create user-scoped RLS policies
CREATE POLICY "Users can view own leads"
ON public.leads FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads"
ON public.leads FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
ON public.leads FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
ON public.leads FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Allow anon/service insert for webhook ingestion
CREATE POLICY "Anon can insert leads"
ON public.leads FOR INSERT
TO anon
WITH CHECK (true);
