-- Create updated_at function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create ai_configs table
CREATE TABLE IF NOT EXISTS public.ai_configs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    instructions TEXT,
    company_name TEXT,
    tone TEXT,
    provider TEXT DEFAULT 'claude',
    api_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own ai_configs') THEN
        CREATE POLICY "Users can view their own ai_configs" ON public.ai_configs FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own ai_configs') THEN
        CREATE POLICY "Users can insert their own ai_configs" ON public.ai_configs FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own ai_configs') THEN
        CREATE POLICY "Users can update their own ai_configs" ON public.ai_configs FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own ai_configs') THEN
        CREATE POLICY "Users can delete their own ai_configs" ON public.ai_configs FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_ai_configs_updated_at ON public.ai_configs;
CREATE TRIGGER update_ai_configs_updated_at
BEFORE UPDATE ON public.ai_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
