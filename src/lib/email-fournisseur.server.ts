/**
 * Fournisseur d'e-mails — 100 % indépendant.
 *
 * Un seul mode d'envoi : une API HTTP standard compatible (Resend, Postmark,
 * Brevo, SMTP-to-HTTP…), configurée côté serveur.
 *
 * Ordre de résolution :
 *  1. EMAIL_API_URL + EMAIL_API_KEY (+ EMAIL_FROM) → fournisseur configuré
 *  2. aucun                                        → envoi désactivé proprement
 */

export type FournisseurEmail = {
  id: "standard";
  nom: string;
  expediteur: string;
  cout: "payant";
  remarque: string;
};

export type ResolutionEmail =
  | { disponible: true; fournisseur: FournisseurEmail }
  | { disponible: false; fournisseur: null; raison: string };

export function resoudreFournisseurEmail(): ResolutionEmail {
  const url = process.env["EMAIL_API_URL"]?.trim();
  const cle = process.env["EMAIL_API_KEY"]?.trim();
  if (url && cle) {
    return {
      disponible: true,
      fournisseur: {
        id: "standard",
        nom: `Fournisseur e-mail (${new URL(url).host})`,
        expediteur: process.env["EMAIL_FROM"]?.trim() || "alertes@lairbleu.fr",
        cout: "payant",
        remarque:
          "Fournisseur configuré manuellement : le coût et les quotas dépendent de votre contrat.",
      },
    };
  }

  return {
    disponible: false,
    fournisseur: null,
    raison:
      "E-MAIL NON CONFIGURÉ : renseignez EMAIL_API_URL, EMAIL_API_KEY et EMAIL_FROM côté serveur pour activer l'envoi.",
  };
}

export type MessageEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  purpose: string;
  label: string;
  idempotencyKey: string;
};

/** Envoie un e-mail via le fournisseur configuré. Lève une erreur explicite sinon. */
export async function envoyerEmail(message: MessageEmail): Promise<{ fournisseur: string }> {
  const resolution = resoudreFournisseurEmail();
  if (!resolution.disponible) throw new Error(resolution.raison);
  const { fournisseur } = resolution;

  const res = await fetch(process.env["EMAIL_API_URL"]!.trim(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env["EMAIL_API_KEY"]!.trim()}`,
      "content-type": "application/json",
      "Idempotency-Key": message.idempotencyKey,
    },
    body: JSON.stringify({
      from: `AirBleu AI <${fournisseur.expediteur}>`,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });
  if (!res.ok) {
    const corps = await res.text();
    throw new Error(`HTTP ${res.status} ${corps.slice(0, 200)}`);
  }
  return { fournisseur: fournisseur.nom };
}
