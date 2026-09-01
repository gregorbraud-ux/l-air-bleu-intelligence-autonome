import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Calculator, MessageCircleQuestion } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { BadgeEtat, BandeauEtat } from "@/components/EtatDonnee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculerClotureProvisoire,
  dernierExerciceOfficiel,
  euro,
  euroPrecis,
  exerciceEnCoursProvisoire,
  exercicePrecedentOfficiel,
  exercicesOfficiels,
  formules,
  hypothesesClotureDefaut,
  projectionsObsoletes,
  caMoyenParServiceAout,
  restaurantAirBleu,
} from "@/lib/lair-bleu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — L'Air Bleu Intelligence" },
      {
        name: "description",
        content:
          "Pilotage de L'Air Bleu (SARL LG AIR), restaurant traditionnel du midi à Montoir-de-Bretagne : exercices officiels et cumul provisoire de gestion 2025/2026.",
      },
      { property: "og:title", content: "Tableau de bord — L'Air Bleu Intelligence" },
      {
        property: "og:description",
        content: "Chiffre d'affaires officiel et cumul provisoire de clôture 2025/2026 au 31/08/2026.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const defauts = hypothesesClotureDefaut();
  const [caCumuleJuillet, setCaCumuleJuillet] = useState(defauts.caCumuleJuillet);
  const [caAout, setCaAout] = useState(defauts.caAout);

  const cloture = useMemo(
    () => calculerClotureProvisoire({ caCumuleJuillet, caAout }),
    [caCumuleJuillet, caAout],
  );

  const evolutionOfficielle =
    ((dernierExerciceOfficiel.chiffreAffaires - exercicePrecedentOfficiel.chiffreAffaires) /
      exercicePrecedentOfficiel.chiffreAffaires) *
    100;

  return (
    <div>
      <PageHeader
        titre="Tableau de bord"
        sousTitre={`${restaurantAirBleu.nom} · ${restaurantAirBleu.ville} — ${restaurantAirBleu.service}, ${restaurantAirBleu.couverts} couverts`}
        action={
          <Button asChild className="shrink-0">
            <Link to="/assistant">
              <MessageCircleQuestion className="mr-2 h-4 w-4" /> Assistant stratégique
            </Link>
          </Button>
        }
      />

      <BandeauEtat etat="provisoire" titre="Trois niveaux de fiabilité distincts">
        Les chiffres comptables clos sont marqués OFFICIEL. L'exercice 2025/2026 est PROVISOIRE (comptabilité de gestion, non validée
        par le bilan) : août 2026 est clôturé, il n'y a donc plus de prévision — le cumul au 31/08/2026 est une donnée de
        gestion PROVISOIRE, à confirmer par le bilan 2026.
      </BandeauEtat>

      {/* ---------- Exercices officiels ---------- */}
      <section className="surface-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">Exercices clos</h2>
          <BadgeEtat etat="officiel" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {exercicesOfficiels.map((ex) => (
            <article key={ex.exercice} className="rounded-2xl border border-border/70 p-4">
              <p className="text-sm text-muted-foreground">
                Exercice {ex.exercice} — clos le {ex.cloture}
              </p>
              <p className="mt-2 font-display text-3xl">{euro(ex.chiffreAffaires)}</p>
              <dl className="mt-3 space-y-1 text-sm">
                <Ligne libelle="Chiffre d'affaires" valeur={euroPrecis(ex.chiffreAffaires)} />
                <Ligne
                  libelle="Résultat net"
                  valeur={euroPrecis(ex.resultatNet)}
                  ton={ex.resultatNet >= 0 ? "positif" : "negatif"}
                />
                <Ligne libelle="EBE" valeur={ex.ebe === null ? "Non disponible" : euroPrecis(ex.ebe)} />
              </dl>
            </article>
          ))}
        </div>
        <p className="mt-4 text-sm">
          Évolution du chiffre d'affaires entre les deux derniers exercices clos :{" "}
          <span className={`inline-flex items-center gap-1 font-semibold ${evolutionOfficielle >= 0 ? "text-success" : "text-destructive"}`}>
            {evolutionOfficielle >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {evolutionOfficielle.toFixed(1).replace(".", ",")} %
          </span>{" "}
          — malgré la hausse du CA, le résultat net est passé de {euroPrecis(exercicePrecedentOfficiel.resultatNet)} à{" "}
          {euroPrecis(dernierExerciceOfficiel.resultatNet)}.
        </p>
      </section>

      {/* ---------- Exercice en cours provisoire ---------- */}
      <section className="surface-card mt-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">Exercice {exerciceEnCoursProvisoire.exercice} en cours</h2>
          <BadgeEtat etat="provisoire" />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Chiffres de gestion non validés par le bilan. {exerciceEnCoursProvisoire.fermeture}.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Carte libelle="CA au 30/06/2026" valeur={euro(exerciceEnCoursProvisoire.caAu30Juin2026)} />
          <Carte libelle="Juillet 2026" valeur={`+ ${euro(exerciceEnCoursProvisoire.caJuillet2026)}`} />
          <Carte
            libelle="CA cumulé au 31/07/2026"
            valeur={euro(exerciceEnCoursProvisoire.caCumuleAu31Juillet2026)}
            detail="Cumul provisoire réel constaté"
          />
          <Carte
            libelle="Août 2026 (clôturé)"
            valeur={`+ ${euro(exerciceEnCoursProvisoire.caAout2026)}`}
            detail={`${exerciceEnCoursProvisoire.servicesAoutRealises} services du midi (${exerciceEnCoursProvisoire.detailServicesAout}) — soit ${euro(caMoyenParServiceAout)} / service`}
          />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Résultat net de l'exercice en cours : non disponible avant le bilan 2026.
        </p>
      </section>

      {/* ---------- Clôture provisoire ---------- */}
      <section className="surface-card mt-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">Clôture au 31/08/2026 — cumul de gestion</h2>
          <BadgeEtat etat="provisoire" />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{exerciceEnCoursProvisoire.note}</p>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <ChampNombre
              label="CA cumulé au 31/07/2026 (€)"
              value={caCumuleJuillet}
              onChange={setCaCumuleJuillet}
              step={1000}
            />
            <ChampNombre label="CA d'août 2026 clôturé (€)" value={caAout} onChange={setCaAout} step={100} />
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => {
                setCaCumuleJuillet(defauts.caCumuleJuillet);
                setCaAout(defauts.caAout);
              }}
            >
              <Calculator className="mr-2 h-4 w-4" /> Réinitialiser les valeurs de gestion
            </Button>
            <div className="rounded-2xl border border-border/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Historique des projections — obsolètes
              </p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {projectionsObsoletes.map((p) => (
                  <li key={p.valeur} className="flex items-center justify-between gap-2">
                    <span className="line-through">{euro(p.valeur)}</span>
                    <BadgeEtat etat="non-disponible" texte="OBSOLÈTE" />
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                Remplacées par le cumul réel de gestion : août 2026 est clôturé.
              </p>
            </div>
          </div>

          <div className="gradient-hero rounded-2xl p-6 text-primary-foreground">
            <p className="text-sm opacity-80">CA cumulé provisoire au 31/08/2026</p>
            <p className="mt-2 font-display text-4xl sm:text-5xl">{euro(cloture.caCloture)}</p>
            <ul className="mt-4 space-y-1 text-sm opacity-90">
              <li>
                Détail : {euro(caCumuleJuillet)} au 31/07 + {euro(caAout)} en août (clôturé)
              </li>
              <li>
                Écart vs exercice {dernierExerciceOfficiel.exercice} officiel : {euro(cloture.ecartExerciceOfficiel)} (
                {cloture.ecartPourcent.toFixed(1).replace(".", ",")} %)
              </li>
              <li>Résultat net : non disponible avant le bilan 2026</li>
            </ul>
            <p className="mt-4 text-xs opacity-80">
              Donnée de comptabilité de gestion PROVISOIRE — à confirmer par le bilan 2026. Ce n'est pas un chiffre
              comptable définitif, et ce n'est plus une prévision.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Rappel identité / offre ---------- */}
      <section className="surface-card mt-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">Offre confirmée</h2>
          <BadgeEtat etat="officiel" />
        </div>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          {formules.map((f) => (
            <li key={f.libelle} className="rounded-2xl border border-border/70 p-4">
              <p className="font-semibold">{f.prix.toString().replace(".", ",")} €</p>
              <p className="mt-1 text-muted-foreground">{f.libelle}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Snack également proposé. Aucune autre formule, aucun autre prix ne doit être communiqué.
        </p>
      </section>
    </div>
  );
}

function Carte({ libelle, valeur, detail }: { libelle: string; valeur: string; detail?: string }) {
  return (
    <article className="rounded-2xl border border-border/70 p-4">
      <p className="text-sm text-muted-foreground">{libelle}</p>
      <p className="mt-2 font-display text-2xl">{valeur}</p>
      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
    </article>
  );
}

function Ligne({ libelle, valeur, ton }: { libelle: string; valeur: string; ton?: "positif" | "negatif" }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-1 last:border-0">
      <span className="text-muted-foreground">{libelle}</span>
      <span className={`font-semibold ${ton === "positif" ? "text-success" : ton === "negatif" ? "text-destructive" : ""}`}>
        {valeur}
      </span>
    </div>
  );
}

function ChampNombre({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <Input
        type="number"
        inputMode="numeric"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
}
