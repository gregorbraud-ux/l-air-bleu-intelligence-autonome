import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Database, ExternalLink, KeyRound, PlugZap, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/AppShell";
import { BadgeCout, BadgeEtat, BandeauEtat } from "@/components/EtatDonnee";
import { Button } from "@/components/ui/button";
import { statutIA } from "@/lib/ia.functions";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Intégrations — AirBleu AI | L'Air Bleu" },
      {
        name: "description",
        content: "État des sources de données, du fournisseur IA et des services connectés pour L'Air Bleu.",
      },
      { property: "og:title", content: "Intégrations — AirBleu AI" },
      { property: "og:description", content: "Sources et connexions de l'espace L'Air Bleu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IntegrationsPage,
});

type IntegrationCardProps = {
  icon: typeof Database;
  title: string;
  description: string;
  etat: "officiel" | "non-connecte" | "demo";
  label: string;
  cout: "gratuit" | "gratuit-limite" | "payant" | "non-connecte";
  details: string;
  action?: string;
};

function IntegrationCard({ icon: Icon, title, description, etat, label, cout, details, action }: IntegrationCardProps) {
  return (
    <article className="surface-card flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <BadgeEtat etat={etat} texte={label} />
          <BadgeCout niveau={cout} />
        </div>
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <p className="mt-4 flex-1 border-t border-border/60 pt-4 text-sm leading-6 text-muted-foreground">{details}</p>
      {action && (
        <Button variant="outline" size="sm" className="mt-4 w-fit" disabled>
          {action} <ExternalLink className="ml-2 h-3.5 w-3.5" />
        </Button>
      )}
    </article>
  );
}

function IntegrationsPage() {
  const ia = useQuery({ queryKey: ["statut-ia"], queryFn: () => statutIA() });
  const iaDisponible = ia.data?.disponible === true;
  const iaCout = ia.data?.cout ?? "non-connecte";

  return (
    <div>
      <PageHeader
        titre="Intégrations"
        sousTitre="Un état lisible des sources réelles, des démonstrations et des coûts associés."
      />

      <BandeauEtat
        etat="officiel"
        titre="Aucune donnée externe n'est présentée comme réelle sans source"
      >
        Les données comptables de référence viennent du contexte officiel de L'Air Bleu. Les sources externes affichent
        leur état de connexion et leur date de collecte lorsqu'elles seront disponibles.
      </BandeauEtat>

      <section className="grid gap-4 md:grid-cols-2">
        <IntegrationCard
          icon={Sparkles}
          title="Fournisseur IA"
          description={ia.isLoading ? "Vérification côté serveur…" : ia.data?.remarque ?? "Statut indisponible."}
          etat={iaDisponible ? "officiel" : "non-connecte"}
          label={iaDisponible ? "CONNECTÉ" : "NON CONNECTÉ"}
          cout={iaCout}
          details={
            iaDisponible
              ? `${ia.data?.fournisseur ?? "Fournisseur non identifié"} · modèle ${ia.data?.modele ?? "non disponible"}. Le fournisseur est isolé derrière une interface remplaçable.`
              : "Mode sans IA actif : aucune génération de texte de remplacement n'est utilisée. Configurez un fournisseur côté serveur pour activer les modules IA."
          }
        />
        <IntegrationCard
          icon={StarIcon}
          title="Avis Google / Places"
          description="Aucune collecte d'avis réelle n'est active dans l'application."
          etat="non-connecte"
          label="NON CONNECTÉ"
          cout="gratuit-limite"
          details="Places API peut retourner un nombre limité d'avis et nécessite une configuration valide. Aucun avis, note ou volume fictif ne doit être interprété comme une mesure du restaurant."
          action="Configuration à venir"
        />
        <IntegrationCard
          icon={SwordsIcon}
          title="Veille concurrentielle"
          description="Aucune source concurrentielle horodatée n'est branchée."
          etat="demo"
          label="DÉMO"
          cout="non-connecte"
          details="Les exemples visibles dans le module Concurrence restent explicitement des données de démonstration. Une donnée réelle devra conserver son URL source et son horodatage."
          action="Source à connecter"
        />
        <IntegrationCard
          icon={Database}
          title="Données métier"
          description="Le contexte officiel reste disponible sans connexion externe."
          etat="officiel"
          label="RÉFÉRENCE"
          cout="gratuit"
          details="Identité, finances officielles et cumul de gestion provisoire sont verrouillés dans la source de vérité de l'application. Les réglages d'interface sont encore locaux tant que la persistance sécurisée n'est pas disponible."
        />
      </section>

      <section className="mt-6 surface-card p-5">
        <div className="flex items-start gap-3">
          <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h2 className="font-semibold">Clés et données sensibles</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Les clés privées restent côté serveur. L'interface ne les affiche pas et les appels IA passent par des
              fonctions serveur. En cas de clé absente ou de quota épuisé, l'application affiche un état explicite au lieu
              de simuler une réponse.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StarIcon(props: React.ComponentProps<typeof Database>) {
  return <PlugZap {...props} />;
}

function SwordsIcon(props: React.ComponentProps<typeof Database>) {
  return <CheckCircle2 {...props} />;
}
