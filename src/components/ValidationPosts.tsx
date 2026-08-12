import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Check,
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Send,
  Sparkles,
  Trash2,
  Undo2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { canaux } from "@/lib/contenu.schema";
import {
  contenuDe,
  type ContenuPost,
  type MetaVersion,
  type PostValidation,
  type StatutValidation,
} from "@/lib/validation-posts";
import { verifierPost, type ContraintesConformite } from "@/lib/conformite-posts";
import { appliquerToutesCorrections, suggestionsPour } from "@/lib/corrections-posts";
import { diffPatch } from "@/lib/diff-texte";
import { DiffCorrection } from "@/components/DiffCorrection";
import { HistoriqueVersions } from "@/components/HistoriqueVersions";

const statutStyle: Record<StatutValidation, string> = {
  "à valider": "bg-chart-4/15 text-chart-4",
  approuvé: "bg-chart-1/15 text-chart-1",
  rejeté: "bg-destructive/15 text-destructive",
  publié: "bg-chart-2/15 text-chart-2",
};

const filtres: Array<StatutValidation | "tous"> = [
  "à valider",
  "approuvé",
  "rejeté",
  "publié",
  "tous",
];

type Props = {
  posts: PostValidation[];
  contraintes?: ContraintesConformite;
  onModifier: (id: string, patch: Partial<PostValidation>, meta?: MetaVersion) => void;
  onStatut: (id: string, statut: StatutValidation, meta?: MetaVersion) => void;
  onJournaliser?: (id: string, contenu: ContenuPost, meta: MetaVersion) => void;
  onSupprimer: (id: string) => void;
};

export function ValidationPosts({
  posts,
  contraintes,
  onModifier,
  onStatut,
  onJournaliser,
  onSupprimer,
}: Props) {
  const [filtre, setFiltre] = useState<StatutValidation | "tous">("à valider");
  const [edition, setEdition] = useState<string | null>(null);
  const [avantEdition, setAvantEdition] = useState<ContenuPost | null>(null);
  const [apercus, setApercus] = useState<string[]>([]);
  const [decision, setDecision] = useState<{ id: string; statut: "approuvé" | "rejeté" } | null>(null);
  const [commentaire, setCommentaire] = useState("");

  const ouvrirDecision = (id: string, statut: "approuvé" | "rejeté") => {
    setDecision({ id, statut });
    setCommentaire("");
  };

  const confirmerDecision = (post: PostValidation) => {
    if (!decision) return;
    const texte = commentaire.trim();
    if (decision.statut === "rejeté" && !texte) {
      toast.error("Ajoutez un commentaire expliquant le rejet.");
      return;
    }
    onStatut(post.id, decision.statut, {
      origine: "decision",
      decision: decision.statut,
      resume: decision.statut === "approuvé" ? "Post approuvé" : "Post rejeté",
      commentaire: texte || "Approuvé sans commentaire",
    });
    if (edition === post.id) fermerEdition(post);
    setDecision(null);
    setCommentaire("");
    toast.success(
      decision.statut === "approuvé"
        ? "Post approuvé et ajouté au calendrier éditorial."
        : "Post rejeté : il reste consultable dans la file « rejeté ».",
    );
  };

  const ouvrirEdition = (post: PostValidation) => {
    setAvantEdition(contenuDe(post));
    setEdition(post.id);
  };

  const fermerEdition = (post: PostValidation) => {
    if (avantEdition && onJournaliser) {
      const modifie = JSON.stringify(avantEdition) !== JSON.stringify(contenuDe(post));
      if (modifie) {
        onJournaliser(post.id, avantEdition, {
          origine: "edition",
          resume: "Édition manuelle avant renvoi en validation",
        });
      }
    }
    setAvantEdition(null);
    setEdition(null);
  };

  const basculerApercu = (cle: string) =>
    setApercus((prev) => (prev.includes(cle) ? prev.filter((c) => c !== cle) : [...prev, cle]));

  const visibles = filtre === "tous" ? posts : posts.filter((p) => p.statutValidation === filtre);
  const compte = (s: StatutValidation) => posts.filter((p) => p.statutValidation === s).length;

  const copier = async (post: PostValidation) => {
    const texte = `${post.legende}\n\n${post.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}`;
    try {
      await navigator.clipboard.writeText(texte);
      toast.success("Post copié, prêt à publier.");
    } catch {
      toast.error("Copie impossible sur cet appareil.");
    }
  };

  return (
    <section className="surface-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Validation des posts</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Éditez chaque idée, approuvez-la pour l'ajouter au calendrier, puis marquez-la comme publiée.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filtres.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filtre === f ? "default" : "secondary"}
              onClick={() => setFiltre(f)}
            >
              {f === "tous" ? `Tous (${posts.length})` : `${f} (${compte(f)})`}
            </Button>
          ))}
        </div>
      </div>

      {visibles.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
          Aucun post dans cette file. Générez un mois d'idées pour démarrer la validation.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {visibles.map((post) => {
            const enEdition = edition === post.id;
            const anomalies = contraintes ? verifierPost(post, contraintes) : [];
            const bloquant = anomalies.some((a) => a.gravite === "bloquant");
            const suggestions = contraintes ? suggestionsPour(post, contraintes) : [];
            return (
              <li key={post.id} className="rounded-xl border border-border/70 bg-secondary/40 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{post.titre}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {post.canal} · jour {post.jour} à {post.heure}
                      {post.angle ? ` · ${post.angle}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    {anomalies.length > 0 && (
                      <Badge
                        className={`border-0 ${bloquant ? "bg-destructive/15 text-destructive" : "bg-chart-4/15 text-chart-4"}`}
                      >
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {bloquant ? "Contraintes non respectées" : "À vérifier"}
                      </Badge>
                    )}
                    <Badge className={`border-0 ${statutStyle[post.statutValidation]}`}>
                      {post.statutValidation}
                    </Badge>
                  </div>
                </div>

                {anomalies.length > 0 && (
                  <ul className="mt-3 space-y-1 rounded-lg border border-border/60 bg-background/60 p-3 text-xs">
                    {anomalies.map((a) => (
                      <li
                        key={`${a.champ}-${a.message}`}
                        className={a.gravite === "bloquant" ? "text-destructive" : "text-muted-foreground"}
                      >
                        <span className="font-medium capitalize">{a.champ}</span> · {a.message}
                      </li>
                    ))}
                  </ul>
                )}

                {suggestions.length > 0 && contraintes && (
                  <div className="mt-3 rounded-lg border border-primary/25 bg-primary/5 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        Corrections suggérées ({suggestions.length})
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => basculerApercu(`${post.id}-global`)}
                      >
                        {apercus.includes(`${post.id}-global`) ? (
                          <>
                            <EyeOff className="mr-1.5 h-3.5 w-3.5" /> Masquer l'aperçu global
                          </>
                        ) : (
                          <>
                            <Eye className="mr-1.5 h-3.5 w-3.5" /> Aperçu global
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          const { post: corrige, appliquees } = appliquerToutesCorrections(post, contraintes);
                          if (!appliquees.length) return;
                          const libelles = suggestions
                            .filter((s) => appliquees.includes(s.id))
                            .map((s) => s.titre);
                          onModifier(post.id, corrige, {
                            origine: "correction",
                            corrections: libelles.length ? libelles : appliquees,
                            resume: `${appliquees.length} correction(s) appliquée(s)`,
                          });
                          setApercus((prev) => prev.filter((c) => !c.startsWith(`${post.id}-`)));
                          toast.success(`${appliquees.length} correction(s) appliquée(s).`);
                        }}
                      >
                        <Wand2 className="mr-2 h-3.5 w-3.5" /> Tout corriger
                      </Button>
                    </div>
                    {apercus.includes(`${post.id}-global`) && (
                      <div className="mt-2.5">
                        <DiffCorrection
                          diffs={diffPatch(post, appliquerToutesCorrections(post, contraintes).post)}
                        />
                      </div>
                    )}
                    <ul className="mt-2.5 space-y-2">
                      {suggestions.map((s) => {
                        const cle = `${post.id}-${s.id}`;
                        const ouvert = apercus.includes(cle);
                        const diffs = ouvert ? diffPatch(post, s.patch) : [];
                        return (
                        <li key={s.id} className="space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-medium">
                              {s.titre}
                              <span
                                className={`ml-2 rounded px-1.5 py-0.5 text-[10px] uppercase ${
                                  s.gravite === "bloquant"
                                    ? "bg-destructive/15 text-destructive"
                                    : "bg-chart-4/15 text-chart-4"
                                }`}
                              >
                                {s.champ}
                              </span>
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{s.detail}</p>
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-1.5">
                          <Button size="sm" variant="ghost" onClick={() => basculerApercu(cle)}>
                            {ouvert ? (
                              <>
                                <EyeOff className="mr-1.5 h-3.5 w-3.5" /> Masquer le diff
                              </>
                            ) : (
                              <>
                                <Eye className="mr-1.5 h-3.5 w-3.5" /> Avant / après
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              onModifier(post.id, s.patch, {
                                origine: "correction",
                                corrections: [s.titre],
                                resume: `Correction « ${s.champ} »`,
                              });
                              setApercus((prev) => prev.filter((c) => c !== cle));
                              toast.success("Correction appliquée.");
                            }}
                          >
                            Appliquer
                          </Button>
                          </div>
                        </div>
                        {ouvert && <DiffCorrection diffs={diffs} />}
                        </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {enEdition ? (
                  <div className="mt-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Input
                        value={post.titre}
                        onChange={(e) => onModifier(post.id, { titre: e.target.value })}
                        placeholder="Titre"
                        className="sm:col-span-3"
                      />
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        value={post.jour}
                        onChange={(e) =>
                          onModifier(post.id, {
                            jour: Math.min(31, Math.max(1, Number(e.target.value) || 1)),
                          })
                        }
                      />
                      <Input
                        value={post.heure}
                        onChange={(e) => onModifier(post.id, { heure: e.target.value })}
                        placeholder="09:00"
                      />
                      <Select
                        value={post.canal}
                        onValueChange={(v) => onModifier(post.id, { canal: v as PostValidation["canal"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {canaux.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      value={post.accroche}
                      onChange={(e) => onModifier(post.id, { accroche: e.target.value })}
                      placeholder="Accroche"
                    />
                    <Textarea
                      rows={9}
                      value={post.legende}
                      onChange={(e) => onModifier(post.id, { legende: e.target.value })}
                      placeholder="Caption complète prête à publier"
                    />
                    <Input
                      value={post.cta}
                      onChange={(e) => onModifier(post.id, { cta: e.target.value })}
                      placeholder="Appel à l'action"
                    />
                    <Input
                      value={post.hashtags.join(" ")}
                      onChange={(e) =>
                        onModifier(post.id, {
                          hashtags: e.target.value
                            .split(/[\s,]+/)
                            .filter(Boolean)
                            .map((h) => (h.startsWith("#") ? h : `#${h}`)),
                        })
                      }
                      placeholder="#hashtags"
                    />
                  </div>
                ) : (
                  <>
                    {post.accroche && <p className="mt-3 text-sm font-medium">{post.accroche}</p>}
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{post.legende}</p>
                    {post.hashtags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {post.hashtags.map((h) => (
                          <Badge key={h} variant="secondary">
                            {h.startsWith("#") ? h : `#${h}`}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {post.cta && (
                      <p className="mt-3 text-sm">
                        <span className="font-medium">Appel à l'action :</span> {post.cta}
                      </p>
                    )}
                  </>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={enEdition ? "default" : "secondary"}
                    onClick={() => (enEdition ? fermerEdition(post) : ouvrirEdition(post))}
                  >
                    {enEdition ? (
                      <>
                        <Check className="mr-2 h-3.5 w-3.5" /> Terminer l'édition
                      </>
                    ) : (
                      <>
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Éditer
                      </>
                    )}
                  </Button>

                  {post.statutValidation === "à valider" && (
                    <Button
                      size="sm"
                      variant={bloquant ? "secondary" : "default"}
                      onClick={() => {
                        if (bloquant) {
                          toast.error(
                            "Ce post ne respecte pas vos contraintes : corrigez les points signalés avant de l'approuver.",
                            contraintes
                              ? {
                                  action: {
                                    label: "Corriger",
                                    onClick: () => {
                                      const { post: corrige, appliquees } = appliquerToutesCorrections(post, contraintes, {
                                        seulementBloquants: true,
                                      });
                                      const libelles = suggestions
                                        .filter((s) => appliquees.includes(s.id))
                                        .map((s) => s.titre);
                                      onModifier(post.id, corrige, {
                                        origine: "correction",
                                        corrections: libelles.length ? libelles : appliquees,
                                        resume: "Corrections bloquantes",
                                      });
                                      toast.success("Corrections bloquantes appliquées.");
                                    },
                                  },
                                }
                              : undefined,
                          );
                          setEdition(post.id);
                          return;
                        }
                        ouvrirDecision(post.id, "approuvé");
                      }}
                    >
                      <Check className="mr-2 h-3.5 w-3.5" /> Approuver
                    </Button>
                  )}

                  {post.statutValidation !== "rejeté" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => ouvrirDecision(post.id, "rejeté")}
                    >
                      <X className="mr-2 h-3.5 w-3.5" /> Rejeter
                    </Button>
                  )}

                  {post.statutValidation === "rejeté" && (
                    <Button
                      size="sm"
                      onClick={() =>
                        onStatut(post.id, "à valider", {
                          origine: "statut",
                          resume: "Post repris après rejet",
                        })
                      }
                    >
                      <Undo2 className="mr-2 h-3.5 w-3.5" /> Reprendre en validation
                    </Button>
                  )}

                  {post.statutValidation === "approuvé" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          onStatut(post.id, "publié");
                          toast.success("Post marqué comme publié.");
                        }}
                      >
                        <Send className="mr-2 h-3.5 w-3.5" /> Marquer publié
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          onStatut(post.id, "à valider", {
                            origine: "statut",
                            resume: "Post renvoyé pour validation",
                          })
                        }
                      >
                        <Undo2 className="mr-2 h-3.5 w-3.5" /> Renvoyer en revue
                      </Button>
                    </>
                  )}

                  {post.statutValidation === "publié" && (
                    <Button size="sm" variant="ghost" onClick={() => onStatut(post.id, "approuvé")}>
                      <Undo2 className="mr-2 h-3.5 w-3.5" /> Repasser en approuvé
                    </Button>
                  )}

                  <Button size="sm" variant="secondary" onClick={() => copier(post)}>
                    <Copy className="mr-2 h-3.5 w-3.5" /> Copier
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => {
                      onSupprimer(post.id);
                      toast.success("Idée supprimée.");
                    }}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Supprimer
                  </Button>
                </div>
                {post.source && (
                  <p className="mt-3 text-xs text-muted-foreground">Inspiré de : {post.source}</p>
                )}

                {decision?.id === post.id && (
                  <div className="mt-3 rounded-lg border border-border/60 bg-background/60 p-3">
                    <p className="text-xs font-semibold">
                      {decision.statut === "approuvé"
                        ? "Commentaire d'approbation (optionnel)"
                        : "Motif du rejet (obligatoire)"}
                    </p>
                    <Textarea
                      rows={3}
                      className="mt-2"
                      value={commentaire}
                      onChange={(e) => setCommentaire(e.target.value)}
                      placeholder={
                        decision.statut === "approuvé"
                          ? "Ex. : accroche validée, publier avant 9 h."
                          : "Ex. : ton trop commercial, ne correspond pas à l'offre du midi."
                      }
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={decision.statut === "rejeté" ? "destructive" : "default"}
                        onClick={() => confirmerDecision(post)}
                      >
                        {decision.statut === "approuvé" ? (
                          <>
                            <Check className="mr-2 h-3.5 w-3.5" /> Confirmer l'approbation
                          </>
                        ) : (
                          <>
                            <X className="mr-2 h-3.5 w-3.5" /> Confirmer le rejet
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDecision(null)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}

                {post.commentaireDecision && decision?.id !== post.id && (
                  <p className="mt-3 flex gap-1.5 rounded-md border border-border/60 bg-secondary/40 p-2 text-xs text-muted-foreground">
                    <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="whitespace-pre-line">{post.commentaireDecision}</span>
                  </p>
                )}

                <HistoriqueVersions
                  post={post}
                  onRestaurer={(v) => {
                    onModifier(post.id, v.contenu, {
                      origine: "edition",
                      resume: `Restauration de la version v${v.numero}`,
                    });
                    toast.success(`Version v${v.numero} restaurée.`);
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
