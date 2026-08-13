import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Copy, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { BandeauEtat } from "@/components/EtatDonnee";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { genererContenuMarketing, statutIA } from "@/lib/ia.functions";
import { libellesTypeContenu, typesContenu, type TypeContenu } from "@/lib/ia-prompts";

export const Route = createFileRoute("/marketing")({
  head: () => ({
    meta: [
      { title: "Marketing IA — L'Air Bleu Intelligence" },
      {
        name: "description",
        content:
          "Générez posts Facebook/Instagram, publications Google Business, réponses aux avis, scripts Reels, SEO local et newsletters pour L'Air Bleu.",
      },
      { property: "og:title", content: "Marketing IA — L'Air Bleu Intelligence" },
      { property: "og:description", content: "Contenus marketing générés à partir du contexte réel du restaurant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketingPage,
});

const tons = ["Chaleureux", "Convivial", "Authentique", "Dynamique", "Professionnel"];

function MarketingPage() {
  const statut = useQuery({ queryKey: ["statut-ia"], queryFn: () => statutIA() });
  const generer = useServerFn(genererContenuMarketing);
  const [type, setType] = useState<TypeContenu>("post-reseaux");
  const [ton, setTon] = useState("Chaleureux");
  const [brief, setBrief] = useState("");
  const [resultat, setResultat] = useState<string | null>(null);
  const [brouillon, setBrouillon] = useState(false);
  const [chargement, setChargement] = useState(false);

  const iaDisponible = statut.data?.disponible === true;

  const lancer = async () => {
    if (brief.trim().length < 5) {
      toast.error("Brief trop court", { description: "Décrivez le menu, l'actualité ou l'avis à traiter." });
      return;
    }
    setChargement(true);
    setResultat(null);
    setBrouillon(false);
    try {
      const { texte } = await generer({ data: { type, brief, ton } });
      setResultat(texte);
      toast.success("Contenu généré", { description: "À relire et valider avant publication." });
    } catch (error) {
      toast.error("Génération impossible", { description: error instanceof Error ? error.message : "Erreur inconnue" });
    } finally {
      setChargement(false);
    }
  };

  return (
    <div>
      <PageHeader
        titre="Marketing IA"
        sousTitre="Contenus rédigés à partir du contexte réel de L'Air Bleu — validation humaine obligatoire avant publication"
      />

      {statut.isSuccess && !iaDisponible && (
        <BandeauEtat
          etat="non-connecte"
          titre="IA non connectée"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setResultat(brief.trim() || "Saisissez votre brief pour préparer un brouillon manuel.");
                setBrouillon(true);
              }}
            >
              Créer un brouillon manuel
            </Button>
          }
        >
          Aucune clé IA n'est configurée côté serveur. Aucun contenu n'est simulé : seul un brouillon clairement identifié est
          possible.
        </BandeauEtat>
      )}

      <section className="surface-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Studio de création</h2>
        <p className="text-sm text-muted-foreground">
          Le contexte du restaurant (identité, formules, service du midi, finances officielles) est injecté automatiquement.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-2">
            <Label htmlFor="brief">Brief</Label>
            <Textarea
              id="brief"
              rows={6}
              placeholder="Ex. : plat du jour de la semaine, actualité de la maison, avis client à traiter…"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Type de contenu</Label>
              <Select value={type} onValueChange={(v) => setType(v as TypeContenu)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {typesContenu.map((t) => (
                    <SelectItem key={t} value={t}>{libellesTypeContenu[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ton éditorial</Label>
              <Select value={ton} onValueChange={setTon}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tons.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={lancer} disabled={chargement || !iaDisponible} className="w-full">
              {chargement ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Générer le contenu
            </Button>
            {statut.isSuccess && !iaDisponible && (
              <p className="text-xs text-muted-foreground">Génération désactivée : IA non connectée.</p>
            )}
          </div>
        </div>

        {resultat && (
          <div className="mt-5">
            {brouillon && (
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-destructive">
                Brouillon manuel — non généré par l'IA
              </p>
            )}
            <pre className="whitespace-pre-wrap rounded-xl bg-muted p-4 text-sm leading-relaxed text-foreground">
              {resultat}
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                void navigator.clipboard.writeText(resultat);
                toast.success("Copié");
              }}
            >
              <Copy className="mr-2 h-4 w-4" /> Copier
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Aucune publication automatique : relisez, validez puis publiez manuellement sur Facebook, Instagram ou Google
              Business.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
