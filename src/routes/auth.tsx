import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion sécurisée — AirBleu AI" },
      {
        name: "description",
        content:
          "Accédez à l'espace administrateur d'AirBleu AI pour gérer les données du restaurant L'Air Bleu.",
      },
      { property: "og:title", content: "Connexion sécurisée — AirBleu AI" },
      {
        property: "og:description",
        content: "Espace administrateur protégé du restaurant L'Air Bleu.",
      },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide").max(255),
  motDePasse: z.string().min(8, "8 caractères minimum").max(72),
  nom: z.string().trim().max(80).optional(),
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuthSession();
  const [enCours, setEnCours] = useState(false);
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [nom, setNom] = useState("");
  const [confirmation, setConfirmation] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/admin", replace: true });
  }, [loading, session, navigate]);

  const valider = () => {
    const res = schema.safeParse({ email, motDePasse, nom });
    if (!res.success) {
      toast.error(res.error.issues[0].message);
      return null;
    }
    return res.data;
  };

  async function connexion() {
    const data = valider();
    if (!data) return;
    setEnCours(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.motDePasse,
    });
    setEnCours(false);
    if (error) {
      toast.error("Connexion impossible : identifiants incorrects.");
      return;
    }
    toast.success("Bienvenue dans l'espace administrateur.");
    navigate({ to: "/admin", replace: true });
  }

  async function inscription() {
    const data = valider();
    if (!data) return;
    setEnCours(true);
    const { data: res, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.motDePasse,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: { display_name: data.nom || data.email.split("@")[0] },
      },
    });
    setEnCours(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!res.session) {
      setConfirmation(true);
      toast.success("Vérifiez votre boîte e-mail pour confirmer votre compte.");
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  async function google() {
    setEnCours(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setEnCours(false);
      toast.error("Connexion Google impossible.");
      return;
    }
    if (result.redirected) return;
    setEnCours(false);
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 py-6">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl gradient-hero">
          <ShieldCheck className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-2xl">Espace administrateur</h1>
          <p className="text-sm text-muted-foreground">Connexion sécurisée à AirBleu AI</p>
        </div>
      </div>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Accès réservé</CardTitle>
          <CardDescription>
            Gérez les données du tableau de bord, les avis et la veille concurrentielle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {confirmation ? (
            <p className="text-sm text-muted-foreground">
              Un e-mail de confirmation vous a été envoyé. Cliquez sur le lien reçu, puis revenez
              vous connecter ici.
            </p>
          ) : (
            <Tabs defaultValue="connexion">
              <TabsList className="w-full">
                <TabsTrigger className="flex-1" value="connexion">
                  Connexion
                </TabsTrigger>
                <TabsTrigger className="flex-1" value="inscription">
                  Créer un compte
                </TabsTrigger>
              </TabsList>

              <TabsContent value="connexion" className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mdp">Mot de passe</Label>
                  <Input
                    id="mdp"
                    type="password"
                    autoComplete="current-password"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                  />
                </div>
                <Button className="w-full" disabled={enCours} onClick={connexion}>
                  {enCours && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Se connecter
                </Button>
              </TabsContent>

              <TabsContent value="inscription" className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom affiché</Label>
                  <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email2">E-mail</Label>
                  <Input
                    id="email2"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mdp2">Mot de passe</Label>
                  <Input
                    id="mdp2"
                    type="password"
                    autoComplete="new-password"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                  />
                </div>
                <Button className="w-full" disabled={enCours} onClick={inscription}>
                  {enCours && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer mon compte
                </Button>
              </TabsContent>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
                  <span className="h-px flex-1 bg-border" /> ou{" "}
                  <span className="h-px flex-1 bg-border" />
                </div>
                <Button variant="outline" className="w-full" disabled={enCours} onClick={google}>
                  Continuer avec Google
                </Button>
              </div>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
