import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { PageHeader } from "@/components/AppShell";
import { AlertesConcurrence } from "@/components/AlertesConcurrence";
import { Badge } from "@/components/ui/badge";
import { concurrents } from "@/lib/data";

export const Route = createFileRoute("/concurrence")({
  head: () => ({
    meta: [
      { title: "Concurrence — AirBleu AI | L'Air Bleu" },
      {
        name: "description",
        content:
          "Comparez L'Air Bleu aux restaurants du secteur Montoir-de-Bretagne, Trignac, Donges et Saint-Nazaire : notes, avis, ticket moyen et visibilité locale.",
      },
      { property: "og:title", content: "Concurrence — AirBleu AI" },
      { property: "og:description", content: "Veille concurrentielle locale du restaurant L'Air Bleu." },
    ],
  }),
  component: ConcurrencePage,
});

function ConcurrencePage() {
  const moi = concurrents[0];
  const radar = [
    { axe: "Note", valeur: (moi.note / 5) * 100 },
    { axe: "Volume d'avis", valeur: Math.min(100, (moi.avis / 500) * 100) },
    { axe: "Ticket moyen", valeur: Math.min(100, (moi.ticket / 22) * 100) },
    { axe: "Visibilité", valeur: moi.visibilite },
    { axe: "Croissance", valeur: Math.min(100, moi.tendance * 12) },
  ];

  return (
    <div>
      <PageHeader
        titre="Suivi de la concurrence"
        sousTitre="Restaurants de déjeuner comparables : Montoir-de-Bretagne, Trignac, Donges, Saint-Nazaire"
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="surface-card overflow-x-auto p-5">
          <h2 className="text-lg font-semibold">Comparatif du marché</h2>
          <table className="mt-4 w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3">Établissement</th>
                <th className="pb-3">Note</th>
                <th className="pb-3">Avis</th>
                <th className="pb-3">Ticket</th>
                <th className="pb-3">Visibilité</th>
                <th className="pb-3">Tendance</th>
              </tr>
            </thead>
            <tbody>
              {concurrents.map((c) => {
                const moiMeme = c.nom === moi.nom;
                return (
                  <tr key={c.nom} className={`border-t border-border/60 ${moiMeme ? "bg-secondary/50" : ""}`}>
                    <td className="py-3 font-medium">
                      <span className="flex items-center gap-2">
                        {c.nom}
                        {moiMeme && <Badge variant="secondary">Vous</Badge>}
                      </span>
                    </td>
                    <td className="py-3">{c.note.toFixed(1)}</td>
                    <td className="py-3">{c.avis.toLocaleString("fr-FR")}</td>
                    <td className="py-3">{c.ticket} €</td>
                    <td className="py-3">{c.visibilite} / 100</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          c.tendance >= 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {c.tendance >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {Math.abs(c.tendance)} %
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="surface-card p-5">
          <h2 className="text-lg font-semibold">Positionnement de L'Air Bleu</h2>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} outerRadius="72%">
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="axe" fontSize={11} />
                <Radar dataKey="valeur" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          "La Brasserie du Brivet publie 3× plus souvent sur Google Business : rattrapage possible sans budget.",
          "Votre ticket moyen déjeuner (17,50 €) reste 9 % sous la moyenne du secteur : marge de progression sur desserts et boissons.",
          "Volume d'avis Google le plus faible du panel : la sollicitation en fin de repas est le levier n° 1, gratuit et mesurable.",
        ].map((texte) => (
          <article key={texte} className="surface-card p-5 text-sm text-muted-foreground">
            {texte}
          </article>
        ))}
      </section>

      <AlertesConcurrence />
    </div>
  );
}
