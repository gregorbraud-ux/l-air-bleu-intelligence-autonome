import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { calendrier } from "@/lib/data";

export const Route = createFileRoute("/calendrier")({
  head: () => ({
    meta: [
      { title: "Calendrier éditorial — AirBleu AI | L'Air Bleu" },
      {
        name: "description",
        content: "Planifiez les publications Instagram, Google, TikTok et newsletters du restaurant L'Air Bleu.",
      },
      { property: "og:title", content: "Calendrier éditorial — AirBleu AI" },
      { property: "og:description", content: "Un mois de publications planifiées et validées en un coup d'œil." },
    ],
  }),
  component: CalendrierPage,
});

const jours = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const canalStyle: Record<string, string> = {
  Instagram: "bg-chart-5/15 text-chart-5",
  Google: "bg-chart-1/15 text-chart-1",
  Newsletter: "bg-chart-4/15 text-chart-4",
  TikTok: "bg-chart-2/15 text-chart-2",
};

function CalendrierPage() {
  const cases = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div>
      <PageHeader
        titre="Calendrier éditorial"
        sousTitre="Juillet 2026 — 9 publications programmées sur 4 canaux"
        action={
          <Button className="shrink-0" onClick={() => toast.success("Nouvelle publication ajoutée au brouillon")}>
            <Plus className="mr-2 h-4 w-4" /> Publication
          </Button>
        }
      />

      <div className="surface-card overflow-hidden p-3 sm:p-5">
        <div className="grid grid-cols-7 gap-2 pb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {jours.map((j) => (
            <span key={j}>{j}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cases.map((jour) => {
            const items = calendrier.filter((p) => p.jour === jour);
            return (
              <div
                key={jour}
                className="min-h-24 rounded-xl border border-border/70 bg-secondary/40 p-1.5 sm:min-h-28 sm:p-2"
              >
                <span className="text-xs font-semibold text-muted-foreground">{jour}</span>
                <div className="mt-1 space-y-1">
                  {items.map((p) => (
                    <button
                      key={p.titre}
                      onClick={() => toast.info(p.titre, { description: `${p.canal} · ${p.heure} · ${p.statut}` })}
                      className={`block w-full truncate rounded-md px-1.5 py-1 text-left text-[11px] font-medium ${canalStyle[p.canal]}`}
                    >
                      {p.titre}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="text-lg font-semibold">Prochaines publications</h2>
          <ul className="mt-4 space-y-3">
            {calendrier.slice(2, 7).map((p) => (
              <li key={p.titre} className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.titre}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.canal} · 
                    {` ${p.jour} juillet à ${p.heure}`}
                  </p>
                </div>
                <Badge variant={p.statut === "planifié" ? "default" : "secondary"} className="shrink-0">
                  {p.statut}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
        <div className="surface-card p-5">
          <h2 className="text-lg font-semibold">Recommandations IA</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>Publier le vendredi entre 18 h et 19 h : +34 % d'engagement observé.</li>
            <li>Ajouter une story sondage par semaine pour nourrir la carte d'automne.</li>
            <li>Deux posts Google Business manquants pour maintenir la visibilité locale.</li>
            <li>Programmer une newsletter avant le 15 pour relancer les clients inactifs.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
