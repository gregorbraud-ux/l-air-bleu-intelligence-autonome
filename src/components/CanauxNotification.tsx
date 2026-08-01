import { BellRing, Loader2, Mail, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { alertesConcurrence } from "@/lib/data";
import { envoyerAlertes } from "@/lib/notifications.functions";
import { usePushNotifications } from "@/lib/push-client";
import type { ConfigAlertes } from "@/lib/alertes-config";

const libelleEtat: Record<string, string> = {
  inconnu: "Vérification…",
  "non-supporte": "Non supporté par ce navigateur",
  refuse: "Bloqué dans le navigateur",
  inactif: "Inactif sur cet appareil",
  actif: "Actif sur cet appareil",
};

export function CanauxNotification({ config }: { config: ConfigAlertes }) {
  const { etat, occupe, activer, desactiver } = usePushNotifications();
  const [envoi, setEnvoi] = useState(false);

  const surveilles = Object.values(config).filter((e) => e.surveille);
  const destinataire = surveilles.find((e) => e.canaux.email)?.canaux.destinataire;
  const pushDemande = surveilles.some((e) => e.canaux.push);

  const alertesAEnvoyer = alertesConcurrence
    .filter((a) => {
      const etab = config[a.concurrent];
      if (!etab?.surveille) return false;
      const cat = etab.categories[a.type];
      if (!cat?.active) return false;
      return a.type === "nouveaute" || Math.abs(a.variation) >= cat.seuil;
    })
    .slice(0, 5);

  async function basculerPush() {
    const res = etat === "actif" ? await desactiver() : await activer();
    if (res.ok) toast.success(res.message);
    else toast.error(res.message);
  }

  async function envoyer() {
    if (alertesAEnvoyer.length === 0) {
      toast.error("Aucune alerte ne correspond à vos seuils actuels.");
      return;
    }
    setEnvoi(true);
    try {
      const { resultats } = await envoyerAlertes({
        data: {
          alertes: alertesAEnvoyer.map((a) => ({
            id: a.id,
            concurrent: a.concurrent,
            type: a.type,
            titre: a.titre,
            detail: a.detail,
            variation: a.variation,
            gravite: a.gravite,
            date: a.date,
            source: a.source,
            sourceLabel: a.sourceLabel,
          })),
          email: Boolean(destinataire),
          push: pushDemande || etat === "actif",
          ...(destinataire ? { destinataire } : {}),
        },
      });
      if (resultats.length === 0) {
        toast.error("Activez au moins un canal (e-mail ou push).");
        return;
      }
      for (const r of resultats) {
        if (r.envoyes > 0) toast.success(r.message);
        else toast.warning(r.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Envoi impossible.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Card className="surface-card mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-4 w-4 text-accent" /> Envoi réel des alertes
        </CardTitle>
        <CardDescription>
          Chaque alerte est envoyée avec un contenu personnalisé (établissement, variation, action conseillée) et
          un lien direct vers la source du signal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="gap-1">
            <Mail className="h-3.5 w-3.5" /> {destinataire ?? "aucun destinataire"}
          </Badge>
          <Badge variant={etat === "actif" ? "default" : "secondary"} className="gap-1">
            <BellRing className="h-3.5 w-3.5" /> Push : {libelleEtat[etat]}
          </Badge>
          <Badge variant="secondary">
            {alertesAEnvoyer.length} alerte{alertesAEnvoyer.length > 1 ? "s" : ""} au-dessus des seuils
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={basculerPush}
            disabled={occupe || etat === "non-supporte" || etat === "refuse"}
          >
            {occupe ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BellRing className="mr-2 h-4 w-4" />}
            {etat === "actif" ? "Désactiver le push ici" : "Activer le push sur cet appareil"}
          </Button>
          <Button onClick={envoyer} disabled={envoi}>
            {envoi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Envoyer les alertes maintenant
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}