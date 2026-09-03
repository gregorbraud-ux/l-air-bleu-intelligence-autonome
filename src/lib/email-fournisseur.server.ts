/**
 * Couche d'abstraction du fournisseur d'e-mails.
 * Objectif : pouvoir remplacer l'envoi Lovable par un fournisseur standard
 * (Resend, Postmark, Brevo… toute API HTTP compatible) sans toucher au reste
 * de l'application.
 *
 * Ordre de résolution :
 *  1. EMAIL_API_URL + EMAIL_API_KEY (+ EMAIL_FROM) → fournisseur standard
 *  2. LOVABLE_API_KEY + domaine d'expédition        → envoi Lovable
 *  3. aucun                                          → envoi désactivé
 */

export type FournisseurEmail = {
  id: "standard" | "lovable";
  nom: string;
  expediteur: string;
  cout: "gratuit-limite" | "payant";
  remarque: string;
};

export type ResolutionEmail =
  | { disponible: true; fournisseur: FournisseurEmail }
  | { disponible: false; fournisseur: null; raison: string };

function domaineLovable() {
  return process.env["EMAIL_SENDER_DOMAIN"] ?? process.env["SENDER_DOMAIN"];
}

export function resoudreFournisseurEmail(): ResolutionEmail {
  const url = process.env["EMAIL_API_URL"]?.trim();
  const cle = process.env["EMAIL_API_KEY"]?.trim();
  if (url && cle) {
    return {
      disponible: true,
      fournisseur: {
        id: "standard",
        nom: `Fournisseur e-mail standard (${new URL(url).host})`,
        expediteur: process.env["EMAIL_FROM"]?.trim() || "alertes@lairbleu.fr",
        cout: "payant",
        remarque:
          "Fournisseur configuré manuellement : le coût et les quotas dépendent de votre contrat.",
      },
    };
  }

  const apiKey = process.env["LOVABLE_API_KEY"];
  const domaine = domaineLovable();
  if (apiKey && domaine) {
    return {
      disponible: true,
      fournisseur: {
        id: "lovable",
        nom: "Envoi e-mail Lovable",
        expediteur: `alertes@${domaine}`,
        cout: "gratuit-limite",
        remarque: "Inclus dans l'espace de travail, avec quota mensuel et domaine à valider.",
      },
    };
  }

  return {
    disponible: false,
    fournisseur: null,
    raison:
      "Aucun fournisseur d'e-mail configuré : renseignez EMAIL_API_URL + EMAIL_API_KEY, ou un domaine d'expédition validé.",
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

/** Envoie un e-mail via le fournisseur actif. Lève une erreur explicite sinon. */
export async function envoyerEmail(message: MessageEmail): Promise<{ fournisseur: string }> {
  const resolution = resoudreFournisseurEmail();
  if (!resolution.disponible) throw new Error(resolution.raison);
  const { fournisseur } = resolution;

  if (fournisseur.id === "standard") {
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

  const { sendLovableEmail } = await import("@lovable.dev/email-js");
  const domaine = domaineLovable()!;
  await sendLovableEmail(
    {
      to: message.to,
      from: `AirBleu AI <alertes@${domaine}>`,
      sender_domain: domaine,
      subject: message.subject,
      html: message.html,
      text: message.text,
      purpose: message.purpose,
      label: message.label,
      idempotency_key: message.idempotencyKey,
    },
    { apiKey: process.env["LOVABLE_API_KEY"]! },
  );
  return { fournisseur: fournisseur.nom };
}
