
-- Allow public access to configuracoes_ia (no auth yet)
CREATE POLICY "Allow public read configuracoes_ia"
  ON public.configuracoes_ia FOR SELECT
  USING (true);

CREATE POLICY "Allow public update configuracoes_ia"
  ON public.configuracoes_ia FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public insert configuracoes_ia"
  ON public.configuracoes_ia FOR INSERT
  WITH CHECK (true);

-- Allow public access to leads (no auth yet)
CREATE POLICY "Allow public read leads"
  ON public.leads FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update leads"
  ON public.leads FOR UPDATE
  USING (true)
  WITH CHECK (true);
