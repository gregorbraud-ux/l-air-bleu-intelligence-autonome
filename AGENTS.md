<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Consignes de contribution

- Ne jamais réécrire l'historique partagé (pas de force push, rebase ou amend de commits déjà poussés).
- Garder la branche principale fonctionnelle : `npm run typecheck`, `npm run lint` et `npm run build` doivent passer avant tout push.
- Aucun secret dans Git : `.env*` est ignoré, seul `.env.example` (valeurs fictives) est versionné.
- Les secrets serveur (`SUPABASE_SERVICE_ROLE_KEY`, `IA_API_KEY`, `EMAIL_API_KEY`, `VAPID_PRIVATE_KEY`) ne sont lus que dans du code serveur — pourquoi : éviter toute fuite vers le navigateur.
- Aucune dépendance propriétaire d'éditeur ou d'hébergeur — pourquoi : le dépôt doit se construire sur n'importe quelle machine.
- Les faits métier (identité, finances, SEO) vivent dans `src/lib/lair-bleu.ts` et `src/lib/seo-editorial.ts` — pourquoi : une seule source de vérité pour l'interface et les prompts IA.
- Session Supabase stockée en localStorage standard dans le client navigateur — pourquoi : portabilité hors éditeur.
