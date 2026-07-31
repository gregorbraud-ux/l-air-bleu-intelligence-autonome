import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { caMensuel, canaux, kpis } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — AirBleu AI | L'Air Bleu" },
      {
        name: "description",
        content:
          "Pilotez L'Air Bleu, restaurant traditionnel à Montoir-de-Bretagne : chiffre d'affaires, fréquentation du midi, réputation et marketing IA.",
      },
      { property: "og:title", content: "Tableau de bord — AirBleu AI" },
      {
        property: "og:description",
        content: "KPI, marketing IA, avis Google et valorisation du restaurant L'Air Bleu.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div>
      <PageHeader
        titre="Tableau de bord"
        sousTitre="L'Air Bleu · Montoir-de-Bretagne — exercice clos au 31/08/2025 et pilotage courant"
        action={
          <Button className="shrink-0">
            <Sparkles className="mr-2 h-4 w-4" /> Analyse IA du mois
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => {
          const positif = kpi.variation >= 0;
          return (
            <article key={kpi.label} className="surface-card p-5">
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="font-display text-3xl">{kpi.valeur}</p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                    positif ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {positif ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(kpi.variation)} %
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{kpi.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold">Chiffre d'affaires mensuel</h2>
          <p className="text-sm text-muted-foreground">Répartition de l'exercice clos au 31/08/2025 — total 492 782 €</p>
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={caMensuel} margin={{ left: -12, right: 8 }}>
                <defs>
                  <linearGradient id="ca" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="mois" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  formatter={(v: number) => [`${v.toLocaleString("fr-FR")} €`, "CA"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }}
                />
                <Area dataKey="ca" stroke="var(--color-chart-1)" strokeWidth={2.5} fill="url(#ca)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-lg font-semibold">Origine des réservations</h2>
          <p className="text-sm text-muted-foreground">Part par canal (%)</p>
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={canaux} layout="vertical" margin={{ left: 24 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="canal" type="category" tickLine={false} axisLine={false} fontSize={12} width={110} />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }}
                />
                <Bar dataKey="part" fill="var(--color-chart-2)" radius={[0, 8, 8, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { titre: "Réputation", texte: "2 avis sans réponse : chaque réponse renforce le référencement local.", lien: "/avis", cta: "Traiter les avis" },
          { titre: "Contenu", texte: "3 publications Facebook / Instagram à valider cette semaine.", lien: "/calendrier", cta: "Ouvrir le calendrier" },
          { titre: "Rentabilité", texte: "Résultat net à -9 192 € : priorité au ticket moyen du midi.", lien: "/valorisation", cta: "Voir l'estimation" },
        ].map((c) => (
          <article key={c.titre} className="surface-card flex flex-col gap-3 p-5">
            <Badge variant="secondary" className="w-fit">{c.titre}</Badge>
            <p className="text-sm text-muted-foreground">{c.texte}</p>
            <Button asChild variant="outline" size="sm" className="mt-auto w-fit">
              <Link to={c.lien}>{c.cta}</Link>
            </Button>
          </article>
        ))}
      </section>
    </div>
  );
}
