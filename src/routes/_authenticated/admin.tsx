import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getMonEspace, listerMembres, modifierRole } from "@/lib/admin.functions";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogOut, ShieldCheck, UserCog } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administration — AirBleu AI" },
      {
        name: "description",
        content: "Espace administrateur d'AirBleu AI : comptes, rôles et gestion des données.",
      },
      { property: "og:title", content: "Administration — AirBleu AI" },
      { property: "og:description", content: "Gestion des comptes et rôles du restaurant L'Air Bleu." },
    ],
  }),
  component: AdminPage,
});

const roles = ["admin", "manager", "viewer"] as const;

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const espaceFn = useServerFn(getMonEspace);
  const membresFn = useServerFn(listerMembres);
  const roleFn = useServerFn(modifierRole);

  const espace = useQuery({ queryKey: ["mon-espace"], queryFn: () => espaceFn() });
  const estAdmin = espace.data?.estAdmin === true;

  const membres = useQuery({
    queryKey: ["membres"],
    queryFn: () => membresFn(),
    enabled: estAdmin,
  });

  const majRole = useMutation({
    mutationFn: (input: { userId: string; role: (typeof roles)[number]; action: "ajouter" | "retirer" }) =>
      roleFn({ data: input }),
    onSuccess: () => {
      toast.success("Rôle mis à jour.");
      queryClient.invalidateQueries({ queryKey: ["membres"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function deconnexion() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div>
      <PageHeader
        titre="Administration"
        sousTitre="Comptes, rôles et gestion sécurisée des données du tableau de bord"
        action={
          <Button variant="outline" onClick={deconnexion}>
            <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="surface-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Mon compte
            </CardTitle>
            <CardDescription>Session sécurisée en cours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {espace.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : espace.isError ? (
              <p className="text-destructive">Impossible de charger votre profil.</p>
            ) : (
              <>
                <p className="font-medium">{espace.data?.profil?.display_name ?? "Compte"}</p>
                <p className="text-muted-foreground">{espace.data?.email}</p>
                <div className="flex flex-wrap gap-2">
                  {(espace.data?.roles ?? []).map((r) => (
                    <Badge key={r} variant="secondary">
                      {r}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="surface-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-4 w-4 text-primary" /> Membres de l'équipe
            </CardTitle>
            <CardDescription>
              {estAdmin
                ? "Attribuez les rôles administrateur, manager ou lecteur."
                : "Seuls les administrateurs peuvent gérer les rôles."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!estAdmin ? (
              <p className="text-sm text-muted-foreground">
                Votre compte n'a pas les droits d'administration. Demandez à un administrateur de vous
                attribuer un rôle.
              </p>
            ) : membres.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ul className="divide-y divide-border/70">
                {(membres.data ?? []).map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{m.display_name ?? "Sans nom"}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {m.roles.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Aucun rôle</span>
                        ) : (
                          m.roles.map((r) => (
                            <Badge key={r} variant="secondary">
                              {r}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {roles.map((r) => {
                        const possede = m.roles.includes(r);
                        return (
                          <Button
                            key={r}
                            size="sm"
                            variant={possede ? "default" : "outline"}
                            disabled={majRole.isPending}
                            onClick={() =>
                              majRole.mutate({
                                userId: m.id,
                                role: r,
                                action: possede ? "retirer" : "ajouter",
                              })
                            }
                          >
                            {r}
                          </Button>
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}