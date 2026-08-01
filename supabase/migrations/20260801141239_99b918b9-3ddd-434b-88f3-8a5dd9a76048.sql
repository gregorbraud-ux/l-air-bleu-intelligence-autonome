CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  libelle text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own push subscriptions"
ON public.push_subscriptions FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER push_subscriptions_set_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.alertes_envois (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alerte_id text NOT NULL,
  canal text NOT NULL CHECK (canal IN ('email', 'push')),
  destinataire text,
  statut text NOT NULL,
  erreur text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.alertes_envois TO authenticated;
GRANT ALL ON public.alertes_envois TO service_role;
ALTER TABLE public.alertes_envois ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own alert deliveries"
ON public.alertes_envois FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX alertes_envois_user_created_idx ON public.alertes_envois (user_id, created_at DESC);