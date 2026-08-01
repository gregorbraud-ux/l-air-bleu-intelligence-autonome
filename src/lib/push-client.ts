import { useCallback, useEffect, useState } from "react";
import {
  clePubliquePush,
  enregistrerAbonnementPush,
  supprimerAbonnementPush,
} from "@/lib/notifications.functions";

function base64UrlVersUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const brut = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const sortie = new Uint8Array(brut.length);
  for (let i = 0; i < brut.length; i += 1) sortie[i] = brut.charCodeAt(i);
  return sortie;
}

function base64Url(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const octets = new Uint8Array(buffer);
  let binaire = "";
  octets.forEach((o) => {
    binaire += String.fromCharCode(o);
  });
  return btoa(binaire).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export type EtatPush = "inconnu" | "non-supporte" | "refuse" | "inactif" | "actif";

export function usePushNotifications() {
  const [etat, setEtat] = useState<EtatPush>("inconnu");
  const [occupe, setOccupe] = useState(false);

  useEffect(() => {
    let vivant = true;
    (async () => {
      if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        if (vivant) setEtat("non-supporte");
        return;
      }
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        const abonnement = await registration.pushManager.getSubscription();
        if (!vivant) return;
        if (Notification.permission === "denied") setEtat("refuse");
        else setEtat(abonnement ? "actif" : "inactif");
      } catch {
        if (vivant) setEtat("non-supporte");
      }
    })();
    return () => {
      vivant = false;
    };
  }, []);

  const activer = useCallback(async () => {
    setOccupe(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setEtat(permission === "denied" ? "refuse" : "inactif");
        return { ok: false, message: "Autorisation des notifications refusée par le navigateur." };
      }
      const { cle } = await clePubliquePush();
      if (!cle) return { ok: false, message: "Clé de notification indisponible côté serveur." };

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const abonnement =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlVersUint8Array(cle),
        }));

      await enregistrerAbonnementPush({
        data: {
          endpoint: abonnement.endpoint,
          p256dh: base64Url(abonnement.getKey("p256dh")),
          auth: base64Url(abonnement.getKey("auth")),
          libelle: navigator.userAgent.slice(0, 160),
        },
      });
      setEtat("actif");
      return { ok: true, message: "Notifications push activées sur cet appareil." };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Activation impossible." };
    } finally {
      setOccupe(false);
    }
  }, []);

  const desactiver = useCallback(async () => {
    setOccupe(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      const abonnement = await registration?.pushManager.getSubscription();
      if (abonnement) {
        await supprimerAbonnementPush({ data: { endpoint: abonnement.endpoint } });
        await abonnement.unsubscribe();
      }
      setEtat("inactif");
      return { ok: true, message: "Notifications push désactivées sur cet appareil." };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Désactivation impossible." };
    } finally {
      setOccupe(false);
    }
  }, []);

  return { etat, occupe, activer, desactiver };
}