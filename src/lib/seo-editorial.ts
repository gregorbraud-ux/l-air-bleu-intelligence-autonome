/** Source de vérité éditoriale SEO — L'Air Bleu. Aucune donnée externe inventée. */
export const seoEditorial = {
  positionnement: "Restaurant à Montoir-de-Bretagne, accessible à tous.",
  localisation:
    "Au pied du Pont de Saint-Nazaire, entre les Chantiers de l'Atlantique et Airbus.",
  zonesPrincipales: ["Montoir-de-Bretagne", "Saint-Nazaire", "Saint-Brevin-les-Pins", "Corsept", "Paimbœuf"],
  zonesSecondaires: ["Pornic"],
  offre: [
    "cuisine maison",
    "formules du midi",
    "buffet d'entrées",
    "grillades",
    "burgers maison",
    "desserts de saison",
    "bar",
    "snack",
    "sur place et à emporter",
  ],
  signature: "L'Air Bleu — entre les deux rives, une bonne adresse pour déjeuner.",
  interdits: [
    "positionnement « restaurant ouvrier » ou « restaurant routier »",
    "formulation artificielle « près de Pornic »",
    "horaires, statistiques, avis Google, adresse ou données externes inventés",
  ],
  donneeInconnue: "non disponible",
} as const;

export function contexteSEO(): string {
  const s = seoEditorial;
  return [
    `SEO : ${s.positionnement} ${s.localisation}`,
    `Accessible depuis les deux rives : ${s.zonesPrincipales.join(", ")}. Zone secondaire uniquement : ${s.zonesSecondaires.join(", ")}.`,
    `Offre : ${s.offre.join(", ")}.`,
    `Signature possible : « ${s.signature} »`,
    `Interdits : ${s.interdits.join(" ; ")}. Donnée inconnue = « ${s.donneeInconnue} ».`,
  ].join("\n");
}
