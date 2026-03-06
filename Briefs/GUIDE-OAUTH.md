# Guide OAuth — Google + GitHub

L'app supporte Google et GitHub OAuth via NextAuth.js v5.
Les boutons de connexion n'apparaissent que si les variables d'environnement correspondantes sont definies.

## 1. Google OAuth

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Creer un projet (ou selectionner un existant)
3. Aller dans **APIs & Services > Credentials**
4. Cliquer **Create Credentials > OAuth client ID**
5. Type : **Web application**
6. **Authorized JavaScript origins** : `https://<TON_DOMAINE>`
7. **Authorized redirect URIs** : `https://<TON_DOMAINE>/api/auth/callback/google`
8. Copier le **Client ID** et le **Client Secret**

## 2. GitHub OAuth

1. Aller sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Cliquer **New OAuth App**
3. **Application name** : `La Tronconneuse` (ou autre)
4. **Homepage URL** : `https://<TON_DOMAINE>`
5. **Authorization callback URL** : `https://<TON_DOMAINE>/api/auth/callback/github`
6. Copier le **Client ID** et generer un **Client Secret**

## 3. Variables d'environnement (Coolify)

Ajouter ces 5 variables dans les settings de l'app Coolify :

| Variable               | Valeur                          |
|------------------------|---------------------------------|
| `GOOGLE_CLIENT_ID`     | Client ID Google                |
| `GOOGLE_CLIENT_SECRET` | Client Secret Google            |
| `GITHUB_ID`            | Client ID GitHub                |
| `GITHUB_SECRET`        | Client Secret GitHub            |
| `AUTH_SECRET`          | (generer avec `openssl rand -base64 32`) |

> **Note** : `AUTH_SECRET` est obligatoire pour NextAuth en production.
> Si deja configure, pas besoin de le regenerer.

## 4. Redeployer

Apres avoir ajoute les variables, redeployer l'app depuis Coolify.
Les boutons Google/GitHub n'apparaitront dans `/profile` que si les variables correspondantes sont definies.

## Rappel technique

- Les providers sont conditionnels dans `src/auth.ts` (pas d'erreur si les vars manquent)
- Les flags client `NEXT_PUBLIC_AUTH_GOOGLE` / `NEXT_PUBLIC_AUTH_GITHUB` sont generes dans `next.config.ts`
- Les boutons dans `src/app/profile/page.tsx` sont affiches conditionnellement via ces flags
