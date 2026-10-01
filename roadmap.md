# Roadmap — L'Air Bleu Intelligence (indépendance)

## Réellement indépendant
- [x] Aucun paquet `@lovable.dev/*` dans package.json ni bun.lock ; package-lock.json obsolète supprimé
- [x] Vite : configuration standard (TanStack Start, React, Tailwind, tsconfig-paths)
- [x] Auth : Supabase Auth natif, session en localStorage standard (plus de broker d'aperçu)
- [x] E-mail et IA : fournisseurs génériques configurés par variables serveur, sinon « NON CONFIGURÉ »
- [x] Fichiers .lovable/project.json, previewAuthStorage.ts, cron-auth.ts supprimés
- [x] .gitignore protège .env* ; .env.example sans secret
- [x] Source de vérité SEO (src/lib/seo-editorial.ts) injectée dans les prompts IA
- [x] Chiffres conservés (492 781,72 € ; -9 192,13 € ; 495 800 € provisoire, août 27 800 €)

## Reste à faire
- [ ] Clés VAPID, IA, e-mail, Google Places : à fournir par l'utilisateur dans l'environnement
- [ ] Création du dépôt GitHub source de vérité et premier commit (hors de cet éditeur)
- [ ] Emballage iOS/Android via Capacitor (non commencé)
