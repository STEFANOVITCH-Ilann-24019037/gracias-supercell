# Gracias Supercell

Application mobile React Native / Expo dédiée à la consultation et à la comparaison de profils Brawl Stars. Le projet propose une connexion locale, une page profil détaillée, un QR code de partage et un mode versus pour comparer deux joueurs.

## Fonctionnalités

- Connexion locale avec validation email / mot de passe depuis un fichier JSON
- Restauration de session côté navigateur via `sessionStorage`
- Page profil complète avec statistiques, radar chart et informations de compte
- Génération d'un QR code basé sur le tag joueur
- Scan QR pour remplir automatiquement le joueur à comparer
- Mode versus pour comparer deux profils
- Consultation des brawlers avec leurs images et informations
- Export du profil en PNG via la feuille de partage du système

## Prérequis

- Node.js 18+ recommandé
- npm
- Expo Go ou un émulateur Android / iOS

## Installation

```bash
npm install
```

## Lancement

```bash
npm start
```

Pour vider le cache Metro et repartir proprement :

```bash
npx expo start -c
```

## Scripts disponibles

```bash
npm start
npm run android
npm run ios
npm run web
npm run lint
npm run generate-players
npm run sync-players
```

## Documentation JSDoc

La documentation est générée dans le dossier `docs/` et déployée automatiquement sur GitHub Pages :

- [Documentation en ligne](https://stefanovitch-ilann-24019037.github.io/gracias-supercell/)
- [Documentation locale](docs/index.html)

## Comptes de test

Utilise ces comptes pour te connecter dans l'application :

| Email | Mot de passe |
|---|---|
| helali@supercell.com | password123 |
| koliai@supercell.com | password123 |
| stefanovitch@supercell.com | password123 |

## Hashtags joueurs disponibles

Ces tags peuvent être recherchés dans le mode joueur ou utilisés dans le mode versus :

- `#QLVP829R`
- `#VU02GGJQ`
- `#RQPOQOQ`
- `#2PVJU20JQ`
- `#2UVJJPQLGP`

## Utilisation

### Connexion

1. Ouvre l'application.
2. Saisis un email et un mot de passe valides.
3. Une fois connecté, accède aux différents onglets de l'application.

### Page profil

La page profil affiche :

- le nom du joueur connecté
- l'email et le tag joueur
- les statistiques principales
- un graphique radar de performance
- le club si disponible
- un QR code partageable
- un bouton pour exporter le profil en PNG

### QR code et scan

- Le QR code encode le tag joueur du compte connecté.
- Le bouton de scan ouvre la caméra.
- Une fois le QR lu, le tag est injecté automatiquement dans le mode versus.

### Mode versus

1. Le joueur 1 est le compte connecté.
2. Le joueur 2 est saisi manuellement ou récupéré par scan QR.
3. L'application compare les statistiques et les top brawlers.

## Structure du projet

```text
App.js
src/
  components/
  screens/
  services/
data/
  account/
  api/
assets/
  brawler/
  favicon/
```

## Données locales

Le projet s'appuie sur des données locales pour fonctionner sans backend :

- `data/account/users.json` pour les comptes utilisateurs
- `data/api/*.json` pour les profils joueurs et les brawlers
- `src/services/playersDataService.js` pour centraliser les données
- `src/services/brawlerImages.js` pour l'association des images brawlers

## Remarques

- La connexion est locale, ce n'est pas une authentification serveur.
- Les mots de passe sont présents en clair dans les données de test pour simplifier le projet.
- Le partage PNG dépend des capacités du téléphone ou de l'émulateur.
