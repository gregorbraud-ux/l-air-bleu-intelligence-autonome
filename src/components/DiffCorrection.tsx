import { ArrowRight } from "lucide-react";
import { libelleChamp, type ChampDiff } from "@/lib/diff-texte";

type Props = { diffs: ChampDiff[] };

/** Aperçu « avant / après » avec surlignage des mots retirés et ajoutés. */
export function DiffCorrection({ diffs }: Props) {
  if (diffs.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/70 bg-background/60 p-3 text-xs text-muted-foreground">
        Cette correction ne modifie aucun texte.
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {diffs.map((d) => (
        <div key={d.champ} className="rounded-lg border border-border/60 bg-background/70 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {libelleChamp(d.champ)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {d.avant.length} <ArrowRight className="mx-0.5 inline h-3 w-3" /> {d.apres.length}{" "}
              car.
              <span
                className={
                  d.delta === 0 ? "" : d.delta > 0 ? "ml-1 text-chart-1" : "ml-1 text-chart-4"
                }
              >
                {d.delta > 0 ? `(+${d.delta})` : d.delta < 0 ? `(${d.delta})` : ""}
              </span>
            </p>
          </div>

          <p className="mt-2 whitespace-pre-line text-xs leading-relaxed">
            {d.segments.map((s, i) => (
              <span
                key={`${d.champ}-${i}`}
                className={
                  s.type === "retrait"
                    ? "rounded bg-destructive/15 text-destructive line-through decoration-destructive/60"
                    : s.type === "ajout"
                      ? "rounded bg-success/15 text-success"
                      : "text-muted-foreground"
                }
              >
                {s.texte}
              </span>
            ))}
          </p>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="rounded-md border border-border/60 p-2">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Avant</p>
              <p className="mt-1 whitespace-pre-line text-xs leading-relaxed">{d.avant || "—"}</p>
            </div>
            <div className="rounded-md border border-primary/30 bg-primary/5 p-2">
              <p className="text-[10px] font-semibold uppercase text-primary">Après</p>
              <p className="mt-1 whitespace-pre-line text-xs leading-relaxed">{d.apres || "—"}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
