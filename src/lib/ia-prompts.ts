import { z } from "zod";
import { contexteAirBleu } from "@/lib/lair-bleu";

export const typesContenu = [
  "post-reseaux",
  "google-business",
  "reponse-avis",
  "reels",
  "seo-local",
  "newsletter",
  "calendrier",
] as const;

export type TypeContenu = (typeof typesContenu)[number];

export const libellesTypeContenu: Record<TypeContenu, string> = {
  "post-reseaux": "Post Facebook / Instagram",
  "google-business": "Publication Google Business Profile",
  "reponse-avis": "Réponse à un avis client",
  reels: "Idée + script de Reel",
  "seo-local": "Texte SEO local",
  newsletter: "Newsletter / fidélisation",
  calendrier: "Calendrier éditorial de la semaine",
};

const consignesParType: Record<TypeContenu, string> = {
  "post-reseaux":
    "Rédige une publication pour Facebook et Instagram : accroche, corps du texte (3 à 6 lignes), appel à l'action avec le téléphone, puis 6 à 10 hashtags locaux pertinents.",
  "google-business":
    "Rédige une publication Google Business Profile : 1 500 caractères maximum, orientée recherche locale « restaurant midi Montoir-de-Bretagne », avec un bouton d'action suggéré.",
  "reponse-avis":
    "Rédige une réponse publique à l'avis fourni dans le brief : remerciement personnalisé, réponse au fond, invitation à revenir. Jamais de promesse commerciale non confirmée.",
  reels:
    "Propose 2 idées de Reels : titre, plan par plan (durée, image, texte à l'écran), voix off, musique suggérée, légende et hashtags. Tournage réaliste au téléphone pendant le service du midi.",
  "seo-local":
    "Rédige un texte SEO local (mots-clés déjeuner, menu du jour, Montoir-de-Bretagne, Trignac, Donges, Saint-Nazaire) : titre, méta-description de moins de 160 caractères, 2 paragraphes, liste de mots-clés.",
  newsletter:
    "Rédige un e-mail de fidélisation pour la clientèle professionnelle du midi : objet, préheader, corps court, appel à l'action téléphonique.",
  calendrier:
    "Propose un calendrier éditorial de la semaine (jours ouvrés uniquement) : pour chaque jour, canal, thème, accroche et intention. Reste réaliste pour un restaurant sans community manager.",
};

export const entreeMarketing = z.object({
  type: z.enum(typesContenu),
  brief: z.string().trim().min(5).max(2000),
  ton: z.string().trim().max(40).default("Chaleureux"),
});

export type EntreeMarketing = z.infer<typeof entreeMarketing>;

export function promptMarketing(data: EntreeMarketing): string {
  return [
    "Tu es le responsable marketing du restaurant décrit ci-dessous. Tu écris en français, ton professionnel, chaleureux, authentique et humain — jamais publicitaire ou exagéré.",
    "",
    "CONTEXTE VÉRIFIÉ :",
    contexteAirBleu(),
    "",
    `TÂCHE : ${libellesTypeContenu[data.type]}.`,
    consignesParType[data.type],
    `Ton éditorial demandé : ${data.ton}.`,
    "",
    "BRIEF DU GÉRANT :",
    data.brief,
    "",
    "Contraintes : n'utilise que les faits du contexte et du brief. N'invente aucun prix, horaire, plat, avis ni chiffre. Si une information manque, écris explicitement « à confirmer ». Réponds en texte clair structuré, sans balise Markdown lourde.",
  ].join("\n");
}

export const entreeAssistant = z.object({
  question: z.string().trim().min(5).max(1000),
  donneesDisponibles: z.array(z.string().max(300)).max(30).default([]),
  donneesManquantes: z.array(z.string().max(300)).max(30).default([]),
});

export type EntreeAssistant = z.infer<typeof entreeAssistant>;

export function promptAssistant(data: EntreeAssistant): string {
  return [
    "Tu es le conseiller de direction du restaurant décrit ci-dessous : gestion, rentabilité et marketing local. Tu réponds en français, de façon concrète et actionnable pour un restaurateur qui a peu de temps.",
    "Les sources externes (avis Google, concurrence, tendances) ne sont pas connectées par défaut : ne présente jamais une donnée DÉMO comme réelle. Signale toute donnée manquante.",
    "",
    "CONTEXTE VÉRIFIÉ :",
    contexteAirBleu(),
    "",
    data.donneesDisponibles.length ? `DONNÉES DISPONIBLES DANS L'APPLICATION :\n- ${data.donneesDisponibles.join("\n- ")}` : "",
    data.donneesManquantes.length ? `DONNÉES MANQUANTES (ne pas les inventer, les signaler) :\n- ${data.donneesManquantes.join("\n- ")}` : "",
    "",
    `QUESTION : ${data.question}`,
    "",
    "Structure ta réponse ainsi :",
    "1. Lecture de la situation (uniquement à partir des données disponibles).",
    "2. Données manquantes qui limitent l'analyse.",
    "3. 3 à 5 actions prioritaires : intitulé, priorité (haute/moyenne/basse), effort, coût (privilégier le gratuit), impact attendu — et « impact non estimable » si tu ne peux pas le chiffrer honnêtement.",
    "4. Ce qu'il faut mesurer la semaine suivante.",
    "Ne chiffre jamais un impact que les données ne permettent pas d'estimer. N'invente aucune donnée.",
  ].join("\n");
}
