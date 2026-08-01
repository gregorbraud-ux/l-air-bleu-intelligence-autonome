import { buildPushPayload, type PushSubscription } from "@block65/webcrypto-web-push";
import { sendLovableEmail } from "@lovable.dev/email-js";
import {
  corpsNotification,
  htmlEmail,
  sujetEmail,
  texteEmail,
  titreNotification,
  type AlerteEnvoi,
} from "@/lib/alertes-contenu";

export type ResultatCanal = {
  canal: "email" | "push";
  envoyes: number;
  echecs: number;
  message: string;
};

type Journal = {
  user_id: string;
  alerte_id: string;
  canal: "email" | "push";
  destinataire: string | null;
  statut: string;
  erreur: string | null;
};

export async function journaliser(lignes: Journal[]) {
  if (lignes.length === 0) return;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("alertes_envois").insert(lignes);
}

export async function envoyerEmailAlertes(
  userId: string,
  destinataire: string,
  alertes: AlerteEnvoi[],
): Promise<ResultatCanal> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  const domaine = process.env["EMAIL_SENDER_DOMAIN"] ?? process.env["SENDER_DOMAIN"];

  if (!apiKey || !domaine) {
    const message =
      "Aucun domaine d'expédition n'est encore configuré : l'envoi d'e-mails sera actif dès la validation du domaine.";
    await journaliser(
      alertes.map((a) => ({
        user_id: userId,
        alerte_id: a.id,
        canal: "email" as const,
        destinataire,
        statut: "domaine_manquant",
        erreur: message,
      })),
    );
    return { canal: "email", envoyes: 0, echecs: alertes.length, message };
  }

  try {
    await sendLovableEmail(
      {
        to: destinataire,
        from: `AirBleu AI <alertes@${domaine}>`,
        sender_domain: domaine,
        subject: sujetEmail(alertes),
        html: htmlEmail(alertes),
        text: texteEmail(alertes),
        purpose: "alertes-veille-concurrentielle",
        label: "veille",
        idempotency_key: `veille-${userId}-${alertes.map((a) => a.id).join("-")}`,
      },
      { apiKey },
    );
    await journaliser(
      alertes.map((a) => ({
        user_id: userId,
        alerte_id: a.id,
        canal: "email" as const,
        destinataire,
        statut: "envoye",
        erreur: null,
      })),
    );
    return {
      canal: "email",
      envoyes: 1,
      echecs: 0,
      message: `E-mail envoyé à ${destinataire} (${alertes.length} alerte${alertes.length > 1 ? "s" : ""}).`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur d'envoi inconnue";
    console.error("[alertes] échec e-mail", message);
    await journaliser(
      alertes.map((a) => ({
        user_id: userId,
        alerte_id: a.id,
        canal: "email" as const,
        destinataire,
        statut: "echec",
        erreur: message,
      })),
    );
    return { canal: "email", envoyes: 0, echecs: alertes.length, message: `E-mail non envoyé : ${message}` };
  }
}

export async function envoyerPushAlertes(userId: string, alertes: AlerteEnvoi[]): Promise<ResultatCanal> {
  const publicKey = process.env["VAPID_PUBLIC_KEY"];
  const privateKey = process.env["VAPID_PRIVATE_KEY"];
  const subject = process.env["VAPID_SUBJECT"] ?? "mailto:contact@lairbleu.fr";

  if (!publicKey || !privateKey) {
    return { canal: "push", envoyes: 0, echecs: 0, message: "Clés push absentes côté serveur." };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: abonnements, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) throw error;
  if (!abonnements || abonnements.length === 0) {
    return { canal: "push", envoyes: 0, echecs: 0, message: "Aucun appareil abonné aux notifications push." };
  }

  let envoyes = 0;
  let echecs = 0;
  const journal: Journal[] = [];

  for (const abo of abonnements) {
    const subscription: PushSubscription = {
      endpoint: abo.endpoint,
      expirationTime: null,
      keys: { p256dh: abo.p256dh, auth: abo.auth },
    };

    for (const alerte of alertes) {
      try {
        const payload = await buildPushPayload(
          {
            data: JSON.stringify({
              title: titreNotification(alerte),
              body: corpsNotification(alerte),
              url: alerte.source,
              interne: "/concurrence",
              tag: alerte.id,
              sourceLabel: alerte.sourceLabel,
            }),
            options: { ttl: 60 * 60 * 24 },
          },
          subscription,
          { subject, publicKey, privateKey },
        );
        const res = await fetch(subscription.endpoint, payload);
        if (res.status === 404 || res.status === 410) {
          await supabaseAdmin.from("push_subscriptions").delete().eq("id", abo.id);
          echecs += 1;
          journal.push({
            user_id: userId,
            alerte_id: alerte.id,
            canal: "push",
            destinataire: abo.endpoint.slice(0, 80),
            statut: "abonnement_expire",
            erreur: `HTTP ${res.status}`,
          });
          break;
        }
        if (!res.ok) {
          const corps = await res.text();
          throw new Error(`HTTP ${res.status} ${corps.slice(0, 200)}`);
        }
        envoyes += 1;
        journal.push({
          user_id: userId,
          alerte_id: alerte.id,
          canal: "push",
          destinataire: abo.endpoint.slice(0, 80),
          statut: "envoye",
          erreur: null,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur push inconnue";
        console.error("[alertes] échec push", message);
        echecs += 1;
        journal.push({
          user_id: userId,
          alerte_id: alerte.id,
          canal: "push",
          destinataire: abo.endpoint.slice(0, 80),
          statut: "echec",
          erreur: message,
        });
      }
    }
  }

  await journaliser(journal);
  return {
    canal: "push",
    envoyes,
    echecs,
    message:
      envoyes > 0
        ? `${envoyes} notification${envoyes > 1 ? "s" : ""} push envoyée${envoyes > 1 ? "s" : ""}.`
        : `Aucune notification push envoyée${echecs ? ` (${echecs} échec${echecs > 1 ? "s" : ""})` : ""}.`,
  };
}