import type { AlerteConcurrence } from "@/lib/data";

export type AlerteEnvoi = {
  id: string;
  concurrent: string;
  type: AlerteConcurrence["type"];
  titre: string;
  detail: string;
  variation: number;
  gravite: AlerteConcurrence["gravite"];
  date: string;
  source: string;
  sourceLabel: string;
};

export const RESTAURANT = {
  nom: "L'Air Bleu",
  ville: "Montoir-de-Bretagne",
  tel: "02 40 90 01 17",
};

const conseils: Record<AlerteConcurrence["type"], string> = {
  note: "Sollicitez 3 avis Google en fin de service midi pour garder l'avantage sur la note.",
  prix: "Mettez en avant notre rapport qualité/prix déjeuner sur Facebook et Instagram cette semaine.",
  visibilite: "Publiez un post Google Business et une story Instagram pour reprendre de la visibilité locale.",
  nouveaute: "Analysez l'offre repérée et adaptez notre formule express pour la clientèle pro du midi.",
};

const libelleType: Record<AlerteConcurrence["type"], string> = {
  note: "Note Google",
  prix: "Tarifs",
  visibilite: "Visibilité locale",
  nouveaute: "Nouvelle offre",
};

export function titreNotification(a: AlerteEnvoi): string {
  return `${a.gravite === "critique" ? "🔴" : a.gravite === "importante" ? "🟠" : "🔵"} ${a.concurrent} — ${a.titre}`;
}

export function corpsNotification(a: AlerteEnvoi): string {
  const variation = a.variation !== 0 ? ` (${a.variation > 0 ? "+" : ""}${a.variation} %)` : "";
  return `${libelleType[a.type]}${variation} · ${a.detail}`;
}

export function texteEmail(alertes: AlerteEnvoi[]): string {
  const lignes = alertes.map(
    (a) =>
      `• ${titreNotification(a)}\n  ${corpsNotification(a)}\n  Détecté : ${a.date}\n  Action conseillée : ${conseils[a.type]}\n  Source (${a.sourceLabel}) : ${a.source}`,
  );
  return [
    `Veille concurrentielle — ${RESTAURANT.nom} (${RESTAURANT.ville})`,
    "",
    `${alertes.length} signal${alertes.length > 1 ? "aux" : ""} détecté${alertes.length > 1 ? "s" : ""} sur les établissements que vous surveillez :`,
    "",
    ...lignes,
    "",
    `AirBleu AI — assistant marketing de ${RESTAURANT.nom} · ${RESTAURANT.tel}`,
  ].join("\n");
}

function echapper(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function htmlEmail(alertes: AlerteEnvoi[]): string {
  const couleur: Record<AlerteConcurrence["gravite"], string> = {
    critique: "#b42318",
    importante: "#b54708",
    info: "#1d4ed8",
  };

  const cartes = alertes
    .map((a) => {
      const variation =
        a.variation !== 0
          ? `<span style="font-weight:600;color:${a.variation > 0 ? "#b42318" : "#067647"}">${a.variation > 0 ? "+" : ""}${a.variation} %</span> · `
          : "";
      return `
      <tr><td style="padding:0 0 16px 0">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e7ec;border-radius:14px">
          <tr><td style="padding:18px 20px">
            <p style="margin:0 0 4px 0;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:${couleur[a.gravite]};font-weight:700">
              ${echapper(a.gravite)} · ${echapper(libelleType[a.type])}
            </p>
            <p style="margin:0 0 6px 0;font-size:17px;font-weight:700;color:#0b1b33">${echapper(a.titre)}</p>
            <p style="margin:0 0 10px 0;font-size:13px;color:#667085">${echapper(a.concurrent)} · ${echapper(a.date)}</p>
            <p style="margin:0 0 12px 0;font-size:14px;line-height:22px;color:#344054">${variation}${echapper(a.detail)}</p>
            <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:#0b1b33"><strong>Action conseillée :</strong> ${echapper(conseils[a.type])}</p>
            <a href="${echapper(a.source)}" style="display:inline-block;background:#0b1b33;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;border-radius:999px">
              Voir la source · ${echapper(a.sourceLabel)}
            </a>
          </td></tr>
        </table>
      </td></tr>`;
    })
    .join("");

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /><title>Veille concurrentielle</title></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden">${echapper(alertes.map((a) => a.titre).join(" · "))}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff">
    <tr><td align="center" style="padding:28px 16px">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
        <tr><td style="padding:0 0 22px 0">
          <p style="margin:0;font-size:20px;font-weight:700;color:#0b1b33">AirBleu AI · Veille concurrentielle</p>
          <p style="margin:6px 0 0 0;font-size:14px;color:#667085">${echapper(RESTAURANT.nom)} — ${echapper(RESTAURANT.ville)}</p>
        </td></tr>
        ${cartes}
        <tr><td style="padding:8px 0 0 0;border-top:1px solid #e4e7ec">
          <p style="margin:14px 0 0 0;font-size:12px;line-height:18px;color:#98a2b3">
            Vous recevez cet e-mail car ces seuils de veille sont activés dans AirBleu AI.<br />
            ${echapper(RESTAURANT.nom)} · 3 rue Anatole France, 44550 ${echapper(RESTAURANT.ville)} · ${echapper(RESTAURANT.tel)}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function sujetEmail(alertes: AlerteEnvoi[]): string {
  if (alertes.length === 1) return `Veille : ${alertes[0].concurrent} — ${alertes[0].titre}`;
  const critiques = alertes.filter((a) => a.gravite === "critique").length;
  return `Veille concurrentielle : ${alertes.length} signaux${critiques ? ` dont ${critiques} critique${critiques > 1 ? "s" : ""}` : ""}`;
}