# L'Air Bleu Intelligence (AirBleu AI)

Application web PWA de pilotage marketing, financier et concurrentiel du restaurant
**L'Air Bleu** (SARL LG AIR — 3 rue Anatole France, 44550 Montoir-de-Bretagne — 02 40 90 01 17).

## Stack

- TanStack Start (React 19, Vite 7) — SSR + fonctions serveur
- Supabase (base de données, authentification, RLS)
- Tailwind CSS v4, shadcn/ui
- PWA : manifeste + service worker (`public/sw.js`) et notifications Web Push (VAPID)

## Fonctionnement autonome

L'application n'a besoin d'aucun service propriétaire pour tourner :

| Brique | Autonome | Variables d'environnement |
| --- | --- | --- |
| Base de données / Auth | oui (Supabase self-host ou hébergé) | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` |
| Connexion Google | oui — Supabase Auth natif (`signInWithOAuth`) | provider Google activé dans Supabase Auth |
| Notifications push | oui — Web Push VAPID | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` |
| E-mails d'alerte | oui — n'importe quelle API HTTP (Resend, Postmark, Brevo…) | `EMAIL_API_URL`, `EMAIL_API_KEY`, `EMAIL_FROM` |
| Génération IA | oui — n'importe quel endpoint compatible OpenAI | `IA_API_URL`, `IA_API_KEY`, `IA_MODELE` |
| Avis Google | non connecté par défaut | `GOOGLE_PLACES_API_KEY` (facultatif, payant) |

Sans identifiants, les modules concernés s'affichent explicitement comme **NON CONNECTÉ** :
aucune donnée fictive n'est présentée comme réelle.

### Dépendances restant liées à la plateforme Lovable

- `@lovable.dev/vite-tanstack-config` : **outillage de build uniquement** (devDependency).
  Il regroupe les plugins TanStack Start / React / Tailwind / Nitro et la détection du
  bac à sable. Le remplacer par une configuration Vite manuelle est possible mais casse
  actuellement la cible de build serverless du projet : il est donc conservé comme outil,
  et aucun code applicatif ne l'importe.
- `@lovable.dev/cloud-auth-js` : chargé **dynamiquement et uniquement dans l'aperçu de
  l'éditeur** (`src/lib/auth-oauth.ts`). En production, la connexion Google passe par
  Supabase Auth natif ; ce paquet n'est jamais évalué.
- `LOVABLE_API_KEY` : utilisé seulement comme repli gratuit pour l'IA et l'e-mail lorsque
  aucun fournisseur externe n'est configuré. Renseigner `IA_API_*` / `EMAIL_API_*` rend
  l'application totalement indépendante.

## Chiffres de référence

- Exercice clos 31/08/2025 — **OFFICIEL** : CA 492 781,72 € ; résultat net -9 192,13 €
- Exercice 2025/2026 — **PROVISOIRE** au 31/08/2026 : CA 495 800 € (août clôturé à 27 800 €),
  à confirmer par le bilan 2026

## Développement

```sh
npm i
npm run dev      # http://localhost:8080
npm run lint
npm run build
```
