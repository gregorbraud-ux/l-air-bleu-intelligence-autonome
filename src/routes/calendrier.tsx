import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Copy, Loader2, Plus, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { calendrier, avis, alertesConcurrence, concurrents } from "@/lib/data";
import { genererPlanEditorial, type IdeePost, type PlanEditorial } from "@/lib/contenu.functions";

export const Route = createFileRoute("/calendrier")({
  head: () => ({
    meta: [
      { title: "Calendrier éditorial — AirBleu AI | L'Air Bleu" },
      {
        name: "description",
        content:
          "Planifiez les publications Facebook, Instagram, Google Business et newsletters du restaurant L'Air Bleu à Montoir-de-Bretagne.",
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
  Facebook: "bg-chart-2/15 text-chart-2",
};

const tons = ["Chaleureux", "Convivial", "Authentique", "Dynamique", "Gourmand"] as const;

function CalendrierPage() {
  const cases = Array.from({ length: 31 }, (_, i) => i + 1);
  const [ton, setTon] = useState<string>("Chaleureux");
  const [nombre, setNombre] = useState(8);
  const [plan, setPlan] = useState<PlanEditorial | null>(null);
  const [selection, setSelection] = useState<IdeePost | null>(null);
  const [copie, setCopie] = useState(false);
  const generer = useServerFn(genererPlanEditorial);

  const contexte = useMemo(
    () => ({
      avis: avis.map((a) => ({
        auteur: a.auteur,
        note: a.note,
        date: a.date,
        texte: a.texte,
        sentiment: a.sentiment as string,
      })),
      tendancesConcurrence: [
        ...alertesConcurrence.slice(0, 5).map((a) => `${a.concurrent} — ${a.titre} : ${a.detail}`),
        ...concurrents
          .filter((c) => c.nom !== "L'Air Bleu")
          .map((c) => `${c.nom} : note ${c.note}/5, ticket ${c.ticket} €, visibilité ${c.visibilite}/100, tendance ${c.tendance} %`),
      ],
    }),
    [],
  );

  const generation = useMutation({
    mutationFn: () =>
      generer({
        data: { mois: "Août 2026", nombre, ton, ...contexte },
      }),
    onSuccess: (resultat) => {
      setPlan(resultat);
      toast.success(`${resultat.publications.length} idées de posts générées à partir des avis et tendances.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const publications = plan
    ? plan.publications.map((p) => ({ ...p, genere: true as const }))
    : calendrier.map((p) => ({
        ...p,
        genere: false as const,
        accroche: "",
        source: "",
        angle: "",
        tonVoix: "",
        cta: "",
      }));

  const textePret = selection
    ? `${selection.legende}\n\n${selection.hashtags
        .map((h) => (h.startsWith("#") ? h : `#${h}`))
        .join(" ")}`
    : "";

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(textePret);
      setCopie(true);
      toast.success("Post copié, prêt à publier.");
      setTimeout(() => setCopie(false), 2000);
    } catch {
      toast.error("Copie impossible sur cet appareil.");
    }
  };

  return (
    <div>
      <PageHeader
        titre="Calendrier éditorial"
        sousTitre={
          plan
            ? `Août 2026 — ${plan.publications.length} publications générées par l'IA sur 4 canaux`
            : "Juillet 2026 — 9 publications programmées sur 4 canaux"
        }
        action={
          <Button className="shrink-0" onClick={() => toast.success("Nouvelle publication ajoutée au brouillon")}>
            <Plus className="mr-2 h-4 w-4" /> Publication
          </Button>
        }
      />

      <section className="surface-card mb-6 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="h-4 w-4 text-primary" /> Générateur de calendrier IA
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Un mois de publications Facebook, Instagram, Google Business et newsletter, construit à partir de vos avis
              Google récents et de la veille concurrentielle locale.
            </p>
          </div>
          <Button disabled={generation.isPending} onClick={() => generation.mutate()}>
            {generation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {generation.isPending ? "Génération…" : "Générer le mois"}
          </Button>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Ton éditorial</p>
            <Select value={ton} onValueChange={setTon}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tons.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium">Publications à générer : {nombre}</p>
            <Slider min={4} max={16} step={1} value={[nombre]} onValueChange={(v) => setNombre(v[0])} />
          </div>
        </div>

        {plan && (
          <div className="mt-5 rounded-xl border border-border/70 bg-secondary/40 p-4">
            <p className="text-sm">{plan.synthese}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {plan.tendances.map((t) => (
                <li key={t} className="flex gap-2">
                  <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="surface-card overflow-hidden p-3 sm:p-5">
        <div className="grid grid-cols-7 gap-2 pb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {jours.map((j) => (
            <span key={j}>{j}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cases.map((jour) => {
            const items = publications.filter((p) => p.jour === jour);
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
                      onClick={() => {
                        if (p.genere) {
                          setSelection(p as IdeePost);
                          setCopie(false);
                          return;
                        }
                        toast.info(p.titre, { description: `${p.canal} · ${p.heure} · ${p.statut}` });
                      }}
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

      {selection && (
        <section className="surface-card mt-6 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">{selection.titre}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {selection.canal} · jour {selection.jour} à {selection.heure} · {selection.statut}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelection(null)}>
              Fermer
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {selection.angle && <Badge variant="outline">Angle : {selection.angle}</Badge>}
            {selection.tonVoix && <Badge variant="outline">Ton : {selection.tonVoix}</Badge>}
          </div>

          <p className="mt-4 text-sm font-medium">{selection.accroche}</p>

          <div className="mt-3 rounded-xl border border-border/70 bg-secondary/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Post prêt à publier
              </p>
              <Button variant="secondary" size="sm" onClick={copier}>
                {copie ? <Check className="mr-2 h-3.5 w-3.5" /> : <Copy className="mr-2 h-3.5 w-3.5" />}
                {copie ? "Copié" : "Copier"}
              </Button>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{selection.legende}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selection.hashtags.map((h) => (
                <Badge key={h} variant="secondary">
                  {h.startsWith("#") ? h : `#${h}`}
                </Badge>
              ))}
            </div>
          </div>

          {selection.cta && (
            <p className="mt-3 text-sm">
              <span className="font-medium">Appel à l'action :</span> {selection.cta}
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Inspiré de : {selection.source}</p>
        </section>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="text-lg font-semibold">Prochaines publications</h2>
          <ul className="mt-4 space-y-3">
            {publications.slice(0, 5).map((p) => (
              <li key={p.titre} className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.titre}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.canal} · 
                    {` ${p.jour} ${plan ? "août" : "juillet"} à ${p.heure}`}
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
            {(plan?.tendances.length ? plan.tendances : [
              "Publier le menu de la semaine chaque lundi avant 9 h : capte les recherches déjeuner du secteur.",
              "Un post Google Business tous les 3 jours pour tenir la première page sur « restaurant Montoir-de-Bretagne ».",
              "Story quotidienne du plat du jour vers 11 h, juste avant la décision de déjeuner.",
              "Newsletter mensuelle aux entreprises voisines pour la clientèle professionnelle du midi.",
            ]).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
