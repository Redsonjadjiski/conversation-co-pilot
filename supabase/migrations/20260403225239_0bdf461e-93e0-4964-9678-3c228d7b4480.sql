CREATE POLICY "Users can delete own config"
ON public.configuracoes_ia
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);