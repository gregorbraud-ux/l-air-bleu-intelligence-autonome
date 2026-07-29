import { createFileRoute } from "@tanstack/react-router";
import { Star, MessageSquareReply } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { avis, repartitionNotes } from "@/lib/data";

export const Route = createFileRoute("/avis")({
  head: () => ({
    meta: [
      { title: "Avis Google — AirBleu AI | L'Air Bleu" },
      {
        name: "description",
        content: "Suivez la note Google de L'Air Bleu, analysez le sentiment des avis et répondez grâce à l'IA.",
      },
      { property: "og:title", content: "Avis Google — AirBleu AI" },
      { property: "og:description", content: "Réputation en ligne du restaurant L'Air Bleu, pilotée par l'IA." },
    ],
  }),
  component: AvisPage,
});

const sentimentStyle: Record<string, string> = {
  positif: "bg-success/10 text-success",
  neutre: "bg-warning/15 text-accent-foreground",
  "négatif": "bg-destructive/10 text-destructive",
};

function AvisPage() {
  return (
    <div>
      <PageHeader titre="Avis Google" sousTitre="1 284 avis cumulés · note moyenne 4,6 / 5" />

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5">
          <p className="text-sm text-muted-foreground">Note moyenne</p>
          <p className="mt-2 font-display text-5xl">4,6</p>
          <div className="mt-2 flex gap-1 text-accent">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">+0,1 point sur 90 jours · 62 nouveaux avis</p>
        </div>
        <div className="surface-card p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold">Répartition des notes</h2>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repartitionNotes} margin={{ left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="note" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                <Bar dataKey="nombre" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} barSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {avis.map((a) => (
          <article key={a.auteur} className="surface-card p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-semibold">{a.auteur}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="flex text-accent">
                    {Array.from({ length: a.note }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </span>
                  <span className="text-xs text-muted-foreground">{a.date}</span>
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${sentimentStyle[a.sentiment]}`}>
                {a.sentiment}
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{a.texte}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {a.repondu ? (
                <Badge variant="secondary">Réponse publiée</Badge>
              ) : (
                <Button
                  size="sm"
                  onClick={() => toast.success("Réponse générée par l'IA", { description: `Brouillon prêt pour ${a.auteur}.` })}
                >
                  <MessageSquareReply className="mr-2 h-4 w-4" /> Répondre avec l'IA
                </Button>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
