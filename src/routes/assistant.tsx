import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { BandeauEtat } from "@/components/EtatDonnee";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { interrogerAssistant, statutIA } from "@/lib/ia.functions";
import { dernierExerciceOfficiel, euroPrecis, exerciceEnCoursProvisoire } from "@/lib/lair-bleu";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Assistant stratégique — L'Air Bleu Intelligence" },
      {
        name: "description",
        content:
          "Posez vos questions de direction : actions prioritaires, ticket moyen, contenus à publier, réponse à la concurrence — à partir des seules données disponibles de L'Air Bleu.",
      },
      { property: "og:title", content: "Assistant stratégique — L'Air Bleu Intelligence" },
      {
        property: "og:description",
        content: "Analyse et actions prioritaires pour le déjeuner de L'Air Bleu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantPage,
});

const questions = [
  "Que faire cette semaine pour augmenter le CA du midi ?",
  "Analyse mes performances et donne-moi 3 actions prioritaires.",
  "Comment améliorer le ticket moyen ?",
  "Quels contenus publier cette semaine ?",
  "Que faire face à la concurrence locale ?",
];

const donneesDisponibles = [
  `Exercice ${dernierExerciceOfficiel.exercice} officiel : CA ${euroPrecis(dernierExerciceOfficiel.chiffreAffaires)}, résultat net ${euroPrecis(dernierExerciceOfficiel.resultatNet)}`,
  `Exercice 2025/2026 provisoire : cumul au 31/07/2026 ${euroPrecis(exerciceEnCoursProvisoire.caCumuleAu31Juillet2026)}`,
  `Août 2026 clôturé (gestion) : ${exerciceEnCoursProvisoire.caAout2026.toLocaleString("fr-FR")} € sur ${exerciceEnCoursProvisoire.servicesAoutRealises} services (${exerciceEnCoursProvisoire.detailServicesAout})`,
  "Formules et prix confirmés, capacité 70 couverts, service du midi uniquement",
];

const donneesManquantes = [
  "Avis Google réels (note, volume, dates) : intégration non connectée",
  "Nombre de couverts et ticket moyen réellement mesurés par service",
  "Données de concurrence réellement collectées (prix, notes, publications)",
  "Statistiques Facebook / Instagram (portée, abonnés, engagement)",
  "Bilan 2026 (résultat net, EBE de l'exercice en cours)",
];

function AssistantPage() {
  const statut = useQuery({ queryKey: ["statut-ia"], queryFn: () => statutIA() });
  const demander = useServerFn(interrogerAssistant);
  const [question, setQuestion] = useState(questions[0]);
  const [reponse, setReponse] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  const iaDisponible = statut.data?.disponible === true;

  const envoyer = async () => {
    setChargement(true);
    setReponse(null);
    try {
      const { texte } = await demander({
        data: { question, donneesDisponibles, donneesManquantes },
      });
      setReponse(texte);
    } catch (error) {
      toast.error("Analyse impossible", {
        description: error instanceof Error ? error.message : "Erreur inconnue",
      });
    } finally {
      setChargement(false);
    }
  };

  return (
    <div>
      <PageHeader
        titre="Assistant stratégique"
        sousTitre="Analyse croisée des seules données disponibles de L'Air Bleu — les données manquantes sont signalées, jamais inventées"
      />

      {statut.isSuccess && !iaDisponible && (
        <BandeauEtat etat="non-connecte" titre="IA non connectée">
          Aucune clé IA n'est configurée côté serveur : l'assistant ne peut pas répondre. Aucune
          réponse n'est simulée.
        </BandeauEtat>
      )}

      <section className="surface-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Votre question</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {questions.map((q) => (
            <Button key={q} variant="outline" size="sm" onClick={() => setQuestion(q)}>
              {q}
            </Button>
          ))}
        </div>
        <Textarea
          className="mt-4"
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <Button className="mt-4" onClick={envoyer} disabled={chargement || !iaDisponible}>
          {chargement ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Analyser
        </Button>
      </section>

      {reponse && (
        <section className="surface-card mt-6 p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Analyse et actions prioritaires</h2>
          <pre className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {reponse}
          </pre>
          <p className="mt-4 text-xs text-muted-foreground">
            Analyse générée à partir des données ci-dessous. Validation humaine requise avant toute
            action ou publication.
          </p>
        </section>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="surface-card p-5">
          <h3 className="font-semibold">Données prises en compte</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {donneesDisponibles.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div className="surface-card p-5">
          <h3 className="font-semibold">Données manquantes</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {donneesManquantes.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
