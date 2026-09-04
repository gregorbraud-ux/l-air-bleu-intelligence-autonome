import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, History, MessageSquare, Undo2, Wand2 } from "lucide-react";
import { diffPatch } from "@/lib/diff-texte";
import { DiffCorrection } from "@/components/DiffCorrection";
import { contenuDe, type PostValidation, type VersionPost } from "@/lib/validation-posts";

type Props = {
  post: PostValidation;
  onRestaurer?: (version: VersionPost) => void;
};

const libelleOrigine: Record<VersionPost["origine"], string> = {
  correction: "Corrections appliquées",
  edition: "Édition manuelle",
  statut: "Renvoi pour validation",
  decision: "Décision de validation",
};

function dateCourte(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Historique des versions d'un post : chaque renvoi en validation et ses corrections. */
export function HistoriqueVersions({ post, onRestaurer }: Props) {
  const versions = post.versions ?? [];
  const [ouvert, setOuvert] = useState(false);
  const [diffs, setDiffs] = useState<number[]>([]);

  if (versions.length === 0) return null;

  const basculerDiff = (numero: number) =>
    setDiffs((prev) =>
      prev.includes(numero) ? prev.filter((n) => n !== numero) : [...prev, numero],
    );

  const ordonnees = [...versions].sort((a, b) => b.numero - a.numero);

  return (
    <div className="mt-3 rounded-lg border border-border/60 bg-background/60 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold">
          <History className="h-3.5 w-3.5 text-primary" />
          Historique des versions
          <Badge variant="secondary" className="ml-1">
            v{versions.length + 1} actuelle
          </Badge>
        </p>
        <Button size="sm" variant="ghost" onClick={() => setOuvert((o) => !o)}>
          {ouvert ? (
            <>
              <EyeOff className="mr-1.5 h-3.5 w-3.5" /> Masquer
            </>
          ) : (
            <>
              <Eye className="mr-1.5 h-3.5 w-3.5" /> Voir les {versions.length} version(s)
            </>
          )}
        </Button>
      </div>

      {ouvert && (
        <ol className="mt-3 space-y-2.5">
          {ordonnees.map((v) => {
            // Contenu qui a succédé à cette version : version suivante, sinon état actuel.
            const suivante = versions.find((x) => x.numero === v.numero + 1);
            const apres = suivante ? suivante.contenu : contenuDe(post);
            const detail = diffs.includes(v.numero);
            return (
              <li key={v.numero} className="rounded-lg border border-border/60 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium">
                      v{v.numero} → v{v.numero + 1} · {libelleOrigine[v.origine]}
                      {v.decision ? ` · ${v.decision}` : ""}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {dateCourte(v.le)} · statut à ce moment : {v.statut}
                      {v.resume ? ` · ${v.resume}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => basculerDiff(v.numero)}>
                      {detail ? (
                        <>
                          <EyeOff className="mr-1.5 h-3.5 w-3.5" /> Masquer le diff
                        </>
                      ) : (
                        <>
                          <Eye className="mr-1.5 h-3.5 w-3.5" /> Avant / après
                        </>
                      )}
                    </Button>
                    {onRestaurer && (
                      <Button size="sm" variant="secondary" onClick={() => onRestaurer(v)}>
                        <Undo2 className="mr-1.5 h-3.5 w-3.5" /> Restaurer
                      </Button>
                    )}
                  </div>
                </div>

                {v.corrections.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {v.corrections.map((c) => (
                      <Badge key={c} variant="outline" className="text-[10px]">
                        <Wand2 className="mr-1 h-3 w-3" /> {c}
                      </Badge>
                    ))}
                  </div>
                )}

                {v.commentaire && (
                  <p className="mt-2 flex gap-1.5 rounded-md border border-border/60 bg-secondary/40 p-2 text-[11px] text-muted-foreground">
                    <MessageSquare className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                    <span className="whitespace-pre-line">{v.commentaire}</span>
                  </p>
                )}

                {detail && (
                  <div className="mt-2.5">
                    <DiffCorrection diffs={diffPatch({ ...post, ...v.contenu }, apres)} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
