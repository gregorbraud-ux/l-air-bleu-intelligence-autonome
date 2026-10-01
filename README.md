# L'Air Bleu Intelligence

Application web PWA de pilotage marketing, financier et concurrentiel du restaurant
**L'Air Bleu** (SARL LG AIR — 3 rue Anatole France, 44550 Montoir-de-Bretagne — 02 40 90 01 17).

> L'Air Bleu — entre les deux rives, une bonne adresse pour déjeuner.

## Installation locale

```sh
git clone <depot> && cd <depot>
cp .env.example .env      # puis renseigner les valeurs
npm install
npm run dev               # http://localhost:8080
npm run typecheck
npm run lint
npm run build             # sortie dist/ (client + serveur)
```

## Stack

TanStack Start (React 19, Vite, SSR + fonctions serveur), Supabase (base, Auth, RLS),
Tailwind CSS v4, shadcn/ui. Aucune dépendance propriétaire d'éditeur.

## Variables d'environnement

Voir `.env.example`. Le fichier `.env` n'est jamais versionné.

| Variable | Portée | Obligatoire |
| --- | --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | navigateur (publiques) | oui |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | serveur | oui |
| `SUPABASE_SERVICE_ROLE_KEY` | serveur, secret | oui (admin) |
| `IA_API_URL`, `IA_API_KEY`, `IA_MODELE` | serveur | non — sinon « IA NON CONFIGURÉE » |
| `EMAIL_API_URL`, `EMAIL_API_KEY`, `EMAIL_FROM` | serveur | non — envoi désactivé |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | serveur | non — push désactivé |
| `GOOGLE_PLACES_API_KEY` | serveur | non — avis « NON CONNECTÉ » |

Seules les variables `VITE_*` (publiques) atteignent le navigateur.

## Supabase Auth

E-mail/mot de passe et Google via Supabase Auth natif ; session stockée en localStorage.
Activer le provider Google et déclarer `<domaine>/auth` comme URL de redirection.
Appliquer les migrations de `supabase/migrations` et vérifier que RLS est actif.

## Déploiement indépendant

`npm run build`, puis déployer `dist/` sur tout hébergeur Node/serverless
(Cloudflare Workers, Vercel, Netlify, VPS). Les secrets se configurent chez l'hébergeur.

## PWA

Manifeste `public/manifest.webmanifest`, service worker `public/sw.js`, notifications Web Push (VAPID).

## Mobile iOS/Android (prévu)

Une seule base de code : la PWA sera emballée avec Capacitor (`@capacitor/ios`, `@capacitor/android`)
en pointant sur le build web. Pas de codebase native séparée.

## Source de vérité métier

- `src/lib/lair-bleu.ts` : identité, finances (officiel 2024/25 : CA 492 781,72 €, résultat -9 192,13 € ;
  2025/26 PROVISOIRE : 495 800 €, août 27 800 €, à confirmer par le bilan 2026).
- `src/lib/seo-editorial.ts` : positionnement SEO ; donnée inconnue = « non disponible ».

## Lovable

Lovable peut servir d'éditeur facultatif. Le projet n'en dépend ni pour le build ni au runtime.
