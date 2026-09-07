# L'Air Bleu Intelligence (AirBleu AI)

Application web PWA de pilotage marketing, financier et concurrentiel du restaurant
**L'Air Bleu** (SARL LG AIR — 3 rue Anatole France, 44550 Montoir-de-Bretagne — 02 40 90 01 17).

## Indépendance

Le projet s'installe, se lance et se déploie **hors de toute plateforme d'édition** :
plus aucun paquet propriétaire n'est présent dans `package.json`, la configuration Vite
est 100 % standard et aucun service tiers n'est requis au runtime.

```sh
npm install       # ou bun install
npm run dev       # http://localhost:8080
npm run typecheck
npm run lint
npm run build     # sortie dist/ (client + serveur)
```

## Stack

- TanStack Start (React 19, Vite) — SSR + fonctions serveur
- Supabase (base de données, authentification, RLS)
- Tailwind CSS v4, shadcn/ui
- PWA : manifeste + service worker (`public/sw.js`) et notifications Web Push (VAPID)

## Variables d'environnement

### Obligatoires (base de données + authentification)

| Variable | Portée | Rôle |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | navigateur | URL du projet Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | navigateur | clé publique (jamais secrète) |
| `SUPABASE_URL` | serveur | URL du projet Supabase |
| `SUPABASE_PUBLISHABLE_KEY` | serveur | clé publique |
| `SUPABASE_SERVICE_ROLE_KEY` | serveur | opérations d'administration (jamais exposée) |

### Facultatives — chaque service absent est affiché comme NON CONFIGURÉ

| Service | Variables | Sans configuration |
| --- | --- | --- |
| Génération IA (endpoint compatible OpenAI, y compris serveur local) | `IA_API_URL`, `IA_API_KEY`, `IA_MODELE` | « IA NON CONFIGURÉE », aucun texte simulé |
| E-mails d'alerte (Resend, Postmark, Brevo… toute API HTTP) | `EMAIL_API_URL`, `EMAIL_API_KEY`, `EMAIL_FROM` | envoi désactivé proprement |
| Notifications push Web Push | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | push désactivé |
| Avis Google (Places API, payant) | `GOOGLE_PLACES_API_KEY` | module « NON CONNECTÉ » |

Aucune clé secrète n'est envoyée au navigateur : seules les variables `VITE_SUPABASE_*`
publiques sont exposées côté client.

## Authentification

- Production **et** développement : Supabase Auth natif (e-mail/mot de passe + Google).
- Activer le provider Google dans Supabase Auth et déclarer l'URL de redirection `<domaine>/auth`.
- Dans un aperçu affiché en iframe, la page d'autorisation Google s'ouvre dans un nouvel
  onglet (la redirection en iframe est bloquée par les navigateurs). Aucun connecteur
  propriétaire n'est utilisé : le confort d'aperçu intégré est volontairement abandonné
  au profit de l'indépendance technique.

## Chiffres de référence

- Exercice clos 31/08/2025 — **OFFICIEL** : CA 492 781,72 € ; résultat net -9 192,13 €
- Exercice 2025/2026 — **PROVISOIRE** au 31/08/2026 : CA 495 800 € (août clôturé à 27 800 €),
  à confirmer par le bilan 2026
- Les anciennes projections ne subsistent qu'en historique marqué OBSOLÈTE.

## Déploiement

1. Créer un projet Supabase (ou auto-héberger), appliquer les migrations de `supabase/migrations`
   puis vérifier que RLS est actif sur toutes les tables `app_*`.
2. Renseigner les variables ci-dessus (secrets uniquement côté serveur).
3. `npm run build`, puis déployer `dist/` sur n'importe quel hébergeur Node/serverless
   (Cloudflare Workers, Vercel, Netlify, VPS).

Le dossier `.lovable/` ne contient que des métadonnées d'éditeur et n'intervient pas dans le build.
