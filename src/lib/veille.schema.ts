import { z } from "zod";

export const zonesSurveillees = ["Trignac", "Donges", "Saint-Nazaire"] as const;
export type ZoneSurveillee = (typeof zonesSurveillees)[number];

export const signalEntree = z.object({
  categorie: z.enum(["menu", "promotion", "publication"]),
  etablissement: z.string().max(120),
  constat: z.string().max(400),
  variation: z.string().max(80).optional(),
  date: z.string().max(60),
  source: z.string().max(400),
  sourceLabel: z.string().max(80),
});

export const entreeVeille = z.object({
  zones: z
    .array(
      z.object({
        zone: z.enum(zonesSurveillees),
        etablissements: z.array(z.string().max(120)).max(10),
        signaux: z.array(signalEntree).max(12),
      }),
    )
    .min(1)
    .max(3),
});

export type EntreeVeille = z.infer<typeof entreeVeille>;

export const syntheseZoneSchema = z.object({
  zone: z.enum(zonesSurveillees),
  gravite: z.enum(["critique", "importante", "info"]),
  resume: z.string(),
  menus: z.string(),
  promotions: z.string(),
  rythmePublication: z.string(),
  menaces: z.array(z.string()),
  actions: z.array(z.string()),
});

export const rapportVeilleSchema = z.object({
  synthese: z.string(),
  zones: z.array(syntheseZoneSchema),
});

export type SyntheseZone = z.infer<typeof syntheseZoneSchema>;
export type RapportVeille = z.infer<typeof rapportVeilleSchema> & { genereLe: string };

export function construirePromptVeille(data: EntreeVeille): string {
  const blocs = data.zones
    .map((z) => {
      const lignes = z.signaux
        .map(
          (s) =>
            `- [${s.categorie}] ${s.etablissement} (${s.date}) : ${s.constat}${s.variation ? ` — ${s.variation}` : ""} — source : ${s.sourceLabel}`,
        )
        .join("\n");
      return `### Zone ${z.zone} — établissements suivis : ${z.etablissements.join(", ")}\n${lignes}`;
    })
    .join("\n\n");

  return `Tu es l'analyste de veille concurrentielle du restaurant L'Air Bleu (SARL LG AIR, 3 rue Anatole France, 44550 Montoir-de-Bretagne, tél. 02 40 90 01 17).

Positionnement de L'Air Bleu : référence du déjeuner en Loire-Atlantique, cuisine maison, produits frais, service rapide le midi, excellent rapport qualité/prix (ticket moyen déjeuner 17,50 €), clientèle professionnelle et familiale. Canaux : Facebook et Instagram uniquement, plus la fiche Google Business. Priorité aux leviers gratuits, au SEO local et à l'automatisation IA.

Analyse les signaux ci-dessous et produis un rapport d'alerte automatique, zone par zone (Trignac, Donges, Saint-Nazaire). Pour chaque zone :
- "resume" : 2 phrases maximum sur ce qui a changé et pourquoi c'est important pour notre déjeuner.
- "menus" : synthèse des évolutions de cartes et plats du jour (si aucun signal, dis-le clairement).
- "promotions" : synthèse des offres et tarifs, avec comparaison à notre ticket moyen de 17,50 €.
- "rythmePublication" : synthèse de la fréquence de publication et de l'activité sociale des concurrents.
- "menaces" : 1 à 3 risques concrets pour L'Air Bleu.
- "actions" : 2 à 3 actions gratuites, concrètes et immédiatement applicables (contenu Facebook/Instagram, fiche Google, sollicitation d'avis, mise en avant du rapport qualité/prix).
- "gravite" : "critique" si un concurrent gagne clairement du terrain sur le déjeuner pro, "importante" si mouvement notable, "info" sinon.

Puis "synthese" : 2 à 3 phrases de vision d'ensemble du secteur.

Ton : professionnel, chaleureux, humain, direct, jamais commercial. Français uniquement. Ne cite aucun établissement ni chiffre absent des signaux fournis.

Signaux détectés :

${blocs}`;
}
