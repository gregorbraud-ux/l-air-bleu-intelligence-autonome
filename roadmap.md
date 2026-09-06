# Roadmap — L'Air Bleu Intelligence (autonomie)

- [x] E-mail : plus aucun paquet propriétaire au runtime (envoyerEmail + appel HTTP de repli)
- [x] Auth : Supabase Auth natif en production, connecteur d'aperçu isolé (src/lib/auth-oauth.ts)
- [x] Vite : @lovable.dev/vite-tanstack-config conservé comme outillage de build, documenté dans le README
- [x] Suppression de lovable-error-reporting ; src/integrations/lovable uniquement en import dynamique d'aperçu
- [x] package.json : @lovable.dev/email-js retiré
- [x] Chiffres officiels conservés (492 781,72 € ; -9 192,13 € ; 495 800 € provisoire, août 27 800 €)
- [x] typecheck + lint (--fix) + build + vérification mobile 390 px sans erreur console
- [x] README et variables d'environnement documentés
- [ ] Secrets VAPID (public/privé/subject) : à saisir par l'utilisateur dans Réglages du projet → Secrets
