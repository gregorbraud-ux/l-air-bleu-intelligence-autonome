import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { modulesIA } from "@/lib/data";

export const Route = createFileRoute("/marketing")({
  head: () => ({
    meta: [
      { title: "Marketing IA — AirBleu AI | L'Air Bleu" },
      {
        name: "description",
        content: "Modules d'intelligence artificielle pour générer contenus, campagnes et réponses clients de L'Air Bleu.",
      },
      { property: "og:title", content: "Marketing IA — AirBleu AI" },
      { property: "og:description", content: "Générez posts, campagnes et réponses en quelques secondes." },
    ],
  }),
  component: MarketingPage,
});

const tons = ["Chaleureux", "Convivial", "Authentique", "Dynamique"];

function MarketingPage() {
  const [brief, setBrief] = useState(
    "Menu du midi de la semaine : blanquette de veau maison, dessert du jour, formule à 15,90 € servie en 45 minutes.",
  );
  const [ton, setTon] = useState("Chaleureux");
  const [resultat, setResultat] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  const generer = () => {
    setChargement(true);
    setResultat(null);
    setTimeout(() => {
      setResultat(
        `Ton ${ton.toLowerCase()} — Proposition Facebook / Instagram\n\n« Cette semaine à L'Air Bleu, la blanquette de veau mijote depuis ce matin dans nos cuisines. Produits frais, cuisine 100 % maison, dessert du jour compris : la formule déjeuner à 15,90 €, servie en 45 minutes.\n\nUne pause midi généreuse à deux pas des entreprises de Montoir-de-Bretagne, dans une salle où l'on prend le temps de vous accueillir comme il faut. »\n\n#LAirBleu #MontoirDeBretagne #MenuDuMidi #CuisineMaison #LoireAtlantique\n\nAppel à l'action suggéré : « Réservez votre table du midi au 02 40 90 01 17. »`,
      );
      setChargement(false);
      toast.success("Contenu généré", { description: "Brouillon ajouté au calendrier éditorial." });
    }, 1100);
  };

  return (
    <div>
      <PageHeader
        titre="Marketing IA"
        sousTitre="Six modules gratuits pour développer le déjeuner et la notoriété locale de L'Air Bleu"
      />

      <section className="surface-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Studio de création</h2>
        <p className="text-sm text-muted-foreground">Décrivez l'actualité de la maison, l'IA rédige le contenu.</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-2">
            <Label htmlFor="brief">Brief</Label>
            <Textarea id="brief" rows={5} value={brief} onChange={(e) => setBrief(e.target.value)} />
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
            <Button onClick={generer} disabled={chargement} className="mt-2 w-full">
              {chargement ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Générer le contenu
            </Button>
          </div>
        </div>
        {resultat && (
          <pre className="mt-5 whitespace-pre-wrap rounded-xl bg-muted p-4 text-sm leading-relaxed text-foreground">
            {resultat}
          </pre>
        )}
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modulesIA.map((m) => (
          <article key={m.titre} className="surface-card flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary">{m.categorie}</Badge>
              <span className="text-xs text-muted-foreground">{m.duree}</span>
            </div>
            <h3 className="text-base font-semibold">{m.titre}</h3>
            <p className="text-sm text-muted-foreground">{m.description}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-auto w-fit"
              onClick={() => toast.info(`Module « ${m.titre} » lancé`, { description: "Résultat disponible dans quelques instants." })}
            >
              Lancer le module
            </Button>
          </article>
        ))}
      </section>
    </div>
  );
}
