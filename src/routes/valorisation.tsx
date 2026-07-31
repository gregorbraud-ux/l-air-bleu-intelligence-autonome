import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/valorisation")({
  head: () => ({
    meta: [
      { title: "Valorisation — AirBleu AI | L'Air Bleu" },
      {
        name: "description",
        content:
          "Estimez la valeur du restaurant L'Air Bleu à partir du chiffre d'affaires, de la rentabilité et des indicateurs marketing.",
      },
      { property: "og:title", content: "Valorisation — AirBleu AI" },
      { property: "og:description", content: "Estimation de la valeur du fonds de commerce, indicateurs financiers et marketing." },
    ],
  }),
  component: ValorisationPage,
});

const euro = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;

function ValorisationPage() {
  const [ca, setCa] = useState(492_782);
  const [marge, setMarge] = useState(4);
  const [note, setNote] = useState(4.5);
  const [visibilite, setVisibilite] = useState(68);
  const [fidelite, setFidelite] = useState(38);

  const calcul = useMemo(() => {
    const ebe = (ca * marge) / 100;
    const multipleBase = 3.2;
    const bonusNote = (note - 4) * 0.6;
    const bonusVisibilite = (visibilite - 60) / 100;
    const bonusFidelite = (fidelite - 30) / 120;
    const multiple = Math.max(1.8, multipleBase + bonusNote + bonusVisibilite + bonusFidelite);
    const valeur = ebe * multiple;
    const scoreMarketing = Math.round(((note / 5) * 40 + (visibilite / 100) * 35 + (fidelite / 100) * 25));
    return {
      ebe,
      multiple,
      valeur,
      basse: valeur * 0.88,
      haute: valeur * 1.14,
      scoreMarketing,
    };
  }, [ca, marge, note, visibilite, fidelite]);

  return (
    <div>
      <PageHeader
        titre="Valorisation du restaurant"
        sousTitre="L'Air Bleu (SARL LG AIR) — base : CA 492 782 € et résultat net -9 192 € (exercice clos au 31/08/2025)"
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="surface-card space-y-6 p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Vos indicateurs</h2>

          <Champ label="Chiffre d'affaires annuel" valeur={euro(ca)}>
            <Slider value={[ca]} min={300_000} max={1_200_000} step={5_000} onValueChange={([v]) => setCa(v)} />
          </Champ>
          <Champ label="Marge d'exploitation (EBE)" valeur={`${marge} %`}>
            <Slider value={[marge]} min={2} max={30} step={1} onValueChange={([v]) => setMarge(v)} />
          </Champ>
          <Separator />
          <Champ label="Note Google" valeur={`${note.toFixed(1)} / 5`}>
            <Slider value={[note]} min={2} max={5} step={0.1} onValueChange={([v]) => setNote(v)} />
          </Champ>
          <Champ label="Visibilité locale" valeur={`${visibilite} / 100`}>
            <Slider value={[visibilite]} min={0} max={100} step={1} onValueChange={([v]) => setVisibilite(v)} />
          </Champ>
          <Champ label="Taux de clients fidèles" valeur={`${fidelite} %`}>
            <Slider value={[fidelite]} min={0} max={90} step={1} onValueChange={([v]) => setFidelite(v)} />
          </Champ>
        </section>

        <section className="space-y-4">
          <div className="surface-card gradient-hero p-6 text-primary-foreground">
            <p className="text-sm opacity-80">Valeur estimée du fonds de commerce</p>
            <p className="mt-2 font-display text-4xl sm:text-5xl">{euro(calcul.valeur)}</p>
            <p className="mt-3 text-sm opacity-85">
              Fourchette : {euro(calcul.basse)} — {euro(calcul.haute)}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <TrendingUp className="h-3.5 w-3.5" /> Multiple appliqué : {calcul.multiple.toFixed(2)} × EBE
            </div>
          </div>

          <div className="surface-card p-5">
            <h2 className="text-lg font-semibold">Décomposition</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <Ligne libelle="Excédent brut d'exploitation" valeur={euro(calcul.ebe)} />
              <Ligne libelle="Multiple sectoriel de base" valeur="3,20 ×" />
              <Ligne libelle="Prime réputation & visibilité" valeur={`${(calcul.multiple - 3.2).toFixed(2)} ×`} />
              <Ligne libelle="Score marketing global" valeur={`${calcul.scoreMarketing} / 100`} />
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Estimation indicative fondée sur les multiples usuels de la restauration indépendante. Elle ne remplace pas
              l'évaluation d'un expert-comptable.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function Champ({ label, valeur, children }: { label: string; valeur: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-sm">{label}</Label>
        <span className="text-sm font-semibold">{valeur}</span>
      </div>
      {children}
    </div>
  );
}

function Ligne({ libelle, valeur }: { libelle: string; valeur: string }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-0">
      <span className="text-muted-foreground">{libelle}</span>
      <span className="font-semibold">{valeur}</span>
    </li>
  );
}
