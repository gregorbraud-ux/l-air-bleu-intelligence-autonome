import { Ban, RotateCcw, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { canaux } from "@/lib/contenu.schema";
import {
  nombreDePosts,
  themesDisponibles,
  tonsDisponibles,
  type Canal,
  type StrategieIA,
} from "@/lib/strategie-ia";

const moisDisponibles = [
  "Août 2026",
  "Septembre 2026",
  "Octobre 2026",
  "Novembre 2026",
  "Décembre 2026",
  "Janvier 2027",
];

type Props = {
  strategie: StrategieIA;
  onMaj: (patch: Partial<StrategieIA>) => void;
  onBasculerPlateforme: (canal: Canal) => void;
  onBasculerTheme: (theme: string) => void;
  onReinitialiser: () => void;
};

export function StrategieIAPanneau({
  strategie,
  onMaj,
  onBasculerPlateforme,
  onBasculerTheme,
  onReinitialiser,
}: Props) {
  return (
    <div className="mt-5 space-y-6 rounded-xl border border-border/70 bg-secondary/30 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Target className="h-4 w-4 text-primary" /> Paramètres de stratégie IA
        </p>
        <Button variant="ghost" size="sm" onClick={onReinitialiser}>
          <RotateCcw className="mr-2 h-3.5 w-3.5" /> Réinitialiser
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Ton éditorial</Label>
          <Select value={strategie.ton} onValueChange={(v) => onMaj({ ton: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tonsDisponibles.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Période — mois</Label>
          <Select value={strategie.mois} onValueChange={(v) => onMaj({ mois: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {moisDisponibles.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Fréquence : {strategie.frequenceParSemaine} publication(s) / semaine</Label>
          <Slider
            min={1}
            max={7}
            step={1}
            value={[strategie.frequenceParSemaine]}
            onValueChange={(v) => onMaj({ frequenceParSemaine: v[0] })}
          />
          <p className="text-xs text-muted-foreground">
            Soit {nombreDePosts(strategie)} publications sur la période sélectionnée.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="jourDebut">Du jour</Label>
            <Input
              id="jourDebut"
              type="number"
              min={1}
              max={31}
              value={strategie.jourDebut}
              onChange={(e) =>
                onMaj({ jourDebut: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jourFin">Au jour</Label>
            <Input
              id="jourFin"
              type="number"
              min={1}
              max={31}
              value={strategie.jourFin}
              onChange={(e) =>
                onMaj({ jourFin: Math.min(31, Math.max(1, Number(e.target.value) || 31)) })
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Plateformes cibles</Label>
        <div className="flex flex-wrap gap-2">
          {canaux.map((c) => {
            const actif = strategie.plateformes.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => onBasculerPlateforme(c)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  actif
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
        {strategie.plateformes.length === 0 && (
          <p className="text-xs text-destructive">Sélectionnez au moins une plateforme.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Thèmes prioritaires</Label>
        <div className="flex flex-wrap gap-2">
          {themesDisponibles.map((t) => {
            const actif = strategie.themes.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => onBasculerTheme(t)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  actif
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="motsInterdits" className="flex items-center gap-2">
          <Ban className="h-3.5 w-3.5 text-muted-foreground" /> Mots interdits (séparés par des
          virgules)
        </Label>
        <Input
          id="motsInterdits"
          value={strategie.motsInterdits.join(", ")}
          placeholder="promo choc, pas cher, fast-food"
          onChange={(e) =>
            onMaj({
              motsInterdits: e.target.value
                .split(",")
                .map((m) => m.trim())
                .filter(Boolean)
                .slice(0, 30),
            })
          }
        />
        <div className="flex flex-wrap gap-1.5">
          {strategie.motsInterdits.map((m) => (
            <Badge key={m} variant="secondary">
              {m}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
