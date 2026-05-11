# 🚒 Anthony Modding

Site officiel d'Anthony Modding - Créateur de véhicules FiveM premium.

![Anthony Modding](public/images/logo.png)

## 🌟 Fonctionnalités

- **Page d'accueil** - Présentation immersive avec animations
- **Boutique** - Catalogue des véhicules avec filtres et recherche
- **Équipe** - Présentation de l'équipe
- **Partenaires** - Liste des partenaires officiels
- **Contact** - Formulaire avec webhook Discord
- **Panel Admin** - Gestion des commandes (accès restreint par Discord ID)

## 🛠️ Technologies

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Auth**: NextAuth.js avec Discord OAuth
- **Database**: PostgreSQL avec Prisma
- **Déploiement**: Vercel

## 🚀 Installation

### Prérequis

- Node.js 18+
- PostgreSQL (optionnel pour le mode démo)
- Compte Discord Developer (pour l'auth admin)

### Étapes

1. **Cloner le repository**
   ```bash
   git clone https://github.com/votre-repo/anthonymodding.git
   cd anthonymodding
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   
   Remplissez le fichier `.env` avec vos valeurs :
   ```env
   # Base de données (optionnel en dev)
   DATABASE_URL="postgresql://user:password@localhost:5432/anthonymodding"
   
   # Discord OAuth
   DISCORD_CLIENT_ID="votre_client_id"
   DISCORD_CLIENT_SECRET="votre_client_secret"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="votre_secret_genere"
   
   # Webhook Discord pour les contacts
   DISCORD_CONTACT_WEBHOOK="https://discord.com/api/webhooks/..."
   ```

4. **Initialiser Prisma** (si vous utilisez la BDD)
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Lancer en développement**
   ```bash
   npm run dev
   ```

## 📁 Structure du projet

```
anthonymodding/
├── prisma/
│   └── schema.prisma       # Schéma de la base de données
├── public/
│   └── images/             # Images statiques
├── src/
│   ├── app/
│   │   ├── admin/          # Panel administrateur
│   │   ├── api/            # Routes API
│   │   ├── boutique/       # Page boutique
│   │   ├── contact/        # Page contact
│   │   ├── equipe/         # Page équipe
│   │   ├── partenaires/    # Page partenaires
│   │   ├── globals.css     # Styles globaux
│   │   ├── layout.tsx      # Layout principal
│   │   └── page.tsx        # Page d'accueil
│   ├── components/         # Composants React
│   ├── lib/                # Utilitaires et config
│   └── types/              # Types TypeScript
├── .env.example            # Template des variables d'env
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🔐 Configuration Discord OAuth

1. Allez sur le [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez une nouvelle application
3. Dans "OAuth2", ajoutez les redirects :
   - `http://localhost:3000/api/auth/callback/discord` (dev)
   - `https://anthonymodding.fr/api/auth/callback/discord` (prod)
4. Copiez le Client ID et Client Secret dans votre `.env`

## 👮 Administrateurs

Les IDs Discord des administrateurs sont configurés dans `src/lib/config.ts` :

```typescript
adminDiscordIds: [
  "723590393199067137",   // Anthony
  "1013453258452377731",  // Admin 2
  "697183808608403487"    // Admin 3
]
```

## 🚀 Déploiement sur Vercel

1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement dans Vercel
3. Déployez !

## 📝 Webhook Contact

Le formulaire de contact envoie automatiquement les messages sur Discord via webhook.

Pour configurer :
1. Créez un webhook dans le salon Discord souhaité (ID: 1456306682576638055)
2. Copiez l'URL du webhook dans `DISCORD_CONTACT_WEBHOOK`

## 🎨 Personnalisation

### Couleurs

Les couleurs principales sont définies dans `tailwind.config.ts` :

```typescript
colors: {
  brand: {
    red: '#D10202',
    'red-dark': '#A00101',
    'red-light': '#FF2020',
  }
}
```

### Configuration du site

Modifiez `src/lib/config.ts` pour personnaliser :
- Nom et slogan
- Liens sociaux
- Catégories de produits
- Statistiques
- Équipe et partenaires

## 📄 Licence

© Anthony Modding - Tous droits réservés

---

Fait avec ❤️ en France
