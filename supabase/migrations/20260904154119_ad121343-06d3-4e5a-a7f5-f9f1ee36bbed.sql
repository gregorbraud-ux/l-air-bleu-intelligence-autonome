CREATE TABLE public.app_reglages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cle text NOT NULL,
  valeur jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, cle)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_reglages TO authenticated;
GRANT ALL ON public.app_reglages TO service_role;

ALTER TABLE public.app_reglages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own settings"
ON public.app_reglages FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER app_reglages_updated_at
BEFORE UPDATE ON public.app_reglages
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();