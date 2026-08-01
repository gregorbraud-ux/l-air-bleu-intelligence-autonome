import { z } from "zod";

export const alerteEnvoiSchema = z.object({
  id: z.string().min(1).max(64),
  concurrent: z.string().min(1).max(120),
  type: z.enum(["note", "prix", "visibilite", "nouveaute"]),
  titre: z.string().min(1).max(160),
  detail: z.string().min(1).max(600),
  variation: z.number(),
  gravite: z.enum(["critique", "importante", "info"]),
  date: z.string().min(1).max(64),
  source: z.string().url().max(500),
  sourceLabel: z.string().min(1).max(80),
});

export const abonnementSchema = z.object({
  endpoint: z.string().url().max(2000),
  p256dh: z.string().min(10).max(500),
  auth: z.string().min(4).max(500),
  libelle: z.string().max(160).optional(),
});