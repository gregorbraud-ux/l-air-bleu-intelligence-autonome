import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calculator, Info } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { BadgeEtat, BandeauEtat } from "@/components/EtatDonnee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  caClotureProvisoire2026,
  euro,
  euroPrecis,
  exercicesOfficiels,
  dernierExerciceOfficiel,
} from "@/lib/lair-bleu";
import {
  calculerValorisation,
  ebeOfficielLePlusRecent,
  hypothesesValorisationDefaut,
  type HypothesesValorisation,
} from "@/lib/valorisation";

export const Route = createFileRoute("/valorisation")({
  head: () => ({
    meta: [
      { title: "Valorisation — L'Air Bleu Intelligence" },
      {
        name: "description",
        content:
          "Estimation transparente de la valeur du fonds de commerce de L'Air Bleu : multiple de CA, multiple d'EBE et capacité de remboursement, avec hypothèses modifiables.",
      },
      { property: "og:title", content: "Valorisation — L'Air Bleu Intelligence" },
      {
        property: "og:description",
        content: "Trois méthodes de valorisation avec hypothèses affichées et limites explicitées.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ValorisationPage,
});

function ValorisationPage() {
  const defauts = hypothesesValorisationDefaut();
  const [h, setH] = useState<HypothesesValorisation>(defauts);
  const resultat = useMemo(() => calculerValorisation(h), [h]);
  const ebeOff = ebeOfficielLePlusRecent();

  const maj = (patch: Partial<HypothesesValorisation>) => setH((prev) => ({ ...prev, ...patch }));

  return (
    <div>
      <PageHeader
        titre="Valorisation du fonds de commerce"
        sousTitre="Trois méthodes indépendantes, hypothèses modifiables et affichées — aucune valeur unique artificiellement précise"
      />

      <BandeauEtat etat="provisoire" titre="Estimation indicative, pas une évaluation d'expert">
        Les bornes de multiples sont des hypothèses de travail que vous pouvez ajuster, et non un
        barème sectoriel sourcé. Seule une évaluation par votre expert-comptable engage une valeur.
        À réactualiser dès réception du bilan 2026.
      </BandeauEtat>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* ---------- Hypothèses ---------- */}
        <section className="surface-card space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">Hypothèses</h2>
            <Button variant="outline" size="sm" onClick={() => setH(defauts)}>
              <Calculator className="mr-2 h-4 w-4" /> Réinitialiser
            </Button>
          </div>

          <Champ
            label="CA de référence (€)"
            value={h.caReference}
            step={1000}
            onChange={(v) => maj({ caReference: v })}
          />
          <div className="flex flex-wrap gap-2 text-xs">
            {exercicesOfficiels.map((ex) => (
              <Button
                key={ex.exercice}
                variant="secondary"
                size="sm"
                onClick={() => maj({ caReference: ex.chiffreAffaires })}
              >
                {ex.exercice} officiel
              </Button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => maj({ caReference: caClotureProvisoire2026 })}
            >
              2025/2026 provisoire
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-sm">Excédent brut d'exploitation retenu</Label>
              <BadgeEtat
                etat={h.sourceEbe === "officiel" ? "officiel" : "provisoire"}
                texte={h.sourceEbe === "officiel" ? "BILAN" : "RECONSTITUÉ"}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={h.sourceEbe === "officiel" ? "default" : "outline"}
                size="sm"
                disabled={!ebeOff}
                onClick={() => ebeOff && maj({ sourceEbe: "officiel", ebe: ebeOff.ebe })}
              >
                EBE du bilan {ebeOff ? ebeOff.exercice : "(non disponible)"}
              </Button>
              <Button
                variant={h.sourceEbe === "estime" ? "default" : "outline"}
                size="sm"
                onClick={() => maj({ sourceEbe: "estime" })}
              >
                Reconstituer depuis le CA
              </Button>
            </div>
            {h.sourceEbe === "officiel" ? (
              <Champ label="EBE (€)" value={h.ebe} step={500} onChange={(v) => maj({ ebe: v })} />
            ) : (
              <>
                <Champ
                  label="Taux d'EBE estimé (% du CA)"
                  value={h.tauxEbeEstime}
                  step={0.5}
                  onChange={(v) => maj({ tauxEbeEstime: v })}
                />
                <p className="rounded-xl bg-warning/15 p-3 text-xs text-accent-foreground">
                  EBE reconstitué : {euro(resultat.ebeRetenu)}. Cette valeur n'est pas comptable —
                  la méthode EBE est donc affichée à titre indicatif seulement.
                </p>
              </>
            )}
          </div>

          <Separator />

          <div className="grid gap-3 sm:grid-cols-2">
            <Champ
              label="Multiple de CA — bas"
              value={h.multipleCaBas}
              step={0.05}
              onChange={(v) => maj({ multipleCaBas: v })}
            />
            <Champ
              label="Multiple de CA — haut"
              value={h.multipleCaHaut}
              step={0.05}
              onChange={(v) => maj({ multipleCaHaut: v })}
            />
            <Champ
              label="Multiple d'EBE — bas"
              value={h.multipleEbeBas}
              step={0.1}
              onChange={(v) => maj({ multipleEbeBas: v })}
            />
            <Champ
              label="Multiple d'EBE — haut"
              value={h.multipleEbeHaut}
              step={0.1}
              onChange={(v) => maj({ multipleEbeHaut: v })}
            />
          </div>

          <Separator />

          <div className="grid gap-3 sm:grid-cols-3">
            <Champ
              label="CAF annuelle (€)"
              value={h.cafDisponible}
              step={500}
              onChange={(v) => maj({ cafDisponible: v })}
            />
            <Champ
              label="Durée (années)"
              value={h.dureeFinancementAnnees}
              step={1}
              onChange={(v) => maj({ dureeFinancementAnnees: v })}
            />
            <Champ
              label="Taux (%)"
              value={h.tauxInteret}
              step={0.25}
              onChange={(v) => maj({ tauxInteret: v })}
            />
          </div>
        </section>

        {/* ---------- Résultats ---------- */}
        <section className="space-y-4">
          <div className="surface-card gradient-hero p-6 text-primary-foreground">
            <p className="text-sm opacity-80">Fourchette de valeur issue des méthodes fiables</p>
            <p className="mt-2 font-display text-3xl sm:text-4xl">
              {euro(resultat.fourchetteBasse)} — {euro(resultat.fourchetteHaute)}
            </p>
            <p className="mt-3 text-xs opacity-85">
              Aucune valeur unique n'est affichée : une valeur précise au centime serait trompeuse à
              ce stade.
            </p>
          </div>

          {resultat.methodes.map((m) => (
            <article key={m.cle} className="surface-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">{m.titre}</h3>
                <BadgeEtat
                  etat={m.fiable ? "officiel" : "non-disponible"}
                  texte={m.fiable ? "EXPLOITABLE" : "INDICATIF"}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{m.formule}</p>
              <p className="mt-3 font-display text-2xl">
                {euro(m.bas)} — {euro(m.haut)}
              </p>
              {m.avertissement && (
                <p className="mt-3 flex gap-2 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {m.avertissement}
                </p>
              )}
            </article>
          ))}

          <div className="surface-card p-5">
            <h3 className="font-semibold">Facteurs qualitatifs à intégrer manuellement</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>
                Bail commercial, loyer et durée restante — donnée non disponible dans l'application.
              </li>
              <li>État du matériel et investissements à prévoir — donnée non disponible.</li>
              <li>
                Dépendance à la clientèle professionnelle du midi et saisonnalité (fermeture
                d'août).
              </li>
              <li>
                Résultat net {dernierExerciceOfficiel.exercice} négatif (
                {euroPrecis(dernierExerciceOfficiel.resultatNet)}) : un repreneur en tiendra compte
                à la baisse.
              </li>
              <li>
                Réputation en ligne réelle : non mesurée tant que les avis Google ne sont pas
                connectés.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function Champ({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <Input
        type="number"
        inputMode="decimal"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
}
