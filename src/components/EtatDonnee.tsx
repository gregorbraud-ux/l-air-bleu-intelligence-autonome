import {
  AlertTriangle,
  BadgeCheck,
  CircleSlash,
  FlaskConical,
  Hourglass,
  PlugZap,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Etat =
  "officiel" | "provisoire" | "prevision" | "demo" | "non-connecte" | "non-disponible";

const config: Record<Etat, { label: string; classe: string; Icone: typeof BadgeCheck }> = {
  officiel: {
    label: "OFFICIEL",
    classe: "bg-success/12 text-success border-success/30",
    Icone: BadgeCheck,
  },
  provisoire: {
    label: "PROVISOIRE",
    classe: "bg-warning/15 text-accent-foreground border-warning/40",
    Icone: Hourglass,
  },
  prevision: {
    label: "PRÉVISION",
    classe: "bg-primary/10 text-primary border-primary/30",
    Icone: AlertTriangle,
  },
  demo: {
    label: "DÉMO",
    classe: "bg-muted text-muted-foreground border-border",
    Icone: FlaskConical,
  },
  "non-connecte": {
    label: "NON CONNECTÉ",
    classe: "bg-destructive/10 text-destructive border-destructive/30",
    Icone: PlugZap,
  },
  "non-disponible": {
    label: "NON DISPONIBLE",
    classe: "bg-muted text-muted-foreground border-border",
    Icone: CircleSlash,
  },
};

export function BadgeEtat({
  etat,
  texte,
  className,
}: {
  etat: Etat;
  texte?: string;
  className?: string;
}) {
  const { label, classe, Icone } = config[etat];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        classe,
        className,
      )}
    >
      <Icone className="h-3 w-3" />
      {texte ?? label}
    </span>
  );
}

/** Bandeau d'avertissement en tête de section (démo, non connecté, provisoire…). */
export function BandeauEtat({
  etat,
  titre,
  children,
  action,
}: {
  etat: Etat;
  titre: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const { classe, Icone } = config[etat];
  return (
    <div className={cn("mb-5 flex flex-wrap items-start gap-3 rounded-2xl border p-4", classe)}>
      <Icone className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{titre}</p>
        {children && <p className="mt-1 text-sm opacity-90">{children}</p>}
      </div>
      {action}
    </div>
  );
}

export type NiveauGratuite = "gratuit" | "gratuit-limite" | "payant" | "non-connecte";

const gratuite: Record<NiveauGratuite, { label: string; classe: string }> = {
  gratuit: { label: "Gratuit", classe: "bg-success/12 text-success border-success/30" },
  "gratuit-limite": {
    label: "Gratuit avec limites",
    classe: "bg-warning/15 text-accent-foreground border-warning/40",
  },
  payant: {
    label: "API payante requise",
    classe: "bg-destructive/10 text-destructive border-destructive/30",
  },
  "non-connecte": { label: "Non connecté", classe: "bg-muted text-muted-foreground border-border" },
};

export function BadgeCout({ niveau }: { niveau: NiveauGratuite }) {
  const { label, classe } = gratuite[niveau];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        classe,
      )}
    >
      {label}
    </span>
  );
}
