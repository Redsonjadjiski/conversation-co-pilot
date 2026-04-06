
CREATE TABLE public.fluxos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL DEFAULT 'Novo Fluxo',
  fluxo_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  ativo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fluxos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flows" ON public.fluxos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flows" ON public.fluxos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flows" ON public.fluxos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flows" ON public.fluxos FOR DELETE USING (auth.uid() = user_id);
